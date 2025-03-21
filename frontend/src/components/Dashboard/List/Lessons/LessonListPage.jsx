
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from '../../../Table';
import TableSearch from '../../../TableSearch';
import Pagination from '../../../Pagination';
import FormContainer from '../../../FormContainer';
import { useSearchParams } from 'react-router-dom';

const LessonListPage = () => {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        params.set("page", page.toString());
        if (search) params.set("search", search);
    
        const response = await axios.get(`http://127.0.0.1:5000/api/lessons?${params.toString()}`);
        
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
      } catch (error) {
        console.error("Error fetching lessons:", error);
        setError("Failed to load lessons. Please try again.");
        setData([]);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLessons();
  }, [page, search]);

  const columns = [
    { header: "Subject", accessor: "subject.name" },
    { header: "Class", accessor: "class_.name" },
    { header: "Teacher", accessor: "teacher.name", className: "hidden md:table-cell" },
    { header: "Day", accessor: "day", className: "hidden md:table-cell" },
    { header: "Start Time", accessor: "startTime", className: "hidden md:table-cell" },
    { header: "End Time", accessor: "endTime", className: "hidden md:table-cell" },
    { header: "Actions", accessor: "action" },
  ];
  
  const renderRow = (item) => (
    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
      <td className="p-4">{item.subject?.name || '-'}</td>
      <td className="p-4">{item.class_?.name || '-'}</td>
      <td className="p-4 hidden md:table-cell">{item.teacher?.name || '-'}</td>
      <td className="p-4 hidden md:table-cell">{item.day || '-'}</td>
      <td className="p-4 hidden md:table-cell">{item.startTime || '-'}</td>
      <td className="p-4 hidden md:table-cell">{item.endTime || '-'}</td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <FormContainer table="lesson" type="update" data={item} />
          <FormContainer table="lesson" type="delete" id={item.id} />
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex justify-center items-center h-64">
          <p>Loading lessons...</p>
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
        <h1 className="hidden md:block text-lg font-semibold">All Lessons</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FormContainer table="lesson" type="create" />
          </div>
        </div>
      </div>
      
      {data.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">No lessons found.</p>
          <p className="text-sm text-gray-400 mt-2">Try clearing your search filter or adding new lessons.</p>
        </div>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={data} />
      )}
      
      <Pagination page={page} count={count} />
    </div>
  );
};

export default LessonListPage;