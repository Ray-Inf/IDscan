import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Navbar = () => {
    const [user, setUser] = useState({ name: 'Loading...', role: 'loading' });

    useEffect(() => {
        // Fetch user data from API
        axios.get('http://127.0.0.1:5000/api/users')
            .then(response => {
                if (response.data && response.data.name) {
                    setUser(response.data);
                }
            })
            .catch(error => {
                console.error('Error fetching user:', error);
                // Set default user in case of error
                setUser({ name: 'John Doe', role: 'admin' });
            });
    }, []);

    return (
        <div className="flex items-center justify-between p-4">
            {/* SEARCH BAR */}
            <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
                <img src="/search.png" alt="" width={14} height={14} />
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-[200px] p-2 bg-transparent outline-none"
                />
            </div>
            {/* ICONS AND USER */}
            <div className="flex items-center gap-6 justify-end w-full">
                <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
                    <img src="/message.png" alt="" width={20} height={20} />
                </div>
                <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
                    <img src="/announcement.png" alt="" width={20} height={20} />
                    <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
                        1
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs leading-3 font-medium">{user?.name}</span>
                    <span className="text-[10px] text-gray-500 text-right">
                        {user?.role}
                    </span>
                </div>
                {/* User Button equivalent */}
                <div className="user-button">
                    <img src="/avatar.png" alt="" width={36} height={36} className="rounded-full"/>
                </div>
            </div>
        </div>
    );
};

export default Navbar;