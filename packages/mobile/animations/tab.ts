import { Animated } from "react-native";

/**
 * Creates animation values for tab indicator
 * @returns {Object} Animation values
 */
export const createTabAnimations = () => {
  const indicatorPosition = new Animated.Value(0);

  /**
   * Animates the tab indicator to a specific position
   * @param {number} toValue - The target position (0, 1, or 2 for tabs)
   * @param {number} duration - Animation duration in ms
   */
  const animateTab = (toValue: number, duration: number = 300) => {
    Animated.timing(indicatorPosition, {
      toValue,
      duration,
      useNativeDriver: false,
    }).start();
  };

  return {
    indicatorPosition,
    animateTab,
  };
};