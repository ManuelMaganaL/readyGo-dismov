import * as SQLite from 'expo-sqlite';
import { fireSyncTrigger } from './sync-trigger';

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async () => {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync('readygo.db');

  // One-time migration: drop tables that had FOREIGN KEY constraints
  // This is needed because CREATE TABLE IF NOT EXISTS won't alter existing schemas
  // Data is recovered from Supabase on next sync
  const versionResult = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = versionResult?.user_version ?? 0;

  if (currentVersion < 1) {
    await db.execAsync(`
      DROP TABLE IF EXISTS day_activities;
      DROP TABLE IF EXISTS checkboxes;
      DROP TABLE IF EXISTS activities;
      PRAGMA user_version = 1;
    `);
  }

  // Create tables if they don't exist (no foreign keys — cascades handled manually)
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS checkboxes (
      id TEXT PRIMARY KEY,
      activity_id TEXT NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS day_activities (
      -- NOTA: Esta tabla se llama "day_activities" localmente pero "day_activity" en Supabase.
      -- El sync engine usa el table_name del sync_queue para hablar con Supabase.
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      activity_id TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0,
      order_index INTEGER DEFAULT 0,
      checklist_state TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      operation TEXT NOT NULL,
      record_id TEXT NOT NULL,
      data TEXT,
      timestamp INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cached_user (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      avatar_url TEXT,
      created_at TEXT
    );
  `);

  return db;
};

export const getDb = () => {
  if (!db) throw new Error("Database not initialized. Call initDatabase first.");
  return db;
};

// HELPER FUNCTIONS FOR LOCAL DATA

// Activities
export const saveLocalActivities = async (activities: any[]) => {
  const database = getDb();
  for (const activity of activities) {
    // Use UPSERT (ON CONFLICT DO UPDATE) instead of INSERT OR REPLACE
    // INSERT OR REPLACE does DELETE+INSERT which triggers CASCADE and wipes child rows
    await database.runAsync(
      `INSERT INTO activities (id, user_id, name, created_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET user_id = excluded.user_id, name = excluded.name, created_at = excluded.created_at`,
      [activity.id, activity.user_id, activity.name, activity.created_at]
    );
    
    if (activity.checkboxes) {
      for (const cb of activity.checkboxes) {
        await database.runAsync(
          `INSERT INTO checkboxes (id, activity_id, description) VALUES (?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET activity_id = excluded.activity_id, description = excluded.description`,
          [cb.id, cb.activity_id, cb.description]
        );
      }
    }
  }
};

export const getLocalActivities = async (userId: string) => {
  const database = getDb();
  const activities = await database.getAllAsync<any>(
    'SELECT * FROM activities WHERE user_id = ?',
    [userId]
  );
  
  for (const activity of activities) {
    activity.checkboxes = await database.getAllAsync(
      'SELECT * FROM checkboxes WHERE activity_id = ?',
      [activity.id]
    );
  }
  
  return activities;
};

// Day Activities
export const saveLocalDayActivities = async (dayActivities: any[]) => {
  const database = getDb();
  for (const da of dayActivities) {
    // Use UPSERT instead of INSERT OR REPLACE to avoid CASCADE deletes
    await database.runAsync(
      `INSERT INTO day_activities (id, user_id, activity_id, date, start_time, end_time, is_completed, order_index, checklist_state, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET user_id = excluded.user_id, activity_id = excluded.activity_id, date = excluded.date, start_time = excluded.start_time, end_time = excluded.end_time, is_completed = excluded.is_completed, order_index = excluded.order_index, checklist_state = excluded.checklist_state, created_at = excluded.created_at`,
      [
        da.id, 
        da.user_id, 
        da.activity_id, 
        da.date, 
        da.start_time, 
        da.end_time, 
        da.is_completed ? 1 : 0, 
        da.order_index, 
        JSON.stringify(da.checklist_state || []),
        da.created_at
      ]
    );
  }
};

export const getLocalDayActivities = async (userId: string, date: string) => {
  const database = getDb();
  const rows = await database.getAllAsync<any>(
    'SELECT da.*, a.name as activity_name FROM day_activities da JOIN activities a ON da.activity_id = a.id WHERE da.user_id = ? AND da.date = ? ORDER BY da.order_index ASC',
    [userId, date]
  );
  
  return rows.map(row => ({
    ...row,
    is_completed: !!row.is_completed,
    checklist_state: JSON.parse(row.checklist_state || '[]'),
    // Mapping for UI consistency
    name: row.activity_name,
    title: row.activity_name
  }));
};

// Sync Queue
export const addToSyncQueue = async (tableName: string, operation: string, recordId: string, data: any) => {
  const database = getDb();
  await database.runAsync(
    'INSERT INTO sync_queue (table_name, operation, record_id, data, timestamp) VALUES (?, ?, ?, ?, ?)',
    [tableName, operation, recordId, JSON.stringify(data), Date.now()]
  );
  
  // Attempt to sync immediately via mediator (no circular dependency)
  fireSyncTrigger();
};

export const getSyncQueue = async () => {
  const database = getDb();
  return await database.getAllAsync<any>('SELECT * FROM sync_queue ORDER BY timestamp ASC');
};

export const removeFromSyncQueue = async (id: number) => {
  const database = getDb();
  await database.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
};

// User Cache for offline support
export const saveUserCache = async (user: { id: string; username: string; email: string; avatar_url?: string | null; created_at?: string }) => {
  const database = getDb();
  // Clear old entries and insert the current user
  await database.runAsync('DELETE FROM cached_user');
  await database.runAsync(
    'INSERT INTO cached_user (id, username, email, avatar_url, created_at) VALUES (?, ?, ?, ?, ?)',
    [user.id, user.username, user.email, user.avatar_url ?? null, user.created_at ?? null]
  );
};

export const getUserCache = async () => {
  const database = getDb();
  const rows = await database.getAllAsync<any>('SELECT * FROM cached_user LIMIT 1');
  return rows.length > 0 ? rows[0] : null;
};
