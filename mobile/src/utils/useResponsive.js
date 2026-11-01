import { useWindowDimensions } from 'react-native';

/**
 * useResponsive — V1.0 Official responsive metrics for phones, foldables, and tablets
 * (Hermes bundle lines 266338–266401)
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const minDim = Math.min(width, height);
  const isTablet = minDim >= 600 || width >= 768;
  const isLandscape = width > height;
  const contentMaxWidth = isTablet ? 820 : '100%';
  const modalMaxWidth = isTablet ? 520 : '100%';
  const screenPadding = isTablet ? 32 : 16;
  const cardRadius = isTablet ? 24 : 20;
  const numGridColumns = isTablet ? (isLandscape ? 3 : 2) : 1;

  return {
    width,
    height,
    isTablet,
    isLandscape,
    contentMaxWidth,
    modalMaxWidth,
    screenPadding,
    cardRadius,
    numGridColumns,
  };
}

export default useResponsive;
