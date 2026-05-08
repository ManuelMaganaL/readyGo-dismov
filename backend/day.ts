import { supabase } from "@/backend/supabase";
import { getDb, addToSyncQueue, saveLocalDayActivities, getLocalDayActivities } from "@/utils/sqlite";
import * as Network from 'expo-network';

export type DayActivityRow = {
  id: string;
  user_id: string;
  activity_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_completed: boolean;
  order_index: number;
  checklist_state: boolean[];
  created_at: string;
};

// timetz viene como "09:00:00+00", extraemos solo "HH:mm"
const parseTimetz = (t: string): string => {
  if (!t) return "00:00";
  return t.substring(0, 5);
};

export const fetchTodayDayActivities = async (
  userId: string,
  date: string
): Promise<any[] | null> => {
  try {
    // 1. Try Local First
    const local = await getLocalDayActivities(userId, date);
    
    // 2. If online, sync from remote
    const network = await Network.getNetworkStateAsync();
    if (network.isConnected && network.isInternetReachable) {
      const { data, error } = await supabase
        .schema("public")
        .from("day_activity")
        .select("*, activities(checkboxes(*))")
        .eq("user_id", userId)
        .eq("date", date)
        .order("order_index", { ascending: true });

      if (!error && data) {
        const mapped = data.map(row => ({
          ...row,
          start_time: parseTimetz(row.start_time),
          end_time: parseTimetz(row.end_time),
          checklist_state: Array.isArray(row.checklist_state) ? row.checklist_state : [],
          checkboxes: row.activities?.checkboxes ?? [],
        }));
        
        // Save to local
        await saveLocalDayActivities(mapped);
        return mapped;
      }
    }
    
    return local;
  } catch (e) {
    console.error("Error in fetchTodayDayActivities:", e);
    return null;
  }
};

export const addDayActivity = async (
  userId: string,
  activityId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<DayActivityRow | null> => {
  const id = Math.random().toString(36).substring(2, 15);
  
  const record = {
    id,
    user_id: userId,
    activity_id: activityId,
    date,
    start_time: startTime,
    end_time: endTime,
    is_completed: false,
    checklist_state: [],
    order_index: 0,
    created_at: new Date().toISOString()
  };

  // 1. Update Local
  await saveLocalDayActivities([record]);

  // 2. Queue for Sync
  await addToSyncQueue('day_activity', 'INSERT', id, {
    user_id: userId,
    activity_id: activityId,
    date,
    start_time: startTime,
    end_time: endTime,
    is_completed: false,
    checklist_state: [],
    order_index: 0
  });

  return record;
};

export const deleteDayActivity = async (id: string): Promise<boolean> => {
  // 1. Update Local
  const database = getDb();
  await database.runAsync('DELETE FROM day_activities WHERE id = ?', [id]);

  // 2. Queue for Sync
  await addToSyncQueue('day_activity', 'DELETE', id, null);

  return true;
};

export const updateDayActivityCompletion = async (
  id: string,
  isCompleted: boolean,
  checklistState: boolean[]
): Promise<boolean> => {
  // 1. Update Local
  const database = getDb();
  await database.runAsync(
    'UPDATE day_activities SET is_completed = ?, checklist_state = ? WHERE id = ?',
    [isCompleted ? 1 : 0, JSON.stringify(checklistState), id]
  );

  // 2. Queue for Sync
  await addToSyncQueue('day_activity', 'UPDATE', id, { 
    is_completed: isCompleted, 
    checklist_state: checklistState 
  });

  return true;
};

export const updateDayActivitiesOrderIndex = async (
  updates: { id: string; order_index: number }[]
): Promise<boolean> => {
  const database = getDb();
  for (const { id, order_index } of updates) {
    // 1. Update Local
    await database.runAsync('UPDATE day_activities SET order_index = ? WHERE id = ?', [order_index, id]);
    
    // 2. Queue for Sync
    await addToSyncQueue('day_activity', 'UPDATE', id, { order_index });
  }
  return true;
};

export const updateDayActivityTimes = async (
  id: string,
  startTime: string,
  endTime: string
): Promise<boolean> => {
  // 1. Update Local
  const database = getDb();
  await database.runAsync(
    'UPDATE day_activities SET start_time = ?, end_time = ? WHERE id = ?',
    [startTime, endTime, id]
  );

  // 2. Queue for Sync
  await addToSyncQueue('day_activity', 'UPDATE', id, { 
    start_time: startTime, 
    end_time: endTime 
  });

  return true;
};

export const fetchWeeklyStats = async (userId: string) => {
  // We can still use Supabase for stats if online, or implement local aggregation
  // For now, let's keep it simple and try online first
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const isoDate = sevenDaysAgo.toISOString().split('T')[0];

  const network = await Network.getNetworkStateAsync();
  if (network.isConnected && network.isInternetReachable) {
    const { data, error } = await supabase
      .schema("public")
      .from("day_activity")
      .select("is_completed, date")
      .eq("user_id", userId)
      .gte("date", isoDate);

    if (!error && data) {
      const total = data.length;
      const completed = data.filter(row => row.is_completed).length;

      const dailyProgress: Record<string, { total: number, completed: number }> = {};
      data.forEach(row => {
        if (!dailyProgress[row.date]) {
          dailyProgress[row.date] = { total: 0, completed: 0 };
        }
        dailyProgress[row.date].total++;
        if (row.is_completed) dailyProgress[row.date].completed++;
      });

      return {
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        dailyProgress
      };
    }
  }

  // Fallback to local stats
  const database = getDb();
  const data = await database.getAllAsync<any>(
    'SELECT is_completed, date FROM day_activities WHERE user_id = ? AND date >= ?',
    [userId, isoDate]
  );

  const total = data.length;
  const completed = data.filter(row => row.is_completed).length;

  const dailyProgress: Record<string, { total: number, completed: number }> = {};
  data.forEach(row => {
    if (!dailyProgress[row.date]) {
      dailyProgress[row.date] = { total: 0, completed: 0 };
    }
    dailyProgress[row.date].total++;
    if (row.is_completed) dailyProgress[row.date].completed++;
  });

  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    dailyProgress
  };
};
