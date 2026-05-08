import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './skeleton';
import { useTheme } from '@/context/ThemeContext';

export default function ActivitySkeleton() {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.secondary }]}>
      <View style={styles.header}>
        <View style={styles.left}>
          <Skeleton width={20} height={20} borderRadius={10} />
          <Skeleton width={80} height={16} />
        </View>
        <Skeleton width={100} height={18} />
        <Skeleton width={24} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent', // Will look like it's loading
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  }
});
