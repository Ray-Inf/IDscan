import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DatabaseTest({ studentId }) { // Accept studentId as a prop
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    // Fetch data from the server when the component mounts
    axios.get('http://localhost:3001/api/users')
      .then(response => {
        setStudents(response.data);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data from the server.');
      });
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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Students List</h1>

      {error && <p className="text-red-500">{error}</p>}
      {authMessage && <p className="text-green-500">{authMessage}</p>}

      <table className="min-w-full border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Registration number</th>
            <th className="border px-4 py-2">Branch</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
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
              <td colSpan="4" className="text-center py-4">No students found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DatabaseTest;