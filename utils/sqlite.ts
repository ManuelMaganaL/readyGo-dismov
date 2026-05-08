import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async () => {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync('readygo.db');

  // Create tables if they don't exist
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
      description TEXT NOT NULL,
      FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS day_activities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      activity_id TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0,
      order_index INTEGER DEFAULT 0,
      checklist_state TEXT,
      created_at TEXT,
      FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      operation TEXT NOT NULL,
      record_id TEXT NOT NULL,
      data TEXT,
      timestamp INTEGER NOT NULL
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
    await database.runAsync(
      'INSERT OR REPLACE INTO activities (id, user_id, name, created_at) VALUES (?, ?, ?, ?)',
      [activity.id, activity.user_id, activity.name, activity.created_at]
    );
    
    if (activity.checkboxes) {
      for (const cb of activity.checkboxes) {
        await database.runAsync(
          'INSERT OR REPLACE INTO checkboxes (id, activity_id, description) VALUES (?, ?, ?)',
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
    await database.runAsync(
      'INSERT OR REPLACE INTO day_activities (id, user_id, activity_id, date, start_time, end_time, is_completed, order_index, checklist_state, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
  
  // Attempt to sync immediately
  // Dynamic require to prevent circular dependency (sqlite.ts -> sync.ts -> sqlite.ts)
  const syncModule = require('./sync');
  if (syncModule && syncModule.triggerSync) {
    syncModule.triggerSync();
  }
};

export const getSyncQueue = async () => {
  const database = getDb();
  return await database.getAllAsync<any>('SELECT * FROM sync_queue ORDER BY timestamp ASC');
};

export const removeFromSyncQueue = async (id: number) => {
  const database = getDb();
  await database.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
};
