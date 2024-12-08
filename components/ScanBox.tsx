import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ScanBoxProps {
  width: number;
  height: number;
}

const ScanBox: React.FC<ScanBoxProps> = ({ width, height }) => {
  return (
    <View
      style={[
        styles.box,
        { width, height },
      ]}
    >
      <View style={styles.corner} />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: 'white',
  },
});

export default ScanBox;
