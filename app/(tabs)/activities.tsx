import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, ScrollView, Pressable } from "react-native";
import { CirclePlus } from "lucide-react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/context/ThemeContext";
import LoaderSpinner from "@/components/loader-spinner";
import UserHeader from "@/components/layout/user-header";
import ActivityBlock from "@/components/layout/activity-block";
import CreateActivityModal from "@/components/modal/create-activity";

import { 
  getSessionInfo, 
  getUserInfo,
} from "@/backend/session";
import { 
  fetchCheckboxesByActivityId, 
  fetchUserActivitiesById, 
} from "@/backend/activities";

import type { Activity, User } from "@/types/index";
import { requestNotificationPermissions } from "@/utils/notifications";

export default function ActivitiesTab() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  useEffect(() => {
    requestNotificationPermissions();

    const isLogedIn = async () => {
      setIsLoading(true);
      const sessionInfo = await getSessionInfo();
      if (!sessionInfo) {
        router.push("/auth/login");
        return;
      }

      const userInfo = await getUserInfo(sessionInfo.id);
      if (!userInfo) {
        router.push("/auth/login");
        return;
      } else {
        setUser({id: userInfo.id, username: userInfo.username, email: userInfo.email, created_at: userInfo.created_at});
      }
    }
    isLogedIn();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const fetchactivities = async () => {
      const activitiesData = await fetchUserActivitiesById(user.id);
      if (!activitiesData || activitiesData.length === 0) {
        setActivities([]);
      } else {
        const activitiesWithCheckboxes: Activity[] = [];

        for (let i = 0; i < activitiesData.length; i++) {
          const activityId = activitiesData[i].id;
          const checkboxes = await fetchCheckboxesByActivityId(activityId);
          
          activitiesWithCheckboxes.push({
            id: activityId,
            user_id: activitiesData[i].user_id,
            name: activitiesData[i].name,
            checkboxes: checkboxes || [],
            created_at: activitiesData[i].created_at,
          })
        }
        setActivities(activitiesWithCheckboxes);
      }
      setIsLoading(false);
    }
    fetchactivities();
  }, [user]);

  return (
    <>
      {isLoading ? (
        <LoaderSpinner/>
      ) : (
        <ThemedView style={styles.mainContainer}>
          <UserHeader user={user!}/>

          <ThemedView style={styles.body}>
            <ThemedText type="title">Actividades</ThemedText>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
              {activities.map((activity, index) => (
                <ActivityBlock 
                  key={index} 
                  activity={activity}
                  setActivities={setActivities}
                />
              ))}
            </ScrollView>
          </ThemedView>

          <Pressable
            style={styles.addActivityButton}
            onPress={() => setIsAddModalVisible(true)}
          >
            <CirclePlus size={40} color={colors.main}/>
          </Pressable>

          <CreateActivityModal 
            isModalVisible={isAddModalVisible}
            setIsModalVisible={setIsAddModalVisible}
            setActivities={setActivities}
          />
        </ThemedView>
      )}
    </>
  );
}

const createStyles = (colors: any) =>
StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 10,
    padding: 15,
    marginTop: 40,
  },
  body: {
    marginTop: 20,
    flex: 1,
  },
  scroll: {
    marginTop: 15,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  addActivityButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    borderRadius: 20,
  },
});
