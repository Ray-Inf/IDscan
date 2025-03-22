import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GymDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [activityType, setActivityType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const activityTypes = [
    'Cardio', 
    'Strength Training', 
    'Swimming', 
    'Yoga', 
    'Group Class',
    'Basketball',
    'Tennis',
    'Other'
  ];

  useEffect(() => {
    // Set default dates to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
    
    fetchUsers();
    fetchLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/gym-logs', {
        params: {
          user_id: selectedUser || undefined,
          activity_type: activityType || undefined,
          start_date: startDate,
          end_date: endDate
        }
      });
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const logEntry = async (e) => {
    e.preventDefault();
    
    const userData = {
      user_id: selectedUser,
      activity_type: activityType,
      login_time: new Date().toISOString()
    };

    try {
      await axios.post('http://localhost:5000/api/log-gym-entry', userData);
      alert('Gym entry logged successfully');
      fetchLogs();
    } catch (error) {
      console.error('Error logging entry:', error);
      alert('Failed to log gym entry');
    }
  };

  const logExit = async (logId) => {
    try {
      await axios.post(`http://localhost:5000/api/log-gym-exit/${logId}`);
      alert('Gym exit logged successfully');
      fetchLogs();
    } catch (error) {
      console.error('Error logging exit:', error);
      alert('Failed to log gym exit');
    }
  };

  const exportCSV = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/export-gym-csv', {
        params: {
          start_date: startDate,
          end_date: endDate,
          activity_type: activityType || undefined
        },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `gym_logs_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV file');
    }
  };

  const calculateDuration = (loginTime, logoutTime) => {
    if (!logoutTime) return 'Still in gym';
    
    const login = new Date(loginTime);
    const logout = new Date(logoutTime);
    const diff = Math.abs(logout - login);
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gym Dashboard</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Log Gym Entry</h2>
        <form onSubmit={logEntry} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">User:</label>
              <select 
                className="w-full p-2 border rounded"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.card_id})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-2">Activity Type:</label>
              <select 
                className="w-full p-2 border rounded"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                required
              >
                <option value="">Select Activity</option>
                {activityTypes.map(activity => (
                  <option key={activity} value={activity}>
                    {activity}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Log Entry
          </button>
        </form>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Gym Activity Logs</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block mb-2">Filter by User:</label>
            <select 
              className="w-full p-2 border rounded"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-2">Activity Type:</label>
            <select 
              className="w-full p-2 border rounded"
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
            >
              <option value="">All Activities</option>
              {activityTypes.map(activity => (
                <option key={activity} value={activity}>
                  {activity}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-2">Start Date:</label>
            <input 
              type="date" 
              className="w-full p-2 border rounded"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block mb-2">End Date:</label>
            <input 
              type="date" 
              className="w-full p-2 border rounded"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={fetchLogs}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
            >
              Filter
            </button>
            <button 
              onClick={exportCSV}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Export CSV
            </button>
          </div>
        </div>
        
        {loading ? (
          <p className="text-center py-4">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border">User</th>
                  <th className="py-2 px-4 border">Card ID</th>
                  <th className="py-2 px-4 border">Department</th>
                  <th className="py-2 px-4 border">Activity</th>
                  <th className="py-2 px-4 border">Check-in Time</th>
                  <th className="py-2 px-4 border">Check-out Time</th>
                  <th className="py-2 px-4 border">Duration</th>
                  <th className="py-2 px-4 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map(log => (
                    <tr key={log.id} className="border-b">
                      <td className="py-2 px-4 border">{log.name}</td>
                      <td className="py-2 px-4 border">{log.card_id}</td>
                      <td className="py-2 px-4 border">{log.department}</td>
                      <td className="py-2 px-4 border">{log.activity_type}</td>
                      <td className="py-2 px-4 border">{new Date(log.login_time).toLocaleString()}</td>
                      <td className="py-2 px-4 border">
                        {log.logout_time ? new Date(log.logout_time).toLocaleString() : 'Still in gym'}
                      </td>
                      <td className="py-2 px-4 border">
                        {calculateDuration(log.login_time, log.logout_time)}
                      </td>
                      <td className="py-2 px-4 border">
                        {!log.logout_time && (
                          <button 
                            onClick={() => logExit(log.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
                          >
                            Log Exit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-4 text-center">No gym logs found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GymDashboard;