import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';  // ✅ Ensuring correct search param usage
import Table from '../../../Table';

import TableSearch from '../../../TableSearch';
import Pagination from '../../../Pagination';
import FormContainer from '../../../FormContainer';

const ResultListPage = () => {
  const [searchParams] = useSearchParams();  
  const page = Number(searchParams.get("page")) || 1;  // ✅ Ensure page is always a number
  const search = searchParams.get("search") || "";  // ✅ Ensure search is always a string

  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/api/results?page=${page}&search=${search}`)
      .then(response => {
        setData(response.data.data);
        setCount(response.data.count);
      })
      .catch(error => console.error('Error fetching results:', error));
  }, [page, search]);  // ✅ Only re-fetch when these values change

  const columns = [
    { header: "Student", accessor: "student.name" },
    { header: "Score", accessor: "score", className: "hidden md:table-cell" },
    { header: "Exam/Assignment", accessor: "exam.title", className: "hidden md:table-cell" },
    { header: "Date", accessor: "exam.startTime", className: "hidden md:table-cell" },
    { header: "Actions", accessor: "action" },
  ];

  const renderRow = (item) => (
    <tr key={item.id}>
      <td>{item.student?.name || '-'}</td>
      <td>{item.score}</td>
      <td>{item.exam?.title || item.assignment?.title || '-'}</td>
      <td>{item.exam?.startTime ? new Date(item.exam.startTime).toLocaleDateString() : '-'}</td>
      <td>
        <FormContainer table="result" type="update" data={item} />
        <FormContainer table="result" type="delete" id={item.id} />
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FormContainer table="result" type="create" />
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={page} count={count} />
    </div>
  );
};

export default ResultListPage;
