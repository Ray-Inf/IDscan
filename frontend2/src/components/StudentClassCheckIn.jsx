import React, { useState, useEffect } from "react";
import axios from "axios";

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000/class_schedule';

const StudentClassCheckIn = () => {
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Load user data from localStorage
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.card_id) {
        setUserData(user);
      } else {
        setError("User information not found. Please login again.");
      }
    } catch (err) {
      console.error("Error loading user data:", err);
      setError("Failed to load user information. Please login again.");
    }
  }, []);

  useEffect(() => {
    if (userData) {
      fetchAvailableClasses();
    }
  }, [userData]);

  const fetchAvailableClasses = async () => {
    if (!userData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get("/student-classes", {
        params: { card_id: userData.card_id }
      });

      if (response.data.success) {
        setAvailableClasses(response.data.classes || []);
      } else {
        setError(response.data.error || "Failed to fetch available classes");
      }
    } catch (err) {
      console.error("Error fetching available classes:", err);
      setError("Failed to load available classes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleClassCheckIn = async (classId) => {
    if (!userData) {
      setError("User information not found");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await axios.post("/classes/attendance", { 
        class_id: classId,
        card_id: userData.card_id,
        status: "present" // Add status field
      });

      if (response.data.success) {
        setSuccessMessage(response.data.message || "Attendance marked successfully");
        // Refresh available classes to update UI
        fetchAvailableClasses();
      } else {
        setError(response.data.error || "Failed to mark attendance");
      }
    } catch (err) {
      console.error("Error marking attendance:", err);
      setError("Failed to mark attendance. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Class Check-In</h1>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {userData && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <h2 className="text-lg font-semibold">Student Information</h2>
          <p>Name: {userData.name}</p>
          <p>ID: {userData.card_id}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-2">Available Classes Now</h2>
          
          {availableClasses.length === 0 ? (
            <div className="bg-gray-100 p-4 rounded text-center">
              <p>No classes available right now</p>
              <button 
                onClick={fetchAvailableClasses}
                className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {availableClasses.map((classItem) => (
                <div key={classItem.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{classItem.class_name}</h3>
                      <p className="text-gray-600">Instructor: {classItem.instructor}</p>
                      <p className="text-gray-600">Room: {classItem.room || "Not specified"}</p>
                      <p className="text-gray-600">
                        Time: {classItem.start_time} - {classItem.end_time}
                      </p>
                      <p className="text-gray-600">
                        Department: {classItem.department}
                      </p>
                    </div>
                    
                    {classItem.already_attended ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        Attendance Marked
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClassCheckIn(classItem.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                      >
                        Mark Attendance
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentClassCheckIn;