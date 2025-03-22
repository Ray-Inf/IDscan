import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserCard = ({ type }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        axios.get('http://127.0.0.1:5000/api/users/count')
            .then(response => setCount(response.data[type]))
            .catch(error => {
                console.error('Error fetching user count:', error);
                setCount(0); // Default to 0 on error
            });
    }, [type]);

    return (
        <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px]">
            <div className="flex justify-between items-center">
                <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">2024/25</span>
                <img src="/more.png" alt="" width={20} height={20} />
            </div>
            <h1 className="text-2xl font-semibold my-4">{count}</h1>
            <h2 className="capitalize text-sm font-medium text-gray-500">{type}s</h2>
        </div>
    );
};

export default UserCard;