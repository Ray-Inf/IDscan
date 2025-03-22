import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [stats, setStats] = useState({
    totalHours: 0,
    libraryVisits: 0,
    gymVisits: 0,
    classAttendance: 0
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userString = localStorage.getItem('user');
        if (!userString) {
          setError('User not found in local storage');
          setLoading(false);
          return;
        }
        
        const userData = JSON.parse(userString);
        const userId = userData.card_id || userData.id;
        
        if (!userId) {
          setError('User ID not found');
          setLoading(false);
          return;
        }
        
        // Modified to use the lookup endpoint with card_id
        const response = await axios.get(`http://localhost:5000/api/lookup`, {
          params: { card_id: userId }
        });
        
        // Access the user object from the response
        if (response.data && response.data.user) {
          setUserData(response.data.user);
        } else {
          throw new Error('User data not found in response');
        }
        
        // Fetch recent activity
        const activityResponse = await axios.get("http://localhost:5000/api/recent", {
          params: { card_id: userId }
        });
        
        if (activityResponse.data.logs) {
          setRecentActivity(activityResponse.data.logs);
          
          // Check for active sessions (no logout_time)
          const active = activityResponse.data.logs.find(log => !log.logout_time);
          if (active) {
            setActiveSession(active);
          }
          
          // Calculate statistics
          calculateStats(userId);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError('Failed to fetch user data: ' + (err.response ? err.response.data.message : err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const calculateStats = async (userId) => {
    try {
      // Get current month
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      // Fetch monthly stats
      const statsResponse = await axios.get("http://localhost:5000/api/get-monthly-attendance", {
        params: {
          card_id: userId,
          month: currentMonth
        }
      });
      
      if (statsResponse.data.logs) {
        const logs = statsResponse.data.logs;
        
        // Calculate statistics
        let totalHours = 0;
        let libraryVisits = 0;
        let gymVisits = 0;
        let classAttendance = 0;
        
        logs.forEach(log => {
          // Count visits by facility
          if (log.facility_id === "library") libraryVisits++;
          if (log.facility_id === "gym") gymVisits++;
          if (log.facility_id === "class") classAttendance++;
          
          // Calculate hours if there's a logout time
          if (log.logout_time) {
            const start = new Date(log.login_time);
            const end = new Date(log.logout_time);
            const diffHours = (end - start) / (1000 * 60 * 60);
            totalHours += diffHours;
          }
        });
        
        setStats({
          totalHours: totalHours.toFixed(1),
          libraryVisits,
          gymVisits,
          classAttendance
        });
      }
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  };

  const formatDuration = (loginTime) => {
    const now = new Date();
    const login = new Date(loginTime);
    const diffMs = now - login;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - User Info & Quick Actions */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-xl font-bold text-white">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold">{userData.name}</h2>
                  <p className="text-gray-600">ID: {userData.card_id}</p>
                  <p className="text-gray-600 capitalize">{userData.role || "Student"}</p>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-2">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Link 
                    to="/facility-check-in" 
                    className="bg-blue-500 text-white py-2 px-4 rounded text-center hover:bg-blue-600"
                  >
                    Check In/Out
                  </Link>
                  <Link 
                    to="/attendance-log" 
                    className="bg-gray-500 text-white py-2 px-4 rounded text-center hover:bg-gray-600"
                  >
                    View Logs
                  </Link>
                  <Link 
                    to="/monthly-report" 
                    className="bg-green-500 text-white py-2 px-4 rounded text-center hover:bg-green-600"
                  >
                    Monthly Report
                  </Link>
                  <Link 
                    to="/scan-id" 
                    className="bg-indigo-500 text-white py-2 px-4 rounded text-center hover:bg-indigo-600"
                  >
                    Scan ID
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Active Session */}
            {activeSession && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-green-800 mb-2">Active Session</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{activeSession.facility_id}</span>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    {formatDuration(activeSession.login_time)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Started: {new Date(activeSession.login_time).toLocaleString()}
                </p>
                
                {activeSession.facility_id === "library" && activeSession.book_id && (
                  <p className="text-sm text-gray-600">Book ID: {activeSession.book_id}</p>
                )}
                
                {activeSession.facility_id === "gym" && activeSession.activity_type && (
                  <p className="text-sm text-gray-600">Activity: {activeSession.activity_type}</p>
                )}
                
                {activeSession.facility_id === "class" && activeSession.subject && (
                  <p className="text-sm text-gray-600">Subject: {activeSession.subject}</p>
                )}
                
                <Link 
                  to="/facility-check-in"
                  className="block mt-4 text-center bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                >
                  Check Out
                </Link>
              </div>
            )}
          </div>
          
          {/* Right Column - Stats & Recent Activity */}
          <div className="md:col-span-2">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm mb-1">Total Hours</h3>
                <p className="text-2xl font-bold">{stats.totalHours}</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm mb-1">Library Visits</h3>
                <p className="text-2xl font-bold">{stats.libraryVisits}</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm mb-1">Gym Visits</h3>
                <p className="text-2xl font-bold">{stats.gymVisits}</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm mb-1">Class Attendance</h3>
                <p className="text-2xl font-bold">{stats.classAttendance}</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <Link to="/attendance-log" className="text-blue-500 text-sm hover:underline">
                  View All
                </Link>
              </div>
              
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="border-b last:border-b-0 pb-3 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{activity.facility_id}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(activity.login_time).toLocaleString()}
                            {activity.logout_time && (
                              <> to {new Date(activity.logout_time).toLocaleTimeString()}</>
                            )}
                          </p>
                          
                          {/* Facility-specific details */}
                          {activity.facility_id === "library" && activity.book_id && (
                            <p className="text-sm mt-1">Book ID: {activity.book_id}</p>
                          )}
                          
                          {activity.facility_id === "gym" && activity.activity_type && (
                            <p className="text-sm mt-1">Activity: {activity.activity_type}</p>
                          )}
                          
                          {activity.facility_id === "class" && activity.subject && (
                            <p className="text-sm mt-1">Subject: {activity.subject}</p>
                          )}
                        </div>
                        
                        <span className={`text-xs px-2 py-1 rounded ${activity.logout_time ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                          {activity.logout_time ? 
                            `Duration: ${((new Date(activity.logout_time) - new Date(activity.login_time)) / (1000 * 60)).toFixed(0)} min` : 
                            'Ongoing'
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No recent activity found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;