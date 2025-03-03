import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import IDScan from './IDScan';
import WebCam from './WebCam';

const FacilityCheckIn = () => {
  // User state
  const [userData, setUserData] = useState({
    cardId: '',
    currentUser: null,
    lastCheckIn: null,
  });

  // UI state
  const [uiState, setUiState] = useState({
    scanMode: 'idScan', // 'idScan', 'faceVerify', 'manual', 'facilitySelection'
    isCheckingIn: true,
    loading: false,
    message: '',
    error: '',
    capturedImage: null,
    webcamKey: Date.now(), // Add a key to force WebCam remounting
    sessionComplete: false, // Flag to track if a check-in/out cycle is complete
  });

  // Form data
  const [formData, setFormData] = useState({
    facilityId: '',
    bookId: '',
    activityType: '',
    showAdditionalFields: false,
  });

  const navigate = useNavigate();

  // Available facilities
  const facilities = [
    { id: 'library', name: 'Library' },
    { id: 'gym', name: 'Gymnasium' },
    { id: 'class', name: 'Classroom' },
    { id: 'cafeteria', name: 'Cafeteria' },
  ];

  const gymActivities = ['Weight Training', 'Cardio', 'Swimming', 'Yoga', 'Basketball', 'Group Exercise'];

  // Load user data from localStorage on component mount
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      setUserData((prev) => ({ ...prev, currentUser: user }));
    }
  }, []);

  // Check user's check-in status when currentUser changes
  useEffect(() => {
    if (userData.currentUser?.card_id) checkUserStatus(userData.currentUser.card_id);
  }, [userData.currentUser]);

  // Show additional fields when facility is selected
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      showAdditionalFields: !!formData.facilityId,
    }));
  }, [formData.facilityId]);

  // Reset states for a new session
  const resetStates = (keepSessionMessage = false) => {
    setUiState((prev) => ({
      ...prev,
      scanMode: 'idScan',
      capturedImage: null,
      error: '',
      message: keepSessionMessage ? prev.message : '',
      webcamKey: Date.now(), // Force WebCam component to remount
      sessionComplete: false, // Reset session state
      isCheckingIn: true, // Reset to check-in mode
    }));
    
    setFormData({
      facilityId: '',
      bookId: '',
      activityType: '',
      showAdditionalFields: false,
    });
    
    setUserData((prev) => ({
      ...prev,
      cardId: '',
      lastCheckIn: null,
    }));
  };

  // Check if user is already checked in somewhere
  const checkUserStatus = async (cardId) => {
    try {
      setUiState((prev) => ({ ...prev, error: '' })); // Clear previous errors

      const { data } = await axios.get(`http://localhost:5000/attendance/user-status?card_id=${cardId}`);
      if (data.active_check_in) {
        setUserData((prev) => ({
          ...prev,
          cardId,
          lastCheckIn: data.active_check_in,
        }));

        setFormData((prev) => ({
          ...prev,
          facilityId: data.active_check_in.facility_id,
        }));

        setUiState((prev) => ({ ...prev, isCheckingIn: false }));
      } else {
        // If no active check-in, make sure we're in check-in mode
        setUiState((prev) => ({ ...prev, isCheckingIn: true }));
      }
    } catch (err) {
      console.error('Error checking user status:', err);
      setUiState((prev) => ({
        ...prev,
        error: `Error checking user status: ${err.response?.data?.error || err.message}`,
      }));
    }
  };

  // Handle ID extraction
  const handleIDExtracted = (extractedCardId, extraInfo = {}) => {
    setUserData((prev) => ({
      ...prev,
      cardId: extraInfo.cardId || extractedCardId,
    }));

    // Check user status immediately after ID extraction
    checkUserStatus(extraInfo.cardId || extractedCardId);

    // Make sure to reset capturedImage when transitioning to face verification
    setUiState((prev) => ({
      ...prev,
      message: `ID card verified. Card ID: ${extractedCardId}`,
      scanMode: 'faceVerify',
      capturedImage: null, // Reset captured image
      webcamKey: Date.now(), // Force WebCam component to remount
      sessionComplete: false, // Reset session state
    }));
  };

  // Handle manual user lookup
  const handleManualUserLookup = async (cardId) => {
    if (!cardId) {
      setUiState((prev) => ({ ...prev, error: 'Please enter a card ID' }));
      return;
    }

    setUiState((prev) => ({ ...prev, loading: true }));

    try {
      const { data } = await axios.get(`http://localhost:5000/users/lookup?card_id=${cardId}`);

      if (data.user) {
        setUserData((prev) => ({
          ...prev,
          cardId,
        }));

        // Check user status immediately after ID lookup
        await checkUserStatus(cardId);

        setUiState((prev) => ({
          ...prev,
          message: `User found: ${data.user.name}`,
          scanMode: 'faceVerify',
          loading: false,
          capturedImage: null, // Reset captured image
          webcamKey: Date.now(), // Force WebCam component to remount
          sessionComplete: false, // Reset session state
        }));
      } else {
        setUiState((prev) => ({ 
          ...prev, 
          error: 'No user found with this card ID',
          loading: false
        }));
      }
    } catch (err) {
      setUiState((prev) => ({
        ...prev,
        error: `Lookup error: ${err.response?.data?.error || err.message}`,
        loading: false
      }));
    }
  };

  // Handle ID scan error
  const handleScanError = (errorMsg) => {
    setUiState((prev) => ({
      ...prev,
      error: errorMsg,
      scanMode: 'manual', // Fall back to manual entry
    }));
  };

  // Convert base64 image data to Blob for upload
  const dataURLtoBlob = (dataURL) => {
    if (!dataURL) return null;

    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeString });
  };

  // Handle face verification
  const handleFaceVerification = async () => {
    if (!uiState.capturedImage || !userData.cardId) {
      setUiState((prev) => ({ ...prev, error: 'Please capture your image for verification' }));
      return;
    }

    setUiState((prev) => ({ ...prev, loading: true }));

    try {
      const formData = new FormData();
      const imageBlob = dataURLtoBlob(uiState.capturedImage);

      if (!imageBlob) {
        throw new Error('Failed to process the captured image');
      }

      formData.append('live_image', imageBlob);
      formData.append('card_id', userData.cardId);

      // Simulate success for development purposes
      setTimeout(() => {
        // Store current isCheckingIn state before updating
        const isCheckingIn = uiState.isCheckingIn;
        
        setUiState((prev) => ({
          ...prev,
          message: 'Face verification successful!',
          scanMode: prev.isCheckingIn ? 'facilitySelection' : prev.scanMode,
          loading: false,
        }));

        // If checking out, proceed with checkout
        if (!isCheckingIn) {
          handleCheckInOut(new Event('submit'));
        }
      }, 1000);
    } catch (err) {
      setUiState((prev) => ({
        ...prev,
        error: `Verification error: ${err.response?.data?.error || err.message}`,
        capturedImage: null,
        loading: false,
        webcamKey: Date.now(), // Reset webcam on error
      }));
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle check-in/check-out
  const handleCheckInOut = async (e) => {
    e.preventDefault();

    // Validation
    if (uiState.isCheckingIn && !formData.facilityId) {
      setUiState((prev) => ({ ...prev, error: 'Please select a facility' }));
      return;
    }

    if (!userData.cardId) {
      setUiState((prev) => ({ ...prev, error: 'Please scan or enter a valid ID card' }));
      return;
    }

    setUiState((prev) => ({ ...prev, loading: true, error: '' }));

    try {
      const now = new Date().toISOString();
      const apiFormData = new FormData();

      // Only use card_id as that's what the backend uses
      apiFormData.append('card_id', userData.cardId);
      apiFormData.append('facility_id', formData.facilityId);

      if (uiState.isCheckingIn) {
        // Check-in process
        apiFormData.append('login_time', now);

        // Add optional fields if applicable
        if (formData.facilityId === 'library' && formData.bookId) {
          apiFormData.append('book_id', formData.bookId);
        }

        if (formData.facilityId === 'gym' && formData.activityType) {
          apiFormData.append('activity_type', formData.activityType);
        }

        const response = await axios.post(
          `http://localhost:5000/attendance/log-facility-attendance`,
          apiFormData
        );

        if (response.data.message) {
          const newCheckIn = {
            card_id: userData.cardId,
            facility_id: formData.facilityId,
            login_time: now,
            bookId: formData.bookId,
            activityType: formData.activityType,
          };

          setUserData((prev) => ({ ...prev, lastCheckIn: newCheckIn }));
          setUiState((prev) => ({
            ...prev,
            message: 'Check-in successful!',
            isCheckingIn: false,
            loading: false
          }));
        }
      } else {
        // Check-out process
        apiFormData.append('logout_time', now);

        const response = await axios.post(
          `http://localhost:5000/attendance/update-facility-attendance`,
          apiFormData
        );

        if (response.data.message) {
          // Set session complete flag instead of immediately resetting
          setUiState((prev) => ({
            ...prev,
            message: 'Check-out successful! Ready for a new session.',
            loading: false,
            sessionComplete: true, // Mark the session as complete
          }));
          
          // Don't reset states automatically - wait for user to start new session
        }
      }
    } catch (err) {
      console.error('Error in check-in/out:', err);
      setUiState((prev) => ({
        ...prev,
        error: `Error: ${err.response?.data?.error || err.message}`,
        loading: false
      }));
    }
  };

  // Start a new check-in session after checking out
  const handleStartNewSession = () => {
    resetStates(true); // Keep the success message temporarily
    // After a brief delay, clear the success message too
    setTimeout(() => {
      setUiState(prev => ({
        ...prev,
        message: '',
      }));
    }, 3000);
  };

  // Reset webcam - can be called manually if needed
  const resetWebcam = () => {
    setUiState(prev => ({
      ...prev,
      capturedImage: null,
      webcamKey: Date.now()
    }));
  };

  // Handle manual checkout initiation
  const initiateCheckout = () => {
    setUiState(prev => ({
      ...prev,
      isCheckingIn: false,
      scanMode: 'faceVerify',
      capturedImage: null,
      webcamKey: Date.now(), // Force webcam remount
    }));
  };

  // Render different UI based on scan mode
  const renderScanMode = () => {
    // If the session is complete, show the "Start New Session" button
    if (uiState.sessionComplete) {
      return (
        <div className="mb-4 w-full max-w-md bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-2">Session Complete</h3>
          <p className="text-gray-600 mb-4">Your check-out has been successfully recorded.</p>
          <button
            onClick={handleStartNewSession}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Start New Check-In Session
          </button>
        </div>
      );
    }

    switch (uiState.scanMode) {
      case 'idScan':
        return (
          <div className="mb-4 w-full max-w-md">
            <IDScan onIDExtracted={handleIDExtracted} onError={handleScanError} />
            <div className="mt-4 text-center">
              <button
                onClick={() => setUiState((prev) => ({ ...prev, scanMode: 'manual' }))}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Use Manual Entry Instead
              </button>
            </div>
          </div>
        );

      case 'manual':
        return (
          <div className="mb-4 w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Manual ID Entry</h3>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 p-2 border rounded"
                placeholder="Enter Card ID"
                value={userData.cardId}
                onChange={(e) => setUserData((prev) => ({ ...prev, cardId: e.target.value }))}
              />
              <button
                onClick={() => handleManualUserLookup(userData.cardId)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={uiState.loading}
              >
                {uiState.loading ? 'Looking up...' : 'Lookup'}
              </button>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setUiState((prev) => ({ ...prev, scanMode: 'idScan' }))}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Use ID Scanner Instead
              </button>
            </div>
          </div>
        );

      case 'faceVerify':
        return (
          <div className="mb-4 w-full max-w-md bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-2">
              Face Verification {!uiState.isCheckingIn ? 'for Check-Out' : ''}
            </h3>
            <p className="mb-4 text-gray-600">Please look at the camera to verify your identity.</p>
            <div className="flex justify-center">
              <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                {!uiState.capturedImage ? (
                  <WebCam
                    onCapture={(imageData) => setUiState((prev) => ({ ...prev, capturedImage: imageData }))}
                    key={uiState.webcamKey} // Use the key from state to force remount
                  />
                ) : (
                  <img
                    src={uiState.capturedImage}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={resetWebcam}
                className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
              >
                Retake
              </button>
              <button
                onClick={handleFaceVerification}
                disabled={!uiState.capturedImage || uiState.loading}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {uiState.loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        );

      case 'facilitySelection':
        return (
          <div className="mb-4 w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Select Facility</h3>
            <form onSubmit={handleCheckInOut}>
              <select
                name="facilityId"
                className="w-full p-2 border rounded mb-4"
                value={formData.facilityId}
                onChange={handleInputChange}
              >
                <option value="">Select Facility</option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>

              {formData.facilityId === 'library' && (
                <div className="mb-4">
                  <label className="block mb-1">Book ID (Optional):</label>
                  <input
                    type="text"
                    name="bookId"
                    className="w-full p-2 border rounded"
                    placeholder="Enter Book ID"
                    value={formData.bookId}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {formData.facilityId === 'gym' && (
                <div className="mb-4">
                  <label className="block mb-1">Activity Type:</label>
                  <select
                    name="activityType"
                    className="w-full p-2 border rounded"
                    value={formData.activityType}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Activity</option>
                    {gymActivities.map((activity) => (
                      <option key={activity} value={activity}>
                        {activity}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={!formData.facilityId || uiState.loading}
                className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-green-300"
              >
                {uiState.loading ? 'Processing...' : 'Confirm Check-In'}
              </button>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">
        {uiState.isCheckingIn ? 'Facility Check-In' : 'Facility Check-Out'}
      </h1>

      {userData.lastCheckIn && !uiState.sessionComplete && (
        <div className="mb-6 p-4 bg-blue-100 border border-blue-300 text-blue-800 rounded-lg w-full max-w-md">
          <p className="font-semibold">
            You are currently checked in at:{' '}
            {facilities.find((f) => f.id === userData.lastCheckIn.facility_id)?.name}
          </p>
          {/* Always show this button if user is checked in, regardless of current UI state */}
          <button
            onClick={initiateCheckout}
            className="mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Proceed to Check-Out
          </button>
        </div>
      )}

      {/* Status Messages */}
      {uiState.message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md w-full max-w-md">
          {uiState.message}
        </div>
      )}

      {uiState.error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md w-full max-w-md">
          {uiState.error}
        </div>
      )}

      {/* Render the current scan mode UI */}
      {renderScanMode()}

      {/* History Button */}
      <div className="mt-6">
        <button
          onClick={() => navigate('/attendance-log')}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          View Attendance History
        </button>
      </div>
    </div>
  );
};

export default FacilityCheckIn;