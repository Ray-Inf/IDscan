
import React, { useState, useEffect } from 'react';
import BigCalendar from './BigCalendar';
import axios from 'axios';

const BigCalendarContainer = ({ type, id }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let endpoint;
        if (type === "teacherId") {
          endpoint = `http://127.0.0.1:5000/api/lessons?type=teacherId&id=${id}&role=teacher`;
        } else if (type === "classId") {
          endpoint = `http://127.0.0.1:5000/api/lessons?type=classId&id=${id}&role=student`;
        } else {
          throw new Error("Invalid type parameter");
        }

        const response = await axios.get(endpoint);
        if (response.data && response.data.data) {
          const formattedEvents = response.data.data.map(lesson => ({
            id: lesson.id || Math.random().toString(36).substr(2, 9),
            title: lesson.title,
            start: new Date(lesson.start),
            end: new Date(lesson.end),
          }));
          setSchedule(formattedEvents);
        }
      } catch (err) {
        console.error("Error fetching calendar data:", err);
        setError("Failed to load schedule data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg font-medium text-gray-700">Loading schedule...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-container w-full h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center">Schedule {type === "classId" ? `(${id})` : ""}</h1>
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;