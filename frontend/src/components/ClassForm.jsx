// import React, { useState } from 'react';
// import axios from 'axios';

// const ClassForm = ({ type, data, setOpen, relatedData }) => {
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
    
//     try {
//       const formData = new FormData(e.target);
//       const payload = Object.fromEntries(formData);
      
//       // Convert string values to appropriate types
//       if (payload.capacity) payload.capacity = parseInt(payload.capacity);
//       if (payload.supervisorId) payload.supervisorId = parseInt(payload.supervisorId);
//       if (payload.gradeId) payload.gradeId = parseInt(payload.gradeId);
      
//       const endpoint = type === "create" ? '/api/classes' : `/api/classes/${data.id}`;
//       const method = type === "create" ? 'post' : 'put';
      
//       console.log('Submitting data:', payload);
//       console.log('Endpoint:', endpoint);
      
//       const response = await axios[method](endpoint, payload);
      
//       if (response.data) {
//         console.log('Success:', response.data);
//         setOpen(false);
//       }
//     } catch (err) {
//       console.error('Form submission error:', err);
//       setError(err.response?.data?.error || 'An error occurred while submitting the form');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-8">
//       <h1 className="text-xl font-semibold">{type === "create" ? "Create a new class" : "Update the class"}</h1>
//       {error && <div className="text-red-500 text-sm">{error}</div>}
//       <div className="flex justify-between flex-wrap gap-4">
//         <input 
//           type="text" 
//           name="name" 
//           placeholder="Class name" 
//           defaultValue={data?.name}
//           className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full md:w-1/4"
//           required
//         />
//         <input 
//           type="number" 
//           name="capacity" 
//           placeholder="Capacity" 
//           defaultValue={data?.capacity}
//           className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full md:w-1/4"
//           required
//         />
//         <select 
//           name="supervisorId" 
//           defaultValue={data?.supervisorId}
//           className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full md:w-1/4"
//           required
//         >
//           <option value="">Select Supervisor</option>
//           {relatedData?.teachers?.map((teacher) => (
//             <option key={teacher.id} value={teacher.id}>
//               {teacher.name} {teacher.surname}
//             </option>
//           ))}
//         </select>
//         <select 
//           name="gradeId" 
//           defaultValue={data?.gradeId}
//           className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full md:w-1/4"
//           required
//         >
//           <option value="">Select Grade</option>
//           {relatedData?.grades?.map((grade) => (
//             <option key={grade.id} value={grade.id}>{grade.level}</option>
//           ))}
//         </select>
//       </div>
//       <button 
//         type="submit" 
//         className="bg-blue-400 text-white p-2 rounded-md"
//         disabled={loading}
//       >
//         {loading ? 'Processing...' : type === "create" ? "Create" : "Update"}
//       </button>
//     </form>
//   );
// };

// export default ClassForm;
import React, { useState } from "react";
import axios from "axios";
import InputField from "./InputField";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ClassForm = ({ type, data, setOpen, relatedData }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);

    if (payload.supervisorId) payload.supervisorId = parseInt(payload.supervisorId);
    if (payload.gradeId) payload.gradeId = parseInt(payload.gradeId);
    if (payload.capacity) payload.capacity = parseInt(payload.capacity);

    try {
      const endpoint = type === "create" ? "http://127.0.0.1:5000/api/classes" : `http://127.0.0.1:5000/api/classes/${data.id}`;
      const method = type === "create" ? "post" : "put";

      const response = await axios[method](endpoint, payload);

      if (response.data) {
        toast.success(`Class ${type === "create" ? "created" : "updated"} successfully!`);
        setOpen(false);
        navigate(0); // Refresh the page
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred while submitting the form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new class" : "Update the class"}
      </h1>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Class name"
          name="name"
          defaultValue={data?.name}
          required
        />
        <InputField
          label="Capacity"
          name="capacity"
          defaultValue={data?.capacity}
          type="number"
          required
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Supervisor</label>
          <select
            name="supervisorId"
            defaultValue={data?.supervisorId}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            required
          >
            <option value="">Select Supervisor</option>
            {relatedData?.teachers?.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} {teacher.surname}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Grade</label>
          <select
            name="gradeId"
            defaultValue={data?.gradeId}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            required
          >
            <option value="">Select Grade</option>
            {relatedData?.grades?.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.level}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        className="bg-blue-400 text-white p-2 rounded-md"
        disabled={loading}
      >
        {loading ? "Processing..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ClassForm;