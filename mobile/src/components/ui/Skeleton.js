import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radius } from '../../theme/spacing';

/**
 * A single shimmering placeholder block. Compose a few of these into the
 * shape of the real content (e.g. a leaderboard row) so a loading state
 * reads as "the content is arriving" instead of a blank spinner or
 * "Đang tải..." text.
 *
 * Usage:
 *   <SkeletonBlock width="70%" height={14} />
 *   <SkeletonBlock width={40} height={40} radius={20} /> // circular
 */
export function SkeletonBlock({ width = '100%', height = 14, radius, style }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.75] });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius ?? Radius?.sm ?? 6,
          backgroundColor: Colors.bgGlass,
          opacity,
        },
        style,
      ]}
    />
  );
}

/** Pre-shaped skeleton matching a leaderboard row's layout (rank · avatar · name/school · xp). */
export function LeaderboardRowSkeleton() {
  return (
    <View style={styles.lbRow}>
      <SkeletonBlock width={28} height={20} radius={6} />
      <SkeletonBlock width={34} height={34} radius={17} />
      <View style={{ flex: 1, gap: 6 }}>
        <SkeletonBlock width="55%" height={13} />
        <SkeletonBlock width="35%" height={10} />
      </View>
      <SkeletonBlock width={44} height={16} />
    </View>
  );
}

/** Pre-shaped skeleton matching a resource/lesson card. */
export function CardSkeleton({ height = 120 }) {
  return (
    <View style={[styles.card, { height }]}>
      <SkeletonBlock width="60%" height={14} style={{ marginBottom: 8 }} />
      <SkeletonBlock width="85%" height={10} style={{ marginBottom: 6 }} />
      <SkeletonBlock width="40%" height={10} />
    </View>
  );
}

/** Pre-shaped skeleton for the XP / stats section. */
export function StatRowSkeleton() {
  return (
    <View style={styles.statRow}>
      <SkeletonBlock width={48} height={48} radius={24} />
      <View style={{ flex: 1, gap: 6 }}>
        <SkeletonBlock width="50%" height={12} />
        <SkeletonBlock width="30%" height={10} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'flex-end',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
});
