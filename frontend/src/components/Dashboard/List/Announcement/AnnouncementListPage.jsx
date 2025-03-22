import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';  // ✅ Correct way to get search params
import Table from '../../../Table'; // Go up two directories to reach components
import TableSearch from '../../../TableSearch';
import Pagination from '../../../Pagination';
import FormContainer from '../../../FormContainer';


const AnnouncementListPage = () => {
    const [searchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;  // ✅ Ensure page is always a number
    const search = searchParams.get("search") || "";  // ✅ Ensure search is always a string

    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);

    useEffect(() => {
        axios.get(`http://127.0.0.1:5000/api/announcements?page=${page}&search=${search}`)
            .then(response => {
                setData(response.data.data);
                setCount(response.data.count);
            })
            .catch(error => console.error("Error fetching announcements:", error));
    }, [page, search]);  // ✅ Fetch only when these values change

    const columns = [
        { header: "Title", accessor: "title" },
        { header: "Class", accessor: "class.name" },
        { header: "Date", accessor: "date", className: "hidden md:table-cell" },
        { header: "Actions", accessor: "action" },
    ];

    const renderRow = (item) => (
        <tr key={item.id}>
            <td>{item.title}</td>
            <td>{item.class?.name || "-"}</td>
            <td>{item.date ? new Date(item.date).toLocaleDateString() : "-"}</td>
            <td>
                <FormContainer table="announcement" type="update" data={item} />
                <FormContainer table="announcement" type="delete" id={item.id} />
            </td>
        </tr>
    );

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">All Announcements</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <FormContainer table="announcement" type="create" />
                    </div>
                </div>
            </div>
            <Table columns={columns} renderRow={renderRow} data={data} />
            <Pagination page={page} count={count} />
        </div>
    );
};

export default AnnouncementListPage;
