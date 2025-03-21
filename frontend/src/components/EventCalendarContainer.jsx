
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import EventCalendar from './EventCalendar';
// import EventList from '../components/EventList';

// const EventCalendarContainer = ({ role, id, searchParams = {} }) => {
//   const { date } = searchParams;
//   const [events, setEvents] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const params = new URLSearchParams();
//         params.set("role", role); // Ensure the backend knows the user's role

//         // For non-admin users, include type and id
//         if (role !== "admin") {
//           params.set("type", "teacherId"); // Assuming the teacher is accessing events
//           params.set("id", id);
//         }

//         if (date) params.set("date", date);

//         const response = await axios.get(`http://127.0.0.1:5000/api/events?${params.toString()}`);
//         setEvents(response.data);
//       } catch (error) {
//         console.error("Error fetching events:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchEvents();
//   }, [role, id, date]);

//   return (
//     <div className="bg-white p-4 rounded-md">
//       <EventCalendar />
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-semibold my-4">Events</h1>
//         <img src="/moreDark.png" alt="" width={20} height={20} />
//       </div>
//       <div className="flex flex-col gap-4">
//         {isLoading ? (
//           <p className="text-gray-500 text-center">Loading events...</p>
//         ) : events.length > 0 ? (
//           <EventList events={events} />
//         ) : (
//           <p className="text-gray-500 text-center">No events for this date.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EventCalendarContainer;
import React, { useEffect, useState } from "react";
import axios from "axios";
import EventCalendar from "./EventCalendar";
import EventList from "../components/EventList";

const EventCalendarContainer = ({ role, id, searchParams = {} }) => {
  const { date } = searchParams;
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params = new URLSearchParams();
        params.set("role", role);

        if (role !== "admin") {
          params.set("type", "teacherId");
          params.set("id", id);
        }

        if (date) params.set("date", date);

        const response = await axios.get(`http://127.0.0.1:5000/api/events?${params.toString()}`);
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [role, id, date]);

  return (
    <div className="bg-white p-4 rounded-md">
      <EventCalendar />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold my-4">Events</h1>
        <img src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <p className="text-gray-500 text-center">Loading events...</p>
        ) : events.length > 0 ? (
          <EventList events={events} />
        ) : (
          <p className="text-gray-500 text-center">No events for this date.</p>
        )}
      </div>
    </div>
  );
};

export default EventCalendarContainer;