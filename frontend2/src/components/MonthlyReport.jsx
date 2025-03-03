import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MonthlyReport = () => {
const [card_id, setCardId] = useState('');

  const [facilityId, setFacilityId] = useState('');
  const [month, setMonth] = useState('');
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [facilities, setFacilities] = useState([
    { id: 'library', name: 'Library' },
    { id: 'gym', name: 'Gymnasium' },
    { id: 'class', name: 'Classroom' },
    { id: 'cafeteria', name: 'Cafeteria' }
  ]);

  // Get current user ID from localStorage
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const userData = JSON.parse(userString);
      setUserId(userData.id || '');
    }

    // Set default month to current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMonth(currentMonth);
  }, []);

  const fetchMonthlyAttendance = async (e) => {
    e.preventDefault();
if (!card_id || !facilityId || !month) {

      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get('http://localhost:5000/attendance/get-monthly-attendance', {
params: { card_id: card_id, facility_id: facilityId, month }

      });

      setAttendanceLogs(response.data.logs || []);
    } catch (err) {
      setError('Failed to fetch attendance data: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalHours = (logs) => {
    let totalMinutes = 0;
    
    logs.forEach(log => {
      if (log.login_time && log.logout_time) {
        const loginTime = new Date(log.login_time);
        const logoutTime = new Date(log.logout_time);
        const diffMs = logoutTime - loginTime;
        const diffMinutes = Math.floor(diffMs / 60000);
        totalMinutes += diffMinutes;
      }
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  const exportAttendanceCSV = async () => {
    if (!facilityId || !month) {
      setError('Please select a facility and month first');
      return;
    }

    try {
      // Calculate first and last day of the month
      const [year, monthNum] = month.split('-');
      const startDate = `${year}-${monthNum}-01`;
      const lastDay = new Date(year, monthNum, 0).getDate();
      const endDate = `${year}-${monthNum}-${lastDay}`;

      // Redirect to the export endpoint
      window.open(`http://localhost:5000/attendance/export-attendance-csv?facility_id=${facilityId}&start_date=${startDate}&end_date=${endDate}`, '_blank');
    } catch (err) {
      setError('Failed to export data: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Monthly Attendance Report</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <form onSubmit={fetchMonthlyAttendance}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">User ID</label>
              <input
                type="text"
value={card_id}
onChange={(e) => setCardId(e.target.value)}

                className="w-full p-2 border rounded"
                placeholder="Enter user ID"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Facility</label>
              <select
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Facility</option>
                {facilities.map(facility => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Month</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-between">
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Generate Report'}
            </button>
            
            <button 
              type="button" 
              onClick={exportAttendanceCSV}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              disabled={loading || !facilityId || !month}
            >
              Export as CSV
            </button>
          </div>
        </form>
        
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
      
      {attendanceLogs.length > 0 && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold">Attendance Summary</h2>
            <p className="text-gray-600">
              Total visits: {attendanceLogs.length} | 
              Total time: {calculateTotalHours(attendanceLogs)}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logout Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  {facilityId === 'library' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book ID</th>
                  )}
                  {facilityId === 'gym' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceLogs.map((log) => {
                  const loginDate = new Date(log.login_time);
                  const logoutDate = log.logout_time ? new Date(log.logout_time) : null;
                  
                  let duration = 'N/A';
                  if (logoutDate) {
                    const diffMs = logoutDate - loginDate;
                    const diffHrs = Math.floor(diffMs / 3600000);
                    const diffMins = Math.floor((diffMs % 3600000) / 60000);
                    duration = `${diffHrs}h ${diffMins}m`;
                  }
                  
                  return (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {loginDate.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {loginDate.toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {logoutDate ? logoutDate.toLocaleTimeString() : 'Not logged out'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {duration}
                      </td>
                      {facilityId === 'library' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.book_id || 'No book'}
                        </td>
                      )}
                      {facilityId === 'gym' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.activity_type || 'General'}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyReport;
