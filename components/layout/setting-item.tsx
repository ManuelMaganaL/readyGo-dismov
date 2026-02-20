import { StyleSheet, Switch, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

import { ACCENT_COLOR, MAIN_COLOR } from "@/constants/theme";
import type { SettingItemProps } from "@/types";


export default function SettingItem({  
  icon,
  label, 
  type = 'link', 
  value, 
  onPress, 
  onValueChange
}: SettingItemProps) {
  return (
    <TouchableOpacity 
      style={styles.itemContainer} 
      onPress={type !== 'switch' ? onPress : undefined}
      activeOpacity={type === 'switch' ? 1 : 0.7}
    >
      <ThemedView style={styles.itemLeft}>
        <ThemedView style={styles.iconBox}>
          {icon}
        </ThemedView>
        <ThemedText>
          {label}
        </ThemedText>
      </ThemedView>

      <ThemedView>
        {type === 'switch' ? (
          <Switch
            trackColor={{ false: ACCENT_COLOR, true: MAIN_COLOR }}
            thumbColor={"#fff"}
            ios_backgroundColor="#e0e0e0"
            onValueChange={onValueChange}
            value={value}
          />
        ) : (
          <ChevronRight size={18} color="#ccc" />
        )}
      </ThemedView>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
})

