// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useSearchParams } from 'react-router-dom';
// import Table from '../../../Table';
// import TableSearch from '../../../TableSearch';
// import Pagination from '../../../Pagination';
// import FormContainer from '../../../FormContainer';

// const ClassListPage = ({ role, userId }) => {
//   const [searchParams] = useSearchParams();
//   const [data, setData] = useState([]);
//   const [count, setCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const page = Number(searchParams.get('page')) || 1;
//   const search = searchParams.get('search') || '';
  
//   // Use props if provided, otherwise fall back to localStorage
//   const userRole = role || localStorage.getItem('userRole') || 'admin';
//   const currentUserId = userId || localStorage.getItem('userId');

//   useEffect(() => {
//     const fetchClasses = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const params = new URLSearchParams();
//         params.set('page', page);
//         if (search) params.set('search', search);
        
//         // Apply role-based filtering
//         if (userRole === 'admin') {
//           // Admin can see all classes
//         } else if (userRole === 'teacher') {
//           // Teacher can only see classes they teach or supervise
//           params.set('teacherId', currentUserId);
//         } else if (userRole === 'student') {
//           // Student can only see their own class
//           params.set('studentId', currentUserId);
//         } else if (userRole === 'parent') {
//           // Parent can only see their children's classes
//           params.set('parentId', currentUserId);
//         }

//         const response = await axios.get(`http://127.0.0.1:5000/api/classes?${params.toString()}`);
//         setData(response.data.data);
//         setCount(response.data.count);
//       } catch (err) {
//         console.error('Error fetching classes:', err);
//         setError('Failed to load classes. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchClasses();
//   }, [page, search, userRole, currentUserId]);

//   const columns = [
//     { header: "Class Name", accessor: "name" },
//     { header: "Capacity", accessor: "capacity", className: "hidden md:table-cell" },
//     { header: "Grade", accessor: "grade", className: "hidden md:table-cell" },
//     { header: "Supervisor", accessor: "supervisor.name", className: "hidden md:table-cell" },
//     { header: "Actions", accessor: "action" },
//   ];

//   const renderRow = (item) => (
//     <tr key={item.id}>
//       <td>{item.name}</td>
//       <td className="hidden md:table-cell">{item.capacity}</td>
//       <td className="hidden md:table-cell">{item.grade?.level || "-"}</td>
//       <td className="hidden md:table-cell">{item.supervisor ? `${item.supervisor.name} ${item.supervisor.surname || ''}` : "No Supervisor"}</td>
//       <td>
//         <div className="flex gap-2">
//           {/* Only show edit/delete options for admin */}
//           {userRole === 'admin' && (
//             <>
//               <FormContainer table="class" type="update" data={item} />
//               <FormContainer table="class" type="delete" id={item.id} />
//             </>
//           )}
//           {/* For teachers, students, and parents, show a view button */}
//           {userRole !== 'admin' && (
//             <button 
//               className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
//               onClick={() => window.location.href = `/classes/${item.id}`}
//             >
//               View
//             </button>
//           )}
//         </div>
//       </td>
//     </tr>
//   );

//   if (loading) {
//     return <div className="flex justify-center items-center h-64">Loading classes...</div>;
//   }

//   if (error) {
//     return <div className="text-red-500 p-4">{error}</div>;
//   }

//   return (
//     <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
//       <div className="flex items-center justify-between mb-4">
//         <h1 className="hidden md:block text-lg font-semibold">All Classes</h1>
//         <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
//           <TableSearch />
//           <div className="flex items-center gap-4 self-end">
//             {/* Only show create button for admin */}
//             {userRole === 'admin' && (
//               <FormContainer table="class" type="create" />
//             )}
//           </div>
//         </div>
//       </div>
      
//       {data.length === 0 ? (
//         <p className="text-gray-500 text-center py-6">No classes found.</p>
//       ) : (
//         <Table columns={columns} renderRow={renderRow} data={data} />
//       )}
      
//       <Pagination page={page} count={count} />
//     </div>
//   );
// };

// export default ClassListPage;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import Table from '../../../Table';
import TableSearch from '../../../TableSearch';
import Pagination from '../../../Pagination';
import FormContainer from '../../../FormContainer';
import ClassForm from '../../../ClassForm'; // Import the ClassForm

const ClassListPage = ({ role, userId }) => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';

  const userRole = role || localStorage.getItem('userRole') || 'admin';
  const currentUserId = userId || localStorage.getItem('userId');

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('page', page);
        if (search) params.set('search', search);

        if (userRole === 'teacher') {
          params.set('teacherId', currentUserId);
        } else if (userRole === 'student') {
          params.set('studentId', currentUserId);
        } else if (userRole === 'parent') {
          params.set('parentId', currentUserId);
        }

        const response = await axios.get(`http://127.0.0.1:5000/api/classes?${params.toString()}`);
        setData(response.data.data);
        setCount(response.data.count);
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to load classes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [page, search, userRole, currentUserId]);

  const columns = [
    { header: "Class Name", accessor: "name" },
    { header: "Capacity", accessor: "capacity", className: "hidden md:table-cell" },
    { header: "Grade", accessor: "grade", className: "hidden md:table-cell" },
    { header: "Supervisor", accessor: "supervisor.name", className: "hidden md:table-cell" },
    { header: "Actions", accessor: "action" },
  ];

  const renderRow = (item) => (
    <tr key={item.id}>
      <td>{item.name}</td>
      <td className="hidden md:table-cell">{item.capacity}</td>
      <td className="hidden md:table-cell">{item.grade?.level || "-"}</td>
      <td className="hidden md:table-cell">{item.supervisor ? `${item.supervisor.name} ${item.supervisor.surname || ''}` : "No Supervisor"}</td>
      <td>
        <div className="flex gap-2">
          {userRole === 'admin' && (
            <>
              <FormContainer table="class" type="update" data={item} />
              <FormContainer table="class" type="delete" id={item.id} />
            </>
          )}
          {userRole !== 'admin' && (
            <button className="bg-blue-500 text-white px-2 py-1 rounded text-xs" onClick={() => window.location.href = `/classes/${item.id}`}>
              View
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading classes...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">All Classes</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            {userRole === 'admin' && (
              <FormContainer table="class" type="create" />
            )}
          </div>
        </div>
      </div>
      
      {data.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No classes found.</p>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={data} />
      )}
      
      <Pagination page={page} count={count} />
    </div>
  );
};

export default ClassListPage;