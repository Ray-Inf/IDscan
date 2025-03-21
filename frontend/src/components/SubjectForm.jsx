
// import React, { useState } from 'react';
// import axios from 'axios';

// const SubjectForm = ({ type, data, setOpen, relatedData }) => {
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');
        
//         try {
//             const formData = new FormData(e.target);
//             const payload = Object.fromEntries(formData);
            
//             // Handle multiple teacher selections
//             const teachers = formData.getAll('teachers');
//             payload.teachers = teachers.map(Number);
            
//             const endpoint = type === "create" ? '/subjects' : `/subjects/${data.id}`;
//             const method = type === "create" ? 'post' : 'put';
            
//             console.log('Submitting data:', payload);
            
//             const response = await axios[method](endpoint, payload);
            
//             if (response.data) {
//                 console.log('Success:', response.data);
//                 setOpen(false);
//                 // Refresh the page or update the parent component
//                 window.location.reload();
//             }
//         } catch (err) {
//             console.error('Form submission error:', err);
//             setError(err.response?.data?.error || 'An error occurred while submitting the form');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit} className="flex flex-col gap-8">
//             <h1 className="text-xl font-semibold">{type === "create" ? "Create a new subject" : "Update the subject"}</h1>
//             {error && <div className="text-red-500 text-sm">{error}</div>}
            
//             <div className="flex justify-between flex-wrap gap-4">
//                 <input 
//                     type="text" 
//                     name="name" 
//                     placeholder="Subject name" 
//                     defaultValue={data?.name} 
//                     className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full md:w-1/3"
//                     required
//                 />
//                 <div className="w-full md:w-1/2">
//                     <label className="text-xs text-gray-500 block mb-1">Teachers</label>
//                     <select 
//                         name="teachers" 
//                         multiple 
//                         defaultValue={data?.teachers?.map(t => t.id)}
//                         className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
//                         style={{ height: "120px" }}
//                     >
//                         {relatedData?.teachers?.map(teacher => (
//                             <option key={teacher.id} value={teacher.id}>{teacher.name} {teacher.surname}</option>
//                         ))}
//                     </select>
//                     <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple teachers</p>
//                 </div>
//             </div>
//             <button 
//                 type="submit" 
//                 className="bg-blue-400 text-white p-2 rounded-md"
//                 disabled={loading}
//             >
//                 {loading ? 'Processing...' : type === "create" ? "Create" : "Update"}
//             </button>
//         </form>
//     );
// };

// export default SubjectForm;
import React, { useState } from "react";
import axios from "axios";
import InputField from "./InputField";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const SubjectForm = ({ type, data, setOpen, relatedData }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);

    // Convert teachers to array of integers
    if (payload.teachers) {
      payload.teachers = Array.from(formData.getAll("teachers")).map(Number);
    }

    try {
      const endpoint = type === "create" ? "http://127.0.0.1:5000/api/subjects" : `http://127.0.0.1:5000/api/subjects/${data.id}`;
      const method = type === "create" ? "post" : "put";

      const response = await axios[method](endpoint, payload);

      if (response.data) {
        toast.success(`Subject ${type === "create" ? "created" : "updated"} successfully!`);
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
        {type === "create" ? "Create a new subject" : "Update the subject"}
      </h1>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Subject Name"
          name="name"
          defaultValue={data?.name}
          required
        />
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label className="text-xs text-gray-500">Teachers</label>
          <select
            name="teachers"
            multiple
            defaultValue={data?.teachers?.map((t) => t.id)}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            style={{ height: "120px" }}
          >
            {relatedData?.teachers?.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} {teacher.surname}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple teachers</p>
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

export default SubjectForm;