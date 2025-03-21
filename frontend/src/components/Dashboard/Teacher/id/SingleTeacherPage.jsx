
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import BigCalendarContainer from '../../../BigCalendarContainer';
import TeacherForm from '../../../TeacherForm';

const SingleTeacherPage = () => {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [subjects, setSubjects] = useState([]);
  
  const userRole = localStorage.getItem('userRole') || 'teacher';

  useEffect(() => {
    if (id) {
      fetchTeacher();
      fetchAnnouncements();
      fetchSubjects();
    }
  }, [id]);

  const fetchTeacher = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/teachers/${id}`);
      setTeacher(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching teacher:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch teacher');
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/announcements');
      setAnnouncements(response.data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/subjects');
      setSubjects(response.data);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleFormClose = (updated = false) => {
    setIsEditMode(false);
    if (updated) {
      fetchTeacher(); // Refresh teacher data
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
        No teacher data found. Please check the teacher ID or contact support.
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      <div className="w-full xl:w-2/3">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="bg-sky-50 py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3 relative">
              {/* Avatar Image */}
              <img
                src={teacher.img || "/noAvatar.png"}
                alt=""
                className="w-36 h-36 rounded-full object-cover"
              />
              {/* Edit Button */}
              
                <button
                  className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                  onClick={handleEdit}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {teacher.name} {teacher.surname || ''}
                </h1>
              </div>
              <p className="text-sm text-gray-500">Teacher at School Management System</p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <img src="/blood.png" alt="" className="w-4 h-4" />
                  <span>{teacher.bloodType || 'N/A'}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <img src="/date.png" alt="" className="w-4 h-4" />
                  <span>
                    {teacher.birthday ? new Date(teacher.birthday).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <img src="/mail.png" alt="" className="w-4 h-4" />
                  <span>{teacher.email || 'N/A'}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <img src="/phone.png" alt="" className="w-4 h-4" />
                  <span>{teacher.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow">
              <img src="/singleAttendance.png" alt="" className="w-6 h-6" />
              <div className="">
                <h1 className="text-xl font-semibold">90%</h1>
                <span className="text-sm text-gray-400">Attendance</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow">
              <img src="/singleBranch.png" alt="" className="w-6 h-6" />
              <div className="">
                <h1 className="text-xl font-semibold">{teacher.subjects?.length || 0}</h1>
                <span className="text-sm text-gray-400">Subjects</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow">
              <img src="/singleLesson.png" alt="" className="w-6 h-6" />
              <div className="">
                <h1 className="text-xl font-semibold">{teacher.lessons?.length || 0}</h1>
                <span className="text-sm text-gray-400">Lessons</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow">
              <img src="/singleClass.png" alt="" className="w-6 h-6" />
              <div className="">
                <h1 className="text-xl font-semibold">{teacher.classes?.length || 0}</h1>
                <span className="text-sm text-gray-400">Classes</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 bg-white rounded-md p-4 h-[800px] shadow">
          <h1 className="text-xl font-semibold mb-4">Teacher's Schedule</h1>
          <BigCalendarContainer type="teacherId" id={id} />
        </div>
      </div>
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md shadow">
          <h1 className="text-xl font-semibold mb-4">Shortcuts</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            <Link
              className="p-3 rounded-md bg-sky-50"
              to={`/classes?supervisorId=${teacher.id}`}
            >
              Teacher's Classes
            </Link>
            <Link
              className="p-3 rounded-md bg-purple-50"
              to={`/students?teacherId=${teacher.id}`}
            >
              Teacher's Students
            </Link>
            <Link
              className="p-3 rounded-md bg-yellow-50"
              to={`/lessons?teacherId=${teacher.id}`}
            >
              Teacher's Lessons
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50"
              to={`/exams?teacherId=${teacher.id}`}
            >
              Teacher's Exams
            </Link>
            <Link
              className="p-3 rounded-md bg-sky-50"
              to={`/assignments?teacherId=${teacher.id}`}
            >
              Teacher's Assignments
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow">
          <h1 className="text-xl font-semibold mb-4">Performance</h1>
          <div className="h-40 flex items-center justify-center bg-gray-50 rounded">
            <span className="text-gray-400">Performance charts will appear here</span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow">
          <h1 className="text-xl font-semibold mb-4">Announcements</h1>
          {announcements.length > 0 ? (
            <div className="flex flex-col gap-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border-b pb-4">
                  <h3 className="font-medium">{announcement.title || 'Untitled'}</h3>
                  <p className="text-sm text-gray-600">{announcement.description || announcement.content || 'No content'}</p>
                  <span className="text-xs text-gray-400">
                    {announcement.date ? new Date(announcement.date).toLocaleDateString() : 
                     announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString() : 'No date'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No announcements available.</p>
          )}
        </div>
      </div>
      {isEditMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <TeacherForm 
              type="update" 
              data={teacher} 
              setOpen={handleFormClose}
              subjects={subjects}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleTeacherPage;