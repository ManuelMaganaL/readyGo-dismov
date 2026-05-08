import { useRef, useState } from "react";
import { Swipeable } from "react-native-gesture-handler";
import { StyleSheet, Pressable, View } from "react-native";
import * as Haptics from 'expo-haptics';
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


export default function ActivityBlock({
  id,
  title,
  time_start,
  time_end,
  checkboxes,
  isDetailed,
  onToggleDetail,
  setIdToDelete,
  setIsDeleteModalVisible,
  setIdToModify,
  setIsModifyModalVisible,
  isSwipeable,
  onCompletionChange,
  initialChecklistState,
  initialCompleted,
}: ActivityBlockProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const swipeableRef = useRef<Swipeable | null>(null);

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleDetail();
  };

  const toggleCheckbox = (index: number) => {
    const isChecking = !checked[index];
    const nextChecked = checked.map((val, i) => i === index ? !val : val);
    const allDone = nextChecked.every(item => item === true);
    
    if (allDone && isChecking) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setChecked(nextChecked);
    onCompletionChange?.(id, allDone, nextChecked);
  };

  const toggleTaskCompletion = () => {
    if (checked.length === 0) {
      const nextCompleted = !isTaskCompleted;
      if (nextCompleted) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setIsTaskCompleted(nextCompleted);
      onCompletionChange?.(id, nextCompleted, []);
      return;
    }

    const shouldComplete = !checked.every(item => item === true);
    if (shouldComplete) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const nextChecked = checked.map(() => shouldComplete);
    setChecked(nextChecked);
    onCompletionChange?.(id, shouldComplete, nextChecked);
  };

  // Funcion que abre el modal para confirmar eliminacion de una actividad
  const deleteActivity = (id: string | number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swipeableRef.current?.close();
    setIdToDelete?.(String(id) as any);
    setIsDeleteModalVisible?.(true);
  }

  // Funcion que abre el modal para modificar una actividad
  const modifyActivity = (id: string | number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    swipeableRef.current?.close();
    setIdToModify?.(String(id) as any);
    setIsModifyModalVisible?.(true);
  }

  const renderRightActions = () => {
    return (
      <Pressable 
        style={styles.deleteButton} 
        onPress={() => deleteActivity(id)}
      >
        <Trash2 size={24} color={colors.danger} />
      </Pressable>
    )
  }

  const renderLeftActions = () => {
    return (
      <Pressable 
        style={styles.deleteButton} 
        onPress={() => modifyActivity(id)}
      >
        <Edit size={24} color={colors.accent} />
      </Pressable>
    )
  }

  const activityBlockContent = (
    <View style={[
    styles.container,
    {
      backgroundColor: isCompleted
        ? (colors.checked ?? colors.mid_accent)
        : colors.secondary,
    },]}>
      <View style={styles.infoContainer}>
        <View style={styles.timeContainer}>
          {/* "Show-details" button */}
          <Pressable onPress={toggleDetail}>
          {isDetailed 
          ? <ChevronUp size={20} color={colors.main}/> 
          : <ChevronDown size={20} color={colors.main}/>
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
            <CircleCheckBig color={colors.main}/>
          ) : (
            <CircleDashed color={colors.main}/>
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
                  <SquareCheck color={colors.main} />
                ) : (
                  <Square color={colors.main} />
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
        ref={swipeableRef}
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

const createStyles = (colors: any) =>
   StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 10,
    padding: 10,
    gap: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.main,
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
    color: colors.text_checked ?? '#FFFFFF',
  },
  completedContainer: {
    backgroundColor: colors.danger,
    width: '100%',
    borderRadius: 10,
    padding: 10,
    gap: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  }
})