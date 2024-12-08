import React, { useState, useRef } from 'react';
import { Image } from 'expo-image';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Button, StyleSheet, Text, TouchableOpacity, View, Animated,Easing } from 'react-native';
import { useRouter } from 'expo-router';

const FaceScan: React.FC = () => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<any>(null); // Store captured photo
  const [captured, setCaptured] = useState(false); // Track if photo is captured
  const cameraRef = useRef<any>(null); // Reference for camera component
  const router = useRouter(); // Router instance to navigate between screens

  const slideAnim = useRef(new Animated.Value(0)).current; // Animated value for sliding up the photo view

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  const capturePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhoto(photo.uri); // Store the captured photo URI
      console.log('Photo Captured:', photo.uri);
      setCaptured(true); // Set captured to true when the photo is taken

      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(); // Slide up the photo view
    }
  };

  const handleRetakePhoto = () => {
    setPhoto(null); // Reset photo state to allow for retake
    setCaptured(false); // Reset captured status
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(); // Reset the animation
  };

  const handleFaceScanRoute = () => {
    router.push('/scan-success'); // Navigate to the next screen
  };

  const slideUpStyle = {
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [600, 0],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} />

      {/* Conditionally render the tab container */}
      <View style={[styles.tabContainer, { zIndex: captured ? 3 : 2 }]}>
        {captured ? (
          // Display only Retake and Proceed buttons after capturing the photo
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleRetakePhoto}>
              <Text style={styles.text}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.faceScanButton]}
              onPress={handleFaceScanRoute}
            >
              <Text style={styles.text}>Proceed</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Display Flip Camera and Capture buttons when no photo is captured
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={capturePhoto}>
              <Text style={styles.text}>Capture</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Animated View for captured image */}
      <Animated.View style={[styles.capturedView, slideUpStyle]}>
        {photo && (
          <View style={styles.photoContainer}>
            <Text style={styles.message}>Captured Photo:</Text>
            <Image source={{ uri: photo }} style={styles.capturedImage} />
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'flex-end',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 3,
  },
  tabContainer: {
    height: 80,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    zIndex: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: 'green',
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  faceScanButton: {
    backgroundColor: '#4CAF50',
  },
  capturedView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    padding: 20,
    zIndex: 1,
  },
  photoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  capturedImage: {
    width: 250,
    height: 150,
    borderRadius: 10,
    marginTop: 10,
  },
});

export default FaceScan;
