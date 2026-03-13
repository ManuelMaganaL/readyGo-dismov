import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSessionInfo, getUserInfo } from '@/backend/session';
import { fetchUserActivitiesById, fetchCheckboxesByActivityId } from '@/backend/activities';
import { supabase } from '@/backend/supabase';
import type { Activity, User } from '@/types';

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      setIsLoadingActivities(true);
      const sessionInfo = await getSessionInfo();
      if (!sessionInfo) {
        setUser(null);
        setMasterActivities([]);
        setIsLoadingActivities(false);
        return;
      }
      const userInfo = await getUserInfo(sessionInfo.id);
      if (userInfo) {
        setUser({
          id: userInfo.id,
          username: userInfo.username,
          email: userInfo.email,
          created_at: userInfo.created_at,
        });
      } else {
        setUser(null);
        setMasterActivities([]);
        setIsLoadingActivities(false);
      }
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchActivities = async () => {
      setIsLoadingActivities(true);
      const activitiesData = await fetchUserActivitiesById(user.id);
      if (!activitiesData || activitiesData.length === 0) {
        setMasterActivities([]);
        setIsLoadingActivities(false);
        return;
      }
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
      setMasterActivities(activitiesWithCheckboxes);
      setIsLoadingActivities(false);
    };
    fetchActivities();
  }, [user]);

  return (
    <ActivitiesContext.Provider value={{ masterActivities, setMasterActivities, isLoadingActivities }}>
      {children}
    </ActivitiesContext.Provider>
  );
};

export const useActivities = () => useContext(ActivitiesContext);
