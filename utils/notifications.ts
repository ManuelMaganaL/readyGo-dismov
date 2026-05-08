import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_PREF_KEY = 'notifications_enabled';
const REMINDER_MINUTES_KEY = 'notifications_reminder_minutes';
const DAY_ACTIVITY_REMINDER_MAP_KEY = 'day_activity_reminder_map';
const DAY_ACTIVITY_ONTIME_MAP_KEY = 'day_activity_ontime_map';

type ReminderMap = Record<string, string>;
type NotificationPermissionState = 'granted' | 'simulator' | 'denied-can-ask' | 'denied-blocked';

let notificationsInitialized = false;

export async function initializeNotifications(): Promise<void> {
  if (notificationsInitialized) return;
  notificationsInitialized = true;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    }).catch(() => {});
  }
}

export async function getNotificationPermissionState(): Promise<NotificationPermissionState> {
  if (!Device.isDevice) {
    return 'simulator';
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') {
    return 'granted';
  }

  return current.canAskAgain ? 'denied-can-ask' : 'denied-blocked';
}

async function ensureNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') {
    return true;
  }

  if (!current.canAskAgain) {
    return false;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

export async function getNotificationsEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(NOTIFICATIONS_PREF_KEY);
    return value === null ? true : value === 'true';
  } catch {
    return true;
  }
}

export async function saveNotificationsEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATIONS_PREF_KEY, String(enabled));
}

export async function getReminderMinutes(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(REMINDER_MINUTES_KEY);
    const parsed = Number(value);
    if (!value || Number.isNaN(parsed) || parsed < 0) return 15;
    return parsed;
  } catch {
    return 15;
  }
}

export async function saveReminderMinutes(minutes: number): Promise<void> {
  await AsyncStorage.setItem(REMINDER_MINUTES_KEY, String(minutes));
}

const getReminderMap = async (): Promise<ReminderMap> => {
  try {
    const raw = await AsyncStorage.getItem(DAY_ACTIVITY_REMINDER_MAP_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ReminderMap;
    return parsed ?? {};
  } catch {
    return {};
  }
};

const saveReminderMap = async (map: ReminderMap): Promise<void> => {
  await AsyncStorage.setItem(DAY_ACTIVITY_REMINDER_MAP_KEY, JSON.stringify(map));
};

const getOntimeMap = async (): Promise<ReminderMap> => {
  try {
    const raw = await AsyncStorage.getItem(DAY_ACTIVITY_ONTIME_MAP_KEY);
    if (!raw) return {};
    return (JSON.parse(raw) as ReminderMap) ?? {};
  } catch {
    return {};
  }
};

const saveOntimeMap = async (map: ReminderMap): Promise<void> => {
  await AsyncStorage.setItem(DAY_ACTIVITY_ONTIME_MAP_KEY, JSON.stringify(map));
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  await initializeNotifications();

  if (!Device.isDevice) {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }

  return true;
}

export async function scheduleReminder(title: string, body: string, eventDate: Date, minutesBefore: number) {
  await initializeNotifications();

  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) return null;

  const now = new Date();
  if (eventDate <= now) {
    return null;
  }

  let triggerDate = new Date(eventDate.getTime() - minutesBefore * 60000);

  // If reminder window has passed but activity is still upcoming, notify almost immediately.
  if (triggerDate <= now) {
    triggerDate = new Date(now.getTime() + 1000);
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });

  return notificationId;
}

export async function cancelReminder(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function upsertDayActivityReminder(
  dayActivityId: string,
  title: string,
  body: string,
  eventDate: Date
) {
  const enabled = await getNotificationsEnabled();
  const reminderMap = await getReminderMap();
  const existingNotificationId = reminderMap[dayActivityId];

  if (existingNotificationId) {
    await cancelReminder(existingNotificationId).catch(() => {});
  }

  if (!enabled) {
    delete reminderMap[dayActivityId];
    await saveReminderMap(reminderMap);
    return null;
  }

  const minutesBefore = await getReminderMinutes();
  let newNotificationId: string | null = null;
  try {
    newNotificationId = await scheduleReminder(title, body, eventDate, minutesBefore);
  } catch {
    newNotificationId = null;
  }

  if (newNotificationId) {
    reminderMap[dayActivityId] = newNotificationId;
  } else {
    delete reminderMap[dayActivityId];
  }
  await saveReminderMap(reminderMap);

  return newNotificationId;
}

export async function removeDayActivityReminder(dayActivityId: string) {
  const reminderMap = await getReminderMap();
  const existingNotificationId = reminderMap[dayActivityId];

  if (existingNotificationId) {
    await cancelReminder(existingNotificationId).catch(() => {});
    delete reminderMap[dayActivityId];
    await saveReminderMap(reminderMap);
  }
}

export async function upsertDayActivityOntimeAlert(
  dayActivityId: string,
  activityName: string,
  eventDate: Date
): Promise<string | null> {
  await initializeNotifications();

  const enabled = await getNotificationsEnabled();
  const ontimeMap = await getOntimeMap();
  const existingId = ontimeMap[dayActivityId];

  if (existingId) {
    await cancelReminder(existingId).catch(() => {});
  }

  if (!enabled) {
    delete ontimeMap[dayActivityId];
    await saveOntimeMap(ontimeMap);
    return null;
  }

  const now = new Date();
  if (eventDate <= now) {
    delete ontimeMap[dayActivityId];
    await saveOntimeMap(ontimeMap);
    return null;
  }

  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) {
    delete ontimeMap[dayActivityId];
    await saveOntimeMap(ontimeMap);
    return null;
  }

  let newId: string | null = null;
  try {
    newId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '¡Es la hora! 🎒',
        body: `"${activityName}" comienza ahora. ¡No olvides tus cosas!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: eventDate,
      },
    });
  } catch {
    newId = null;
  }

  if (newId) {
    ontimeMap[dayActivityId] = newId;
  } else {
    delete ontimeMap[dayActivityId];
  }
  await saveOntimeMap(ontimeMap);
  return newId;
}

export async function removeDayActivityOntimeAlert(dayActivityId: string) {
  const ontimeMap = await getOntimeMap();
  const existingId = ontimeMap[dayActivityId];

  if (existingId) {
    await cancelReminder(existingId).catch(() => {});
    delete ontimeMap[dayActivityId];
    await saveOntimeMap(ontimeMap);
  }
}

export async function sendCompletionNotification(activityName: string) {
  await initializeNotifications();

  const enabled = await getNotificationsEnabled();
  if (!enabled) return;

  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) return;

  const content = {
    title: '¡Actividad completada! 💪',
    body: `Completaste "${activityName}". ¡Buen trabajo!`,
    sound: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  };

  try {
    // Immediate presentation while the app is in foreground.
    await Notifications.scheduleNotificationAsync({
      content,
      trigger: null,
    });
  } catch {
    // Non-critical — silently ignore if notification fails
  }
}