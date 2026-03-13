import { useState } from "react";
import { Swipeable } from "react-native-gesture-handler";
import { StyleSheet, Pressable, View } from "react-native";
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

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/context/ThemeContext";

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
  onCompletionChange,
  initialChecklistState,
  initialCompleted,
}: ActivityBlockProps) {
  const { dark } = useTheme();
  console.log("Activities theme:", dark);

  const blockColor = dark ? "#6B22A6" : SECONDARY_COLOR;
  const iconColor = dark ? "#F1CCFE" : "#6A23A8";

  const [checked, setChecked] = useState<boolean[]>(() => {
    if (initialChecklistState && initialChecklistState.length === checkboxes.length) {
      return initialChecklistState;
    }
    return checkboxes.map(checkbox => checkbox.complete ?? false);
  });
  const [isTaskCompleted, setIsTaskCompleted] = useState(initialCompleted ?? false);

  const isCompleted = checked.length > 0
    ? checked.every(item => item === true)
    : isTaskCompleted;

  const toggleDetail = () => { 
    setIsDetailed((prev: boolean[]) => prev.map(
      (val, i) => i === position ? !val : val
    ));
  }

  const toggleCheckbox = (index: number) => {
    setChecked(prev => {
      const nextChecked = prev.map((val, i) => i === index ? !val : val);
      onCompletionChange?.(id, nextChecked.every(item => item === true), nextChecked);
      return nextChecked;
    });
  };

  const toggleTaskCompletion = () => {
    if (checked.length === 0) {
      setIsTaskCompleted(prev => {
        const nextCompleted = !prev;
        onCompletionChange?.(id, nextCompleted, []);
        return nextCompleted;
      });
      return;
    }

    const shouldComplete = !checked.every(item => item === true);
    setChecked(prev => {
      const nextChecked = prev.map(() => shouldComplete);
      onCompletionChange?.(id, shouldComplete, nextChecked);
      return nextChecked;
    });
  };

  // Funcion que abre el modal para confirmar eliminacion de una actividad
  const deleteActivity = (id: string | number) => {
    setIdToDelete?.(String(id) as any);
    setIsDeleteModalVisible?.(true);
  }

  // Funcion que abre el modal para modificar una actividad
  const modifyActivity = (id: string | number) => {
    setIdToModify?.(String(id) as any);
    setIsModifyModalVisible?.(true);
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
    <View style={[
    styles.container,
    {
      backgroundColor: isCompleted
        ? "#e1e1e1"
        : blockColor,
    },]}>
      <View style={styles.infoContainer}>
        <View style={styles.timeContainer}>
          {/* "Show-details" button */}
          <Pressable onPress={toggleDetail}>
          {isDetailed 
          ? <ChevronUp size={20} color={iconColor}/> 
          : <ChevronDown size={20} color={iconColor}/>
          }
          </Pressable>

          {/* Time */}
          <ThemedText 
            style={isCompleted ? styles.completedTask : undefined}
            type="defaultSemiBold"
          >
            {`${time_start} - ${time_end}`}
          </ThemedText>
        </View>
        
        {/* Activity name */}
        <ThemedText 
          style={isCompleted ? styles.completedTask : undefined}
          type="defaultSemiBold"
        >
          {title}
        </ThemedText>
        
        {/* Status */}
        <Pressable onPress={toggleTaskCompletion} hitSlop={8}>
          {isCompleted ? (
            <CircleCheckBig color={iconColor}/>
          ) : (
            <CircleDashed color={iconColor}/>
          )}
        </Pressable>
      </View>

      {/* Checklist */}
      {isDetailed && (
        <View style={styles.checklistContainer}>
          {checkboxes.length === 0 && (
            <ThemedText type="default">Nothing to do for today</ThemedText>
          )}
          {checkboxes
            .map((item, index) => ({ item, index }))
            .sort((a, b) => {
              const aChecked = checked[a.index] ?? false;
              const bChecked = checked[b.index] ?? false;
              if (aChecked === bChecked) return 0;
              return aChecked ? 1 : -1;
            })
            .map(({ item, index }) => (
              <Pressable
                key={index}
                style={styles.checkboxRow}
                onPress={() => toggleCheckbox(index)}
              >
                {checked[index] ? (
                  <SquareCheck color={iconColor} />
                ) : (
                  <Square color={iconColor} />
                )}
                <ThemedText
                  style={checked[index] ? styles.completedTask : undefined}
                >
                  {item.description}
                </ThemedText>
              </Pressable>
            ))
          }
        </View>
      )}
    </View>
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