import { View, Text, StyleSheet } from 'react-native';
import Button from '@/components/Button';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter(); // Initialize router for navigation

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <Text style={styles.cameraStyle}>📷</Text>
      </View>
      <Button
        label="Begin Scan"
        color="#0BCE83"
        textColor="#fff"
        onPress={() => router.push('/id-scan')} // Navigate to ID Scan
      />
      <Button
        label="View Log"
        color="#000000"
        textColor="#D9D9D9"
        onPress={() => router.push('/log-details')} // Navigate to Log Details
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  cameraStyle: {
    fontSize: 200,
    textAlign: 'center',
    lineHeight: 180,
  },
  cameraContainer: {
    width: 250,
    height: 230,
    backgroundColor: '#D9D9D9',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
});
