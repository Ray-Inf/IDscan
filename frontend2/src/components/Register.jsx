


// import React, { useState } from 'react';
// import WebCam from './WebCam'; // Import your existing WebCam component

// const Register = () => {
//     const [name, setName] = useState(null);
//     const [capturedImage, setCapturedImage] = useState(null); // Store the captured image
//     const [resultStatus, setResultStatus] = useState(null);
//     const [isImageCaptured, setIsImageCaptured] = useState(false); // To track if the image has been captured

//     const register = () => {
//         if (!name || !capturedImage) {
//             alert("Please enter your name and capture an image.");
//             return;
//         }

//         // Create FormData and append the name and image
//         const formData = new FormData();
//         formData.append('name', name);

//         // Convert the base64 image to a Blob
//         const blob = convertBase64ToBlob(capturedImage);

//         // Append the image Blob to FormData
//         formData.append('image', blob, 'image.jpg');

//         fetch('http://127.0.0.1:5000/register', {
//             method: 'POST',
//             body: formData,
//         })
//             .then((res) => res.json())
//             .then((res) => {
//                 setResultStatus(res.status);
//             })
//             .catch((err) => console.error("Error:", err));
//     };

//     // Convert base64 to Blob
//     const convertBase64ToBlob = (base64) => {
//         const byteCharacters = atob(base64.split(',')[1]);
//         const byteArrays = [];
//         for (let offset = 0; offset < byteCharacters.length; offset++) {
//             const byteArray = byteCharacters.charCodeAt(offset);
//             byteArrays.push(byteArray);
//         }
//         const byteArray = new Uint8Array(byteArrays);
//         return new Blob([byteArray], { type: 'image/jpeg' });
//     };

//     const handleCapture = (imageData) => {
//         setCapturedImage(imageData); // Set the captured image data
//         setIsImageCaptured(true); // Mark that an image has been captured
//     };

//     const handleRetake = () => {
//         setCapturedImage(null); // Reset the captured image
//         setIsImageCaptured(false); // Mark that the image has been retaken
//     };

//     return (
//         <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
//             <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl">
//                 {resultStatus !== 'Done' ? (
//                     <div>
//                         <h2 className="text-3xl font-semibold text-center text-indigo-600 mb-6">
//                             Register Your Account
//                         </h2>
//                         <div className="mb-4">
//                             <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">
//                                 Enter Your Name
//                             </label>
//                             <input
//                                 type="text"
//                                 name="name"
//                                 id="name"
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                                 onChange={(e) => setName(e.target.value)}
//                             />
//                         </div>

//                         {/* WebCam Component to capture the photo */}
//                         <div className="mb-4">
//                             <label className="block text-gray-700 text-sm font-medium mb-2">Capture Your Image</label>
//                             <WebCam onCapture={handleCapture} />
//                         </div>

//                         {/* Show captured image preview and retake option */}
//                         {isImageCaptured && (
//                             <div className="mb-4 text-center">
//                                 <h3 className="text-lg font-semibold text-indigo-600 mb-2">Preview</h3>
//                                 <img
//                                     src={capturedImage}
//                                     alt="Captured"
//                                     className="w-full h-auto mb-4 rounded-md shadow-lg"
//                                 />
//                                 <button
//                                     onClick={handleRetake}
//                                     className="py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
//                                 >
//                                     Retake Image
//                                 </button>
//                             </div>
//                         )}

//                         <div className="text-center">
//                             <button
//                                 onClick={register}
//                                 className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                             >
//                                 Register
//                             </button>
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="text-center">
//                         <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
//                             Hello {name}!
//                         </h2>
//                         <p className="text-gray-700 mb-4">
//                             Your registration was successfully completed. You can now proceed to login.
//                         </p>
//                         <div>
//                             <button
//                                 onClick={() => setResultStatus(null)}
//                                 className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                             >
//                                 Back to Register
//                             </button>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Register;
import React, { useState } from 'react';
import WebCam from './WebCam'; // Import your existing WebCam component

const Register = () => {
    const [name, setName] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null); // Store the captured image
    const [resultStatus, setResultStatus] = useState(null);
    const [isImageCaptured, setIsImageCaptured] = useState(false); // To track if the image has been captured

    const register = () => {
        if (!name || !capturedImage) {
            alert("Please enter your name and capture an image.");
            return;
        }

        // Create FormData and append the name and image
        const formData = new FormData();
        formData.append('name', name);

        // Convert the base64 image to a Blob
        const blob = convertBase64ToBlob(capturedImage);

        // Append the image Blob to FormData
        formData.append('image', blob, 'image.jpg');

        fetch('http://127.0.0.1:5000/register', {
            method: 'POST',
            body: formData,
        })
            .then((res) => res.json())
            .then((res) => {
                setResultStatus(res.status);
            })
            .catch((err) => console.error("Error:", err));
    };

    // Convert base64 to Blob
    const convertBase64ToBlob = (base64) => {
        const byteCharacters = atob(base64.split(',')[1]);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset++) {
            const byteArray = byteCharacters.charCodeAt(offset);
            byteArrays.push(byteArray);
        }
        const byteArray = new Uint8Array(byteArrays);
        return new Blob([byteArray], { type: 'image/jpeg' });
    };

    const handleCapture = (imageData) => {
        setCapturedImage(imageData); // Set the captured image data
        setIsImageCaptured(true); // Mark that an image has been captured
    };

    const handleRetake = () => {
        setCapturedImage(null); // Reset the captured image
        setIsImageCaptured(false); // Mark that the image has been retaken
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl">
                {resultStatus !== 'Done' ? (
                    <div>
                        <h2 className="text-3xl font-semibold text-center text-indigo-600 mb-6">
                            Register Your Account
                        </h2>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">
                                Enter Your Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        {/* Conditionally show WebCam or image preview */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">Capture Your Image</label>
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

                        <div className="text-center">
                            <button
                                onClick={register}
                                className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Register
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
                            Hello {name}!
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Your registration was successfully completed. You can now proceed to login.
                        </p>
                        <div>
                            <button
                                onClick={() => setResultStatus(null)}
                                className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Back to Register
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
