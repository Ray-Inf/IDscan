import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/announcements')
      .then(response => {
        // Handle response data properly
        const announcementsArray = Array.isArray(response.data) 
          ? response.data 
          : (response.data.data || []);
        
        setAnnouncements(announcementsArray);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching announcements:", error);
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading announcements...</div>;
  if (error) return <div>Error loading announcements: {error.message}</div>;
  if (!announcements.length) return <div>No announcements available.</div>;

  return (
    <div>
      <h1>Announcements</h1>
      {announcements.map((announcement) => (
        <div key={announcement.id}>
          <h2>{announcement.title}</h2>
          <p>{announcement.description}</p>
          <p>{new Date(announcement.date).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};

export default Announcements;