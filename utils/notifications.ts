import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_PREF_KEY = 'notifications_enabled';
const REMINDER_MINUTES_KEY = 'notifications_reminder_minutes';
const DAY_ACTIVITY_REMINDER_MAP_KEY = 'day_activity_reminder_map';

type ReminderMap = Record<string, string>;
type NotificationPermissionState = 'granted' | 'simulator' | 'denied-can-ask' | 'denied-blocked';

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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
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

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
}

export async function scheduleReminder(title: string, body: string, eventDate: Date, minutesBefore: number) {
  const triggerDate = new Date(eventDate.getTime() - minutesBefore * 60000);

  if (triggerDate <= new Date()) {
    return null;
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
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
  const newNotificationId = await scheduleReminder(title, body, eventDate, minutesBefore);

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

export async function sendCompletionNotification(activityName: string) {
  const enabled = await getNotificationsEnabled();
  if (!enabled) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '¡Actividad completada! 💪',
      body: `Completaste "${activityName}". ¡Buen trabajo!`,
      sound: true,
    },
    trigger: null,
  });
}