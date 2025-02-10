import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DatabaseTest() {
  const [students, setStudents] = useState([]); // State to store students data
  const [error, setError] = useState(''); // State to handle errors

  useEffect(() => {
    // Fetch data from the server when the component mounts
    axios.get('http://localhost:3001/api/users')
      .then(response => {
        setStudents(response.data); // Store the fetched students data
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data from the server.'); // Set error message if fetching fails
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Students List</h1>

      {error && <p className="text-red-500">{error}</p>} {/* Display error message if any */}

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
              <tr key={student.id}>
                <td className="border px-4 py-2">{student.student_id}</td>
                <td className="border px-4 py-2">{student.name_of_student}</td>
                <td className="border px-4 py-2">{student.student_registration_number}</td>
                <td className="border px-4 py-2">{student.branch}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center py-4">No students found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DatabaseTest;