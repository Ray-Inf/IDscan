import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StudentAttendanceCard from '../../StudentAttendanceCard';

const StudentPage = () => {
  const [studentData, setStudentData] = useState(null);
  const [classItem, setClassItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
        // Replace 'currentUserId' with the actual user ID or use authentication
        const userId = 'student10'; // Replace with actual ID for testing
        
        // Fetch student data
        const studentResponse = await axios.get(`http://localhost:5000/api/students/${userId}`);
        setStudentData(studentResponse.data);
        
        // Fetch class schedule
        const scheduleResponse = await axios.get(`http://localhost:5000/api/students/schedule`, {
            params: {
                userId: userId,  // Pass userId as a query parameter
            }
        });
        setClassItem(scheduleResponse.data);
        
        setLoading(false);
    } catch (err) {
        console.error('Error fetching student data:', err);
        setError(err.response?.data?.error || 'Failed to fetch student data');
        setLoading(false);
    }
};
  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      <strong className="font-bold">Error:</strong>
      <span className="block sm:inline"> {error}</span>
    </div>;
  }

  if (!studentData) {
    return <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
      No student data found. Please check your student ID or contact support.
    </div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Profile Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col items-center mb-6">
            <img 
              src={studentData.img || "/noAvatar.png"} 
              alt={studentData.name} 
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
            <h1 className="text-2xl font-bold">{studentData.name} {studentData.surname}</h1>
            <p className="text-gray-500">Class: {studentData.class_?.name || 'N/A'}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Student ID</p>
              <p className="font-medium">{studentData.username}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Grade</p>
              <p className="font-medium">{studentData.grade?.level || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="font-medium">{studentData.email}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Phone</p>
              <p className="font-medium">{studentData.phone}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Blood Type</p>
              <p className="font-medium">{studentData.bloodType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Birthday</p>
              <p className="font-medium">{studentData.birthday ? new Date(studentData.birthday).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
        
        {/* Attendance Card */}
        <div className="col-span-1">
          <StudentAttendanceCard id={studentData.id} />
        </div>
        
        {/* Parent Information */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Parent Information</h2>
          {studentData.parent ? (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Name</p>
                <p className="font-medium">{studentData.parent.name} {studentData.parent.surname}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <p className="font-medium">{studentData.parent.email}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Phone</p>
                <p className="font-medium">{studentData.parent.phone}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Address</p>
                <p className="font-medium">{studentData.parent.address}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No parent information available</p>
          )}
        </div>
      </div>
      
      {/* Class Schedule */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Class Schedule</h2>
        {classItem && classItem.lessons && classItem.lessons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Subject</th>
                  <th className="py-2 px-4 border-b text-left">Day</th>
                  <th className="py-2 px-4 border-b text-left">Start Time</th>
                  <th className="py-2 px-4 border-b text-left">End Time</th>
                </tr>
              </thead>
              <tbody>
                {classItem.lessons.map((lesson, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-2 px-4 border-b">{lesson.subject?.name || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{lesson.day || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{lesson.startTime || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{lesson.endTime || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No lessons scheduled for this class.</p>
        )}
      </div>
    </div>
  );
};

export default StudentPage;