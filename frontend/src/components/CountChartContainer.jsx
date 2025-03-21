
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import CountChart from './CountChart';

// const CountChartContainer = ({ role, id }) => {
//   const [boys, setBoys] = useState(0);
//   const [girls, setGirls] = useState(0);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const params = new URLSearchParams();
//         params.set("role", role); // Ensure the backend knows the user's role

//         // For non-admin users, include type and id
//         if (role !== "admin") {
//           params.set("type", "teacherId"); // Assuming the teacher is accessing students
//           params.set("id", id);
//         }

//         const response = await axios.get(`http://127.0.0.1:5000/api/students/count?${params.toString()}`);
//         setBoys(response.data.boys || 0);
//         setGirls(response.data.girls || 0);
//       } catch (error) {
//         console.error("Error fetching student count data:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [role, id]);

//   return (
//     <div className="bg-white rounded-xl w-full h-full p-4">
//       <div className="flex justify-between items-center">
//         <h1 className="text-lg font-semibold">Students</h1>
//         <img src="/moreDark.png" alt="" width={20} height={20} />
//       </div>
//       {isLoading ? (
//         <p className="text-gray-500 text-center">Loading student count data...</p>
//       ) : (
//         <>
//           <CountChart boys={boys} girls={girls} />
//           <div className="flex justify-center gap-16">
//             <div className="flex flex-col gap-1">
//               <div className="w-5 h-5 bg-lamaSky rounded-full" />
//               <h1 className="font-bold">Boys</h1>
//             </div>
//             <div className="flex flex-col gap-1">
//               <div className="w-5 h-5 bg-lamaYellow rounded-full" />
//               <h1 className="font-bold">Girls</h1>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default CountChartContainer;
import React, { useEffect, useState } from "react";
import axios from "axios";
import CountChart from "./CountChart";

const CountChartContainer = ({ role, id }) => {
  const [boys, setBoys] = useState(0);
  const [girls, setGirls] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        params.set("role", role);

        if (role !== "admin") {
          params.set("type", "teacherId");
          params.set("id", id);
        }

        const response = await axios.get(`http://127.0.0.1:5000/api/students/count?${params.toString()}`);
        setBoys(response.data.boys || 0);
        setGirls(response.data.girls || 0);
      } catch (error) {
        console.error("Error fetching student count data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [role, id]);

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Students</h1>
        <img src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      {isLoading ? (
        <p className="text-gray-500 text-center">Loading student count data...</p>
      ) : (
        <>
          <CountChart boys={boys} girls={girls} />
          <div className="flex justify-center gap-16">
            <div className="flex flex-col gap-1">
              <div className="w-5 h-5 bg-lamaSky rounded-full" />
              <h1 className="font-bold">Boys</h1>
            </div>
            <div className="flex flex-col gap-1">
              <div className="w-5 h-5 bg-lamaYellow rounded-full" />
              <h1 className="font-bold">Girls</h1>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CountChartContainer;
