import React, { useState, useRef, useEffect } from 'react';

function IDScan() {
  // State variables to store extracted text, detected face, match status, matched name, errors, and capture status
  const [extractedText, setExtractedText] = useState('');
  const [detectedFace, setDetectedFace] = useState('');
  const [matchFound, setMatchFound] = useState(null); // State to store match status
  const [matchedName, setMatchedName] = useState(''); // Stores the name if a match is found
  const [error, setError] = useState(''); // State to store any errors
  const [isCapturing, setIsCapturing] = useState(false); // State to control capturing
  
  // Refs for video, canvas, interval, and stream
  const videoRef = useRef(null);    // Reference to the video element
  const canvasRef = useRef(null);   // Reference to the canvas element
  const intervalRef = useRef(null); // Ref to store the interval ID
  const streamRef = useRef(null);   // Ref to store the video stream

  useEffect(() => {
    // Cleanup the interval and video stream when the component is unmounted or capturing stops
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCapture = () => {
    if (!isCapturing) {
      // Start video feed
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          streamRef.current = stream;           // Store the video stream
          videoRef.current.srcObject = stream;  // Set the video source to the stream
          videoRef.current.play();              // Play the video
          setIsCapturing(true);                 // Update capturing status
        })
        .catch((err) => {
          console.log("Error accessing the camera", err);
        });
    }
  };

  const stopCapture = () => {
    // Stop capturing and video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
  };

  const captureFrame = () => {
    // Draw the current video frame onto the canvas
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Convert the canvas to a base64 image
    const imageData = canvas.toDataURL('image/jpeg');

    // Send the image to the backend for processing
    fetch('http://localhost:5000/capture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageData }),    // Send image data in the request body
    })
      .then(response => response.json())
      .then(data => {
        // Handle backend response
        if (data.error) {
          setError(data.error); // Display any error message
        } else {
          if (data.extractedText) {
            setExtractedText(data.extractedText); // Update extracted text
          }
          if (data.detectedFace) {
            setDetectedFace(data.detectedFace);   // Update detected face image
          }
          setMatchFound(data.matchFound); // Set match status
          if (data.matchFound) {
            setMatchedName(data.matchedName); // Set matched name
            stopCapture(); // Stop video capture when a face match is found
          }
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setError("An error occurred while capturing the image.");
      });
  };

  const resetCapture = () => {
    // Reset all state variables and stop capturing
    setExtractedText('');
    setDetectedFace('');
    setMatchFound(null);
    setMatchedName('');
    setError('');
    stopCapture();
  };

  return (
    <div>
      {/* Video element for live feed, hidden when a match is found */}
      {!matchFound && (
        <video ref={videoRef} width="640" height="480" />
      )}
      {/* Canvas element to capture frames from the video, hidden from view */}
      {!matchFound && (
        <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />
      )}

      <div>
        {/* Display detected face if available */}
        {detectedFace && <img src={detectedFace} alt="Detected Face" />}
        {/* Display match status if determined */}
        {matchFound !== null && (
          <p>
            {matchFound ? `Match found: ${matchedName}` : 'No matching face detected.'}
          </p>
        )}
        {/* Display extracted text from ID card */}
        {extractedText && <p>{extractedText}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      <div>
        {/* Button to start or stop capturing based on current state */}
        {!isCapturing && !matchFound ? (
          <button className='m-2 p-5 bg-indigo-600 text-white rounded-md' onClick={startCapture}>Start Capturing</button>
        ) : isCapturing && !matchFound ? (
          <button className='m-2 p-5 bg-indigo-600 text-white rounded-md' onClick={stopCapture}>Stop Capturing</button>
        ) : null}

        {/* Button to capture and process the current frame */}
        {!matchFound && (
          <button className='m-2 p-5 bg-indigo-600 text-white rounded-md' onClick={captureFrame}>Extract</button>
        )}
        {/* Button to reset all states and stop capturing */}
        <button className='m-2 p-5 bg-indigo-600 text-white rounded-md' onClick={resetCapture}>Reset</button>
      </div>
    </div>
  );
}

export default IDScan;
