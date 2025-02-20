import React, { useState } from "react";
import WebCam from "./WebCam"; // Reuse the WebCam component
import { Link } from "react-router-dom";

const Login = () => {
  const [name, setName] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null); // Store the captured image as Data URL
  const [imageCaptured, setImageCaptured] = useState(false); // Track if image has been captured
  const [errorMessage, setErrorMessage] = useState(null); // Store error message if login fails

  // Convert base64 image data to Blob
  const convertBase64ToBlob = (base64) => {
    const byteCharacters = atob(base64.split(",")[1]); // Remove the base64 header part
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset++) {
      const byteArray = byteCharacters.charCodeAt(offset);
      byteArrays.push(byteArray);
    }
    const byteArray = new Uint8Array(byteArrays);
    return new Blob([byteArray], { type: "image/jpeg" }); // Assuming the image is JPEG, update the type if needed
  };

  // Handle login process
  const login = () => {
    if (!capturedImage) {
      alert("Please capture an image using the webcam.");
      return;
    }

    // Convert the base64 image to Blob
    const imageBlob = convertBase64ToBlob(capturedImage);

    // Create FormData and append the Blob as a file
    const formData = new FormData();
    formData.append("image", imageBlob, "captured_image.jpg"); // Name the file for the backend

    fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          // If the response includes 'Error', show the error message
          setErrorMessage(res);
          setLoggedIn(false);
        } else {
          // If login is successful
          setName(data.message);
          setLoggedIn(true);
          setErrorMessage(null); // Clear any previous error messages
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        setErrorMessage("An error occurred. Please try again.");
      });
  };

  // Handle the retake of the image
  const handleRetake = () => {
    setCapturedImage(null); // Reset captured image
    setImageCaptured(false); // Reset image captured flag
    setErrorMessage(null); // Reset error message
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-lg w-full bg-white p-6 rounded-lg shadow-lg">
        {!loggedIn ? (
          <div className="text-center">
            {!capturedImage ? (
              // Reuse the WebCam component for capturing image
              <WebCam
                onCapture={(imageData) => {
                  setCapturedImage(imageData);
                  setImageCaptured(true);
                }} // Capture image and set the flag
              />
            ) : (
              <div className="mt-4">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-auto rounded-lg mb-4"
                />
                <button
                  onClick={handleRetake}
                  className="w-full py-2 px-4 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                >
                  Retake Image
                </button>
              </div>
            )}

            {imageCaptured && (
              <button
                onClick={login}
                className="mt-4 w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
              >
                Authenticate Me
              </button>
            )}

            {errorMessage && (
              <div className="mt-4 text-red-600">
                <p>{errorMessage}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
              {name}
            </h2>
            <p className="text-gray-700 mb-4">
              You are successfully logged in to the system. You may logout of
              the system by clicking the button below.
            </p>
            <button
              onClick={() => {
                setName(null);
                setLoggedIn(false);
                setCapturedImage(null); // Clear captured image after logout
                setImageCaptured(false); // Reset image captured flag
                setErrorMessage(null); // Reset error message
              }}
              className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;