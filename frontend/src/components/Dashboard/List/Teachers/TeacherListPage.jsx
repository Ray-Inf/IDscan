// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Link, useSearchParams } from 'react-router-dom';

// const TeacherListPage = () => {
//   const [teachers, setTeachers] = useState([]);
//   const [count, setCount] = useState(0);
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');

//   const page = parseInt(searchParams.get('page') || '1');
//   const ITEMS_PER_PAGE = 10;

//   useEffect(() => {
//     fetchTeachers();
//   }, [page, searchParams]);

//   const fetchTeachers = async () => {
//     setLoading(true);
//     try {
//       let url = `http://127.0.0.1:5000/api/teachers?page=${page}`;
//       const classId = searchParams.get('classId');
//       const search = searchParams.get('search');

//       if (classId) url += `&classId=${classId}`;
//       if (search) url += `&search=${search}`;

//       const response = await axios.get(url);
//       setTeachers(response.data.data);
//       setCount(response.data.count);
//     } catch (err) {
//       setError(err.message || 'Failed to fetch teachers');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (searchTerm) {
//       searchParams.set('search', searchTerm);
//       searchParams.set('page', '1');
//     } else {
//       searchParams.delete('search');
//     }
//     setSearchParams(searchParams);
//   };

//   const handlePageChange = (newPage) => {
//     searchParams.set('page', newPage.toString());
//     setSearchParams(searchParams);
//   };

//   const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
//   const pageNumbers = [];
//   for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
//     pageNumbers.push(i);
//   }

//   if (loading) {
//     return <div className="flex justify-center items-center h-64">Loading...</div>;
//   }

//   if (error) {
//     return (
//       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
//         <strong className="font-bold">Error:</strong>
//         <span className="block sm:inline"> {error}</span>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white p-4 rounded-lg shadow-md flex-1 m-4 mt-0">
//       {/* Top Section */}
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-lg font-semibold">All Teachers</h1>
//         <form onSubmit={handleSearch} className="flex items-center">
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             placeholder="Search teachers..."
//             className="border rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <button
//             type="submit"
//             className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
//           >
//             Search
//           </button>
//         </form>
//       </div>

//       {/* Teacher List Table */}
//       <table className="min-w-full bg-white">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="py-2 px-4 border-b text-left">Info</th>
//             <th className="py-2 px-4 border-b text-left hidden md:table-cell">Subjects</th>
//             <th className="py-2 px-4 border-b text-left hidden md:table-cell">Classes</th>
//             <th className="py-2 px-4 border-b text-left">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {teachers.map((teacher) => (
//             <tr key={teacher.id} className="border-b border-gray-200 hover:bg-purple-50">
//               <td className="py-4 px-4">
//                 <div className="flex items-center gap-4">
//                   <img
//                     src={teacher.img || "/noAvatar.png"}
//                     alt=""
//                     className="w-10 h-10 rounded-full object-cover"
//                   />
//                   <div className="flex flex-col">
//                     <h3 className="font-semibold">{teacher.name} {teacher.surname || ''}</h3>
//                     <p className="text-xs text-gray-500">{teacher.email || 'No email'}</p>
//                   </div>
//                 </div>
//               </td>
//               <td className="py-2 px-4 hidden md:table-cell">
//                 {teacher.subjects?.map(subject => subject.name).join(', ') || '-'}
//               </td>
//               <td className="py-2 px-4 hidden md:table-cell">
//                 {teacher.classes?.map(cls => cls.name).join(', ') || '-'}
//               </td>
//               <td className="py-2 px-4">
//                 <Link to={`/teachers/${teacher.id}`}>
//                   <button className="bg-sky-200 text-black px-3 py-1 rounded hover:bg-sky-300">
//                     View
//                   </button>
//                 </Link>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Pagination */}
//       <div className="flex items-center justify-between mt-6">
//         <span className="text-sm text-gray-500">
//           Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, count)} of {count} teachers
//         </span>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => handlePageChange(page - 1)}
//             disabled={page === 1}
//             className={`px-3 py-1 rounded ${page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
//           >
//             Previous
//           </button>
//           {pageNumbers.map(num => (
//             <button
//               key={num}
//               onClick={() => handlePageChange(num)}
//               className={`px-3 py-1 rounded ${page === num ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
//             >
//               {num}
//             </button>
//           ))}
//           <button
//             onClick={() => handlePageChange(page + 1)}
//             disabled={page === totalPages}
//             className={`px-3 py-1 rounded ${page === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TeacherListPage;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from '../../../Table';
import Pagination from '../../../Pagination';
import TableSearch from '../../../TableSearch';
import FormContainer from '../../../FormContainer';
import { useSearchParams } from 'react-router-dom';

const TeacherListPage = ({ role, userId }) => {
  const [teachers, setTeachers] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [refresh, setRefresh] = useState(false);

  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  
  const userRole = role || localStorage.getItem('userRole') || 'admin';
  const currentUserId = userId || localStorage.getItem('userId');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        params.set("page", page.toString());
        if (search) params.set("search", search);
        
        const response = await axios.get(`http://127.0.0.1:5000/api/teachers?${params.toString()}`);
        setTeachers(response.data.data);
        setCount(response.data.count);
      } catch (error) {
        console.error('Error fetching teachers:', error);
        setError('Failed to load teachers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [page, search, refresh, userRole, currentUserId]);

  const columns = [
    { 
      header: 'Info', 
      accessor: 'info',
      render: (teacher) => (
        <div className="flex items-center gap-4 p-2">
          <img 
            src={teacher.img || "/noAvatar.png"} 
            alt="" 
            className="w-10 h-10 rounded-full object-cover" 
          />
          <div className="flex flex-col">
            <h3 className="font-semibold">{teacher.name} {teacher.surname}</h3>
            <p className="text-xs text-gray-500">{teacher.email || '-'}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Subjects', 
      accessor: 'subjects',
      render: (teacher) => teacher.subjects?.map(subject => subject.name).join(', ') || '-'
    },
    { 
      header: 'Classes', 
      accessor: 'classes',
      render: (teacher) => teacher.classes?.map(cls => cls.name).join(', ') || '-'
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (teacher) => (
        <div className="flex items-center gap-2">
          <button 
            className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky"
            onClick={() => window.location.href = `/teachers/${teacher.id}`}
          >
            <img src="/view.png" alt="View" width="16" height="16" />
          </button>
          
          {(userRole === 'admin') && (
            <>
              <FormContainer 
                table="teacher" 
                type="update" 
                id={teacher.id} 
                setRefresh={setRefresh}
              />
              <FormContainer 
                table="teacher" 
                type="delete" 
                id={teacher.id}
                setRefresh={setRefresh}
              />
            </>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading teachers...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold hidden md:block">All Teachers</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4">
            {userRole === 'admin' && (
              <FormContainer 
                table="teacher" 
                type="create" 
                setRefresh={setRefresh}
              />
            )}
          </div>
        </div>
      </div>
      
      {teachers.length === 0 ? (
        <div className="text-center py-8">No teachers found.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table 
              columns={columns} 
              data={teachers} 
            />
          </div>
          
          <Pagination 
            page={page} 
            count={count} 
            itemsPerPage={10}
          />
        </>
      )}
    </div>
  );
};

export default TeacherListPage;