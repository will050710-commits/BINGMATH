import React from 'react';
import { View } from 'react-native';

let LinearGradient = null;
try {
  // Support react-native-linear-gradient (installed in this project)
  // eslint-disable-next-line global-require
  LinearGradient = require('react-native-linear-gradient').default || require('react-native-linear-gradient');
} catch (e) {
  try {
    // Fallback to expo-linear-gradient
    // eslint-disable-next-line global-require
    LinearGradient = require('expo-linear-gradient').LinearGradient;
  } catch (e2) {
    LinearGradient = null;
  }
}

/**
 * Renders a gradient when a LinearGradient module is available.
 * Falls back to a flat view using the first color otherwise.
 */
export default function GradientGlow({ colors, style, start, end, children, ...rest }) {
  if (LinearGradient && colors && colors.length > 0) {
    return (
      <LinearGradient
        colors={colors}
        start={start ?? { x: 0.5, y: 0 }}
        end={end ?? { x: 0.5, y: 1 }}
        style={style}
        {...rest}
      >
        {children}
      </LinearGradient>
    );
  }
  return <View style={[style, { backgroundColor: colors?.[0] ?? 'transparent' }]}>{children}</View>;
}
