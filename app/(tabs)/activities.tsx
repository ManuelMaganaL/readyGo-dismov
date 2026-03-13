import React from "react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, ScrollView, Pressable } from "react-native";
import { CirclePlus } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";

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

import type { Activity, User } from "@/types/index";
import { requestNotificationPermissions } from "@/utils/notifications";
import { useActivities } from "@/context/ActivitiesContext";

export default function ActivitiesTab() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const { colors } = useTheme();
  const styles = createStyles(colors);

  const { masterActivities, setMasterActivities, isLoadingActivities } = useActivities();
  const isScreenLoading = isLoadingActivities || !user;

  const loadUser = useCallback(async () => {
    const sessionInfo = await getSessionInfo();
    if (!sessionInfo) {
      router.push("/auth/login");
      return;
    }

    const userInfo = await getUserInfo(sessionInfo.id);
    if (!userInfo) {
      router.push("/auth/login");
      return;
    }

    setUser({
      id: userInfo.id,
      username: userInfo.username,
      email: userInfo.email,
      avatar_url: userInfo.avatar_url ?? null,
      created_at: userInfo.created_at,
    });
  }, [router]);
  
  useEffect(() => {
    requestNotificationPermissions();
    loadUser();
  }, [loadUser]);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  return (
    <>
      {isScreenLoading ? (
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
              {masterActivities.length === 0 ? (
                <ThemedText type="default">
                  Aun no tienes actividades. Pulsa el boton + para crear la primera.
                </ThemedText>
              ) : masterActivities.map((activity, index) => (
                <ActivityBlock 
                  key={index} 
                  activity={activity}
                  setActivities={setMasterActivities}
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
            setActivities={setMasterActivities}
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
