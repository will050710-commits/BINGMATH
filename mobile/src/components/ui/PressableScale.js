import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { haptic, Motion } from '../../theme/effects';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Drop-in replacement for TouchableOpacity that adds a real tactile
 * press (the whole element — border, background, shadow and all —
 * scales down together as one unit) instead of just an opacity fade,
 * with an optional light haptic tick on tap.
 *
 *   <PressableScale onPress={fn} style={s}>
 */
export default function PressableScale({
  children,
  onPress,
  style,
  scaleTo = 0.96,
  haptics = 'tap', // 'tap' | 'select' | 'success' | 'warn' | null
  disabled,
  ...rest
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue, duration) =>
    Animated.timing(scale, { toValue, duration, useNativeDriver: true }).start();

  const handlePressIn = () => animateTo(scaleTo, Motion.pressScale.duration);
  const handlePressOut = () => animateTo(1, Motion.releaseScale.duration);

  const handlePress = (e) => {
    if (haptics && haptic[haptics]) haptic[haptics]();
    onPress && onPress(e);
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={[style, { transform: [{ scale }] }, disabled && { opacity: 0.5 }]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
