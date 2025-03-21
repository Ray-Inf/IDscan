
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import AttendanceChart from "./AttendanceChart";

// const AttendanceChartContainer = ({ role, id }) => {
//   const [data, setData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const params = new URLSearchParams();
//         params.set("role", role); // Ensure the backend knows the user's role

//         // For non-admin users, include type and id
//         if (role !== "admin") {
//           params.set("type", "teacherId"); // Assuming the teacher is accessing attendance
//           params.set("id", id);
//         }

//         const response = await axios.get(`http://127.0.0.1:5000/api/attendance?${params.toString()}`);
//         setData(response.data);
//       } catch (error) {
//         console.error("Error fetching attendance data:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [role, id]);

//   return (
//     <div className="bg-white rounded-lg p-4 h-full">
//       <div className="flex justify-between items-center">
//         <h1 className="text-lg font-semibold">Attendance</h1>
//         <img src="/moreDark.png" alt="" width={20} height={20} />
//       </div>
//       {isLoading ? (
//         <p className="text-gray-500 text-center">Loading attendance data...</p>
//       ) : data.length > 0 ? (
//         <AttendanceChart data={data} />
//       ) : (
//         <p className="text-gray-500 text-center">No attendance data available.</p>
//       )}
//     </div>
//   );
// };

// export default AttendanceChartContainer;
import React, { useEffect, useState } from "react";
import axios from "axios";
import AttendanceChart from "./AttendanceChart";

const AttendanceChartContainer = ({ role, id }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!role || !id) {
          console.warn("Role or ID is undefined. Skipping API call.");
          setIsLoading(false);
          return;
        }

        const params = new URLSearchParams();
        params.set("role", role);

        if (role !== "admin") {
          params.set("type", "teacherId");
          params.set("id", id);
        }

        const response = await axios.get(`http://127.0.0.1:5000/api/attendance?${params.toString()}`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [role, id]);

  return (
    <div className="bg-white rounded-lg p-4 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Attendance</h1>
        <img src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      {isLoading ? (
        <p className="text-gray-500 text-center">Loading attendance data...</p>
      ) : data.length > 0 ? (
        <AttendanceChart data={data} />
      ) : (
        <p className="text-gray-500 text-center">No attendance data available.</p>
      )}
    </div>
  );
};

export default AttendanceChartContainer;