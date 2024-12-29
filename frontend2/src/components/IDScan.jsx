import React, { useState, useRef, useEffect } from 'react';

function IDScan() {
  const [extractedText, setExtractedText] = useState('');
  const [detectedFace, setDetectedFace] = useState('');
  const [matchFound, setMatchFound] = useState(null); // State to store match status
  const [matchedName, setMatchedName] = useState('');
  const [error, setError] = useState(''); // State to store any errors
  const [isCapturing, setIsCapturing] = useState(false); // State to control capturing
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null); // Ref to store the interval ID
  const streamRef = useRef(null); // Ref to store the video stream

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
          streamRef.current = stream;
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsCapturing(true);
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
      body: JSON.stringify({ imageData }),
    })
      .then(response => response.json())
      .then(data => {
        // Handle backend response
        if (data.error) {
          setError(data.error); // Display any error message
        } else {
          if (data.extractedText) {
            setExtractedText(data.extractedText);
          }
          if (data.detectedFace) {
            setDetectedFace(data.detectedFace);
          }
          setMatchFound(data.matchFound); // Set match status
          if (data.matchFound) {
            setMatchedName(data.matchedName); // Set matched name
          }
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setError("An error occurred while capturing the image.");
      });
  };

  const resetCapture = () => {
    setExtractedText('');
    setDetectedFace('');
    setMatchFound(null);
    setMatchedName('');
    setError('');
    stopCapture();
  };

  return (
    <div>
      <video ref={videoRef} width="640" height="480" />
      <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />

      <div>
        {detectedFace && <img src={detectedFace} alt="Detected Face" />}
        {matchFound !== null && (
          <p>
            {matchFound ? `Match found: ${matchedName}` : 'No matching face detected.'}
          </p>
        )}
        {extractedText && <p>{extractedText}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      <div>
        {!isCapturing ? (
          <button className='m-2 p-5 bg-indigo-600 text-white rounded-md' onClick={startCapture}>Start Capturing</button>
        ) : (
          <button className='m-2 p-5 bg-indigo-600 text-white rounded-md' onClick={stopCapture}>Stop Capturing</button>
        )}

        <button className='m-2 p-5 bg-indigo-600 text-white rounded-md' onClick={captureFrame}>Extract</button>
        <button className='m-2 p-5 bg-indigo-600 text-white rounded-md' onClick={resetCapture}>Reset</button>
      </div>
    </div>
  );
}

export default IDScan;
