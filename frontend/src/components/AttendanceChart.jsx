// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// const AttendanceChart = () => {
//   const [data, setData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     axios.get('http://127.0.0.1:5000/api/attendance')
//       .then(response => {
//         setData(response.data);
//         setIsLoading(false);
//       })
//       .catch(error => {
//         console.error("Error fetching attendance data:", error);
//         setIsLoading(false);
//       });
//   }, []);

//   return (
//     <div className="bg-white p-4 rounded-md shadow-md">
//       <h2 className="text-lg font-semibold text-gray-700">Attendance Overview</h2>

//       {isLoading ? (
//         <p className="text-gray-500 text-center">Loading attendance data...</p>
//       ) : data.length > 0 ? (
//         <ResponsiveContainer width="100%" height={350}>
//           <BarChart data={data}>
//             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
//             <XAxis dataKey="name" axisLine={false} tick={{ fill: "#6b7280" }} tickLine={false} />
//             <YAxis axisLine={false} tick={{ fill: "#6b7280" }} tickLine={false} />
//             <Tooltip contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }} />
//             <Legend align="left" verticalAlign="top" wrapperStyle={{ paddingTop: "10px" }} />
//             <Bar dataKey="present" fill="#4CAF50" legendType="circle" radius={[10, 10, 0, 0]} />
//             <Bar dataKey="absent" fill="#E53E3E" legendType="circle" radius={[10, 10, 0, 0]} />
//           </BarChart>
//         </ResponsiveContainer>
//       ) : (
//         <p className="text-gray-500 text-center">No attendance data available.</p>
//       )}
//     </div>
//   );
// };

// export default AttendanceChart;
import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const AttendanceChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
        <XAxis dataKey="name" axisLine={false} tick={{ fill: "#6b7280" }} tickLine={false} />
        <YAxis axisLine={false} tick={{ fill: "#6b7280" }} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }} />
        <Legend align="left" verticalAlign="top" wrapperStyle={{ paddingTop: "10px" }} />
        <Bar dataKey="present" fill="#4CAF50" legendType="circle" radius={[10, 10, 0, 0]} />
        <Bar dataKey="absent" fill="#E53E3E" legendType="circle" radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AttendanceChart;
