import { useState } from "react";
import { Swipeable } from "react-native-gesture-handler";
import { StyleSheet, Pressable } from "react-native";
import { 
  CircleDashed, 
  CircleCheckBig, 
  ChevronDown, 
  ChevronUp, 
  Square, 
  SquareCheck,
  Trash2,
  Edit,
} from "lucide-react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

import type { ActivityBlockProps } from "@/types/index";
import { ACCENT_COLOR, DANGER_COLOR, MAIN_COLOR, SECONDARY_COLOR } from "@/constants/theme";


export default function ActivityBlock({
  id,
  title,
  time_start,
  time_end,
  checkboxes,
  position,
  isDetailed,
  setIsDetailed,
  setIdToDelete,
  setIsDeleteModalVisible,
  setIdToModify,
  setIsModifyModalVisible,
  isSwipeable,
}: ActivityBlockProps) {
  const [checked, setChecked] = useState<boolean[]>(
    checkboxes.map(checkbox => checkbox.complete)
  )

  const toggleDetail = () => { 
    setIsDetailed((prev: boolean[]) => prev.map(
      (val, i) => i === position ? !val : val
    ));
  }

  const toggleCheckbox = (index: number) => {
    setChecked(prev => prev.map(
      (val, i) => i === index ? !val : val
    ));
  };

  // Funcion que abre el modal para confirmar eliminacion de una actividad
  const deleteActivity = (id: number) => {
    setIdToDelete(id);
    setIsDeleteModalVisible(true);
  }

  // Funcion que abre el modal para modificar una actividad
  const modifyActivity = (id: number) => {
    setIdToModify(id);
    setIsModifyModalVisible(true);
  }

  const renderRightActions = () => {
    return (
      <Pressable 
        style={styles.deleteButton} 
        onPress={() => deleteActivity(id)}
      >
        <Trash2 size={24} color={DANGER_COLOR} />
      </Pressable>
    )
  }

  const renderLeftActions = () => {
    return (
      <Pressable 
        style={styles.deleteButton} 
        onPress={() => modifyActivity(id)}
      >
        <Edit size={24} color={ACCENT_COLOR} />
      </Pressable>
    )
  }

  const activityBlockContent = (
    <ThemedView style={checked.every(item => item === true) ? styles.completedContainer : styles.container}>
      <ThemedView style={styles.infoContainer}>
        <ThemedView style={styles.timeContainer}>
          {/* "Show-details" button */}
          <Pressable onPress={toggleDetail}>
            {isDetailed ? (<ChevronUp size={20} />) : (<ChevronDown size={20} />)}
          </Pressable>

          {/* Time */}
          <ThemedText 
            style={checked.every(item => item === true) ? styles.completedTask : ""}
            type="defaultSemiBold"
          >
            {`${time_start} - ${time_end}`}
          </ThemedText>
        </ThemedView>
        
        {/* Activity name */}
        <ThemedText 
          style={checked.every(item => item === true) ? styles.completedTask : ""}
          type="defaultSemiBold"
        >
          {title}
        </ThemedText>
        
        {/* Status */}
        {checked.every(item => item === true) ? (
          <CircleCheckBig color={MAIN_COLOR}/>
        ) : (
          <CircleDashed color={ACCENT_COLOR}/>
        )}
      </ThemedView>

      {/* Checklist */}
      {isDetailed && (
        <ThemedView style={styles.checklistContainer}>
          {checkboxes.length === 0 && (
            <ThemedText type="default">Nothing to do for today</ThemedText>
          )}
          {checkboxes.map((item, index) => (
            <Pressable
              key={index}
              style={styles.checkboxRow}
              onPress={() => toggleCheckbox(index)}
            >
              {checked[index] ? (
                <SquareCheck color={MAIN_COLOR} />
              ) : (
                <Square color={ACCENT_COLOR} />
              )}

              <ThemedText 
                style={checked[index] ? styles.completedTask : ""}
              >
                {item.description}
              </ThemedText>
            </Pressable>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  )

  if (isSwipeable) {
    return (
      <Swipeable
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
        overshootRight={false}
        overshootLeft={false}
      >
        {activityBlockContent}
      </Swipeable>
    )
  } else {
    return activityBlockContent;
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: SECONDARY_COLOR,
    padding: 10,
    gap: 10,
    borderLeftWidth: 3,
    borderLeftColor: MAIN_COLOR,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  checklistContainer: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 5,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#4f4f4f',
  },
  completedContainer: {
    backgroundColor: '#e1e1e1',
    width: '100%',
    borderRadius: 10,
    padding: 10,
    gap: 10,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT_COLOR,
  }
})