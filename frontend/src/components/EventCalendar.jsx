import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const EventCalendar = () => {
  const [value, setValue] = useState(new Date());
  const [events, setEvents] = useState([]); // ✅ Ensure default is an empty array

  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/api/events?date=${value.toISOString().split('T')[0]}`)
      .then(response => {
        console.log("📅 Event API Response:", response.data); // ✅ Debugging
        setEvents(Array.isArray(response.data) ? response.data : []); // ✅ Ensure array format
      })
      .catch(error => {
        console.error("❌ Event API Error:", error);
        setEvents([]); // ✅ Prevents errors when API fails
      });
  }, [value]);

  return (
    <div>
      <Calendar onChange={setValue} value={value} />
      <div>
        {events.length > 0 ? ( // ✅ Prevent `.map()` errors
          events.map(event => (
            <div key={event.id}>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p>{new Date(event.startTime).toLocaleTimeString()}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No events found for this date</p> // ✅ Show fallback
        )}
      </div>
    </div>
  );
};

export default EventCalendar;
