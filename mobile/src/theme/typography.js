import { StyleSheet } from 'react-native';

export const FontFamily = {
  regular: 'BeVietnamPro-Regular',
  medium: 'BeVietnamPro-Medium',
  semiBold: 'BeVietnamPro-SemiBold',
  bold: 'BeVietnamPro-Bold',
  extraBold: 'BeVietnamPro-ExtraBold',
  black: 'BeVietnamPro-Black',
};

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
  hero: 40,
};

export const LineHeight = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
};

export const Typography = StyleSheet.create({
  heroTitle: {
    fontFamily: FontFamily.black,
    fontSize: FontSize.hero,
    lineHeight: FontSize.hero * 1.1,
    color: '#ffffff',
  },
  sectionTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize['2xl'],
    color: '#ffffff',
    lineHeight: FontSize['2xl'] * 1.2,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: '#ffffff',
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: FontSize.base * 1.5,
  },
  bodyMuted: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: FontSize.sm * 1.5,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.3,
  },
  badge: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#ffffff',
  },
  tabLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10,
  },
});

export default Typography;
