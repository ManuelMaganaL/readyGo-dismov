import { supabase } from "@/backend/supabase";
import { getDb, addToSyncQueue } from "@/utils/sqlite";
import * as Network from 'expo-network';
import { generateUUID } from '@/utils/id';

// Helper to check if we should try remote or just queue
const isOnline = async () => {
  const state = await Network.getNetworkStateAsync();
  return !!(state.isConnected && state.isInternetReachable);
};

// ACTIVITIES
export const fetchUserActivitiesById = async (id: string) => {
  const { data, error } = await supabase
    .schema("public")
    .from("activities")
    .select("*, checkboxes(*)")
    .eq("user_id", id);

  if (error || !data) {
    console.error('Error fetching user activities:', error);
    return null;
  }

  return data;
};

export const fetchActivityById = async (id: string) => {
  // Try remote first if online, else we rely on context/local
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("No authenticated user found");
    return null;
  }

  const { data, error } = await supabase
    .schema("public")
    .from("activities")
    .select("*, checkboxes(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    console.error('Error fetching activity:', error);
    return null;
  }

  return data;
}

export const deleteActivity = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Update Local — remove activity, its checkboxes, and any day_activities that reference it
  const database = getDb();
  await database.runAsync('DELETE FROM day_activities WHERE activity_id = ?', [id]);
  await database.runAsync('DELETE FROM checkboxes WHERE activity_id = ?', [id]);
  await database.runAsync('DELETE FROM activities WHERE id = ?', [id]);

  // 2. Queue for Sync
  await addToSyncQueue('activities', 'DELETE', id, null);

  return true;
}

export const addActivity = async (userId: string, name: string) => {
  const id = generateUUID();
  const createdAt = new Date().toISOString();
  
  // 1. Update Local
  const database = getDb();
  await database.runAsync(
    'INSERT INTO activities (id, user_id, name, created_at) VALUES (?, ?, ?, ?)',
    [id, userId, name, createdAt]
  );

  // 2. Queue for Sync
  await addToSyncQueue('activities', 'INSERT', id, { user_id: userId, name, created_at: createdAt });

  return { id, user_id: userId, name, created_at: createdAt };
}

export const updateActivityName = async (id: string, name: string) => {
  // 1. Update Local
  const database = getDb();
  await database.runAsync('UPDATE activities SET name = ? WHERE id = ?', [name, id]);

  // 2. Queue for Sync
  await addToSyncQueue('activities', 'UPDATE', id, { name });

  return { id, name };
};

// CHECKBOXES
export const fetchCheckboxesByActivityId = async (activityId: string) => {
  const { data, error } = await supabase
    .schema("public")
    .from("checkboxes")
    .select("*")
    .eq("activity_id", activityId);

  if (error || !data) {
    console.error('Error fetching checkboxes:', error);
    return null;
  }

  return data;
}

export const addCheckboxToActivity = async (activityId: string, description: string) => {
  const id = generateUUID();
  const createdAt = new Date().toISOString();

  // 1. Update Local
  const database = getDb();
  await database.runAsync(
    'INSERT INTO checkboxes (id, activity_id, description) VALUES (?, ?, ?)',
    [id, activityId, description]
  );

  // 2. Queue for Sync
  await addToSyncQueue('checkboxes', 'INSERT', id, { activity_id: activityId, description });

  return { id, activity_id: activityId, description, created_at: createdAt };
}

export const updateCheckboxDescription = async (checkboxId: string, description: string) => {
  // 1. Update Local
  const database = getDb();
  await database.runAsync('UPDATE checkboxes SET description = ? WHERE id = ?', [description, checkboxId]);

  // 2. Queue for Sync
  await addToSyncQueue('checkboxes', 'UPDATE', checkboxId, { description });

  return { id: checkboxId, description };
};

export const deleteCheckbox = async (checkboxId: string) => {
  // 1. Update Local
  const database = getDb();
  await database.runAsync('DELETE FROM checkboxes WHERE id = ?', [checkboxId]);

  // 2. Queue for Sync
  await addToSyncQueue('checkboxes', 'DELETE', checkboxId, null);

  return { id: checkboxId };
}