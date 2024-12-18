// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Import useNavigate
// import WebCam from './WebCam'; // Assuming WebCam component is already there

// const Login = () => {
//   const [capturedImage, setCapturedImage] = useState(null);
//   const [isImageCaptured, setIsImageCaptured] = useState(false);
//   const [resultStatus, setResultStatus] = useState(null);
//   const navigate = useNavigate(); // Use navigate hook for redirection

//   // Simulate a check for known faces (you should replace this with actual face detection logic)
//   const checkKnownFace = (imageData) => {
//     // Here, you would send the captured image to the backend for face recognition
//     // For the sake of example, we'll simulate this with a dummy check
//     const isKnownFace = imageData === 'known_face_image_data'; // Replace with actual face check logic
//     return isKnownFace;
//   };

//   const handleCapture = (imageData) => {
//     setCapturedImage(imageData);
//     setIsImageCaptured(true);

//     // Check if the captured face is known
//     if (!checkKnownFace(imageData)) {
//       // Redirect to the Register page if face is unknown
//       navigate('/register'); // Change to your actual register route if needed
//     } else {
//       // Handle known face (e.g., proceed to login)
//       setResultStatus('Known face detected. Proceeding to login.');
//     }
//   };

//   const handleRetake = () => {
//     setCapturedImage(null);
//     setIsImageCaptured(false);
//     setResultStatus(null);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
//       <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl">
//         {resultStatus ? (
//           <div className="text-center">
//             <h2 className="text-2xl font-semibold text-indigo-600 mb-4">{resultStatus}</h2>
//           </div>
//         ) : (
//           <div>
//             <h2 className="text-3xl font-semibold text-center text-indigo-600 mb-6">
//               Login with Face Recognition
//             </h2>
//             <div className="mb-4">
//               {!isImageCaptured ? (
//                 <WebCam onCapture={handleCapture} />
//               ) : (
//                 <div className="text-center">
//                   <h3 className="text-lg font-semibold text-indigo-600 mb-2">Preview</h3>
//                   <img
//                     src={capturedImage}
//                     alt="Captured"
//                     className="w-full h-auto mb-4 rounded-md shadow-lg"
//                   />
//                   <button
//                     onClick={handleRetake}
//                     className="py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
//                   >
//                     Retake Image
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Login;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import WebCam from './WebCam'; // Assuming WebCam component is already there

const Login = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isImageCaptured, setIsImageCaptured] = useState(false);
  const [resultStatus, setResultStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(''); // To store error message
  const navigate = useNavigate(); // Use navigate hook for redirection

  // Simulate a check for known faces (replace with actual face detection logic)
  const checkKnownFace = (imageData) => {
    // Here, you would send the captured image to the backend for face recognition
    // For the sake of example, we'll simulate this with a dummy check
    const isKnownFace = imageData === 'known_face_image_data'; // Replace with actual face check logic
    return isKnownFace;
  };

  const handleCapture = (imageData) => {
    setCapturedImage(imageData);
    setIsImageCaptured(true);

    // Check if the captured face is known
    if (!checkKnownFace(imageData)) {
      setErrorMessage('User not registered. Redirecting to register page...');
      setTimeout(() => {
        // Redirect to register page after showing the error message
        navigate('/register'); // Change to your actual register route if needed
      }, 2000); // Wait for 2 seconds before redirecting
    } else {
      // Handle known face (e.g., proceed to login)
      setResultStatus('Known face detected. Proceeding to login.');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsImageCaptured(false);
    setResultStatus(null);
    setErrorMessage(''); // Reset error message on retake
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl">
        {resultStatus ? (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-indigo-600 mb-4">{resultStatus}</h2>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-semibold text-center text-indigo-600 mb-6">
              Login with Face Recognition
            </h2>
            <div className="mb-4">
              {errorMessage && (
                <div className="text-center text-red-600 font-semibold mb-4">
                  {errorMessage}
                </div>
              )}
              {!isImageCaptured ? (
                <WebCam onCapture={handleCapture} />
              ) : (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-indigo-600 mb-2">Preview</h3>
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-auto mb-4 rounded-md shadow-lg"
                  />
                  <button
                    onClick={handleRetake}
                    className="py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Retake Image
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
