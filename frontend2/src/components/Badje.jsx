import React, { useEffect, useState } from "react";

export default function Badges({ studentId }) {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    fetch(`/student-badges/${studentId}`)
      .then((response) => response.json())
      .then((data) => setBadges(data.badges))
      .catch((error) => console.error("Error fetching badges:", error));
  }, [studentId]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Badges</h2>
      <div className="grid grid-cols-3 gap-4">
        {badges.map((badge, index) => (
          <div key={index} className="bg-indigo-100 p-4 rounded-lg text-center">
            <p className="font-bold">{badge.badge_name}</p>
            <p className="text-sm text-gray-600">{badge.awarded_date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}