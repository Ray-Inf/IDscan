// export function adjustScheduleToCurrentWeek(schedule) {
//     const today = new Date();
//     const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
//     const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to get Monday
//     const startOfWeek = new Date(today.setDate(diff));
    
//     return schedule.map(event => {
//       const startDate = new Date(event.start);
//       const endDate = new Date(event.end);
      
//       // Get the day of week from the event (0-6, but we want 1-7 for Monday-Sunday)
//       const eventDayOfWeek = startDate.getDay();
//       const adjustedDayOfWeek = eventDayOfWeek === 0 ? 7 : eventDayOfWeek;
      
//       // Calculate the date for this week
//       const newStartDate = new Date(startOfWeek);
//       newStartDate.setDate(startOfWeek.getDate() + (adjustedDayOfWeek - 1));
//       newStartDate.setHours(startDate.getHours(), startDate.getMinutes(), startDate.getSeconds());
      
//       // Calculate the time difference between start and end
//       const timeDiff = endDate.getTime() - startDate.getTime();
      
//       // Apply the same time difference to the new start date
//       const newEndDate = new Date(newStartDate.getTime() + timeDiff);
      
//       return {
//         ...event,
//         start: newStartDate,
//         end: newEndDate
//       };
//     });
//   }
// utils.js
import moment from 'moment';

/**
 * Adjusts a schedule of events to the current week
 * @param {Array} schedule - Array of events with title, start, and end properties
 * @returns {Array} - Adjusted schedule with dates in the current week
 */
export function adjustScheduleToCurrentWeek(schedule) {
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    return [];
  }

  // Get the current week's starting date (Sunday)
  const startOfWeek = moment().startOf('week');
  
  // Map through each event and adjust its dates
  return schedule.map(event => {
    // Skip if no valid dates
    if (!event.start || !event.end) {
      return event;
    }
    
    try {
      // Parse the event dates
      const eventStart = moment(event.start);
      const eventEnd = moment(event.end);
      
      // Get day of week (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = eventStart.day();
      
      // Create new dates in current week with the same time
      const newStart = startOfWeek.clone()
        .add(dayOfWeek, 'days')
        .hours(eventStart.hours())
        .minutes(eventStart.minutes())
        .seconds(0);
        
      // Calculate duration of original event
      const durationMinutes = moment.duration(eventEnd.diff(eventStart)).asMinutes();
      
      // Add duration to start time to get new end time
      const newEnd = newStart.clone().add(durationMinutes, 'minutes');
      
      // Return new event with adjusted dates
      return {
        ...event,
        start: newStart.toDate(),
        end: newEnd.toDate()
      };
    } catch (error) {
      console.error("Error adjusting event to current week:", error);
      return event;
    }
  });
}

/**
 * Formats a date to HH:MM format
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} - Formatted time string
 */
export function formatTime(date) {
  if (!date) return '';
  return moment(date).format('HH:mm');
}

/**
 * Groups events by day
 * @param {Array} events - Array of events
 * @returns {Object} - Events grouped by day
 */
export function groupEventsByDay(events) {
  return events.reduce((acc, event) => {
    const day = moment(event.start).format('dddd');
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(event);
    return acc;
  }, {});
}