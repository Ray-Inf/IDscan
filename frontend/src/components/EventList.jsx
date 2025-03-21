// import React, { useEffect, useState } from "react";

// const EventList = ({ dateParam }) => {
//   const [events, setEvents] = useState([]);

//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const dateQuery = dateParam ? `?date=${dateParam}` : "";
//         const response = await fetch(`http://127.0.0.1:5000/api/events${dateQuery}`);
//         const data = await response.json();
//         setEvents(data);
//       } catch (error) {
//         console.error("Error fetching events:", error);
//       }
//     };

//     fetchEvents();
//   }, [dateParam]);

//   return (
//     <div>
//       {events.length === 0 ? (
//         <p className="text-gray-500">No events for this date.</p>
//       ) : (
//         events.map((event) => (
//           <div
//             className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lamaSky even:border-t-lamaPurple"
//             key={event.id}
//           >
//             <div className="flex items-center justify-between">
//               <h1 className="font-semibold text-gray-600">{event.title}</h1>
//               <span className="text-gray-300 text-xs">
//                 {new Date(event.startTime).toLocaleTimeString("en-UK", {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                   hour12: false,
//                 })}
//               </span>
//             </div>
//             <p className="mt-2 text-gray-400 text-sm">{event.description}</p>
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default EventList;
import React from "react";

const EventList = ({ events }) => {
  return (
    <div>
      {events.length === 0 ? (
        <p className="text-gray-500">No events for this date.</p>
      ) : (
        events.map((event) => (
          <div
            className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lamaSky even:border-t-lamaPurple"
            key={event.id}
          >
            <div className="flex items-center justify-between">
              <h1 className="font-semibold text-gray-600">{event.title}</h1>
              <span className="text-gray-300 text-xs">
                {new Date(event.startTime).toLocaleTimeString("en-UK", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
            </div>
            <p className="mt-2 text-gray-400 text-sm">{event.description}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default EventList;