import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from '../../../Table';
import Pagination from '../../../Pagination';
import TableSearch from '../../../TableSearch';
import FormContainer from '../../../FormContainer';
import { useSearchParams } from 'react-router-dom';

const StudentListPage = ({ role, userId }) => {
  const [students, setStudents] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [refresh, setRefresh] = useState(false);

  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  
  // Use props if provided, otherwise fall back to localStorage
  const userRole = role || localStorage.getItem('userRole') || 'admin';
  const currentUserId = userId || localStorage.getItem('userId');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        params.set("page", page.toString());
        if (search) params.set("search", search);
        
        // Apply role-based filtering
        if (userRole === 'admin') {
          // Admin can see all students
        } else if (userRole === 'teacher') {
          // Teacher can only see students in their classes
          params.set("teacherId", currentUserId);
        } else if (userRole === 'parent') {
          // Parent can only see their children
          params.set("parentId", currentUserId);
        } else if (userRole === 'student') {
          // Students can only see themselves or classmates
          params.set("studentId", currentUserId);
          params.set("includeClassmates", "true");
        }

        const response = await axios.get(`http://127.0.0.1:5000/api/students?${params.toString()}`);
        setStudents(response.data.data);
        setCount(response.data.count);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Failed to load students. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [page, search, refresh, userRole, currentUserId]);

  const columns = [
    { 
      header: 'Info', 
      accessor: 'info',
      render: (student) => (
        <div className="flex items-center gap-4 p-2">
          <img 
            src={student.img || "/noAvatar.png"} 
            alt="" 
            className="w-10 h-10 rounded-full object-cover" 
          />
          <div className="flex flex-col">
            <h3 className="font-semibold">{student.name} {student.surname}</h3>
            <p className="text-xs text-gray-500">{student.class_?.name || '-'}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Username', 
      accessor: 'username', 
      className: 'hidden md:table-cell' 
    },
    { 
      header: 'Grade', 
      accessor: 'grade.level', 
      className: 'hidden md:table-cell',
      render: (student) => student.grade?.level || '-'
    },
    { 
      header: 'Phone', 
      accessor: 'phone', 
      className: 'hidden lg:table-cell' 
    },
    { 
      header: 'Address', 
      accessor: 'address', 
      className: 'hidden lg:table-cell' 
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (student) => (
        <div className="flex items-center gap-2">
          {/* View button for all roles */}
          <button 
            className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky"
            onClick={() => window.location.href = `/students/${student.id}`}
          >
            <img src="/view.png" alt="View" width="16" height="16" />
          </button>
          
          {/* Edit/Delete buttons only for admin and parent (for their own children) */}
          {(userRole === 'admin' || (userRole === 'parent' && student.parentId === currentUserId)) && (
            <>
              <FormContainer 
                table="student" 
                type="update" 
                id={student.id} 
                setRefresh={setRefresh}
              />
              <FormContainer 
                table="student" 
                type="delete" 
                id={student.id}
                setRefresh={setRefresh}
              />
            </>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading students...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold hidden md:block">All Students</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4">
            {/* Only show create button for admin */}
            {userRole === 'admin' && (
              <FormContainer 
                table="student" 
                type="create" 
                setRefresh={setRefresh}
              />
            )}
          </div>
        </div>
      </div>
      
      {students.length === 0 ? (
        <div className="text-center py-8">No students found.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table 
              columns={columns} 
              data={students} 
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

export default StudentListPage;