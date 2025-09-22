import React from 'react';
import { TextInput, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export function Input({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  style,
  inputStyle,
}: InputProps) {
  return (
    <LinearGradient
      colors={['#FFFFFF', '#F8F8F8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, style]}
    >
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#999999"
        style={[styles.input, inputStyle]}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardAppearance="light"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    fontSize: 16,
    color: '#333333',
  },
});
