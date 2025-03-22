
import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarStyle.css';

// Setup the localizer
const localizer = momentLocalizer(moment);

const BigCalendar = ({ data }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Custom event component with hover effect
  const EventComponent = ({ event }) => {
    const getEventColor = (subject) => {
      const lowerSubject = subject.toLowerCase();
      if (lowerSubject.includes('physics')) return 'bg-yellow-100 border-yellow-300';
      if (lowerSubject.includes('chemistry')) return 'bg-blue-100 border-blue-300';
      return 'bg-purple-100 border-purple-300';
    };

    const colorClass = getEventColor(event.title || '');

    return (
      <div
        className={`event-block ${colorClass} p-2 rounded-md border-l-4 cursor-pointer transition-all hover:shadow-md`}
        onMouseEnter={() => setSelectedEvent(event)}
        onMouseLeave={() => setSelectedEvent(null)}
      >
        <div className="font-semibold">{event.title}</div>
        <div className="text-xs text-gray-700">
          {moment(event.start).format('h:mm A')} - {moment(event.end).format('h:mm A')}
        </div>
      </div>
    );
  };

  // Custom header component to make the date more prominent
  const CustomHeader = ({ label }) => (
    <div className="text-center py-2 font-semibold text-xl">{label}</div>
  );

  // Custom time slot component
  const TimeSlotWrapper = ({ children }) => (
    <div className="time-slot-wrapper text-sm font-medium">{children}</div>
  );

  return (
    <div className="calendar-wrapper w-full h-full">
      <Calendar
        localizer={localizer}
        events={data}
        startAccessor="start"
        endAccessor="end"
        views={['month', 'week', 'day']}
        defaultView="week"
        step={30} // Smaller time slots for better precision
        timeslots={2} // More granular time slots
        components={{
          event: EventComponent,
          timeSlotWrapper: TimeSlotWrapper,
          header: CustomHeader,
        }}
        className="custom-big-calendar rounded-lg shadow-xl border border-gray-200"
        eventPropGetter={(event) => {
          return {
            className: 'calendar-event',
          };
        }}
        dayPropGetter={(date) => {
          const today = moment().startOf('day').toDate();
          const isToday = moment(date).isSame(today, 'day');
          return {
            className: isToday ? 'today-highlight' : '',
          };
        }}
        formats={{
          timeGutterFormat: 'h:mm A',
          eventTimeRangeFormat: ({ start, end }) => {
            return `${moment(start).format('h:mm A')} - ${moment(end).format('h:mm A')}`;
          },
        }}
        popup
        popupOffset={10}
      />
      {selectedEvent && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-md shadow-lg border z-50 w-64">
          <h3 className="font-bold text-lg">{selectedEvent.title}</h3>
          <p className="text-sm text-gray-600">
            {moment(selectedEvent.start).format('dddd, MMMM D, YYYY')}
          </p>
          <p className="text-sm">
            {moment(selectedEvent.start).format('h:mm A')} - {moment(selectedEvent.end).format('h:mm A')}
          </p>
        </div>
      )}
    </div>
  );
};

export default BigCalendar;