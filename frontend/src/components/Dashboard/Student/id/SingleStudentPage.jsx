
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import StudentAttendanceCard from '../../../StudentAttendanceCard';
import BigCalendarContainer from '../../../BigCalendarContainer';
import StudentForm from '../../../StudentForm'; // Import the StudentForm

const SingleStudentPage = () => {
  const { id } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStudentData();
    }
  }, [id]);

  const fetchStudentData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/students/${id}`);
      setStudentData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching student data:', err);
      setError(err.message || 'Failed to fetch student data');
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSave = async (updatedData) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/students/${id}`, updatedData);
      setStudentData(response.data);
      setIsEditMode(false);
    } catch (err) {
      console.error('Error updating student data:', err);
      setError(err.message || 'Failed to update student data');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{error}</div>;
  }

  if (!studentData) {
    return <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">No student data found.</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <button onClick={() => window.history.back()} className="flex items-center text-blue-600 hover:text-blue-800">
            Back to List
          </button>
        </div>

        {isEditMode ? (
          <StudentForm
            type="update"
            data={studentData}
            setOpen={() => setIsEditMode(false)}
            relatedData={{ grades: [], classes: [] }} // Pass related data if needed
            onSubmit={handleSave}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Profile Card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col items-center mb-6">
                {/* <img src={studentData.img || "/noAvatar.png"} alt={studentData.name} className="w-24 h-24 rounded-full object-cover mb-4" /> */}
                <img 
  src={studentData.img ? `http://127.0.0.1:5000/api${studentData.img}` : "/noAvatar.png"} 
  alt="User Profile"
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
                <div>
                  <p className="text-gray-600 text-sm">Address</p>
                  <p className="font-medium">{studentData.address}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Gender</p>
                  <p className="font-medium">{studentData.sex}</p>
                </div>
              </div>
              <button onClick={handleEdit} className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4">Edit</button>
            </div>
            
            {/* Attendance Card */}
            <div className="col-span-1">
              <div></div>
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
        )}

        {/* Additional student information can be added here */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Academic Performance */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Academic Performance</h2>
            <p className="text-gray-500">Academic performance data will be displayed here.</p>
          </div>
          
          {/* Behavior/Discipline */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Behavior & Discipline</h2>
            <p className="text-gray-500">Behavior and discipline records will be displayed here.</p>
          </div>
          
          {/* Student's Schedule */}
          <div className="mt-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Student's Schedule</h2>
              {studentData.class_?.id ? (
                <BigCalendarContainer type="classId" id={studentData.class_.id} />
              ) : (
                <p className="text-gray-500">No class assigned to this student.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleStudentPage;