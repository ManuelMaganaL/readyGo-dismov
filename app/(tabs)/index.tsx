import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { CirclePlus } from "lucide-react-native";

import UserHeader from "@/components/layout/user-header";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import ActivityBlock from "@/components/layout/activity-block";
import TodaysCalendar from "@/components/layout/todays-calendar";
import AddActivityModal from "@/components/modal/add-activity";
import DeleteActivityModal from "@/components/modal/delete-activity";
import ModifyActivityModal from "@/components/modal/modify-activity";

import type { Activity } from "@/types";
// Reemplazar por datos de la base de datos
import { dummyData } from "@/data/dummy-activities";

export default function ActivitiesScreen() {
  // Estado para almacenar datos, se va a cargar con un useEffecct
  const [activities, setActivities] = useState<Activity[]>(dummyData);
  
  // Estados para los bloques de actividades
  const [isDetailed, setIsDetailed] = useState<boolean[]>(Array(dummyData.length + 1).fill(false));
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [isModifyModalVisible, setIsModifyModalVisible] = useState(false);
  const [idToModify, setIdToModify] = useState<number | null>(null);

  // Junta todas las checklists en una sola actividad
  const allActivities: Activity = {
    id: -1,
    title: "All",
    time_start: activities[0]?.time_start ?? "00:00",
    time_end: activities[activities.length - 1]?.time_end ?? "00:00",
    checkboxes: activities.flatMap(activity => activity.checkboxes),
  }

  return (
    <ThemedView style={styles.mainContainer}>
      {/* Header */} 
      <UserHeader />

      <ThemedView style={styles.body}>
        <ThemedText type="title">Today's list</ThemedText>  

        {/* Calendar */}
        <TodaysCalendar/>

        {/* Today's activities */}
        <ThemedView style={styles.activitiesContainer}>
          {/* Todas las checklist de todas las actividades */}
          <ActivityBlock
            key={allActivities.id}
            id={allActivities.id}
            title={allActivities.title}
            time_start={allActivities.time_start}
            time_end={allActivities.time_end}
            checkboxes={allActivities.checkboxes}
            position={0}
            isDetailed={isDetailed[0]}
            setIsDetailed={setIsDetailed}
            onDelete={() => {}}
            setIdToDelete={setIdToDelete}
            setIsDeleteModalVisible={setIsDeleteModalVisible}
            setIdToModify={setIdToModify}
            setIsModifyModalVisible={setIsModifyModalVisible}
          />

          {/* Demas actividades */}
          {activities.map((activity, index) => (
            <ActivityBlock
              key={activity.id}
              id={activity.id}
              title={activity.title}
              time_start={activity.time_start}
              time_end={activity.time_end}
              checkboxes={activity.checkboxes}
              position={index + 1}
              isDetailed={isDetailed[index + 1]}
              setIsDetailed={setIsDetailed}
              onDelete={(id) => (id)}
              setIdToDelete={setIdToDelete}
              setIsDeleteModalVisible={setIsDeleteModalVisible}
              setIdToModify={setIdToModify}
              setIsModifyModalVisible={setIsModifyModalVisible}
            />
          ))}
        </ThemedView>
      </ThemedView>

      <Pressable
        style={styles.addActivityButton}
        onPress={() => setIsAddModalVisible(true)}
      >
        <CirclePlus size={40} color={'#8052c7'}/>
      </Pressable>
      
      {/* Modal to add an activity to the day */}
      {isAddModalVisible && (
        <AddActivityModal
          isModalVisible={isAddModalVisible}
          setIsModalVisible={setIsAddModalVisible}
          setActivities={setActivities}
        />
      )}

      {/* Modal to confirm deletion of an activity */}
      {isDeleteModalVisible && idToDelete !== null && (
        <DeleteActivityModal
          isModalVisible={isDeleteModalVisible}
          setIsModalVisible={setIsDeleteModalVisible}
          id={idToDelete!}
          setActivities={setActivities}
        />
      )}

      {/* Modal to modify an activity */}
      {isModifyModalVisible && idToModify !== null && (
        <ModifyActivityModal
          isModalVisible={isModifyModalVisible}
          setIsModalVisible={setIsModifyModalVisible}
          id={idToModify}
          activities={activities}
          setActivities={setActivities}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 10,
    padding: 15,
    marginTop: 40,
  },
  activitiesContainer: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 20,
  },
  body: {
    marginTop: 20,
  },
  addActivityButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    boxShadow: '0px 0px 5px rgba(95, 53, 245, 0.3)',
    borderRadius: 20,
  },
})
