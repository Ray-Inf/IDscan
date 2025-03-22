import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import Table from '../../../Table';
import TableSearch from '../../../TableSearch';
import Pagination from '../../../Pagination';
import FormContainer from '../../../FormContainer';

const EventListPage = () => {
    const [searchParams] = useSearchParams();
    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const page = Number(searchParams.get('page')) || 1;
    const search = searchParams.get('search') || '';
    const date = searchParams.get('date') || '';

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            
            // Build query string with all possible parameters
            const queryParams = new URLSearchParams();
            queryParams.append('page', page);
            if (search) queryParams.append('search', search);
            if (date) queryParams.append('date', date);
            
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                const response = await axios.get(
                    `http://127.0.0.1:5000/api/events?${queryParams.toString()}`,
                    { signal: controller.signal }
                );
                
                clearTimeout(timeoutId);
                
                console.log("Events API response:", response.data); // Debug logging
                
                // Check if response has the expected structure
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
                console.error("Error fetching events:", err);
                setData([]);
                setCount(0);
                
                if (err.code === 'ERR_CANCELED') {
                    setError("Request timed out. Server may be unavailable.");
                } else if (err.response) {
                    // The server responded with a status code outside the 2xx range
                    setError(`Server error: ${err.response.data?.error || err.message}`);
                } else if (err.request) {
                    // The request was made but no response was received
                    setError("No response from server. Please check your connection.");
                } else {
                    // Something else happened in setting up the request
                    setError(`Failed to load events. ${err.message}`);
                }
            }
            
            setLoading(false);
        };
        
        fetchEvents();
    }, [page, search, date]);

    const columns = [
        { header: "Title", accessor: "title" },
        { header: "Class", accessor: "class_.name" },
        { header: "Date", accessor: "startTime", className: "hidden md:table-cell" },
        { header: "Start Time", accessor: "startTime", className: "hidden md:table-cell" },
        { header: "End Time", accessor: "endTime", className: "hidden md:table-cell" },
        { header: "Actions", accessor: "action" },
    ];

    const renderRow = (item) => {
        // Safely access properties with optional chaining
        const title = item?.title || '-';
        const className = item?.class_?.name || '-';
        
        // Format dates with error handling
        let startDate = '-';
        let startTime = '-';
        let endTime = '-';
        
        if (item?.startTime) {
            try {
                const startDateTime = new Date(item.startTime);
                startDate = startDateTime.toLocaleDateString();
                startTime = startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch (e) {
                console.error("Start date parsing error:", e);
            }
        }
        
        if (item?.endTime) {
            try {
                const endDateTime = new Date(item.endTime);
                endTime = endDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch (e) {
                console.error("End date parsing error:", e);
            }
        }

        return (
            <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-2">{title}</td>
                <td className="p-2">{className}</td>
                <td className="p-2 hidden md:table-cell">{startDate}</td>
                <td className="p-2 hidden md:table-cell">{startTime}</td>
                <td className="p-2 hidden md:table-cell">{endTime}</td>
                <td className="p-2">
                    <div className="flex gap-2">
                        <FormContainer table="event" type="update" data={item} />
                        <FormContainer table="event" type="delete" id={item.id} />
                    </div>
                </td>
            </tr>
        );
    };

    if (loading) {
        return (
            <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
                <div className="flex justify-center items-center h-64">
                    <p>Loading events...</p>
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
                <h1 className="hidden md:block text-lg font-semibold">All Events</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <FormContainer table="event" type="create" />
                    </div>
                </div>
            </div>
            
            {data.length === 0 ? (
                <div className="text-center py-6">
                    <p className="text-gray-500">No events found.</p>
                    <p className="text-sm text-gray-400 mt-2">Try clearing your search filter or adding new events.</p>
                </div>
            ) : (
                <Table columns={columns} renderRow={renderRow} data={data} />
            )}
            
            <Pagination page={page} count={count} />
        </div>
    );
};

export default EventListPage;