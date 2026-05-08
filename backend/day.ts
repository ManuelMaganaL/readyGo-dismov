import { supabase } from "@/backend/supabase";

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
const parseTimetz = (t: string): string => t.substring(0, 5);

export const fetchTodayDayActivities = async (
  userId: string,
  date: string
): Promise<any[] | null> => {
  const { data, error } = await supabase
    .schema("public")
    .from("day_activity")
    .select("*, activities(checkboxes(*))")
    .eq("user_id", userId)
    .eq("date", date)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching day activities:", error);
    return null;
  }

  return (data ?? []).map(row => ({
    ...row,
    start_time: parseTimetz(row.start_time),
    end_time: parseTimetz(row.end_time),
    checklist_state: Array.isArray(row.checklist_state) ? row.checklist_state : [],
    // Inyectamos los checkboxes de la actividad base para que estén disponibles
    checkboxes: row.activities?.checkboxes ?? [],
  }));
};

export const addDayActivity = async (
  userId: string,
  activityId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<DayActivityRow | null> => {
  // Ensure the selected base activity belongs to the signed-in user.
  const { data: ownedActivity, error: ownershipError } = await supabase
    .schema("public")
    .from("activities")
    .select("id")
    .eq("id", activityId)
    .eq("user_id", userId)
    .single();

  if (ownershipError || !ownedActivity) {
    console.error("Error validating activity ownership:", ownershipError);
    return null;
  }

  const { data, error } = await supabase
    .schema("public")
    .from("day_activity")
    .insert({
      user_id: userId,
      activity_id: activityId,
      date,
      start_time: startTime,
      end_time: endTime,
      is_completed: false,
      checklist_state: [],
      order_index: 0,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("Error adding day activity:", error);
    return null;
  }

  return {
    ...data,
    start_time: parseTimetz(data.start_time),
    end_time: parseTimetz(data.end_time),
    checklist_state: [],
  };
};

export const deleteDayActivity = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .schema("public")
    .from("day_activity")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting day activity:", error);
    return false;
  }
  return true;
};

export const updateDayActivityCompletion = async (
  id: string,
  isCompleted: boolean,
  checklistState: boolean[]
): Promise<boolean> => {
  const { error } = await supabase
    .schema("public")
    .from("day_activity")
    .update({ is_completed: isCompleted, checklist_state: checklistState })
    .eq("id", id);

  if (error) {
    console.error("Error updating day activity completion:", error);
    return false;
  }
  return true;
};

export const updateDayActivitiesOrderIndex = async (
  updates: { id: string; order_index: number }[]
): Promise<boolean> => {
  const promises = updates.map(({ id, order_index }) =>
    supabase
      .schema("public")
      .from("day_activity")
      .update({ order_index })
      .eq("id", id)
  );

  const results = await Promise.all(promises);
  const hasError = results.some(({ error }) => error);
  if (hasError) {
    console.error("Error updating order indexes");
    return false;
  }
  return true;
};

export const updateDayActivityTimes = async (
  id: string,
  startTime: string,
  endTime: string
): Promise<boolean> => {
  const { error } = await supabase
    .schema("public")
    .from("day_activity")
    .update({ start_time: startTime, end_time: endTime })
    .eq("id", id);

  if (error) {
    console.error("Error updating day activity times:", error);
    return false;
  }
  return true;
};

export const fetchWeeklyStats = async (userId: string) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const isoDate = sevenDaysAgo.toISOString().split('T')[0];

  const { data, error } = await supabase
    .schema("public")
    .from("day_activity")
    .select("is_completed, date")
    .eq("user_id", userId)
    .gte("date", isoDate);

  if (error) {
    console.error("Error fetching weekly stats:", error);
    return null;
  }

  const total = data.length;
  const completed = data.filter(row => row.is_completed).length;

  // Group by date to see daily progress
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
