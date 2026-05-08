import React, { useMemo, useEffect } from 'react';
import { Modal, StyleSheet, View, Pressable, Dimensions } from 'react-native';
import { Trophy, X, ListTodo, Clock, CheckCircle2, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
  FadeIn,
  FadeInDown,
  Layout,
  ZoomIn
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/context/ThemeContext';
import type { Activity } from '@/types';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.45;
const STROKE_WIDTH = 15;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface StatsModalProps {
  isVisible: boolean;
  onClose: () => void;
  activities: Activity[];
  completedIds: (string | number)[];
  dateLabel: string;
}

export default function StatsModal({ isVisible, onClose, activities, completedIds, dateLabel }: StatsModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const stats = useMemo(() => {
    const total = activities.length;
    const completed = activities.filter(a => completedIds.includes(a.id)).length;
    const percentage = total > 0 ? (completed / total) : 0;
    const pending = total - completed;

    return { total, completed, percentage, pending, percentageText: Math.round(percentage * 100) };
  }, [activities, completedIds]);

  const progress = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      progress.value = withTiming(stats.percentage, {
        duration: 1000,
        easing: Easing.out(Easing.exp),
      });
    } else {
      progress.value = 0;
    }
  }, [isVisible, stats.percentage]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const cardStyle = {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          entering={ZoomIn.duration(300)}
          style={styles.modalContainer}
        >
          {/* Decorative Background Blur Effect */}
          <View style={styles.decorationCircle} />

          <View style={styles.header}>
            <View style={styles.titleGroup}>
              <View style={[styles.iconBadge, { backgroundColor: colors.main }]}>
                <Trophy size={18} color={colors.opposite_text} />
              </View>
              <View style={styles.headerTextGroup}>
                <ThemedText type="subtitle" style={styles.headerTitle}>Rendimiento</ThemedText>
                <ThemedText style={styles.dateLabel}>{dateLabel}</ThemedText>
              </View>
            </View>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <X size={22} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.content}>
            {/* Circular Progress Section */}
            <View style={styles.chartContainer}>
              <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                <G rotation="-90" origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}>
                  <Circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={RADIUS}
                    stroke={colors.main + '15'}
                    strokeWidth={STROKE_WIDTH}
                    fill="transparent"
                  />
                  <AnimatedCircle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={RADIUS}
                    stroke={colors.main}
                    strokeWidth={STROKE_WIDTH}
                    fill="transparent"
                    strokeDasharray={CIRCUMFERENCE}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                  />
                </G>
              </Svg>
              <View style={styles.percentageContainer}>
                <ThemedText style={styles.percentageNumber}>{stats.percentageText}%</ThemedText>
                <ThemedText style={styles.percentageLabel}>Logrado</ThemedText>
              </View>
            </View>

            {/* Stats Items - Clean & Minimalist */}
            <View style={styles.statsRow}>
              <Animated.View entering={FadeInDown.delay(100)} style={[styles.statCard, cardStyle]}>
                <View style={styles.statIconWrapper}>
                  <ListTodo size={22} color="#2196F3" />
                </View>
                <ThemedText style={styles.statValue}>{stats.total}</ThemedText>
                <ThemedText style={styles.statName}>Total</ThemedText>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(200)} style={[styles.statCard, cardStyle]}>
                <View style={styles.statIconWrapper}>
                  <CheckCircle2 size={22} color="#4CAF50" />
                </View>
                <ThemedText style={styles.statValue}>{stats.completed}</ThemedText>
                <ThemedText style={styles.statName}>Hechas</ThemedText>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(300)} style={[styles.statCard, cardStyle]}>
                <View style={styles.statIconWrapper}>
                  <Clock size={22} color={colors.mid_accent} />
                </View>
                <ThemedText style={styles.statValue}>{stats.pending}</ThemedText>
                <ThemedText style={styles.statName}>Pendientes</ThemedText>
              </Animated.View>
            </View>

            {/* Achievement Section */}
            {stats.percentageText === 100 && stats.total > 0 ? (
              <Animated.View entering={FadeIn.delay(500)} style={styles.achievementCard}>
                <View style={styles.achievementIcon}>
                  <Star size={32} color="#FFD700" fill="#FFD700" />
                </View>
                <View style={styles.achievementTextContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.achievementTitle}>¡Día Impecable!</ThemedText>
                  <ThemedText style={styles.achievementSub}>Has dominado tus metas de hoy.</ThemedText>
                </View>
              </Animated.View>
            ) : (
              <View style={styles.encouragementContainer}>
                <ThemedText style={styles.encouragementText}>
                  {stats.percentageText >= 80 ? "¡Casi lo logras! Mantén el ritmo." :
                    stats.percentageText >= 50 ? "Buen progreso, sigue adelante." :
                      stats.total > 0 ? "¡Tú puedes! Paso a paso." :
                        "Planifica tu día para empezar."}
                </ThemedText>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '92%',
    backgroundColor: colors.card,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.light_accent,
    overflow: 'hidden',
  },
  decorationCircle: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.main,
    opacity: 0.1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTextGroup: {
    justifyContent: 'center',
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  dateLabel: {
    fontSize: 12,
    opacity: 0.5,
    textTransform: 'capitalize',
    marginTop: 0,
  },
  closeButton: {
    padding: 8,
    backgroundColor: colors.secondary + '60',
    borderRadius: 12,
  },
  content: {
    alignItems: 'center',
  },
  chartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 35,
  },
  percentageContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageNumber: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 50,
    includeFontPadding: false,
    textAlign: 'center',
  },
  percentageLabel: {
    fontSize: 12,
    opacity: 0.4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: -5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 0,
    marginBottom: 25,
    width: '100%',
  },
  statCard: {
    flex: 1,
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconWrapper: {
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statName: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 2,
    textAlign: 'center',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.main + '10',
    padding: 16,
    borderRadius: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.main + '30',
    gap: 16,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFD70020',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementTextContainer: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    color: colors.main,
  },
  achievementSub: {
    fontSize: 13,
    opacity: 0.7,
  },
  encouragementContainer: {
    padding: 10,
  },
  encouragementText: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
    textAlign: 'center',
  }
});
