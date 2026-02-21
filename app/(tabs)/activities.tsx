import { StyleSheet, ScrollView } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import UserHeader from "@/components/layout/user-header";

import { dummyData } from "@/data/dummy-activities";

export default function ActivitiesScreen() {
  return (
    <ThemedView style={styles.mainContainer}>
      <UserHeader />

      <ThemedView style={styles.body}>
        <ThemedText type="title">Actividades</ThemedText>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          
        </ScrollView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
    marginTop: 20,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});