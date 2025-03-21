// import React from 'react';
// import { Routes, Route, Outlet } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// // Components
// import Menu from './components/Menu';
// import Navbar from './components/Navbar';

// // Pages
// import StudentListPage from './components/Dashboard/List/Students/StudentListPage';
// import TeacherListPage from './components/Dashboard/List/Teachers/TeacherListPage';
// import SubjectListPage from './components/Dashboard/List/Subjects/SubjectListPage';
// import SingleTeacherPage from './components/Dashboard/Teacher/id/SingleTeacherPage';
// import ParentPage from './components/Dashboard/Parent/ParentPage';
// import StudentPage from './components/Dashboard/Student/StudentPage';
// import TeacherPage from './components/Dashboard/Teacher/TeacherPage';
// import ClassListPage from './components/Dashboard/List/Classes/ClassListPage';
// import AnnouncementListPage from './components/Dashboard/List/Announcement/AnnouncementListPage';
// import AssignmentListPage from './components/Dashboard/List/Assignment/AssignmentListPage';
// import EventListPage from './components/Dashboard/List/Events/EventListPage';
// import ResultListPage from './components/Dashboard/List/Results/ResultListPage';
// import ParentListPage from './components/Dashboard/List/Parents/ParentListPage';
// import LessonListPage from './components/Dashboard/List/Lessons/LessonListPage';
// import ExamListPage from './components/Dashboard/List/Exams/ExamListPage';
// import SingleStudentPage from './components/Dashboard/Student/id/SingleStudentPage';
// import DashboardLayout from './components/Dashboard/DashboardLayout';
// import AdminPage from './components/Dashboard/Admin/AdminPage';
// import AttendanceChartContainer from './components/AttendanceChartContainer';

// const App = () => {
//   return (
//     <div className="app-container">
//      {/* <StudentPage/> */}
//      {/* <SingleTeacherPage/> */}
//      {/* <TeacherPage/> */}
     
//       <ToastContainer position="bottom-right" theme="dark" />
//       <Routes>
//         <Route path="/" element={<DashboardLayout />}>
//           {/* All routes will be rendered inside the DashboardLayout */}
//           {/* <Route index element={<DashboardLayout />} />
//            */}
//           {/* Student Routes */}
//           <Route path="list/students" element={<StudentListPage />} />
//           <Route path="students/:id" element={<SingleStudentPage />} />
//           <Route path="student" element={<StudentPage />} />
          

//           {/* Teacher Routes */}
//           <Route path="list/teachers" element={<TeacherListPage />} />
//           <Route path="teachers/:id" element={<SingleTeacherPage />} />
//           <Route path="teacher" element={<TeacherPage />} />

//              {/* ✅ Parent Routes (FIXED) */}
//     <Route path="list/parents" element={<ParentListPage />} />   {/* Parent List */}
//     <Route path="parents/:id" element={<ParentPage />} />   {/* Parent Details */}

//           {/* Class Routes */}
//           <Route path="list/classes" element={<ClassListPage />} />

//           {/* Subject Routes */}
//           <Route path="list/subjects" element={<SubjectListPage />} />

//           {/* Announcement Routes */}
//           <Route path="list/announcements" element={<AnnouncementListPage />} />

//           {/* Assignment Routes */}
//           <Route path="list/assignments" element={<AssignmentListPage />} />

//           {/* Event Routes */}
//           <Route path="list/events" element={<EventListPage />} />

//           {/* Result Routes */}
//           <Route path="list/results" element={<ResultListPage />} />

//           {/* Lesson Routes */}
//           <Route path="list/lessons" element={<LessonListPage />} />

//           {/* Exam Routes */}
//           <Route path="list/exams" element={<ExamListPage />} />

//           {/* Admin Routes */}
//           <Route path="admin" element={<AdminPage />} />
//           <Route path="list/attendance" element={<AttendanceChartContainer />} />
//         </Route>
//       </Routes>
//     </div>
//   );
// };

// export default App;
import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import StudentListPage from './components/Dashboard/List/Students/StudentListPage';
import TeacherListPage from './components/Dashboard/List/Teachers/TeacherListPage';
import SubjectListPage from './components/Dashboard/List/Subjects/SubjectListPage';
import SingleTeacherPage from './components/Dashboard/Teacher/id/SingleTeacherPage';
import ParentPage from './components/Dashboard/Parent/ParentPage';
import StudentPage from './components/Dashboard/Student/StudentPage';
import TeacherPage from './components/Dashboard/Teacher/TeacherPage';
import ClassListPage from './components/Dashboard/List/Classes/ClassListPage';
import AnnouncementListPage from './components/Dashboard/List/Announcement/AnnouncementListPage';
import AssignmentListPage from './components/Dashboard/List/Assignment/AssignmentListPage';
import EventListPage from './components/Dashboard/List/Events/EventListPage';
import ResultListPage from './components/Dashboard/List/Results/ResultListPage';
import ParentListPage from './components/Dashboard/List/Parents/ParentListPage';
import LessonListPage from './components/Dashboard/List/Lessons/LessonListPage';
import ExamListPage from './components/Dashboard/List/Exams/ExamListPage';
import SingleStudentPage from './components/Dashboard/Student/id/SingleStudentPage';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import AdminPage from './components/Dashboard/Admin/AdminPage';
import AttendanceChartContainer from './components/AttendanceChartContainer';


const App = () => {
  return (
    <div className="app-container">
      <ToastContainer position="bottom-right" theme="dark" />
      
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          {/* Dashboard Home */}
          <Route index element={<AdminPage />} />
          
          {/* Student Routes */}
          <Route path="students" element={<StudentListPage />} />
          <Route path="students/:id" element={<SingleStudentPage />} />
          <Route path="student" element={<StudentPage />} />
          
          {/* Teacher Routes */}
          <Route path="teachers" element={<TeacherListPage />} />
          <Route path="teachers/:id" element={<SingleTeacherPage />} />
          <Route path="teacher" element={<TeacherPage />} />

          {/* Parent Routes */}
          <Route path="parents" element={<ParentListPage />} />
          <Route path="parents/:id" element={<ParentPage />} />

          {/* Class Routes */}
          <Route path="classes" element={<ClassListPage />} />
          
          {/* Subject Routes */}
          <Route path="subjects" element={<SubjectListPage />} />
          
          {/* Announcement Routes */}
          <Route path="announcements" element={<AnnouncementListPage />} />
          
          {/* Assignment Routes */}
          <Route path="assignments" element={<AssignmentListPage />} />
          
          {/* Event Routes */}
          <Route path="events" element={<EventListPage />} />
          
          {/* Result Routes */}
          <Route path="results" element={<ResultListPage />} />
          
          {/* Lesson Routes */}
          <Route path="lessons" element={<LessonListPage />} />
          
          {/* Exam Routes */}
          <Route path="exams" element={<ExamListPage />} />
          
          {/* Admin Routes */}
          <Route path="admin" element={<AdminPage />} />
          
          {/* Attendance Routes */}
          <Route path="attendance" element={<AttendanceChartContainer />} />
          
          {/* Legacy list routes for backward compatibility */}
          <Route path="list/students" element={<StudentListPage />} />
          <Route path="list/teachers" element={<TeacherListPage />} />
          <Route path="list/classes" element={<ClassListPage />} />
          <Route path="list/subjects" element={<SubjectListPage />} />
          <Route path="list/announcements" element={<AnnouncementListPage />} />
          <Route path="list/assignments" element={<AssignmentListPage />} />
          <Route path="list/events" element={<EventListPage />} />
          <Route path="list/results" element={<ResultListPage />} />
          <Route path="list/parents" element={<ParentListPage />} />
          <Route path="list/lessons" element={<LessonListPage />} />
          <Route path="list/exams" element={<ExamListPage />} />
          <Route path="list/attendance" element={<AttendanceChartContainer />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;