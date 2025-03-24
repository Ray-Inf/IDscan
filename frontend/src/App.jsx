import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Auth Components
import Login from "./components/Login";
import Register from "./components/Register";
import PrivateRoute from "./components/PrivateRoute";
import Unauthorized from "./components/Unauthorized";
import AdminPage from "./components/Dashboard/Admin/AdminPage";
// ID System Components
import IDScan from "./components/IDScan";
import RegisterIDTemplate from "./components/RegisterIDTemplate";
import AttendanceLog from "./components/AttendanceLog";
import FacilityCheckIn from "./components/FacilityCheckIn";
import LibraryDashboard from "./components/LibraryDashboard";
import GymDashboard from "./components/GymDashboard";
import MonthlyReport from "./components/MonthlyReport";
import FaceIDAttendance from "./components/FaceIDAttendance";

// Academic System Components
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import AdminDashboard from "./components/AdminDashboard";
import ClassSchedule from "./components/ClassSchedule";

// Student Management
import StudentListPage from "./components/Dashboard/List/Students/StudentListPage";
import SingleStudentPage from "./components/Dashboard/Student/id/SingleStudentPage";
import StudentPage from "./components/Dashboard/Student/StudentPage";
import StudentClassCheckIn from "./components/StudentClassCheckIn";

// Teacher Management
import TeacherListPage from "./components/Dashboard/List/Teachers/TeacherListPage";
import SingleTeacherPage from "./components/Dashboard/Teacher/id/SingleTeacherPage";
import TeacherPage from "./components/Dashboard/Teacher/TeacherPage";
// import TeacherAttendanceView from "./components/TeacherAttendanceView";

// Parent Management
import ParentListPage from "./components/Dashboard/List/Parents/ParentListPage";
import ParentPage from "./components/Dashboard/Parent/ParentPage";

// Academic Components
import ClassListPage from "./components/Dashboard/List/Classes/ClassListPage";
import SubjectListPage from "./components/Dashboard/List/Subjects/SubjectListPage";
import LessonListPage from "./components/Dashboard/List/Lessons/LessonListPage";
import ExamListPage from "./components/Dashboard/List/Exams/ExamListPage";
import ResultListPage from "./components/Dashboard/List/Results/ResultListPage";
import AssignmentListPage from "./components/Dashboard/List/Assignment/AssignmentListPage";
import AnnouncementListPage from "./components/Dashboard/List/Announcement/AnnouncementListPage";
import EventListPage from "./components/Dashboard/List/Events/EventListPage";
import AttendanceChartContainer from "./components/AttendanceChartContainer";
import Dashboard from "./components/Dashboard";

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

  // Helper function to determine if a user can access certain features
  const canAccess = (requiredRoles) => {
    if (!requiredRoles) return true;
    return requiredRoles.includes(userRole);
  };

  return (
    <Router>
      <div className="app-container">
        <ToastContainer position="bottom-right" theme="dark" />
        
        {/* Navbar */}
        {isAuthenticated && (
          <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold">School Management System</h1>
              
              <div className="flex space-x-4">
                <Link to="/dashboard" className="hover:text-blue-300">Dashboard</Link>
                
                {/* Common Links */}
                <Link to="/attendance" className="hover:text-blue-300">Attendance</Link>
                
                {/* Role-specific Links */}
                {canAccess(["ADMIN", "STAFF"]) && (
                  <Link to="/scan-id" className="hover:text-blue-300">ID Scan</Link>
                )}
                
                {canAccess(["ADMIN"]) && (
                  <>
                    <Link to="/admin" className="hover:text-blue-300">Admin</Link>
                    <Link to="/reports" className="hover:text-blue-300">Reports</Link>
                  </>
                )}
                
                {canAccess(["TEACHER", "ADMIN"]) && (
                  <Link to="/teachers" className="hover:text-blue-300">Teachers</Link>
                )}
                
                {canAccess(["STUDENT", "ADMIN", "TEACHER"]) && (
                  <Link to="/students" className="hover:text-blue-300">Students</Link>
                )}
                
                {canAccess(["LIBRARY", "ADMIN"]) && (
                  <Link to="/library" className="hover:text-blue-300">Library</Link>
                )}
                
                {canAccess(["GYM", "ADMIN"]) && (
                  <Link to="/gym" className="hover:text-blue-300">Gym</Link>
                )}
              </div>
              
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
            </div>
          </nav>
        )}
        {/* Routes */}
        <Routes>
          <Route path="/stud" element={<StudentListPage />} />
          <Route path="/register-template" element={<RegisterIDTemplate />} />
          <Route path="register" element={<Register />} />
          <Route path="/register-admin" element={<AdminPage />} />
          
          {/* Authentication Routes */}
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} setUserName={setUserName} setUserId={setUserId} />} />
          {/* <Route path="/register" element={<Register />} /> */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Main Application Layout with Dashboard */}
          <Route element={<PrivateRoute allowedRoles={["STUDENT", "TEACHER", "ADMIN", "LIBRARY", "GYM", "STAFF"]} />}>
            <Route path="/" element={<DashboardLayout />}>
              {/* Dashboard Home */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={
                userRole === "ADMIN" ? <AdminDashboard /> :
                userRole === "TEACHER" ? <TeacherPage /> :
                userRole === "STUDENT" ? <StudentPage /> :
                userRole === "LIBRARY" ? <LibraryDashboard /> :
                userRole === "GYM" ? <GymDashboard /> :
                <AdminDashboard />
              } />
              
              {/* ID System Routes */}
              <Route path="scan-id" element={<IDScan />} />
             
              <Route path="attendance-log" element={<AttendanceLog />} />
              <Route path="facility-check-in" element={<FacilityCheckIn />} />
              <Route path="mark-attendance" element={<FaceIDAttendance />} />
              
              {/* Student Management */}
              <Route path="students" element={<StudentListPage />} />
              <Route path="students/:id" element={<SingleStudentPage />} />
              <Route path="student" element={<StudentPage />} />
              <Route path="class-attendance" element={<StudentClassCheckIn />} />
              
              {/* Teacher Management */}
              <Route path="teachers" element={<TeacherListPage />} />
              <Route path="teachers/:id" element={<SingleTeacherPage />} />
              <Route path="teacher" element={<TeacherPage />} />
              {/* <Route path="teacher-attendance" element={<TeacherAttendanceView />} /> */}
              
              {/* Parent Management */}
              <Route path="parents" element={<ParentListPage />} />
              <Route path="parents/:id" element={<ParentPage />} />
              
              {/* Academic Components */}
              <Route path="classes" element={<ClassListPage />} />
              <Route path="subjects" element={<SubjectListPage />} />
              <Route path="lessons" element={<LessonListPage />} />
              <Route path="exams" element={<ExamListPage />} />
              <Route path="results" element={<ResultListPage />} />
              <Route path="assignments" element={<AssignmentListPage />} />
              <Route path="class-schedule" element={<ClassSchedule />} />
              
              {/* Facility Management */}
              <Route path="library" element={<LibraryDashboard />} />
              <Route path="gym" element={<GymDashboard />} />
              
              {/* Reports and Announcements */}
              <Route path="announcements" element={<AnnouncementListPage />} />
              <Route path="events" element={<EventListPage />} />
              <Route path="attendance" element={<AttendanceChartContainer />} />
              <Route path="reports" element={<MonthlyReport />} />
              
              {/* Admin Pages */}
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
          </Route>
          
          {/* Default Redirect */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </div>
    </Router>
  );
}