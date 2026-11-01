import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, Dimensions, StyleSheet, AppState } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

const { height: SCREEN_H } = Dimensions.get('window');

/**
 * Decorative "rising particle" background (small rotated squares drifting
 * up and fading out) — the battle-arena equivalent of FloatingMathBg.
 *
 *   <FloatingParticles count={10} color={Colors.primary} />
 */
function Particle({ index, color, size, left, duration, startY }) {
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();
  const cancelledRef = useRef(true);

  useEffect(() => {
    cancelledRef.current = true;
    let startTimeout;

    const runOnce = () => {
      if (cancelledRef.current) return;
      y.setValue(0);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(y, { toValue: -SCREEN_H * 0.8, duration, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.5, duration: 400, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: Math.max(duration - 400, 100), useNativeDriver: true }),
        ]),
      ]).start(({ finished }) => {
        if (finished && !cancelledRef.current) runOnce();
      });
    };

    const appIsActive = () => AppState.currentState === 'active';

    if (isFocused && appIsActive()) {
      cancelledRef.current = false;
      startTimeout = setTimeout(runOnce, index * 300);
    }

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isFocused) {
        cancelledRef.current = false;
        startTimeout = setTimeout(runOnce, 0);
      } else {
        cancelledRef.current = true;
      }
    });

    return () => {
      cancelledRef.current = true;
      clearTimeout(startTimeout);
      sub.remove();
    };
  }, [isFocused]);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: `${left}%`, top: startY,
          transform: [{ translateY: y }, { rotate: '45deg' }],
          opacity, width: size, height: size, borderColor: color,
        },
      ]}
      pointerEvents="none"
    />
  );
}

export default function FloatingParticles({ count = 10, color }) {
  const items = useMemo(() => Array.from({ length: count }).map((_, i) => ({
    size: 10 + (i % 4) * 8,
    left: (i * 137.5) % 100,
    duration: 4000 + (i * 700) % 3000,
    startY: SCREEN_H * 0.7 + (i % 3) * 60,
  })), [count]);

  return (
    <>
      {items.map((it, i) => (
        <Particle key={i} index={i} color={color} {...it} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  particle: { position: 'absolute', borderWidth: 1, borderRadius: 2, backgroundColor: 'transparent' },
});
