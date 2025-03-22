import React, { useEffect, useState } from "react";
import axios from "axios";

const StudentAttendanceCard = ({ id }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchAttendance();
    }
  }, [id]);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/students/${id}/attendance`, {
        params: {
          startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(),
        }
      });
      
      setAttendance(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Failed to load attendance data');
      setLoading(false);
    }
  };

  const calculateAttendanceStats = () => {
    const totalDays = attendance.length;
    const presentDays = attendance.filter(day => day.present).length;
    const absentDays = totalDays - presentDays;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    
    return {
      present: presentDays,
      absent: absentDays,
      total: totalDays,
      percentage
    };
  };

  if (loading) {
    return <div className="card p-4 shadow-md">Loading attendance data...</div>;
  }

  if (error) {
    return <div className="card p-4 shadow-md text-red-500">{error}</div>;
  }

  const stats = calculateAttendanceStats();

  return (
    <div className="card p-4 shadow-md">
      <h3 className="text-lg font-semibold mb-3">Attendance Summary</h3>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-gray-600">Present</p>
          <p className="text-xl font-bold">{stats.present}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600">Absent</p>
          <p className="text-xl font-bold">{stats.absent}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600">Total</p>
          <p className="text-xl font-bold">{stats.total}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between mb-1">
          <span>Attendance Rate</span>
          <span>{stats.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${
              stats.percentage >= 90 ? 'bg-green-600' : 
              stats.percentage >= 75 ? 'bg-yellow-400' : 'bg-red-500'
            }`}
            style={{ width: `${stats.percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceCard;