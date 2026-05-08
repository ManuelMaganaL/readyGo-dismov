import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { fetchUserActivitiesById, fetchCheckboxesByActivityId } from '@/backend/activities';
import type { Activity } from '@/types';
import { initDatabase, getLocalActivities, saveLocalActivities } from '@/utils/sqlite';
import { startSyncEngine, processSyncQueue } from '@/utils/sync';
import * as Network from 'expo-network';

interface ActivitiesContextType {
  masterActivities: Activity[];
  setMasterActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  isLoadingActivities: boolean;
}

const ActivitiesContext = createContext<ActivitiesContextType>({
  masterActivities: [],
  setMasterActivities: () => {},
  isLoadingActivities: true,
});

export const ActivitiesProvider = ({ children }: { children: React.ReactNode }) => {
  const [masterActivities, setMasterActivities] = useState<Activity[]>([]);
  const { user } = useUser();
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [dbReady, setDbReady] = useState(false);

  // Initialize DB
  useEffect(() => {
    initDatabase().then(() => {
      setDbReady(true);
      startSyncEngine();
    });
  }, []);

  useEffect(() => {
    if (!user || !dbReady) {
      setMasterActivities([]);
      if (dbReady) setIsLoadingActivities(false);
      return;
    }

    const loadActivities = async () => {
      setIsLoadingActivities(true);
      
      try {
        // 1. Try to load from SQLite first (Fast load)
        const localData = await getLocalActivities(user.id);
        if (localData.length > 0) {
          setMasterActivities(localData);
          setIsLoadingActivities(false);
        }

        // 2. Check connectivity
        const network = await Network.getNetworkStateAsync();
        if (network.isConnected && network.isInternetReachable) {
          // 3. Sync from Supabase
          const activitiesData = await fetchUserActivitiesById(user.id);
          if (activitiesData) {
            const activitiesWithCheckboxes: Activity[] = [];
            for (const activity of activitiesData) {
              const checkboxes = await fetchCheckboxesByActivityId(activity.id);
              activitiesWithCheckboxes.push({
                id: activity.id,
                user_id: activity.user_id,
                name: activity.name,
                checkboxes: checkboxes || [],
                created_at: activity.created_at,
              });
            }
            
            // 4. Save to SQLite and Update UI
            await saveLocalActivities(activitiesWithCheckboxes);
            setMasterActivities(activitiesWithCheckboxes);
            
            // 5. Process any pending sync items
            processSyncQueue();
          }
        }
      } catch (error) {
        console.error('Error in ActivitiesProvider:', error);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    loadActivities();
  }, [user, dbReady]);

  return (
    <ActivitiesContext.Provider value={{ masterActivities, setMasterActivities, isLoadingActivities }}>
      {children}
    </ActivitiesContext.Provider>
  );
};

export const useActivities = () => useContext(ActivitiesContext);
