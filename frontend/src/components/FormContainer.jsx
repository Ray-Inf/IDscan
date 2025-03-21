
// import React, { useState } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import TeacherForm from './TeacherForm';
// import StudentForm from './StudentForm';
// import ClassForm from './ClassForm';
// import ExamForm from './ExamForm';
// import SubjectForm from './SubjectForm';

// const deleteActionMap = {
//   subject: (id) => axios.delete(`http://127.0.0.1:5000/api/subjects/${id}`),
//   class: (id) => axios.delete(`http://127.0.0.1:5000/api/classes/${id}`),
//   teacher: (id) => axios.delete(`http://127.0.0.1:5000/api/teachers/${id}`),
//   student: (id) => axios.delete(`http://127.0.0.1:5000/api/students/${id}`),
//   exam: (id) => axios.delete(`http://127.0.0.1:5000/api/exams/${id}`),
// };

// const forms = {
//   subject: (setOpen, type, data, relatedData) => (
//     <SubjectForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
//   ),
//   class: (setOpen, type, data, relatedData) => (
//     <ClassForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
//   ),
//   teacher: (setOpen, type, data, relatedData) => (
//     <TeacherForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
//   ),
//   student: (setOpen, type, data, relatedData) => (
//     <StudentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
//   ),
//   exam: (setOpen, type, data, relatedData) => (
//     <ExamForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
//   ),
// };

// const FormContainer = ({ table, type, data, id, relatedData }) => {
//   const [open, setOpen] = useState(false);

//   const handleDelete = async () => {
//     try {
//       await deleteActionMap[table](id);
//       toast.success(`${table} has been deleted!`);
//       setOpen(false);
//     } catch (error) {
//       toast.error('Error deleting data');
//       console.error(error);
//     }
//   };

//   return (
//     <>
//       <button
//         className={`${type === 'create' ? 'bg-yellow-400' : type === 'update' ? 'bg-blue-400' : 'bg-purple-400'} p-2 rounded-full`}
//         onClick={() => setOpen(true)}
//       >
//         {type}
//       </button>
//       {open && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
//           <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
//             {type === 'delete' && id ? (
//               <form onSubmit={(e) => { e.preventDefault(); handleDelete(); }} className="p-4 flex flex-col gap-4">
//                 <input type="hidden" name="id" value={id} />
//                 <span className="text-center font-medium">All data will be lost. Are you sure you want to delete this {table}?</span>
//                 <button type="submit" className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
//                   Delete
//                 </button>
//               </form>
//             ) : type === 'create' || type === 'update' ? (
//               forms[table](setOpen, type, data, relatedData)
//             ) : (
//               'Form not found!'
//             )}
//             <button className="absolute top-4 right-4 cursor-pointer" onClick={() => setOpen(false)}>
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default FormContainer;
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import TeacherForm from './TeacherForm';
import StudentForm from './StudentForm';
import ClassForm from './ClassForm';
import ExamForm from './ExamForm';
import SubjectForm from './SubjectForm';

const deleteActionMap = {
  subject: (id) => axios.delete(`http://127.0.0.1:5000/api/subjects/${id}`),
  class: (id) => axios.delete(`http://127.0.0.1:5000/api/classes/${id}`),
  teacher: (id) => axios.delete(`http://127.0.0.1:5000/api/teachers/${id}`),
  student: (id) => axios.delete(`http://127.0.0.1:5000/api/students/${id}`),
  exam: (id) => axios.delete(`http://127.0.0.1:5000/api/exams/${id}`),
};

const forms = {
  subject: (setOpen, type, data, relatedData) => (
    <SubjectForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),
  class: (setOpen, type, data, relatedData) => (
    <ClassForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),
  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),
  student: (setOpen, type, data, relatedData) => (
    <StudentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),
  exam: (setOpen, type, data, relatedData) => (
    <ExamForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),
};

const FormContainer = ({ table, type, data, id, relatedData }) => {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteActionMap[table](id);
      toast.success(`${table} has been deleted!`);
      setOpen(false);
      // Optionally refresh the page or update the UI state
      window.location.reload();
    } catch (error) {
      toast.error('Error deleting data');
      console.error(error);
    }
  };

  // Determine button label based on type
  const buttonLabel = {
    create: "Create New",
    update: "Edit",
    delete: "Delete"
  }[type] || type;

  return (
    <>
      <button
        className={`${
          type === 'create' ? 'bg-yellow-400' : 
          type === 'update' ? 'bg-blue-400' : 
          'bg-purple-400'
        } p-2 rounded-md text-white`}
        onClick={() => setOpen(true)}
      >
        {buttonLabel}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] max-h-[90vh] overflow-y-auto">
            {type === 'delete' && id ? (
              <form onSubmit={(e) => { e.preventDefault(); handleDelete(); }} className="p-4 flex flex-col gap-4">
                <input type="hidden" name="id" value={id} />
                <h2 className="text-xl font-bold text-center">Confirm Deletion</h2>
                <p className="text-center">All data will be lost. Are you sure you want to delete this {table}?</p>
                <div className="flex justify-center gap-4 mt-4">
                  <button 
                    type="button" 
                    className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-red-700 text-white py-2 px-4 rounded-md"
                  >
                    Delete
                  </button>
                </div>
              </form>
            ) : type === 'create' || type === 'update' ? (
              forms[table](setOpen, type, data, relatedData)
            ) : (
              'Form not found!'
            )}
            <button 
              className="absolute top-4 right-4 cursor-pointer bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FormContainer;