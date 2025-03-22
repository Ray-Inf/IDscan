
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import WebCam from "./WebCam";
import IDScan from "./IDScan";
import axios from "axios";

const Login = ({ setIsAuthenticated, setUserRole }) => {
  const navigate = useNavigate(); // ✅ Initialize navigate
  const [step, setStep] = useState("id-scan"); 
  const [capturedImage, setCapturedImage] = useState(null);
  const [userId, setUserId] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle ID scan completion
  const handleIDExtracted = (extractedUserId, extractedInfo) => {
    setUserId(extractedUserId);
    setUserInfo(extractedInfo);
    setStep("face-capture");
  };

  // Handle login verification with face
  const handleLogin = async () => {
    if (!capturedImage) {
      setErrorMessage("Please capture an image using the webcam.");
      return;
    }

    if (!userId) {
      setErrorMessage("User ID not found. Please scan your ID card again.");
      setStep("id-scan");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("live_image", dataURLtoBlob(capturedImage));
      formData.append("user_id", userId);

      const response = await axios.post("http://127.0.0.1:5000/api/login", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.match) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: userId,
            name: response.data.name,
            role: response.data.role || "user",
          })
        );

        setIsAuthenticated(true);
        setUserRole(response.data.role || "user");

        // ✅ Redirect to dashboard
        navigate("/dashboard");
      } else {
        setErrorMessage(response.data.message || "Face verification failed. Please try again.");
        setCapturedImage(null);
      }
    } catch (error) {
      console.error("Error during login:", error);
      let errorMsg = "An error occurred while verifying your face. Please try again.";
      
      if (error.response && error.response.data && error.response.data.error) {
        errorMsg = error.response.data.error;
      }
      
      setErrorMessage(errorMsg);
      setCapturedImage(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle ID scan errors
  const handleScanError = (error) => {
    setErrorMessage(error);
    setStep("id-scan");
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

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        
        {/* Step 1: ID Scan */}
        {step === "id-scan" && (
          <IDScan 
            onIDExtracted={handleIDExtracted}
            onError={handleScanError}
          />
        )}

        {/* Step 2: Face Capture */}
        {step === "face-capture" && (
          <>
            {userInfo && (
              <div className="mb-4 p-3 bg-blue-50 rounded-md">
                <h3 className="font-semibold">{userInfo.isNewUser ? "New User Detected" : "ID Verified"}</h3>
                {!userInfo.isNewUser && (
                  <p className="text-sm text-gray-600">Hello, {userInfo.name || "User"}</p>
                )}
                <p className="text-sm text-gray-600">
                  Please look at the camera for face verification.
                </p>
              </div>
            )}
            
            {!capturedImage ? (
              <WebCam onCapture={(imageData) => setCapturedImage(imageData)} />
            ) : (
              <div className="mb-4">
                <img src={capturedImage} alt="Captured" className="w-full h-64 object-cover rounded-md" />
                <button
                  onClick={() => setCapturedImage(null)}
                  className="mt-2 w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none"
                >
                  Retake Image
                </button>
              </div>
            )}

            {/* Back to ID Scan Button */}
            <button
              onClick={() => {
                setStep("id-scan");
                setCapturedImage(null);
                setUserId("");
                setUserInfo(null);
                setErrorMessage("");
              }}
              className="w-full mb-2 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none"
            >
              Back to ID Scan
            </button>

            {/* Authenticate Button */}
            {capturedImage && (
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none disabled:bg-blue-300"
              >
                {loading ? "Authenticating..." : "Authenticate Me"}
              </button>
            )}
          </>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-center">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
