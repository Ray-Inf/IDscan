import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DatabaseTest({ studentId }) {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [localStudentDetails, setLocalStudentDetails] = useState(null);

  useEffect(() => {
    // Try to fetch locally stored student details
    const storedDetails = localStorage.getItem("studentDetails");
    if (storedDetails) {
      setLocalStudentDetails(JSON.parse(storedDetails));
    } else {
      // Fetch student data from the server as a fallback
      axios.get('http://localhost:3001/api/users')
        .then(response => {
          setStudents(response.data);
        })
        .catch(err => {
          console.error('Error fetching data:', err);
          setError('Failed to fetch data from the server.');
        });
    }
  }, []);

  useEffect(() => {
    if (studentId) {
      // Log authentication time
      axios.post('http://localhost:3001/api/log-auth', { student_id: studentId })
        .then(response => {
          setAuthMessage(response.data.message);
        })
        .catch(err => {
          console.error('Error logging authentication:', err);
          setAuthMessage('Failed to log authentication time.');
        });
    }
  }, [studentId]);

  // Function to clear locally stored student details
  const clearLocalData = () => {
    localStorage.removeItem("studentDetails");
    setLocalStudentDetails(null); // Update UI
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Student Details</h1>

      {error && <p className="text-red-500">{error}</p>}
      {authMessage && <p className="text-green-500">{authMessage}</p>}

      {/* Clear Data Button */}
      {localStudentDetails && (
        <button 
          onClick={clearLocalData} 
          className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Data
        </button>
      )}

      <table className="min-w-full border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Registration Number</th>
            <th className="border px-4 py-2">Branch</th>
          </tr>
        </thead>
        <tbody>
          {localStudentDetails ? (
            <tr>
              <td className="border px-4 py-2">{localStudentDetails.student_id}</td>
              <td className="border px-4 py-2">{localStudentDetails.name_of_student}</td>
              <td className="border px-4 py-2">{localStudentDetails.student_registration_number}</td>
              <td className="border px-4 py-2">{localStudentDetails.branch}</td>
            </tr>
          ) : students.length > 0 ? (
            students.map(student => (
              <tr key={student.student_id}>
                <td className="border px-4 py-2">{student.student_id}</td>
                <td className="border px-4 py-2">{student.name_of_student}</td>
                <td className="border px-4 py-2">{student.student_registration_number}</td>
                <td className="border px-4 py-2">{student.branch}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4">No student details available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DatabaseTest;
