import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * A "▼" that smoothly rotates to point up when `open` is true, instead of
 * abruptly swapping between "▼" and "▲" characters.
 *
 *   <Chevron open={isExpanded} color={Colors.textMuted} />
 */
export default function Chevron({ open, size = 14, color }) {
  const rotate = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotate, { toValue: open ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [open]);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <Animated.Text style={{ fontSize: size, color, transform: [{ rotate: spin }] }}>
      ▼
    </Animated.Text>
  );
}
