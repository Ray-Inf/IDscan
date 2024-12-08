import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
  label: string;
  color: string;
  textColor: string;
  onPress: () => void; // Function to handle button press
};

export default function Button({ label, color, textColor, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, { backgroundColor: color }]}>
      <Text style={[styles.textStyle, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    width: 253,
    height: 61,
  },
  textStyle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
