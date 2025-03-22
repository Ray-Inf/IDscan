// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useSearchParams } from 'react-router-dom';
// import Table from '../../../Table';
// import TableSearch from '../../../TableSearch';
// import Pagination from '../../../Pagination';
// import FormContainer from '../../../FormContainer';

// const AssignmentListPage = ({ role, id }) => {
//     const [searchParams] = useSearchParams();
//     const [data, setData] = useState([]);
//     const [count, setCount] = useState(0);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
    
//     const page = Number(searchParams.get('page')) || 1;
//     const search = searchParams.get('search') || '';

//     useEffect(() => {
//         const fetchAssignments = async () => {
//             setLoading(true);
//             setError(null);
            
//             try {
//                 const params = new URLSearchParams();
//                 params.set("page", page.toString());
//                 if (search) params.set("search", search);
//                 params.set("role", role); // Ensure the backend knows the user's role

//                 // For non-admin users, include type and id
//                 if (role !== "admin") {
//                     params.set("type", "teacherId"); // Assuming the teacher is accessing assignments
//                     params.set("id", id);
//                 }

//                 const response = await axios.get(
//                     `http://127.0.0.1:5000/api/assignments?${params.toString()}`
//                 );
                
//                 if (response.data && typeof response.data === 'object') {
//                     if (Array.isArray(response.data.data)) {
//                         setData(response.data.data);
//                         setCount(response.data.count || 0);
//                     } else {
//                         console.warn("API returned non-array data:", response.data);
//                         setData([]);
//                         setCount(0);
//                         setError("Invalid data format received from server (expected array)");
//                     }
//                 } else {
//                     console.warn("Unexpected API response format:", response.data);
//                     setData([]);
//                     setCount(0);
//                     setError("Invalid data format received from server");
//                 }
//             } catch (err) {
//                 console.error("Error fetching assignments:", err);
//                 setData([]);
//                 setCount(0);
                
//                 if (err.code === 'ERR_CANCELED') {
//                     setError("Request timed out. Server may be unavailable.");
//                 } else if (err.response) {
//                     setError(`Server error: ${err.response.data?.error || err.message}`);
//                 } else if (err.request) {
//                     setError("No response from server. Please check your connection.");
//                 } else {
//                     setError(`Failed to load assignments. ${err.message}`);
//                 }
//             }
            
//             setLoading(false);
//         };
        
//         fetchAssignments();
//     }, [page, search, role, id]);

//     const columns = [
//         { header: "Title", accessor: "title" },
//         { header: "Subject Name", accessor: "lesson.subject.name" },
//         { header: "Class", accessor: "lesson.class_.name" },
//         { header: "Teacher", accessor: "lesson.teacher.name", className: "hidden md:table-cell" },
//         { header: "Due Date", accessor: "dueDate", className: "hidden md:table-cell" },
//         { header: "Actions", accessor: "action" },
//     ];

//     const renderRow = (item) => {
//         if (!item) return null;
        
//         const title = item?.title || '-';
//         const subjectName = item?.lesson?.subject?.name || '-';
//         const className = item?.lesson?.class_?.name || '-';
//         const teacherName = item?.lesson?.teacher?.name || '-';
        
//         let dueDate = '-';
//         if (item?.dueDate) {
//             try {
//                 dueDate = new Date(item.dueDate).toLocaleDateString();
//             } catch (e) {
//                 console.error("Date parsing error:", e);
//             }
//         }

//         return (
//             <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
//                 <td className="p-2">{title}</td>
//                 <td className="p-2">{subjectName}</td>
//                 <td className="p-2">{className}</td>
//                 <td className="p-2 hidden md:table-cell">{teacherName}</td>
//                 <td className="p-2 hidden md:table-cell">{dueDate}</td>
//                 <td className="p-2">
//                     <div className="flex gap-2">
//                         <FormContainer table="assignment" type="update" data={item} />
//                         <FormContainer table="assignment" type="delete" id={item.id} />
//                     </div>
//                 </td>
//             </tr>
//         );
//     };

//     if (loading) {
//         return (
//             <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
//                 <div className="flex justify-center items-center h-64">
//                     <p>Loading assignments...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
//                 <div className="flex flex-col items-center justify-center h-64">
//                     <p className="text-red-500 mb-4">{error}</p>
//                     <button 
//                         className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//                         onClick={() => window.location.reload()}
//                     >
//                         Retry
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
//             <div className="flex items-center justify-between mb-4">
//                 <h1 className="hidden md:block text-lg font-semibold">All Assignments</h1>
//                 <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
//                     <TableSearch />
//                     <div className="flex items-center gap-4 self-end">
//                         <FormContainer table="assignment" type="create" />
//                     </div>
//                 </div>
//             </div>
            
//             {data.length === 0 ? (
//                 <div className="text-center py-6">
//                     <p className="text-gray-500">No assignments found.</p>
//                     <p className="text-sm text-gray-400 mt-2">Try clearing your search filter or adding new assignments.</p>
//                 </div>
//             ) : (
//                 <Table columns={columns} renderRow={renderRow} data={data} />
//             )}
            
//             <Pagination page={page} count={count} />
//         </div>
//     );
// };

// export default AssignmentListPage;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import Table from '../../../Table';
import TableSearch from '../../../TableSearch';
import Pagination from '../../../Pagination';
import FormContainer from '../../../FormContainer';

const AssignmentListPage = () => {
    const [searchParams] = useSearchParams();
    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const page = Number(searchParams.get('page')) || 1;
    const search = searchParams.get('search') || '';
    
    // Get user role and ID from localStorage
    const userRole = localStorage.getItem('userRole') || 'admin';
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchAssignments = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const params = new URLSearchParams();
                params.set("page", page.toString());
                if (search) params.set("search", search);
                
                // Apply role-based filtering
                if (userRole === 'admin') {
                    // Admin can see all assignments
                } else if (userRole === 'teacher') {
                    // Teacher can only see assignments they created
                    params.set("teacherId", userId);
                } else if (userRole === 'student') {
                    // Student can only see assignments for their class
                    params.set("studentId", userId);
                } else if (userRole === 'parent') {
                    // Parent can only see assignments for their children
                    params.set("parentId", userId);
                }

                const response = await axios.get(
                    `http://127.0.0.1:5000/api/assignments?${params.toString()}`
                );
                
                if (response.data && typeof response.data === 'object') {
                    if (Array.isArray(response.data.data)) {
                        setData(response.data.data);
                        setCount(response.data.count || 0);
                    } else {
                        console.warn("API returned non-array data:", response.data);
                        setData([]);
                        setCount(0);
                        setError("Invalid data format received from server (expected array)");
                    }
                } else {
                    console.warn("Unexpected API response format:", response.data);
                    setData([]);
                    setCount(0);
                    setError("Invalid data format received from server");
                }
            } catch (err) {
                console.error("Error fetching assignments:", err);
                setData([]);
                setCount(0);
                
                if (err.code === 'ERR_CANCELED') {
                    setError("Request timed out. Server may be unavailable.");
                } else if (err.response) {
                    setError(`Server error: ${err.response.data?.error || err.message}`);
                } else if (err.request) {
                    setError("No response from server. Please check your connection.");
                } else {
                    setError(`Failed to load assignments. ${err.message}`);
                }
            }
            
            setLoading(false);
        };
        
        fetchAssignments();
    }, [page, search, userRole, userId]);

    const columns = [
        { header: "Title", accessor: "title" },
        { header: "Subject Name", accessor: "lesson.subject.name" },
        { header: "Class", accessor: "lesson.class_.name" },
        { header: "Teacher", accessor: "lesson.teacher.name", className: "hidden md:table-cell" },
        { header: "Due Date", accessor: "dueDate", className: "hidden md:table-cell" },
        { header: "Actions", accessor: "action" },
    ];

    const renderRow = (item) => {
        if (!item) return null;
        
        const title = item?.title || '-';
        const subjectName = item?.lesson?.subject?.name || '-';
        const className = item?.lesson?.class_?.name || '-';
        const teacherName = item?.lesson?.teacher?.name || '-';
        
        let dueDate = '-';
        if (item?.dueDate) {
            try {
                dueDate = new Date(item.dueDate).toLocaleDateString();
            } catch (e) {
                console.error("Date parsing error:", e);
            }
        }

        return (
            <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-2">{title}</td>
                <td className="p-2">{subjectName}</td>
                <td className="p-2">{className}</td>
                <td className="p-2 hidden md:table-cell">{teacherName}</td>
                <td className="p-2 hidden md:table-cell">{dueDate}</td>
                <td className="p-2">
                    <div className="flex gap-2">
                        {/* Only show edit/delete options for admin and the teacher who owns the assignment */}
                        {(userRole === 'admin' || (userRole === 'teacher' && item.lesson?.teacher?.id === userId)) && (
                            <>
                                <FormContainer table="assignment" type="update" data={item} />
                                <FormContainer table="assignment" type="delete" id={item.id} />
                            </>
                        )}
                        {/* For students and parents, show a view button */}
                        {(userRole === 'student' || userRole === 'parent') && (
                            <button 
                                className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                                onClick={() => window.location.href = `/assignments/${item.id}`}
                            >
                                View
                            </button>
                        )}
                    </div>
                </td>
            </tr>
        );
    };

    if (loading) {
        return (
            <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
                <div className="flex justify-center items-center h-64">
                    <p>Loading assignments...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
                <div className="flex flex-col items-center justify-center h-64">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            <div className="flex items-center justify-between mb-4">
                <h1 className="hidden md:block text-lg font-semibold">All Assignments</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        {/* Only show create button for admin and teachers */}
                        {(userRole === 'admin' || userRole === 'teacher') && (
                            <FormContainer table="assignment" type="create" />
                        )}
                    </div>
                </div>
            </div>
            
            {data.length === 0 ? (
                <div className="text-center py-6">
                    <p className="text-gray-500">No assignments found.</p>
                    <p className="text-sm text-gray-400 mt-2">Try clearing your search filter or adding new assignments.</p>
                </div>
            ) : (
                <Table columns={columns} renderRow={renderRow} data={data} />
            )}
            
            <Pagination page={page} count={count} />
        </div>
    );
};

export default AssignmentListPage;