import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, StyleSheet, AppState } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { FontFamily } from '../../theme/typography';

/**
 * Decorative floating math symbols for hero/background sections
 * (the "π Σ θ ∞" drifting in the background).
 *
 * Unlike a plain Animated.loop, this pauses itself when:
 *  - the screen loses focus (user navigated to another tab/screen), or
 *  - the app goes to the background,
 * instead of animating forever off-screen and draining battery.
 *
 * Usage (inside a `position: relative`-ish container, e.g. the hero View):
 *   <FloatingMathBg symbols={['π','Σ','θ','∞','∫','Δ']} color={Colors.cyan} />
 */
function FloatingItem({ children, index, color, fontSize, fontFamily, area }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const isFocused  = useIsFocused();
  const loopRef    = useRef(null);

  useEffect(() => {
    const targetOpacity = 0.15 + (index % 3) * 0.06;

    const start = () => {
      loopRef.current?.stop();
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -16,
            duration: 2000 + index * 400,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 2000 + index * 400,
            useNativeDriver: true,
          }),
        ]),
      );
      Animated.timing(opacity, {
        toValue: targetOpacity,
        duration: 600,
        useNativeDriver: true,
      }).start();
      loopRef.current.start();
    };

    const stop = () => {
      loopRef.current?.stop();
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    };

    const appIsActive = () => AppState.currentState === 'active';
    if (isFocused && appIsActive()) {
      start();
    } else {
      stop();
    }

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isFocused) {
        start();
      } else {
        stop();
      }
    });

    return () => {
      stop();
      sub.remove();
    };
  }, [isFocused]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Animated.Text
      style={[
        styles.symbol,
        {
          left: `${area.left}%`,
          top: `${area.top}%`,
          color,
          fontSize,
          fontFamily,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="none"
    >
      {children}
    </Animated.Text>
  );
}

export default function FloatingMathBg({
  symbols,
  color = '#00D2FF',
  count = 6,
  fontFamily = FontFamily.bold,
}) {
  const items = useMemo(
    () =>
      symbols.slice(0, count).map((s, i) => ({
        symbol: s,
        area: { left: 8 + (i * 18) % 80, top: 10 + (i * 17) % 60 },
      })),
    [symbols, count],
  );

  return (
    <>
      {items.map((it, i) => (
        <FloatingItem
          key={i}
          index={i}
          color={color}
          fontSize={22}
          fontFamily={fontFamily}
          area={it.area}
        >
          {it.symbol}
        </FloatingItem>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  symbol: { position: 'absolute' },
});
