import * as Network from 'expo-network';
import { getSyncQueue, removeFromSyncQueue, getDb } from './sqlite';
import { supabase } from '@/backend/supabase';
import { registerSyncTrigger } from './sync-trigger';
import { logger } from './logger';

let isSyncing = false;
let syncTimeout: NodeJS.Timeout | null = null;

export const startSyncEngine = () => {
  // Check for sync every 30 seconds
  setInterval(async () => {
    if (isSyncing) return;
    
    const state = await Network.getNetworkStateAsync();
    if (state.isConnected && state.isInternetReachable) {
      await processSyncQueue();
    }
  }, 30000);
};

export const triggerSync = () => {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    const state = await Network.getNetworkStateAsync();
    if (state.isConnected && state.isInternetReachable) {
      await processSyncQueue();
    }
  }, 1000); // 1 second debounce
};

export const processSyncQueue = async () => {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const queue = await getSyncQueue();
    if (queue.length === 0) {
      isSyncing = false;
      return;
    }

    logger.log(`Processing ${queue.length} items from sync queue...`);

    for (const item of queue) {
      const { id, table_name, operation, record_id, data } = item;
      const payload = JSON.parse(data || '{}');

      let success = false;

      try {
        if (operation === 'INSERT') {
          const { error } = await supabase
            .schema('public')
            .from(table_name)
            .upsert({ id: record_id, ...payload });
          
          if (!error) success = true;
          else {
            logger.error(`Sync error (INSERT ${table_name}) for ID ${record_id}:`, error);
          }
        } 
        else if (operation === 'UPDATE') {
          const { error } = await supabase
            .schema('public')
            .from(table_name)
            .update(payload)
            .eq('id', record_id);
          
          if (!error) success = true;
          else {
            logger.error(`Sync error (UPDATE ${table_name}) for ID ${record_id}:`, error);
          }
        }
        else if (operation === 'DELETE') {
          const { error } = await supabase
            .schema('public')
            .from(table_name)
            .delete()
            .eq('id', record_id);
          
          if (!error) success = true;
          else logger.error(`Sync error (DELETE ${table_name}):`, error);
        }

        if (success) {
          await removeFromSyncQueue(id);
        }
      } catch (e) {
        logger.error("Critical sync item error:", e);
      }
    }
  } catch (error) {
    logger.error("Sync engine error:", error);
  } finally {
    isSyncing = false;
  }
};

// Register triggerSync with the mediator so sqlite.ts can call it
// without creating a circular dependency
registerSyncTrigger(triggerSync);
