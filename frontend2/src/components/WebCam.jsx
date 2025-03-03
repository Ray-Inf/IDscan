import React, { useRef, useEffect } from "react";

const WebCam = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Start the webcam feed
  useEffect(() => {
    let mounted = true;
    
    const startWebcam = async () => {
      try {
        // Stop any existing streams first
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Get new stream
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          // Specify preferred settings for better performance
          audio: false
        });
        
        // Save stream reference for cleanup
        streamRef.current = stream;
        
        // Only set video source if component is still mounted
        if (mounted && videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Ensure the video plays once loaded
          videoRef.current.onloadedmetadata = () => {
            if (mounted && videoRef.current) {
              videoRef.current.play().catch(err => console.error("Error playing video:", err));
            }
          };
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
        if (mounted) {
          // Inform parent component of error
          if (typeof onCapture === 'function') {
            onCapture(null, { error: "Failed to access camera" });
          }
        }
      }
    };

    startWebcam();

    // Cleanup function
    return () => {
      mounted = false;
      // Stop webcam when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Make sure video is playing and has dimensions
      if (video.readyState !== 4 || video.videoWidth === 0) {
        console.error("Video not ready yet");
        return;
      }
      
      const context = canvas.getContext("2d");

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        // Convert canvas to Data URL
        const imageData = canvas.toDataURL("image/jpeg");
        onCapture(imageData); // Pass the captured image to the parent component
      } catch (err) {
        console.error("Error capturing image:", err);
        onCapture(null, { error: "Failed to capture image" });
      }
    }
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full rounded-md shadow-lg"
      ></video>
      <canvas ref={canvasRef} className="hidden"></canvas>
      <button
        onClick={captureImage}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-white text-indigo-600 font-bold rounded-full shadow hover:bg-gray-200"
      >
        Capture Image
      </button>
    </div>
  );
};

export default WebCam;