import React, { useRef } from "react";

const WebCam = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Start the webcam feed
  React.useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    startWebcam();

    return () => {
      // Stop webcam when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to Data URL
      const imageData = canvas.toDataURL("image/jpeg");
      onCapture(imageData); // Pass the captured image to the parent component
    }
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
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
