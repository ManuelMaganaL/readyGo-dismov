import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { fetchUserActivitiesById, fetchCheckboxesByActivityId } from '@/backend/activities';
import type { Activity } from '@/types';

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

  useEffect(() => {
    if (!user) {
      setMasterActivities([]);
      setIsLoadingActivities(false);
      return;
    }

    const fetchActivities = async () => {
      setIsLoadingActivities(true);
      try {
        const activitiesData = await fetchUserActivitiesById(user.id);
        if (!activitiesData || activitiesData.length === 0) {
          setMasterActivities([]);
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
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setIsLoadingActivities(false);
      }
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
