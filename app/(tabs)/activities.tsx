import React from "react";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, ScrollView, Pressable, TextInput, View } from "react-native";
import { CirclePlus, Search, ListTodo, Zap } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/context/ThemeContext";
import { useActivities } from "@/context/ActivitiesContext";
import LoaderSpinner from "@/components/loader-spinner";
import UserHeader from "@/components/layout/user-header";
import ActivityBlock from "@/components/layout/activity-block";
import CreateActivityModal from "@/components/modal/create-activity";

import type { Activity } from "@/types/index";
import { useUser } from "@/context/UserContext";

export default function ActivitiesTab() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const { masterActivities: activities, setMasterActivities: setActivities, isLoadingActivities: isActivitiesLoading } = useActivities();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const { colors } = useTheme();
  const styles = createStyles(colors);

  const filteredActivities = useMemo(() => {
    return activities.filter(a =>
      (a.title ?? a.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activities, searchQuery]);

  const showLoading = isActivitiesLoading || isUserLoading;

  return (
    <>
      {showLoading ? (
        <LoaderSpinner />
      ) : (
        <ThemedView style={styles.mainContainer}>
          <UserHeader user={user!} />

          <ThemedView style={styles.body}>
            <ThemedText type="title" style={styles.mainTitle}>Actividades</ThemedText>

            <View style={styles.topRow}>
              <View style={styles.statCardCompact}>
                <View style={[styles.iconBadge, { backgroundColor: colors.main }]}>
                  <ListTodo size={18} color="#FFF" />
                </View>
                <ThemedText style={styles.statValue}>{activities.length}</ThemedText>
              </View>

              <View style={styles.searchContainerCompact}>
                <Search size={18} color={colors.light_accent} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar..."
                  placeholderTextColor={colors.light_accent}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            <ThemedView style={styles.sectionHeader}>
              <ThemedText style={styles.subtitle}>{filteredActivities.length} encontradas</ThemedText>
            </ThemedView>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <ThemedView style={styles.gridContainer}>
                {filteredActivities.length === 0 ? (
                  <ThemedView style={styles.emptyContainer}>
                    <ThemedText style={styles.emptyText}>
                      {searchQuery ? "No se encontraron resultados" : "Aun no tienes actividades. Pulsa el botón + para crear la primera."}
                    </ThemedText>
                  </ThemedView>
                ) : filteredActivities.map((activity) => (
                  <View key={String(activity.id)} style={styles.gridItem}>
                    <ActivityBlock
                      activity={activity}
                      setActivities={setActivities}
                    />
                  </View>
                ))}
              </ThemedView>
            </ScrollView>
          </ThemedView>

          <Pressable
            style={styles.addActivityButton}
            onPress={() => setIsAddModalVisible(true)}
          >
            <ThemedView style={styles.fabGradient}>
              <CirclePlus size={32} color="#FFF" />
            </ThemedView>
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
      flexDirection: 'column',
      gap: 10,
      padding: 15,
      marginTop: 40,
    },
    body: {
      flex: 1,
      marginTop: 20,
    },
    mainTitle: {
      fontSize: 26,
      lineHeight: 30,
      marginBottom: 16,
    },
    topRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 16,
      alignItems: 'center',
    },
    statCardCompact: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      height: 52,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.light_accent,
    },
    searchContainerCompact: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingHorizontal: 12,
      height: 52,
      borderWidth: 1,
      borderColor: colors.light_accent,
    },
    iconBadge: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statValue: {
      fontSize: 17,
      fontWeight: 'bold',
      marginLeft: 4,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 12,
      opacity: 0.6,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
    },
    gridItem: {
      width: '48%',
    },
    emptyContainer: {
      width: '100%',
      alignItems: 'center',
      marginTop: 40,
    },
    emptyText: {
      textAlign: 'center',
      opacity: 0.5,
      fontSize: 14,
      paddingHorizontal: 20,
    },
    addActivityButton: {
      position: 'absolute',
      bottom: 30,
      right: 20,
      shadowColor: colors.main,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
    },
    fabGradient: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.main,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
