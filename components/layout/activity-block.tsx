/** TODO
 * Logica: Si todos los checkboxes de una actividad estan "complete true" cambiar el icono de CircleDashed a CircleCheckBig
 * UI: Scroll y signo de añadir actividad de tu lista de actividades
 * Modal para agregar actividades de tu lista al dia
 * Boton para eliminar actividad del dia
 * 
 * REFINEMENT
 * Marcar de un color mas obscuro la actividad que esta transcurriendo (si la hora actual esta entre time_start y end_time)
 * Si la actividad transcurriente esta completa marcar mas obscuro la siguiente actividad
 * Si todo esta completo mostrar animacion de confeti
*/

import { useState } from "react";
import { StyleSheet, Pressable } from "react-native";
import { 
  CircleDashed, 
  CircleCheckBig, 
  ChevronDown, 
  ChevronUp, 
  Square, 
  SquareCheck
} from "lucide-react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

import type { ActivityBlockProps } from "@/types/index";

export default function ActivityBlock({
  title,
  time_start,
  end_time,
  complete,
  checkboxes,
  position,
  isDetailed,
  setIsDetailed
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

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.infoContainer}>
        <ThemedView style={styles.timeContainer}>
          {/* "Show-details" button */}
          <Pressable onPress={toggleDetail}>
            {isDetailed ? (<ChevronUp size={20} />) : (<ChevronDown size={20} />)}
          </Pressable>

          {/* Time */}
          <ThemedText type="defaultSemiBold">{`${time_start} - ${end_time}`}</ThemedText>
        </ThemedView>
        
        {/* Activity name */}
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        
        {/* Status */}
        {complete ? (
          <CircleCheckBig size={20} color={'#8052c7'}/>
        ) : (
          <CircleDashed size={20} color={'#4f4f4f'}/>
        )}
      </ThemedView>

      {/* Checklist */}
      {isDetailed && (
        <ThemedView style={styles.checklistContainer}>
          {checkboxes.map((item, index) => (
            <Pressable
              key={index}
              style={styles.checkboxRow}
              onPress={() => toggleCheckbox(index)}
            >
              {checked[index] ? (
                <SquareCheck size={20} color="#8052c7" />
              ) : (
                <Square size={20} color="#4f4f4f" />
              )}

              <ThemedText>{item.description}</ThemedText>
            </Pressable>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  )
}


const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#c7c7c7',
    padding: 10,
    gap: 10,
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
})