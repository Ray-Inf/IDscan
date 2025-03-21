import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [userRole, setUserRole] = useState('admin'); // Default role

  useEffect(() => {
    // Fetch menu items
    axios.get('http://127.0.0.1:5000/api/menu')
      .then(response => setMenuItems(response.data))
      .catch(error => console.error('Error fetching menu:', error));
    
    // Fetch user role
    axios.get('http://127.0.0.1:5000/api/users')
      .then(response => {
        if (response.data && response.data.role) {
          setUserRole(response.data.role);
        }
      })
      .catch(error => {
        console.error('Error fetching user:', error);
        // Use default role in case of error
      });
  }, []);

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {i.title}
          </span>
          {i.items.map((item) => {
            if (item.visible && item.visible.includes(userRole)) {
              return (
                <Link
                  to={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-gray-100"
                >
                  <img src={item.icon} alt="" width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;