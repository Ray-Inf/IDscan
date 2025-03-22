import React, { useState, useEffect } from "react";
import axios from "axios";

const AttendanceLog = () => {
  const [logs, setLogs] = useState([]);
const [card_id, setCardId] = useState("");

  const [facilityId, setFacilityId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userRole, setUserRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [view, setView] = useState("list"); // list or calendar
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  useEffect(() => {
    // Get user info from localStorage
    const userString = localStorage.getItem("user");
    if (userString) {
      const userData = JSON.parse(userString);
      setUserRole(userData.role || "");
      setCurrentUserId(userData.id || "");
      
      // If not admin, set userId filter to current user
      if (userData.role !== "admin" && userData.role !== "teacher") {
        setUserId(userData.id);
      }
    }
    
    // Set default dates for better usability
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    
    setStartDate(oneWeekAgo.toISOString().slice(0, 10));
    setEndDate(today.toISOString().slice(0, 10));
    
    // Initial fetch after setting dates
    setTimeout(() => fetchLogs(), 100);
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setErrorMessage("");
    
    try {
      const params = {};
      // Use card_id instead of user_id to match backend expectations
if (card_id) params.card_id = card_id;

      if (facilityId) params.facility_id = facilityId;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await axios.get("http://localhost:5000/api/get-attendance-logs", { params });

      
      if (response.data.logs) {
        setLogs(response.data.logs);
        setErrorMessage("");
      } else {
        setLogs([]);
        setErrorMessage("No attendance logs found for the given filters.");
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setErrorMessage("An error occurred while fetching attendance logs: " + (error.response?.data?.error || error.message) + ". Please try again later.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMonthlyLogs = async () => {
    setLoading(true);
    setErrorMessage("");
    
    try {
      // Make sure we're using card_id instead of user_id
      const params = {
        card_id: userId || currentUserId,
        month: month
      };
      
      if (facilityId) params.facility_id = facilityId;

      const response = await axios.get("http://localhost:5000/api/get-monthly-attendance", { params });

      
      if (response.data.logs) {
        setLogs(response.data.logs);
        setErrorMessage("");
      } else {
        setLogs([]);
        setErrorMessage("No attendance logs found for the selected month.");
      }
    } catch (error) {
      console.error("Error fetching monthly logs:", error);
      setErrorMessage("An error occurred while fetching monthly attendance: " + (error.response?.data?.error || error.message) + ". Please try again later.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = () => {
    if (view === "list") {
      fetchLogs();
    } else {
      fetchMonthlyLogs();
    }
  };
  
  const exportCsv = async () => {
    try {
      const params = {
        facility_id: facilityId || "all",
        start_date: startDate || new Date().toISOString().slice(0, 10),
        end_date: endDate || new Date().toISOString().slice(0, 10)
      };
      
      const response = await axios.get("http://localhost:5000/api/export-attendance-csv", {

        params,
        responseType: "blob"
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `attendance_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      setErrorMessage("Failed to export attendance data: " + (error.response?.data?.error || error.message));
    }
  };
  
  // Calculate attendance duration
  const calculateDuration = (loginTime, logoutTime) => {
    if (!logoutTime) return "Ongoing";
    
    const start = new Date(loginTime);
    const end = new Date(logoutTime);
    const diff = Math.floor((end - start) / 1000); // difference in seconds
    
    if (diff < 60) {
      return `${diff} seconds`;
    } else if (diff < 3600) {
      return `${Math.floor(diff / 60)} minutes`;
    } else {
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  // Generate calendar view for monthly attendance
  const renderCalendarView = () => {
    // Get days in month
    const [year, monthNum] = month.split("-");
    const daysInMonth = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
    const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('default', { month: 'long' });
    
    // Create a map of days with attendance
    const attendanceDays = {};
    logs.forEach(log => {
      // Handle both login_time and timestamp fields from different API endpoints
      const loginTimeField = log.login_time || log.timestamp;
      if (!loginTimeField) return;
      
      const day = new Date(loginTimeField).getDate();
      if (!attendanceDays[day]) {
        attendanceDays[day] = [];
      }
      attendanceDays[day].push(log);
    });
    
    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">{monthName} {year} Attendance</h2>
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-semibold bg-gray-100">
              {day}
            </div>
          ))}
          
          {/* Fill in empty spaces for first day of month */}
          {Array.from({ length: new Date(`${year}-${monthNum}-01`).getDay() }).map((_, i) => (
            <div key={`empty-start-${i}`} className="p-2 border min-h-16"></div>
          ))}
          
          {/* Calendar days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const hasAttendance = attendanceDays[day] && attendanceDays[day].length > 0;
            
            return (
              <div 
                key={`day-${day}`} 
                className={`p-2 border min-h-16 ${hasAttendance ? 'bg-blue-50' : ''}`}
              >
                <div className="font-semibold">{day}</div>
                {hasAttendance && (
                  <div className="text-xs mt-1">
                    {attendanceDays[day].slice(0, 2).map((log, i) => {
                      // Handle different field names from different API endpoints
                      const facilityName = log.facility_id || "general";
                      const loginTime = log.login_time || log.timestamp;
                      return (
                        <div key={i} className="mb-1">
                          {facilityName} {new Date(loginTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      );
                    })}
                    {attendanceDays[day].length > 2 && (
                      <div className="text-blue-500">+{attendanceDays[day].length - 2} more</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Generate specialized facility details
 // In renderFacilityDetails function in AttendanceLog.jsx
const renderFacilityDetails = (log) => {
  if (!log.facility_id) return null;
  
  switch(log.facility_id) {
    case "library":
      return log.book_id ? (
        <div>
          <span className="font-semibold">Book ID:</span> {log.book_id}
        </div>
      ) : null;
    case "gym":
      return log.activity_type ? (
        <div>
          <span className="font-semibold">Activity:</span> {log.activity_type}
        </div>
      ) : null;
    // ... rest of the cases
    default:
      return null;
  }
};
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Attendance Logs</h1>
        
        {/* View Toggle */}
        <div className="flex space-x-2">
          <button 
            onClick={() => setView("list")} 
            className={`px-4 py-2 rounded ${view === "list" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            List View
          </button>
          <button 
            onClick={() => setView("calendar")} 
            className={`px-4 py-2 rounded ${view === "calendar" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Calendar View
          </button>
          
          {(userRole === "admin" || userRole === "teacher") && (
            <button 
              onClick={exportCsv}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(userRole === "admin" || userRole === "teacher") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card ID</label>
              <input
                type="text"
                placeholder="Card ID"
value={card_id}
onChange={(e) => setCardId(e.target.value)}

                className="w-full p-2 border rounded"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facility</label>
            <select 
              value={facilityId} 
              onChange={(e) => setFacilityId(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All Facilities</option>
              <option value="library">Library</option>
              <option value="gym">Gym</option>
              <option value="class">Class</option>
              <option value="cafeteria">Cafeteria</option>
              <option value="hostel">Hostel</option>
            </select>
          </div>
          
          {view === "list" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <button 
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      {/* Attendance Data */}
      {!loading && !errorMessage && (
        view === "list" ? (
          <>
            {logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      {userRole === "admin" && <th className="py-2 px-4 border-b">User ID</th>}
                      <th className="py-2 px-4 border-b">Name</th>
                      <th className="py-2 px-4 border-b">Card ID</th>
                      <th className="py-2 px-4 border-b">Facility</th>
                      <th className="py-2 px-4 border-b">Check-In Time</th>
                      <th className="py-2 px-4 border-b">Check-Out Time</th>
                      <th className="py-2 px-4 border-b">Duration</th>
                      <th className="py-2 px-4 border-b">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => {
                      // Handle both login_time and timestamp fields from different API endpoints
                      const loginTime = log.login_time || log.timestamp;
                      const logoutTime = log.logout_time;
                      // Use facility_id if available, otherwise show "general"
                      const facilityName = log.facility_name || "general";
                      
                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          {userRole === "admin" && <td className="py-2 px-4 border-b">{log.user_id}</td>}
                          <td className="py-2 px-4 border-b">{log.name}</td>
                          <td className="py-2 px-4 border-b">{log.card_id}</td>
                          <td className="py-2 px-4 border-b">{facilityName}</td>
                          <td className="py-2 px-4 border-b">{loginTime ? new Date(loginTime).toLocaleString() : "N/A"}</td>
                          <td className="py-2 px-4 border-b">
                            {logoutTime ? new Date(logoutTime).toLocaleString() : "Ongoing"}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {loginTime ? calculateDuration(loginTime, logoutTime) : "N/A"}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {renderFacilityDetails(log)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No attendance logs found</div>
            )}
          </>
        ) : (
          renderCalendarView()
        )
      )}
    </div>
  );
};

export default AttendanceLog;
