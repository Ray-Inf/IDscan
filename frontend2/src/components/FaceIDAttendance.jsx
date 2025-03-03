import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";

const FaceIDAttendance = () => {
  // States for the component
  const [step, setStep] = useState('initial'); // initial, idscan, facescan, verification, success, error
  const [userData, setUserData] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [scanStatus, setScanStatus] = useState("");
  const [scanProgress, setScanProgress] = useState(0);
  const [debugInfo, setDebugInfo] = useState(null);
  
  // ID Scan states
  const [capturedIDImage, setCapturedIDImage] = useState(null);
  const [idScanComplete, setIdScanComplete] = useState(false);
  
  // Face Scan states
  const [capturedFaceImage, setCapturedFaceImage] = useState(null);
  const [faceScanComplete, setFaceScanComplete] = useState(false);
  
  // Refs
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.baseURL = 'http://localhost:5000';
  }, []);

  // Load user data from localStorage
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.card_id) {
        setUserData(user);
      } else {
        setError("User information not found. Please login again.");
      }
    } catch (err) {
      console.error("Error loading user data:", err);
      setError("Failed to load user information. Please login again.");
    }
  }, []);

  // Fetch available classes when user data is loaded
  useEffect(() => {
    if (userData) {
      fetchAvailableClasses();
    }
  }, [userData]);

  // Add a refresh timer to periodically check for available classes
  useEffect(() => {
    if (userData && step === 'initial') {
      const refreshTimer = setInterval(() => {
        fetchAvailableClasses();
      }, 60000); // Refresh every minute
      
      return () => clearInterval(refreshTimer);
    }
  }, [userData, step]);

  // Fetch server time for debugging purposes
  const fetchServerTime = async () => {
    try {
      const response = await axios.get("/class_schedule/debug/time");
      if (response.data.success) {
        setDebugInfo(response.data);
        console.log("Server time info:", response.data);
      }
    } catch (err) {
      console.error("Error fetching server time:", err);
    }
  };

  // Fetch available classes for the student
  const fetchAvailableClasses = async () => {
    if (!userData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Display the current time for debugging
      console.log("Fetching classes at:", new Date().toLocaleTimeString());
      
      // Fetch server time for comparison
      await fetchServerTime();
      
      const response = await axios.get("/class_schedule/student-classes", {
        params: { card_id: userData.card_id }
      });

      if (response.data.success) {
        console.log("Available classes:", response.data.classes);
        setAvailableClasses(response.data.classes || []);
        
        // Store debug info if available
        if (response.data.debug_info) {
          console.log("Debug info:", response.data.debug_info);
        }
        
        // Clear any previous errors if we successfully fetched classes
        setError(null);
      } else {
        setError(response.data.error || "Failed to fetch available classes");
      }
    } catch (err) {
      console.error("Error fetching available classes:", err);
      setError("Failed to load available classes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Start webcam stream
  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setError("Camera access denied. Please enable camera permissions.");
    }
  }, []);

  // Stop webcam stream
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Reset the scanning process
  const resetScan = useCallback(() => {
    setCapturedIDImage(null);
    setCapturedFaceImage(null);
    setIdScanComplete(false);
    setFaceScanComplete(false);
    setScanProgress(0);
    setScanStatus("");
    setStep('initial');
    stopWebcam();
  }, [stopWebcam]);

  // Handle class selection
  const handleClassSelect = (classItem) => {
    setSelectedClass(classItem);
    setStep('idscan');
    startWebcam();
  };

  // Capture image from webcam
  const captureImage = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg");
    }
    return null;
  }, []);

  // Converts a base64 Data URL to a Blob object for file upload
  const dataURLtoBlob = (dataURL) => {
    const byteString = atob(dataURL.split(",")[1]);
    const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([arrayBuffer], { type: mimeString });
  };

  // Capture ID scan
  const captureID = useCallback(() => {
    const imageData = captureImage();
    if (imageData) {
      setCapturedIDImage(imageData);
      stopWebcam();
      setScanStatus("Verifying ID card...");
      setScanProgress(20);
      
      // Simulate ID verification process
      setTimeout(() => {
        setScanStatus("ID card verified successfully");
        setScanProgress(100);
        setTimeout(() => {
          setIdScanComplete(true);
          setStep('facescan');
          startWebcam();
        }, 1000);
      }, 1500);
      
      // In a real implementation, send the ID to the backend for verification
      // processID(imageData);
    }
  }, [captureImage, stopWebcam, startWebcam]);

  // Capture face scan
  const captureFace = useCallback(() => {
    const imageData = captureImage();
    if (imageData) {
      setCapturedFaceImage(imageData);
      stopWebcam();
      setScanStatus("Analyzing facial features...");
      setScanProgress(20);
      
      // Simulate face verification process
      setTimeout(() => {
        setScanStatus("Matching with student record...");
        setScanProgress(60);
        
        setTimeout(() => {
          setScanStatus("Face verification complete");
          setScanProgress(100);
          setTimeout(() => {
            setFaceScanComplete(true);
            setStep('verification');
            verifyAndMarkAttendance();
          }, 1000);
        }, 1000);
      }, 1500);
      
      // In a real implementation, send the face image to the backend for verification
      // processFaceScan(imageData);
    }
  }, [captureImage, stopWebcam]);

  // Process both verifications and mark attendance
  const verifyAndMarkAttendance = async () => {
    if (!userData || !selectedClass || !idScanComplete || !faceScanComplete) {
      setError("Verification incomplete. Please try again.");
      setStep('error');
      return;
    }

    setLoading(true);
    setScanStatus("Marking attendance...");
    setScanProgress(50);
    
    try {
      // In a production implementation, you would upload both ID and face images
      // const formData = new FormData();
      // formData.append("id_image", dataURLtoBlob(capturedIDImage));
      // formData.append("face_image", dataURLtoBlob(capturedFaceImage));
      
      // Instead, we'll make a direct API call to mark attendance
      const response = await axios.post("/class_schedule/classes/attendance", {
        class_id: selectedClass.id,
        card_id: userData.card_id,
        status: "present"  // Default status
      });
      
      if (response.data.success) {
        setScanProgress(100);
        setScanStatus("Attendance marked successfully");
        setSuccessMessage(`Attendance marked for ${selectedClass.class_name}`);
        setStep('success');
      } else {
        throw new Error(response.data.error || "Failed to mark attendance");
      }
    } catch (err) {
      console.error("Error marking attendance:", err);
      setError(err.response?.data?.error || err.message || "Failed to mark attendance. Please try again.");
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  // Render different steps
  const renderStepContent = () => {
    switch (step) {
      case 'initial':
        return renderClassSelection();
      case 'idscan':
        return renderIDScan();
      case 'facescan':
        return renderFaceScan();
      case 'verification':
        return renderVerification();
      case 'success':
        return renderSuccess();
      case 'error':
        return renderError();
      default:
        return renderClassSelection();
    }
  };

  // Render class selection step
  const renderClassSelection = () => (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Select Class for Attendance</h2>
      
      {debugInfo && (
        <div className="bg-blue-50 p-2 rounded text-xs mb-4">
          <p>Server time: {debugInfo.server_time}</p>
          <p>Day: {debugInfo.day_of_week}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : availableClasses.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          <p className="mb-2">No classes available right now</p>
          <p className="text-sm text-gray-600 mb-4">
            {`Current time: ${new Date().toLocaleTimeString()}`}
          </p>
          <button 
            onClick={fetchAvailableClasses}
            className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {availableClasses.map((classItem) => (
            <div key={classItem.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{classItem.class_name}</h3>
                  <p className="text-gray-600">Instructor: {classItem.instructor}</p>
                  <p className="text-gray-600">Room: {classItem.room || "Not specified"}</p>
                  <p className="text-gray-600">
                    Time: {classItem.start_time?.substring(0, 5)} - {classItem.end_time?.substring(0, 5)}
                  </p>
                </div>
                
                {classItem.already_attended ? (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    Attendance Marked
                  </span>
                ) : (
                  <button
                    onClick={() => handleClassSelect(classItem)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Mark Attendance
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="mt-4 text-center">
            <button 
              onClick={fetchAvailableClasses}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
            >
              Refresh Classes
            </button>
          </div>
        </div>
      )}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );

  // Render ID scan step
  const renderIDScan = () => (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Step 1: Scan Your ID Card</h2>
      <p className="mb-4 text-sm text-gray-600">Position your ID card in frame and ensure good lighting</p>
      
      {!capturedIDImage ? (
        <>
          <div className="relative w-full h-64 bg-black rounded-md overflow-hidden mb-4">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
            <div className="absolute inset-0 border-2 border-dashed border-white opacity-70 pointer-events-none">
              <div className="absolute inset-2 border border-yellow-400 opacity-50"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs text-center p-1 bg-black bg-opacity-50 rounded">
                Align ID card here
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setStep('initial')}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none"
            >
              Scan ID
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="w-full h-64 bg-black rounded-md overflow-hidden mb-4">
            <img src={capturedIDImage} alt="Captured ID" className="w-full h-full object-cover" />
          </div>
          <div className="w-full mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm">{scanStatus}</span>
              <span className="text-sm">{scanProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{width: `${scanProgress}%`}}
              ></div>
            </div>
          </div>
          {!idScanComplete && (
            <button
              onClick={() => {
                setCapturedIDImage(null);
                setScanProgress(0);
                startWebcam();
              }}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none"
            >
              Rescan ID
            </button>
          )}
        </>
      )}
    </div>
  );

  // Render face scan step
  const renderFaceScan = () => (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Step 2: Face Verification</h2>
      <p className="mb-4 text-sm text-gray-600">Look directly at the camera with neutral expression</p>
      
      {!capturedFaceImage ? (
        <>
          <div className="relative w-full h-64 bg-black rounded-md overflow-hidden mb-4">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-10 border-2 border-dashed border-yellow-400 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs text-center p-1 bg-black bg-opacity-50 rounded">
                Center your face here
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={resetScan}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none"
            >
              Cancel
            </button>
            <button
              onClick={captureFace}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none"
            >
              Verify Face
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="w-full h-64 bg-black rounded-md overflow-hidden mb-4">
            <img src={capturedFaceImage} alt="Captured Face" className="w-full h-full object-cover" />
          </div>
          <div className="w-full mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm">{scanStatus}</span>
              <span className="text-sm">{scanProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{width: `${scanProgress}%`}}
              ></div>
            </div>
          </div>
          {!faceScanComplete && (
            <button
              onClick={() => {
                setCapturedFaceImage(null);
                setScanProgress(0);
                startWebcam();
              }}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none"
            >
              Retry Face Scan
            </button>
          )}
        </>
      )}
    </div>
  );

  // Render verification step
  const renderVerification = () => (
    <div className="p-4 text-center">
      <div className="animate-pulse mb-4">
        <svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">Verifying Identity</h2>
      <p className="mb-4 text-gray-600">Please wait while we verify your identification...</p>
      <div className="w-full mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm">{scanStatus}</span>
          <span className="text-sm">{scanProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{width: `${scanProgress}%`}}
          ></div>
        </div>
      </div>
    </div>
  );

  // Render success step
  const renderSuccess = () => (
    <div className="p-4 text-center">
      <div className="mb-4 text-green-500">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">Attendance Confirmed!</h2>
      <p className="text-gray-600 mb-4">{successMessage}</p>
      {selectedClass && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4 text-left">
          <h3 className="font-medium">{selectedClass.class_name}</h3>
          <p className="text-sm">Instructor: {selectedClass.instructor}</p>
          <p className="text-sm">Room: {selectedClass.room || "Not specified"}</p>
          <p className="text-sm">
            Time: {selectedClass.start_time} - {selectedClass.end_time}
          </p>
          <p className="text-sm mt-2 font-medium text-green-600">
            Attendance recorded at {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
      <button
        onClick={() => {
          resetScan();
          fetchAvailableClasses();
        }}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none"
      >
        Return to Classes
      </button>
    </div>
  );

  // Render error step
  const renderError = () => (
    <div className="p-4 text-center">
      <div className="mb-4 text-red-500">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">Verification Failed</h2>
      <p className="text-gray-600 mb-4">{error || "An error occurred during the verification process."}</p>
      <button
        onClick={resetScan}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">Biometric Attendance</h1>
        {userData && (
          <div className="text-sm mt-1">
            {userData.name} • {userData.card_id}
          </div>
        )}
      </div>
      
      {error && step !== 'error' && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {renderStepContent()}
      
      {['idscan', 'facescan', 'verification'].includes(step) && (
        <div className="px-4 pb-4 pt-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>ID Verification {idScanComplete ? '✓' : '🔄'}</span>
            <span>Face Recognition {faceScanComplete ? '✓' : '🔄'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceIDAttendance;