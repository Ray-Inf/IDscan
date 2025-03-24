// import React, { useState, useRef, useCallback } from "react";
// import axios from "axios";

// const IDScan = ({ onIDExtracted, onError }) => {
//   const [capturedImage, setCapturedImage] = useState(null);
//   const [scanning, setScanning] = useState(false);
//   const [scanStatus, setScanStatus] = useState("");
//   const [scanProgress, setScanProgress] = useState(0);
//   const videoRef = useRef(null);
//   const streamRef = useRef(null);

//   const startWebcam = useCallback(async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
//       });
      
//       streamRef.current = stream;
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }
//     } catch (error) {
//       console.error("Error accessing camera:", error);
//       onError("Camera access denied. Please enable camera permissions.");
//     }
//   }, [onError]);

//   const stopWebcam = useCallback(() => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => track.stop());
//       streamRef.current = null;
//     }
//   }, []);

//   const captureID = useCallback(() => {
//     if (videoRef.current) {
//       const canvas = document.createElement("canvas");
//       const context = canvas.getContext("2d");
//       canvas.width = videoRef.current.videoWidth;
//       canvas.height = videoRef.current.videoHeight;
//       context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
//       const imageData = canvas.toDataURL("image/jpeg");
//       console.log("ID captured - image data length:", imageData.length);
//       setCapturedImage(imageData);
//       stopWebcam();
//       setScanning(true);
//       setScanStatus("Starting ID verification process");
//       setScanProgress(10);
      
//       processID(imageData);
//     }
//   }, [stopWebcam]);

//   const processID = async (imageData) => {
//     try {
//       console.log("Processing captured image...");
      
//       // Create an Image object to ensure proper resize
//       const img = new Image();
//       img.onload = async () => {
//         // Create a canvas with the exact dimensions needed by the model
//         const canvas = document.createElement("canvas");
//         const ctx = canvas.getContext("2d");

//         // Set exact dimensions required by the model
//         canvas.width = 224;
//         canvas.height = 224;
        
//         // Draw the image maintaining aspect ratio
//         const aspectRatio = img.width / img.height;
//         let drawWidth, drawHeight, offsetX, offsetY;
        
//         if (aspectRatio > 1) {
//           // Image is wider than tall
//           drawHeight = 224;
//           drawWidth = drawHeight * aspectRatio;
//           offsetX = (drawWidth - 224) / -2;
//           offsetY = 0;
//         } else {
//           // Image is taller than wide
//           drawWidth = 224;
//           drawHeight = drawWidth / aspectRatio;
//           offsetX = 0;
//           offsetY = (drawHeight - 224) / -2;
//         }
        
//         // Fill with black background first
//         ctx.fillStyle = 'black';
//         ctx.fillRect(0, 0, 224, 224);
        
//         // Draw the image centered
//         ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        
//         // Get the resized image as dataURL
//         const resizedDataURL = canvas.toDataURL('image/jpeg', 0.95);
//         console.log("Resized image created successfully");
        
//         // Convert to blob directly without custom function
//         const resizedBlob = await fetch(resizedDataURL).then(r => r.blob());
//         console.log("Resized blob size:", resizedBlob.size, "type:", resizedBlob.type);
        
//         const formData = new FormData();
//         formData.append("id_image", resizedBlob, "id_card.jpg");
//         formData.append("card_id", "12345"); // Replace with actual card ID if needed
        
//         setScanStatus("Analyzing ID card...");
//         setScanProgress(30);

//         try {
//           console.log("Sending request to backend...");
//           const response = await axios.post("http://localhost:5000/api/scan", formData, {
//             headers: { "Content-Type": "multipart/form-data" }
//           });
          
//           console.log("Response received:", response.data);

//           setScanStatus("Verifying ID card template...");
//           setScanProgress(60);

//           await new Promise(resolve => setTimeout(resolve, 500));
//           setScanStatus("Extracting ID information...");
//           setScanProgress(80);

//           await new Promise(resolve => setTimeout(resolve, 500));
//           setScanStatus("Verification complete");
//           setScanProgress(100);

//           if (response.data.user_id || response.data.card_id) {
//             const userId = response.data.user_id || response.data.card_id;

//             const userInfo = {
//               name: response.data.name,
//               role: response.data.role,
//               templateId: response.data.template_id,
//               templateName: response.data.template_name,
//               similarity: response.data.similarity,
//               isNewUser: response.data.new_user || false
//             };
            
//             console.log("ID extraction successful:", userInfo);
//             onIDExtracted(userId, userInfo);
//             setScanning(false);
//           } else {
//             console.error("ID extraction failed - no user_id or card_id in response");
//             onError("Could not extract ID information. Please try again.");
//             resetScan();
//           }
//         } catch (error) {
//           console.error("API request failed:", error);
//           handleApiError(error);
//         }
//       };
      
//       img.onerror = () => {
//         console.error("Failed to load image for processing");
//         onError("Failed to process ID image. Please try again.");
//         resetScan();
//       };
      
//       // Set the image source to start loading
//       img.src = imageData;
      
//     } catch (error) {
//       console.error("Error in processing ID:", error);
//       handleApiError(error);
//     }
//   };
  
//   const handleApiError = (error) => {
//     let errorMessage = "Error processing ID card. Please try again.";

//     if (error.response && error.response.data && error.response.data.error) {
//       errorMessage = error.response.data.error;
//     }

//     onError(errorMessage);
//     resetScan();
//   };
  
//   const resetScan = () => {
//     setCapturedImage(null);
//     setScanning(false);
//     setScanProgress(0);
//     startWebcam();
//   };

//   React.useEffect(() => {
//     startWebcam();
//     return () => {
//       stopWebcam();
//     };
//   }, [startWebcam, stopWebcam]);

//   return (
//     <div className="flex flex-col items-center justify-center">
//       <h3 className="text-lg font-bold mb-2">ID Card Scanner</h3>
//       <p className="mb-4 text-sm text-gray-600">Position your ID card in frame and ensure good lighting</p>
      
//       {!capturedImage ? (
//         <>
//           <div className="relative w-full h-64 bg-black rounded-md overflow-hidden mb-4">
//             <video
//               ref={videoRef}
//               className="w-full h-full object-cover"
//               autoPlay
//               playsInline
//             />
//             <div className="absolute inset-0 border-2 border-dashed border-white opacity-70 pointer-events-none">
//               <div className="absolute inset-2 border border-yellow-400 opacity-50"></div>
//               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs text-center p-1 bg-black bg-opacity-50 rounded">
//                 Align ID card here
//               </div>
//             </div>
//           </div>
//           <button
//             onClick={captureID}
//             className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none"
//           >
//             Scan ID
//           </button>
//         </>
//       ) : (
//         <>
//           <div className="w-full h-64 bg-black rounded-md overflow-hidden mb-4">
//             <img src={capturedImage} alt="Captured ID" className="w-full h-full object-cover" />
//           </div>
//           {scanning ? (
//             <div className="w-full">
//               <div className="flex justify-between mb-1">
//                 <span className="text-sm">{scanStatus}</span>
//                 <span className="text-sm">{scanProgress}%</span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2.5">
//                 <div 
//                   className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
//                   style={{width: `${scanProgress}%`}}
//                 ></div>
//               </div>
//             </div>
//           ) : (
//             <button
//               onClick={resetScan}
//               className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none"
//             >
//               Rescan ID
//             </button>
//           )}
//         </>
//       )}
//       <div className="mt-2 text-xs text-gray-500 italic">
//         * System will verify ID card against approved templates
//       </div>
//     </div>
//   );
// };

// export default IDScan;
import React, { useState, useRef, useCallback } from "react";
import axios from "axios";

const IDScan = ({ onIDExtracted, onError }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState(""); // For showing verification steps
  const [scanProgress, setScanProgress] = useState(0); // For progress indication
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Start webcam to scan ID
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
      onError("Camera access denied. Please enable camera permissions.");
    }
  }, [onError]);

  // Stop webcam stream
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Capture ID image
  const captureID = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageData);
      stopWebcam();
      setScanning(true);
      setScanStatus("Starting ID verification process");
      setScanProgress(10);
      
      // Send the captured ID to backend for processing
      processID(imageData);
    }
  }, [stopWebcam]);

  // Process the ID image to extract information
  const processID = async (imageData) => {
    try {
      // Create form data with the image
      const formData = new FormData();
      formData.append("id_image", dataURLtoBlob(imageData));
      
      setScanStatus("Analyzing ID card...");
      setScanProgress(30);
      
      // Call backend API
      const response = await axios.post("http://127.0.0.1:5000/api/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setScanStatus("Verifying ID card template...");
      setScanProgress(60);
      
      // Simulate template verification delay (since it's already done on backend)
      await new Promise(resolve => setTimeout(resolve, 500));
      setScanStatus("Extracting ID information...");
      setScanProgress(80);
      
      // Simulate OCR delay (since it's already done on backend)
      await new Promise(resolve => setTimeout(resolve, 500));
      setScanStatus("Verification complete");
      setScanProgress(100);
      
      if (response.data.user_id || response.data.card_id) {
        // Get the ID to use (card_id for new users, user_id for existing users)
        const userId = response.data.user_id || response.data.card_id;
        
        // Extract user information
        const userInfo = {
          name: response.data.name,
          role: response.data.role,
          templateId: response.data.template_id,
          templateName: response.data.template_name,
          similarity: response.data.similarity,
          isNewUser: response.data.new_user || false
        };
        
        // Pass both the user ID and additional information
        onIDExtracted(userId, userInfo);
        setScanning(false);
      } else {
        onError("Could not extract ID information. Please try again.");
        setCapturedImage(null);
        startWebcam();
        setScanning(false);
        setScanProgress(0);
      }
    } catch (error) {
      console.error("Error processing ID:", error);
      let errorMessage = "Error processing ID card. Please try again.";
      
      // Extract more specific error message from response if available
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      
      onError(errorMessage);
      setCapturedImage(null);
      startWebcam();
      setScanning(false);
      setScanProgress(0);
    }
  };

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

  // Initialize webcam on component mount
  React.useEffect(() => {
    startWebcam();
    return () => {
      stopWebcam();
    };
  }, [startWebcam, stopWebcam]);

  return (
    <div className="flex flex-col items-center justify-center">
      <h3 className="text-lg font-bold mb-2">ID Card Scanner</h3>
      <p className="mb-4 text-sm text-gray-600">Position your ID card in frame and ensure good lighting</p>
      
      {!capturedImage ? (
        <>
          <div className="relative w-full h-64 bg-black rounded-md overflow-hidden mb-4">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
            <div className="absolute inset-0 border-2 border-dashed border-white opacity-70 pointer-events-none">
              {/* Guide overlay */}
              <div className="absolute inset-2 border border-yellow-400 opacity-50"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs text-center p-1 bg-black bg-opacity-50 rounded">
                Align ID card here
              </div>
            </div>
          </div>
          <button
            onClick={captureID}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none"
          >
            Scan ID
          </button>
        </>
      ) : (
        <>
          <div className="w-full h-64 bg-black rounded-md overflow-hidden mb-4">
            <img src={capturedImage} alt="Captured ID" className="w-full h-full object-cover" />
          </div>
          {scanning ? (
            <div className="w-full">
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
          ) : (
            <button
              onClick={() => {
                setCapturedImage(null);
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
      <div className="mt-2 text-xs text-gray-500 italic">
        * System will verify ID card against approved templates
      </div>
    </div>
  );
};

export default IDScan;