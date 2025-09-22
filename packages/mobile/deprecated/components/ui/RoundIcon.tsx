import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

const RoundIcon = ({style = null, IconComponent, icon, size = 40, color = '#fff', backgroundColor = '#333', onPress }) => {
  const mergedStyles = [styles.iconContainer, style];
  return (
    <TouchableOpacity onPress={onPress} style={[mergedStyles, { width: size, height: size, backgroundColor }]}>
      <View style={styles.iconInnerContainer}>
        {IconComponent && <IconComponent size={size * 0.6} color={color} />}
        {icon}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RoundIcon;
