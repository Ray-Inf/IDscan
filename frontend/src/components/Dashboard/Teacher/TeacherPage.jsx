
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const TeacherPage = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // For demo purposes, let's assume we have a userId in localStorage
  // In a real app, you might get this from auth or context
  const userId = localStorage.getItem('userId') || 'teacher1';

  useEffect(() => {
    fetchSchedule();
    fetchAnnouncements();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      console.log('Fetching schedule for userId:', userId);

      const response = await axios.get(`http://127.0.0.1:5000/api/teacher/schedule?userId=${userId}`);
      console.log('Schedule response:', response.data);

      setSchedule(response.data);

      // Transform schedule data to FullCalendar events format
      const calendarEvents = response.data.map(lesson => ({
        id: lesson.id,
        title: lesson.subject?.name || 'Unknown Subject',
        start: `${lesson.day}T${lesson.startTime}`,
        end: `${lesson.day}T${lesson.endTime}`,
        color: getRandomColor(lesson.subject?.name),
      }));

      console.log('Calendar events:', calendarEvents);
      setEvents(calendarEvents);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError(err.message || 'Failed to fetch schedule');
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/announcements');
      console.log('Announcements response:', response.data);
      setAnnouncements(response.data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  };

  // Generate random color based on subject name
  const getRandomColor = (subjectName) => {
    if (!subjectName) return '#3788d8'; // Default blue
    
    // Simple hash function to get consistent colors for the same subject
    let hash = 0;
    for (let i = 0; i < subjectName.length; i++) {
      hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      '#3788d8', // Blue
      '#ff7f50', // Coral
      '#32cd32', // Lime Green
      '#9370db', // Medium Purple
      '#ff69b4', // Hot Pink
      '#20b2aa', // Light Sea Green
    ];
    
    return colors[Math.abs(hash) % colors.length];
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

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT - Calendar */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-lg shadow-md">
          <h1 className="text-xl font-semibold mb-4">Schedule</h1>
          <div className="h-[800px]">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={events}
              height="100%"
            />
          </div>
        </div>
      </div>
      
      {/* RIGHT - Announcements */}
      <div className="w-full xl:w-1/3">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h1 className="text-xl font-semibold mb-4">Announcements</h1>
          {announcements.length > 0 ? (
            <div className="flex flex-col gap-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border-b pb-4">
                  <h3 className="font-medium">{announcement.title}</h3>
                  <p className="text-sm text-gray-600">{announcement.content}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No announcements available.</p>
          )}
        </div>

        {/* Performance Section */}
        <div className="bg-white p-4 rounded-lg shadow-md mt-4">
          <h1 className="text-xl font-semibold mb-4">Performance</h1>
          <div className="h-40 flex items-center justify-center bg-gray-50 rounded">
            <span className="text-gray-400">Performance charts will appear here</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;