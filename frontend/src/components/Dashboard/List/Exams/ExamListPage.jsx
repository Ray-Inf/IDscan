// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useSearchParams } from 'react-router-dom';
// import Table from '../../../Table';
// import TableSearch from '../../../TableSearch';
// import Pagination from '../../../Pagination';
// import FormContainer from '../../../FormContainer';

// const ExamListPage = () => {
//   const [searchParams] = useSearchParams();
//   const [data, setData] = useState([]);
//   const [count, setCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   const page = Number(searchParams.get('page')) || 1;
//   const search = searchParams.get('search') || '';

//   useEffect(() => {
//     setLoading(true);
//     axios.get(`http://127.0.0.1:5000/api/exams?page=${page}&search=${search}`)
//       .then(response => {
//         if (response.data && response.data.data) {
//           setData(response.data.data);
//           setCount(response.data.count);
//         } else {
//           console.error("Unexpected API response format:", response.data);
//           setError("Invalid data format received from server");
//         }
//         setLoading(false);
//       })
//       .catch(error => {
//         console.error("Error fetching exams:", error);
//         setError("Failed to load exams. Please try again.");
//         setLoading(false);
//       });
//   }, [page, search]);

//   const columns = [
//     { header: "Subject", accessor: "lesson.subject.name" },
//     { header: "Class", accessor: "lesson.class_.name" }, // Note the underscore in class_
//     { header: "Teacher", accessor: "lesson.teacher.name", className: "hidden md:table-cell" },
//     { header: "Start Date", accessor: "startTime", className: "hidden md:table-cell" },
//     { header: "End Date", accessor: "endTime", className: "hidden md:table-cell" },
//     { header: "Actions", accessor: "action" },
//   ];

//   const renderRow = (item) => {
//     // Add null checks to prevent errors
//     const subjectName = item?.lesson?.subject?.name || '-';
//     const className = item?.lesson?.class_?.name || '-'; // Note the underscore in class_
//     const teacherName = item?.lesson?.teacher?.name || '-';
//     const startTime = item?.startTime ? new Date(item.startTime).toLocaleDateString() : '-';
//     const endTime = item?.endTime ? new Date(item.endTime).toLocaleDateString() : '-';

//     return (
//       <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
//         <td className="p-2">{subjectName}</td>
//         <td className="p-2">{className}</td>
//         <td className="p-2 hidden md:table-cell">{teacherName}</td>
//         <td className="p-2 hidden md:table-cell">{startTime}</td>
//         <td className="p-2 hidden md:table-cell">{endTime}</td>
//         <td className="p-2">
//           <div className="flex gap-2">
//             <FormContainer table="exam" type="update" data={item} />
//             <FormContainer table="exam" type="delete" id={item.id} />
//           </div>
//         </td>
//       </tr>
//     );
//   };

//   if (loading) {
//     return <div className="flex justify-center items-center h-64">Loading exams...</div>;
//   }

//   if (error) {
//     return <div className="text-red-500 p-4">{error}</div>;
//   }

//   return (
//     <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
//       <div className="flex items-center justify-between mb-4">
//         <h1 className="hidden md:block text-lg font-semibold">All Exams</h1>
//         <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
//           <TableSearch />
//           <div className="flex items-center gap-4 self-end">
//             <FormContainer table="exam" type="create" />
//           </div>
//         </div>
//       </div>
      
//       {data.length === 0 ? (
//         <p className="text-gray-500 text-center py-6">No exams found.</p>
//       ) : (
//         <Table columns={columns} renderRow={renderRow} data={data} />
//       )}
      
//       <Pagination page={page} count={count} />
//     </div>
//   );
// };

// export default ExamListPage;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import Table from '../../../Table';
import TableSearch from '../../../TableSearch';
import Pagination from '../../../Pagination';
import FormContainer from '../../../FormContainer';

const ExamListPage = ({ role, userId }) => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  
  // Use props if provided, otherwise fall back to localStorage
  const userRole = role || localStorage.getItem('userRole') || 'admin';
  const currentUserId = userId || localStorage.getItem('userId');

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('page', page);
        if (search) params.set('search', search);
        
        // Apply role-based filtering
        if (userRole === 'admin') {
          // Admin can see all exams
        } else if (userRole === 'teacher') {
          // Teacher can only see exams for their lessons
          params.set('teacherId', currentUserId);
        } else if (userRole === 'student') {
          // Student can only see exams for their classes
          params.set('studentId', currentUserId);
        } else if (userRole === 'parent') {
          // Parent can only see exams for their children's classes
          params.set('parentId', currentUserId);
        }

        const response = await axios.get(`http://127.0.0.1:5000/api/exams?${params.toString()}`);
        setData(response.data.data);
        setCount(response.data.count);
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError('Failed to load exams. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [page, search, userRole, currentUserId]);

  const columns = [
    { header: "Subject", accessor: "lesson.subject.name" },
    { header: "Class", accessor: "lesson.class_.name" },
    { header: "Teacher", accessor: "lesson.teacher.name", className: "hidden md:table-cell" },
    { header: "Start Date", accessor: "startTime", className: "hidden md:table-cell" },
    { header: "End Date", accessor: "endTime", className: "hidden md:table-cell" },
    { header: "Actions", accessor: "action" },
  ];

  const renderRow = (item) => {
    const subjectName = item?.lesson?.subject?.name || '-';
    const className = item?.lesson?.class_?.name || '-';
    const teacherName = item?.lesson?.teacher?.name || '-';
    const startTime = item?.startTime ? new Date(item.startTime).toLocaleDateString() : '-';
    const endTime = item?.endTime ? new Date(item.endTime).toLocaleDateString() : '-';

    return (
      <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
        <td className="p-2">{subjectName}</td>
        <td className="p-2">{className}</td>
        <td className="p-2 hidden md:table-cell">{teacherName}</td>
        <td className="p-2 hidden md:table-cell">{startTime}</td>
        <td className="p-2 hidden md:table-cell">{endTime}</td>
        <td className="p-2">
          <div className="flex gap-2">
            {/* Only show edit/delete options for admin and teacher who owns the exam */}
            {(userRole === 'admin' || (userRole === 'teacher' && item?.lesson?.teacherId === currentUserId)) && (
              <>
                <FormContainer table="exam" type="update" data={item} />
                <FormContainer table="exam" type="delete" id={item.id} />
              </>
            )}
            {/* For students and parents, maybe show a view button instead */}
            {(userRole === 'student' || userRole === 'parent') && (
              <button className="bg-blue-500 text-white px-2 py-1 rounded text-xs">View</button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading exams...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">All Exams</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            {/* Only show create button for admin and teachers */}
            {(userRole === 'admin' || userRole === 'teacher') && (
              <FormContainer table="exam" type="create" />
            )}
          </div>
        </div>
      </div>
      {data.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No exams found.</p>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={data} />
      )}
      <Pagination page={page} count={count} />
    </div>
  );
};

export default ExamListPage;