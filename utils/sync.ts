import * as Network from 'expo-network';
import { getSyncQueue, removeFromSyncQueue, getDb } from './sqlite';
import { supabase } from '@/backend/supabase';

let isSyncing = false;

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

export const processSyncQueue = async () => {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const queue = await getSyncQueue();
    if (queue.length === 0) {
      isSyncing = false;
      return;
    }

    console.log(`Processing ${queue.length} items from sync queue...`);

    for (const item of queue) {
      const { id, table_name, operation, record_id, data } = item;
      const payload = JSON.parse(data || '{}');

      let success = false;

      try {
        if (operation === 'INSERT' || operation === 'UPDATE') {
          const { error } = await supabase
            .schema('public')
            .from(table_name)
            .upsert({ id: record_id, ...payload });
          
          if (!error) success = true;
          else console.error(`Sync error (${operation} ${table_name}):`, error);
        } 
        else if (operation === 'DELETE') {
          const { error } = await supabase
            .schema('public')
            .from(table_name)
            .delete()
            .eq('id', record_id);
          
          if (!error) success = true;
          else console.error(`Sync error (DELETE ${table_name}):`, error);
        }

        if (success) {
          await removeFromSyncQueue(id);
        }
      } catch (e) {
        console.error("Critical sync item error:", e);
      }
    }
  } catch (error) {
    console.error("Sync engine error:", error);
  } finally {
    isSyncing = false;
  }
};
