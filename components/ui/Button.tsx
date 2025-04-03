import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}

export function Button({ title, onPress, style }: ButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.button, style]}>
      <LinearGradient colors={['#007AFF', '#0055FF']} style={styles.buttonGradient}>
        <Text style={styles.buttonText}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    width: '80%',
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
