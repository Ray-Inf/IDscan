// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import TableSearch from "../../../TableSearch";
// import FormContainer from "../../../FormContainer";
// import Table from "../../../Table";
// import Pagination from "../../../Pagination";

// const ParentListPage = () => {
//   const [parents, setParents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [page, setPage] = useState(1);
//   const [count, setCount] = useState(0);
//   const [search, setSearch] = useState('');
//   const [role, setRole] = useState('admin'); // Set to admin by default since we're not using authentication
//   const ITEM_PER_PAGE = 10;

//   useEffect(() => {
//     fetchParents();
//   }, [page, search]);

//   const fetchParents = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`http://127.0.0.1:5000/api/parents?page=${page}&search=${search}`);
      
//       if (!response.data || !response.data.data) {
//         throw new Error('Invalid data format: Expected data object');
//       }
      
//       setParents(response.data.data);
//       setCount(response.data.count);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (searchTerm) => {
//     setSearch(searchTerm);
//     setPage(1); // Reset to first page when searching
//   };

//   const columns = [
//     {
//       header: "Info",
//       accessor: "info",
//     },
//     {
//       header: "Student Names",
//       accessor: "students",
//       className: "hidden md:table-cell",
//     },
//     {
//       header: "Phone",
//       accessor: "phone",
//       className: "hidden lg:table-cell",
//     },
//     {
//       header: "Address",
//       accessor: "address",
//       className: "hidden lg:table-cell",
//     },
//     {
//       header: "Actions",
//       accessor: "action",
//     },
//   ];

//   const renderRow = (item) => (
//     <tr
//       key={item.id}
//       className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
//     >
//       <td className="flex items-center gap-4 p-4">
//         <div className="flex flex-col">
//           <h3 className="font-semibold">{item.name}</h3>
//           <p className="text-xs text-gray-500">{item?.email}</p>
//         </div>
//       </td>
//       <td className="hidden md:table-cell">
//         {item.students.map((student) => student.name).join(", ")}
//       </td>
//       <td className="hidden md:table-cell">{item.phone}</td>
//       <td className="hidden md:table-cell">{item.address}</td>
//       <td>
//         <div className="flex items-center gap-2">
//           <FormContainer table="parent" type="update" data={item} />
//           <FormContainer table="parent" type="delete" id={item.id} />
//         </div>
//       </td>
//     </tr>
//   );

//   if (loading && parents.length === 0) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
//       {/* TOP */}
//       <div className="flex items-center justify-between">
//         <h1 className="hidden md:block text-lg font-semibold">All Parents</h1>
//         <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
//           <TableSearch onSearch={handleSearch} />
//           <div className="flex items-center gap-4 self-end">
//             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
//               <img src="/filter.png" alt="" width={14} height={14} />
//             </button>
//             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
//               <img src="/sort.png" alt="" width={14} height={14} />
//             </button>
//             <FormContainer table="parent" type="create" onSubmit={fetchParents} />
//           </div>
//         </div>
//       </div>
//       {/* LIST */}
//       <Table columns={columns} renderRow={renderRow} data={parents} />
//       {/* PAGINATION */}
//       <Pagination 
//         page={page} 
//         count={count} 
//         itemsPerPage={ITEM_PER_PAGE} 
//         onPageChange={(newPage) => setPage(newPage)} 
//       />
//     </div>
//   );
// };

// export default ParentListPage;
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import TableSearch from "../../../TableSearch";
// import FormContainer from "../../../FormContainer";
// import Table from "../../../Table";
// import Pagination from "../../../Pagination";
// import { useNavigate } from 'react-router-dom';

// const ParentListPage = () => {
//   const [parents, setParents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [page, setPage] = useState(1);
//   const [count, setCount] = useState(0);
//   const [search, setSearch] = useState('');
//   const [role, setRole] = useState('admin'); // Set to admin by default since we're not using authentication
//   const ITEM_PER_PAGE = 10;
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchParents();
//   }, [page, search]);

//   const fetchParents = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`http://127.0.0.1:5000/api/parents?page=${page}&search=${search}`);
      
//       if (!response.data || !response.data.data) {
//         throw new Error('Invalid data format: Expected data object');
//       }
      
//       setParents(response.data.data);
//       setCount(response.data.count);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (searchTerm) => {
//     setSearch(searchTerm);
//     setPage(1); // Reset to first page when searching
//   };

//   const handleViewDetails = (parentId) => {
//     navigate(`/parent-details/${parentId}`);
//   };

//   const columns = [
//     {
//       header: "Info",
//       accessor: "info",
//     },
//     {
//       header: "Student Names",
//       accessor: "students",
//       className: "hidden md:table-cell",
//     },
//     {
//       header: "Phone",
//       accessor: "phone",
//       className: "hidden lg:table-cell",
//     },
//     {
//       header: "Address",
//       accessor: "address",
//       className: "hidden lg:table-cell",
//     },
//     {
//       header: "Actions",
//       accessor: "action",
//     },
//   ];

//   const renderRow = (item) => (
//     <tr
//       key={item.id}
//       className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight cursor-pointer"
//       onClick={() => handleViewDetails(item.id)}
//     >
//       <td className="flex items-center gap-4 p-4">
//         <div className="flex flex-col">
//           <h3 className="font-semibold">{item.name}</h3>
//           <p className="text-xs text-gray-500">{item?.email}</p>
//         </div>
//       </td>
//       <td className="hidden md:table-cell">
//         {item.students?.map((student) => student.name).join(", ") || ""}
//       </td>
//       <td className="hidden md:table-cell">{item.phone}</td>
//       <td className="hidden md:table-cell">{item.address}</td>
//       <td onClick={(e) => e.stopPropagation()}>
//         <div className="flex items-center gap-2">
//           <FormContainer table="parent" type="update" data={item} />
//           <FormContainer table="parent" type="delete" id={item.id} onDelete={fetchParents} />
//         </div>
//       </td>
//     </tr>
//   );

//   if (loading && parents.length === 0) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
//       {/* TOP */}
//       <div className="flex items-center justify-between">
//         <h1 className="hidden md:block text-lg font-semibold">All Parents</h1>
//         <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
//           <TableSearch onSearch={handleSearch} />
//           <div className="flex items-center gap-4 self-end">
//             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
//               <img src="/filter.png" alt="" width={14} height={14} />
//             </button>
//             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
//               <img src="/sort.png" alt="" width={14} height={14} />
//             </button>
//             <FormContainer table="parent" type="create" onSubmit={fetchParents} />
//           </div>
//         </div>
//       </div>
//       {/* LIST */}
//       <Table columns={columns} renderRow={renderRow} data={parents} />
//       {/* PAGINATION */}
//       <Pagination 
//         page={page} 
//         count={count} 
//         itemsPerPage={ITEM_PER_PAGE} 
//         onPageChange={(newPage) => setPage(newPage)} 
//       />
//     </div>
//   );
// };

// export default ParentListPage;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Table from "../../../Table";
import TableSearch from "../../../TableSearch";
import Pagination from "../../../Pagination";
import FormContainer from "../../../FormContainer";

const ParentListPage = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const ITEM_PER_PAGE = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchParents();
  }, [page, search]);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://127.0.0.1:5000/api/parents?page=${page}&search=${search}`
      );

      if (!response.data || !response.data.data) {
        throw new Error("Invalid data format: Expected data object");
      }

      setParents(response.data.data);
      setCount(response.data.count);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);
    setPage(1); // Reset to first page when searching
  };

  // ✅ Navigate to ParentPage when selecting a parent
  const handleViewDetails = (parentId) => {
    navigate(`/parents/${parentId}`); // ✅ Now links to ParentPage
  };

  const columns = [
    { header: "Info", accessor: "info" },
    { header: "Student Names", accessor: "students", className: "hidden md:table-cell" },
    { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
    { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
    { header: "Actions", accessor: "action" },
  ];

  const renderRow = (item) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight cursor-pointer"
      onClick={() => handleViewDetails(item.id)}
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">
        {item.students?.map((student) => student.name).join(", ") || ""}
      </td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <FormContainer table="parent" type="update" data={item} />
          <FormContainer table="parent" type="delete" id={item.id} onDelete={fetchParents} />
        </div>
      </td>
    </tr>
  );

  if (loading && parents.length === 0) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Parents</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch onSearch={handleSearch} />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <img src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <img src="/sort.png" alt="" width={14} height={14} />
            </button>
            <FormContainer table="parent" type="create" onSubmit={fetchParents} />
          </div>
        </div>
      </div>

      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={parents} />

      {/* PAGINATION */}
      <Pagination
        page={page}
        count={count}
        itemsPerPage={ITEM_PER_PAGE}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
};

export default ParentListPage;
