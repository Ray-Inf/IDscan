import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from '../../../Table';
import Pagination from '../../../Pagination';
import TableSearch from '../../../TableSearch';


const SubjectListPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSubjects();
  }, [page]);

  const fetchSubjects = async () => {
    const response = await axios.get(`http://127.0.0.1:5000/api/subjects?page=${page}`);
    setSubjects(response.data.data);
    setCount(response.data.count);
  };

  const columns = [
    { header: 'Subject Name', accessor: 'name' },
    { header: 'Teachers', accessor: 'teachers', className: 'hidden md:table-cell' },
  ];

  const renderRow = (item) => (
    <tr key={item.id}>
      <td>{item.name}</td>
      <td>{item.teachers?.map((teacher) => teacher.name).join(', ') || '-'}</td>
    </tr>
  );

  return (
    <div>
      <TableSearch />
      <Table columns={columns} data={subjects} renderRow={renderRow} />
      <Pagination page={page} count={count} setPage={setPage} />
    </div>
  );
};

export default SubjectListPage;
