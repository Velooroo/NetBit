import { ActivityIndicator, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ThemedView } from '@/components/base/ThemedView';

export function LoadingOverlay() {
  return (
    <Animated.View 
      entering={FadeIn.duration(200)}
      style={StyleSheet.absoluteFill}
    >
      <ThemedView style={styles.overlay}>
        <ActivityIndicator size="large" color="#007AFF" />
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
