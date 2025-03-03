
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
// Import components
import Login from "./components/Login";
import Register from "./components/Register";
import IDScan from "./components/IDScan";
import RegisterIDTemplate from "./components/RegisterIDTemplate";
import AttendanceLog from "./components/AttendanceLog";
import Dashboard from "./components/Dashboard";
import Unauthorized from "./components/Unauthorized";
import PrivateRoute from "./components/PrivateRoute";
import AdminDashboard from "./components/AdminDashboard";
import FacilityCheckIn from "./components/FacilityCheckIn";
import ClassSchedule from "./components/ClassSchedule";
import LibraryDashboard from "./components/LibraryDashboard";
import GymDashboard from "./components/GymDashboard";
import MonthlyReport from "./components/MonthlyReport";
import TeacherAttendanceView from "./components/TeacherAttendacneView";
import StudentClassCheckIn from "./components/StudentClassCheckIn";
import FaceIDAttendance from "./components/FaceIDAttendance";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    // Check if user data exists in localStorage
    const userString = localStorage.getItem("user");
    if (userString) {
      const userData = JSON.parse(userString);
      setIsAuthenticated(true);
      setUserRole(userData.role || "user");
      setUserName(userData.name || "");
      setUserId(userData.id || "");
    }
  }, []);

  const logout = () => {
    // Clear user data from localStorage and reset state
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUserRole("");
    setUserName("");
    setUserId("");
  };

  return (
    <Router>
      <div>
        {/* Navbar */}
        <nav className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Campus ID System</h1>
            
            {isAuthenticated && (
              <div className="flex space-x-4">
                <Link to="/dashboard" className="hover:text-blue-300">Dashboard</Link>
                <Link to="/library-dashboard" className="hover:text-blue-300">Library</Link>
                <Link to="/facility-check-in" className="hover:text-blue-300">Check In/Out</Link>
                <Link to="/attendance-log" className="hover:text-blue-300">Attendance Logs</Link>
                <Link to="/gym-dashboard" className="hover:text-blue-300">Gym</Link>
                <Link to="/admin-dashboard" className="hover:text-blue-300">Admin</Link>
                <Link to="/class-schedule" className="hover:text-blue-300">Class Schedule</Link>
                <Link to="/teacher-attendance" className="hover:text-blue-300">Teacher Attendance</Link>
                <Link to="/class-attendance" className="hover:text-blue-300">class Attendance</Link>
                <Link to="/monthly-report" className="hover:text-blue-300">Monthly Report</Link>
                <Link to="/mark-attendance" className="hover:text-blue-300">Mark Attendance</Link>
                {/* {userRole === "admin" && (
                  <>
                    <Link to="/admin-dashboard" className="hover:text-blue-300">Admin</Link>
                    <Link to="/class-schedule" className="hover:text-blue-300">Class Schedule</Link>
                  </>
                )} */}
                {/* {userRole === "teacher" && (
                  <Link to="/teacher-attendance" className="hover:text-blue-300">Class Attendance</Link>
                )} */}
                {/* {userRole === "library" && (
                  <Link to="/library-dashboard" className="hover:text-blue-300">Library</Link>
                )} */}
                {/* {userRole === "gym" && (
                  <Link to="/gym-dashboard" className="hover:text-blue-300">Gym</Link>
                )} */}
              </div>
            )}
            
            {isAuthenticated ? (
              <div className="flex items-center">
                <span className="mr-4">
                  Welcome, {userName} | {userRole}
                </span>
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                Login
              </Link>
            )}
          </div>
        </nav>

        {/* Routes */}
        <div className="container mx-auto p-4">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} setUserName={setUserName} setUserId={setUserId} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-template" element={<RegisterIDTemplate />} />
              
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Routes */}
            <Route element={<PrivateRoute allowedRoles={["user", "admin", "teacher", "library", "gym"]} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/attendance-log" element={<AttendanceLog />} />
              <Route path="/facility-check-in" element={<FacilityCheckIn />} />
              <Route path="/scan-id" element={<IDScan />} />
              <Route path="/monthly-report" element={<MonthlyReport />} />
              <Route path="/teacher-attendance" element={<TeacherAttendanceView />} />
              <Route path="/class-attendance" element={<StudentClassCheckIn/>} />
              <Route path="/mark-attendance" element={<FaceIDAttendance/>} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/class-schedule" element={<ClassSchedule />} />
              <Route path="/library-dashboard" element={<LibraryDashboard />} />
              <Route path="/gym-dashboard" element={<GymDashboard />} />
            </Route>
            
            {/* Teacher Routes */}
            {/* <Route element={<PrivateRoute allowedRoles={["teacher", "admin"]} />}>
              <Route path="/teacher-attendance" element={<TeacherAttendanceView />} />
            </Route> */}
            
            {/* Admin Routes */}
            {/* <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/class-schedule" element={<ClassSchedule />} />
            </Route> */}
            
            {/* Facility Staff Routes */}
            {/* <Route element={<PrivateRoute allowedRoles={["library", "admin"]} />}>
              <Route path="/library-dashboard" element={<LibraryDashboard />} />
            </Route> */}
             
            {/* <Route element={<PrivateRoute allowedRoles={["gym", "admin"]} />}>
              <Route path="/gym-dashboard" element={<GymDashboard />} />
            </Route> */}

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}