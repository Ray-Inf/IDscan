// import React, { useState, useEffect } from "react";
// import axios from "axios";

// // Configure axios defaults
// axios.defaults.baseURL = 'http://localhost:5000/api';

// const TeacherAttendanceView = () => {
//   const [classes, setClasses] = useState([]);
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [attendanceData, setAttendanceData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [userData, setUserData] = useState(null);
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [attendanceSummary, setAttendanceSummary] = useState({
//     total: 0,
//     present: 0,
//     absent: 0,
//     late: 0
//   });

//   useEffect(() => {
//     // Load user data from localStorage
//     try {
//       const user = JSON.parse(localStorage.getItem("user"));
//       if (user && user.card_id) {
//         setUserData(user);
//       } else {
//         setError("Teacher information not found. Please login again.");
//       }
//     } catch (err) {
//       console.error("Error loading user data:", err);
//       setError("Failed to load user information. Please login again.");
//     }
//   }, []);

//   useEffect(() => {
//     if (userData && (userData.role === 'teacher' || userData.role === 'guest_teacher')) {
//       fetchTeacherClasses();
//     } else if (userData) {
//       setError("You must be a teacher to access this page");
//     }
//   }, [userData]);

//   const fetchTeacherClasses = async () => {
//     if (!userData) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const response = await axios.get("/classes", {
//         params: { teacher_id: userData.card_id }
//       });

//       if (response.data.success) {
//         setClasses(response.data.classes || []);
//       } else {
//         setError(response.data.error || "Failed to fetch classes");
//       }
//     } catch (err) {
//       console.error("Error fetching classes:", err);
//       setError("Failed to load classes. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAttendance = async (classId) => {
//     if (!classId) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const response = await axios.get(`/classes/${classId}/attendance`, {
//         params: { date: selectedDate }
//       });

//       if (response.data.success) {
//         setAttendanceData(response.data.attendance || []);
        
//         // Calculate summary
//         const total = response.data.attendance.length;
//         const present = response.data.attendance.filter(a => a.status === 'present').length;
//         const absent = response.data.attendance.filter(a => a.status === 'absent').length;
//         const late = response.data.attendance.filter(a => a.status === 'late').length;
        
//         setAttendanceSummary({ total, present, absent, late });
//       } else {
//         setError(response.data.error || "Failed to fetch attendance data");
//       }
//     } catch (err) {
//       console.error("Error fetching attendance:", err);
//       setError("Failed to load attendance data. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClassSelect = (classId) => {
//     setSelectedClass(classId);
//     fetchAttendance(classId);
//   };

//   const handleDateChange = (e) => {
//     setSelectedDate(e.target.value);
//     if (selectedClass) {
//       fetchAttendance(selectedClass);
//     }
//   };

//   const handleManualAttendance = async (cardId, status) => {
//     if (!selectedClass) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const response = await axios.post("/classes/attendance", {
//         class_id: selectedClass,
//         card_id: cardId,
//         status: status
//       });

//       if (response.data.success) {
//         fetchAttendance(selectedClass);
//       } else {
//         setError(response.data.error || "Failed to update attendance");
//       }
//     } catch (err) {
//       console.error("Error updating attendance:", err);
//       setError("Failed to update attendance. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadAttendance = () => {
//     if (!selectedClass || attendanceData.length === 0) return;
    
//     // Find the selected class name
//     const classDetails = classes.find(c => c.id === selectedClass);
//     const className = classDetails ? classDetails.class_name : 'Class';
    
//     // Create CSV content
//     let csvContent = "data:text/csv;charset=utf-8,";
//     csvContent += "Card ID,Status,Timestamp\n";
    
//     attendanceData.forEach(item => {
//       const timestamp = new Date(item.timestamp).toLocaleString();
//       csvContent += `${item.card_id},${item.status},${timestamp}\n`;
//     });
    
//     // Create download link
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", `${className}_attendance_${selectedDate}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Teacher Attendance View</h1>
      
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {userData && (
//         <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
//           <h2 className="text-lg font-semibold">Teacher Information</h2>
//           <p>Name: {userData.name}</p>
//           <p>ID: {userData.card_id}</p>
//           <p>Role: {userData.role}</p>
//         </div>
//       )}
      
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//         <div className="md:col-span-1 bg-white p-4 border rounded shadow-sm">
//           <h2 className="text-lg font-semibold mb-2">Your Classes</h2>
          
//           {loading && !classes.length ? (
//             <div className="flex justify-center my-4">
//               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//             </div>
//           ) : classes.length === 0 ? (
//             <div className="text-gray-500 text-center py-4">
//               No classes found
//             </div>
//           ) : (
//             <div className="space-y-2">
//               {classes.map(cls => (
//                 <button
//                   key={cls.id}
//                   onClick={() => handleClassSelect(cls.id)}
//                   className={`w-full text-left p-2 rounded ${selectedClass === cls.id ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
//                 >
//                   <div className="font-medium">{cls.class_name}</div>
//                   <div className="text-sm">{cls.department} - Year {cls.year}</div>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
        
//         <div className="md:col-span-3 bg-white p-4 border rounded shadow-sm">
//           {selectedClass ? (
//             <>
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-lg font-semibold">
//                   Attendance for {classes.find(c => c.id === selectedClass)?.class_name}
//                 </h2>
                
//                 <div className="flex items-center space-x-2">
//                   <input
//                     type="date"
//                     value={selectedDate}
//                     onChange={handleDateChange}
//                     className="p-2 border rounded"
//                   />
//                   <button
//                     onClick={downloadAttendance}
//                     disabled={attendanceData.length === 0}
//                     className={`px-3 py-2 rounded ${attendanceData.length > 0 ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
//                   >
//                     Download CSV
//                   </button>
//                 </div>
//               </div>
              
//               {/* Attendance Summary */}
//               <div className="grid grid-cols-4 gap-2 mb-4">
//                 <div className="bg-blue-50 p-2 rounded text-center border border-blue-100">
//                   <div className="text-sm text-blue-600">Total</div>
//                   <div className="text-2xl font-bold">{attendanceSummary.total}</div>
//                 </div>
//                 <div className="bg-green-50 p-2 rounded text-center border border-green-100">
//                   <div className="text-sm text-green-600">Present</div>
//                   <div className="text-2xl font-bold">{attendanceSummary.present}</div>
//                 </div>
//                 <div className="bg-red-50 p-2 rounded text-center border border-red-100">
//                   <div className="text-sm text-red-600">Absent</div>
//                   <div className="text-2xl font-bold">{attendanceSummary.absent}</div>
//                 </div>
//                 <div className="bg-yellow-50 p-2 rounded text-center border border-yellow-100">
//                   <div className="text-sm text-yellow-600">Late</div>
//                   <div className="text-2xl font-bold">{attendanceSummary.late}</div>
//                 </div>
//               </div>
              
//               {loading ? (
//                 <div className="flex justify-center my-8">
//                   <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//                 </div>
//               ) : attendanceData.length === 0 ? (
//                 <div className="text-center py-8 text-gray-500">
//                   No attendance data found for this date
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card ID</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {attendanceData.map((attendance, index) => (
//                         <tr key={index} className="hover:bg-gray-50">
//                           <td className="px-6 py-4 whitespace-nowrap">{attendance.card_id}</td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
//                               ${attendance.status === 'present' ? 'bg-green-100 text-green-800' : 
//                                 attendance.status === 'absent' ? 'bg-red-100 text-red-800' :
//                                 'bg-yellow-100 text-yellow-800'}`}>
//                               {attendance.status}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">{new Date(attendance.timestamp).toLocaleString()}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                             <div className="flex space-x-2">
//                               <button 
//                                 onClick={() => handleManualAttendance(attendance.card_id, 'present')}
//                                 className="text-green-600 hover:text-green-900"
//                               >
//                                 Present
//                               </button>
//                               <button 
//                                 onClick={() => handleManualAttendance(attendance.card_id, 'absent')}
//                                 className="text-red-600 hover:text-red-900"
//                               >
//                                 Absent
//                               </button>
//                               <button 
//                                 onClick={() => handleManualAttendance(attendance.card_id, 'late')}
//                                 className="text-yellow-600 hover:text-yellow-900"
//                               >
//                                 Late
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="text-center py-8 text-gray-500">
//               Select a class to view attendance
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TeacherAttendanceView;