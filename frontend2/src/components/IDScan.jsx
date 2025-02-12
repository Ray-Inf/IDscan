import React, { useState, useRef, useEffect } from 'react';

function IDScan() {
  // State variables to store extracted text, detected face, match status, matched name, errors, and capture status
  const [extractedText, setExtractedText] = useState('');
  const [detectedFace, setDetectedFace] = useState('');
  const [matchFound, setMatchFound] = useState(null); // State to store match status
  const [matchedName, setMatchedName] = useState(''); // Stores the name if a match is found
  const [error, setError] = useState(''); // State to store any errors
  const [isCapturing, setIsCapturing] = useState(false); // State to control capturing
  const [studentId, setStudentId] = useState('');
  const [confirmingId, setConfirmingId] = useState(false);
  const [manualIdEntry, setManualIdEntry] = useState(false);
  const [correctedId, setCorrectedId] = useState('');


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
            setExtractedText(data.extractedText);
            const idMatch = data.extractedText.match(/Student Id: (\d{8})/i);
            if (idMatch) {
              setStudentId(idMatch[1]);
              setConfirmingId(true);
            }
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
    setExtractedText('');
    setDetectedFace('');
    setMatchFound(null);
    setMatchedName('');
    setError('');
    setStudentId('');
    setConfirmingId(false);
    setManualIdEntry(false);
    setCorrectedId('');
    stopCapture();
  };

  const handleConfirmation = (isCorrect) => {
    setConfirmingId(false);
    if (!isCorrect) {
      setManualIdEntry(true);
    }
  };

  const saveCorrectedId = () => {
    setStudentId(correctedId);
    setManualIdEntry(false);
  };

  return (
    <div>
      {!matchFound && (
        <video ref={videoRef} width="640" height="480" />
      )}
      {!matchFound && (
        <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />
      )}

      <div>
        {detectedFace && <img src={detectedFace} alt="Detected Face" />}
        {matchFound !== null && (
          <p>{matchFound ? `Match found: ${matchedName}` : 'No matching face detected.'}</p>
        )}
        {extractedText && <p>{extractedText}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {confirmingId && (
          <div>
            <p>Is this the correct Student ID: {studentId}?</p>
            <button className='m-2 p-2 bg-green-500 text-white rounded' onClick={() => handleConfirmation(true)}>Yes</button>
            <button className='m-2 p-2 bg-red-500 text-white rounded' onClick={() => handleConfirmation(false)}>No</button>
          </div>
        )}

        {manualIdEntry && (
          <div>
            <input
              type="text"
              value={correctedId}
              onChange={(e) => setCorrectedId(e.target.value)}
              placeholder="Enter correct Student ID"
              className="m-2 p-2 border rounded"
            />
            <button className='m-2 p-2 bg-blue-500 text-white rounded' onClick={saveCorrectedId}>Save</button>
          </div>
        )}
      </div>

      <div>
        {!isCapturing && !matchFound ? (
          <button className='m-2 p-5 bg-indigo-600 text-white rounded-md' onClick={startCapture}>Start Capturing</button>
        ) : isCapturing && !matchFound ? (
          <button className='m-2 p-5 bg-indigo-600 text-white rounded-md' onClick={stopCapture}>Stop Capturing</button>
        ) : null}

        {!matchFound && (
          <button className='m-2 p-5 bg-indigo-600 text-white rounded-md' onClick={captureFrame}>Extract</button>
        )}
        <button className='m-2 p-5 bg-indigo-600 text-white rounded-md' onClick={resetCapture}>Reset</button>
      </div>
    </div>
  );
}

export default IDScan;
