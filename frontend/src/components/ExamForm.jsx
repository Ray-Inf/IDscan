
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const ExamForm = ({ type, data, setOpen, relatedData }) => {
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [formData, setFormData] = useState({
//         title: data?.title || '',
//         startTime: data?.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : '',
//         endTime: data?.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : '',
//         lessonId: data?.lessonId || ''
//     });

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');
        
//         try {
//             // Prepare payload
//             const payload = {
//                 ...formData,
//                 lessonId: formData.lessonId ? Number(formData.lessonId) : null,
//                 startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
//                 endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null
//             };
            
//             const endpoint = type === "create" ? '/api/exams' : `/api/exams/${data.id}`;
//             const method = type === "create" ? 'post' : 'put';
            
//             console.log('Submitting data:', payload);
//             console.log('Endpoint:', endpoint);
            
//             const response = await axios[method](endpoint, payload);
            
//             if (response.data) {
//                 console.log('Success:', response.data);
//                 setOpen(false);
//                 // Refresh the data
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
//             <h1 className="text-xl font-semibold">{type === "create" ? "Create a new exam" : "Update the exam"}</h1>
//             {error && <div className="text-red-500 text-sm">{error}</div>}
            
//             <div className="flex justify-between flex-wrap gap-4">
//                 <div className="flex flex-col gap-1 w-full md:w-1/3">
//                     <label className="text-xs text-gray-500">Exam Title</label>
//                     <input 
//                         type="text" 
//                         name="title" 
//                         placeholder="Exam title" 
//                         value={formData.title}
//                         onChange={handleChange}
//                         className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
//                         required
//                     />
//                 </div>
//                 <div className="flex flex-col gap-1 w-full md:w-1/3">
//                     <label className="text-xs text-gray-500">Start Time</label>
//                     <input 
//                         type="datetime-local" 
//                         name="startTime" 
//                         value={formData.startTime}
//                         onChange={handleChange}
//                         className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
//                         required
//                     />
//                 </div>
//                 <div className="flex flex-col gap-1 w-full md:w-1/3">
//                     <label className="text-xs text-gray-500">End Time</label>
//                     <input 
//                         type="datetime-local" 
//                         name="endTime" 
//                         value={formData.endTime}
//                         onChange={handleChange}
//                         className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
//                         required
//                     />
//                 </div>
//                 <div className="flex flex-col gap-1 w-full md:w-1/3">
//                     <label className="text-xs text-gray-500">Lesson</label>
//                     <select 
//                         name="lessonId" 
//                         value={formData.lessonId}
//                         onChange={handleChange}
//                         className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
//                         required
//                     >
//                         <option value="">Select Lesson</option>
//                         {relatedData?.lessons?.map(lesson => (
//                             <option key={lesson.id} value={lesson.id}>{lesson.name}</option>
//                         ))}
//                     </select>
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

// export default ExamForm;
import React, { useState } from "react";
import axios from "axios";
import InputField from "./InputField";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ExamForm = ({ type, data, setOpen, relatedData }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);

    // Convert lessonId to integer
    if (payload.lessonId) payload.lessonId = parseInt(payload.lessonId);

    try {
      const endpoint = type === "create" ? "http://127.0.0.1:5000/api/exams" : `http;//127.0.0.1:5000/api/exams/${data.id}`;
      const method = type === "create" ? "post" : "put";

      const response = await axios[method](endpoint, payload);

      if (response.data) {
        toast.success(`Exam ${type === "create" ? "created" : "updated"} successfully!`);
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
        {type === "create" ? "Create a new exam" : "Update the exam"}
      </h1>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Exam title"
          name="title"
          defaultValue={data?.title}
          required
        />
        <InputField
          label="Start Time"
          name="startTime"
          defaultValue={data?.startTime}
          type="datetime-local"
          required
        />
        <InputField
          label="End Time"
          name="endTime"
          defaultValue={data?.endTime}
          type="datetime-local"
          required
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            name="lessonId"
            defaultValue={data?.lessonId}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            required
          >
            <option value="">Select Lesson</option>
            {relatedData?.lessons?.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.name}
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

export default ExamForm;