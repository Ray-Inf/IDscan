import React, { useState, useRef } from 'react';
import { Image } from 'expo-image';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import {
  Animated,
  Button,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

const IDScan: React.FC = () => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<any>(null);
  const [captured, setCaptured] = useState(false); // Track if a photo is captured
  const cameraRef = useRef<any>(null);
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(0)).current;

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhoto(photo.uri);
      console.log('Photo Captured:', photo.uri);
      setCaptured(true); // Set captured to true when the photo is taken

      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  };

  const handleRetakePhoto = () => {
    setPhoto(null);
    setCaptured(false); // Reset captured status for retaking
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleFaceScanRoute = () => {
    router.push('/face-scan');
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
          // Display only Retake and Face Scan buttons after capturing the photo
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleRetakePhoto}>
              <Text style={styles.text}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.faceScanButton]}
              onPress={handleFaceScanRoute}
            >
              <Text style={styles.text}>Face Scan</Text>
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

export default IDScan;


// import React, { useState, useRef, useEffect } from 'react';
// import { Image } from 'expo-image';
// import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
// import { Animated, Button, StyleSheet, Text, TouchableOpacity, View,Easing } from 'react-native';
// import { useRouter } from 'expo-router';
// import * as tf from '@tensorflow/tfjs'; // Import TensorFlow.js
// import * as tfjs from '@tensorflow/tfjs-react-native'; // Import TensorFlow.js React Native bindings
// import * as cocoSsd from '@tensorflow-models/coco-ssd'; // COCO-SSD for object detection

// const IDScan: React.FC = () => {
//   const [facing, setFacing] = useState<CameraType>('back');
//   const [permission, requestPermission] = useCameraPermissions();
//   const [photo, setPhoto] = useState<any>(null);
//   const [captured, setCaptured] = useState(false);
//   const [idCardDetected, setIdCardDetected] = useState(false); // State to track ID card detection
//   const cameraRef = useRef<any>(null);
//   const router = useRouter();
//   const slideAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     const loadModel = async () => {
//       await tf.ready(); // Ensure TensorFlow.js is ready
//       await tfjs.ready();
//     };
//     loadModel();
//   }, []);

//   // Run the ID card detection logic using TensorFlow.js and a pre-trained COCO-SSD model
//   const detectIDCard = async (cameraFeed: any) => {
//     const model = await cocoSsd.load(); // Load the pre-trained COCO-SSD model
//     const imageTensor = tf.browser.fromPixels(cameraFeed); // Convert camera feed to Tensor

//     const predictions = await model.detect(imageTensor); // Run the object detection

//     // Check if any of the detected objects is a rectangle (for simplicity, assume an ID card is rectangular)
//     const idCardDetected = predictions.some(pred => pred.class === 'book'); // Simulating ID card detection as 'book'
//     setIdCardDetected(idCardDetected); // Set the state based on detection

//     // Release the tensor memory to prevent leaks
//     imageTensor.dispose();
//   };

//   // Automatically route to face-scan if ID card is detected
//   useEffect(() => {
//     if (idCardDetected) {
//       router.push('/face-scan');
//     }
//   }, [idCardDetected]);

//   if (!permission) {
//     return <View />;
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.message}>We need your permission to show the camera</Text>
//         <Button onPress={requestPermission} title="Grant Permission" />
//       </View>
//     );
//   }

//   const toggleCameraFacing = () => {
//     setFacing((current) => (current === 'back' ? 'front' : 'back'));
//   };

//   const capturePhoto = async () => {
//     if (cameraRef.current) {
//       const photo = await cameraRef.current.takePictureAsync();
//       setPhoto(photo.uri);
//       console.log('Photo Captured:', photo.uri);
//       setCaptured(true);
//       Animated.timing(slideAnim, {
//         toValue: 1,
//         duration: 500,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }).start();
//     }
//   };

//   const handleRetakePhoto = () => {
//     setPhoto(null);
//     setCaptured(false);
//     Animated.timing(slideAnim, {
//       toValue: 0,
//       duration: 500,
//       easing: Easing.in(Easing.ease),
//       useNativeDriver: true,
//     }).start();
//   };

//   const handleFaceScanRoute = () => {
//     router.push('/face-scan');
//   };

//   const slideUpStyle = {
//     transform: [
//       {
//         translateY: slideAnim.interpolate({
//           inputRange: [0, 1],
//           outputRange: [600, 0],
//         }),
//       },
//     ],
//   };

//   return (
//     <View style={styles.container}>
//       <CameraView
//         style={styles.camera}
//         facing={facing}
//         ref={cameraRef}
//         onCameraReady={() => detectIDCard(cameraRef.current)} // Detect ID card when the camera is ready
//       />

//       {/* Rectangular box to guide the user */}
//       <View style={styles.guidelineBox}></View>

//       <View style={[styles.tabContainer, { zIndex: captured ? 3 : 2 }]}>
//         {captured ? (
//           // Display only Retake and Face Scan buttons after capturing the photo
//           <View style={styles.buttonContainer}>
//             <TouchableOpacity style={styles.button} onPress={handleRetakePhoto}>
//               <Text style={styles.text}>Retake</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.button, styles.faceScanButton]}
//               onPress={handleFaceScanRoute}
//             >
//               <Text style={styles.text}>Face Scan</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           // Display Flip Camera and Capture buttons when no photo is captured
//           <View style={styles.buttonContainer}>
//             <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
//               <Text style={styles.text}>Flip Camera</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.button} onPress={capturePhoto}>
//               <Text style={styles.text}>Capture</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>

//       {/* Animated View for captured image */}
//       <Animated.View style={[styles.capturedView, slideUpStyle]}>
//         {photo && (
//           <View style={styles.photoContainer}>
//             <Text style={styles.message}>Captured Photo:</Text>
//             <Image source={{ uri: photo }} style={styles.capturedImage} />
//           </View>
//         )}
//       </Animated.View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f0f0f0',
//     justifyContent: 'flex-end',
//   },
//   message: {
//     textAlign: 'center',
//     paddingBottom: 10,
//   },
//   camera: {
//     flex: 3,
//   },
//   tabContainer: {
//     height: 80,
//     backgroundColor: 'white',
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     borderTopWidth: 1,
//     borderTopColor: '#ccc',
//     zIndex: 2,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-evenly',
//     width: '100%',
//   },
//   button: {
//     paddingVertical: 10,
//     paddingHorizontal: 25,
//     backgroundColor: 'green',
//     borderRadius: 8,
//   },
//   text: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: 'white',
//   },
//   faceScanButton: {
//     backgroundColor: '#4CAF50',
//   },
//   capturedView: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: '100%',
//     backgroundColor: 'white',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//     padding: 20,
//     zIndex: 1,
//   },
//   photoContainer: {
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   capturedImage: {
//     width: 250,
//     height: 150,
//     borderRadius: 10,
//     marginTop: 10,
//   },
//   guidelineBox: {
//     position: 'absolute',
//     top: '40%',
//     left: '10%',
//     right: '10%',
//     borderWidth: 2,
//     borderColor: 'green',
//     borderRadius: 10,
//     zIndex: 3,
//   },
// });

// export default IDScan;
