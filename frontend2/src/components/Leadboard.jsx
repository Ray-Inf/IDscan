import React, { useEffect, useState } from "react";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetch('/leaderboard')
      .then((response) => response.json())
      .then((data) => setLeaderboard(data.leaderboard))
      .catch((error) => console.error("Error fetching leaderboard:", error));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Rank</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Points</th>
            <th className="py-2 px-4 border-b">Attendance</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((student, index) => (
            <tr key={student.student_id}>
              <td className="py-2 px-4 border-b">{index + 1}</td>
              <td className="py-2 px-4 border-b">{student.name}</td>
              <td className="py-2 px-4 border-b">{student.total_points}</td>
              <td className="py-2 px-4 border-b">{student.attendance_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}