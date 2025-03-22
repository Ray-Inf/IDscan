
// import React, { useState } from 'react';

// const TableSearch = ({ onSearch }) => {
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSearch(searchTerm);
//   };
  
//   return (
//     <form onSubmit={handleSubmit} className="flex-1 md:max-w-md">
//       <div className="relative">
//         <input
//           type="text"
//           placeholder="Search..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         <button 
//           type="submit"
//           className="absolute left-3 top-1/2 transform -translate-y-1/2"
//         >
//           🔍
//         </button>
//       </div>
//     </form>
//   );
// };

// export default TableSearch;
import React, { useState } from "react";

const TableSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full md:max-w-md">
      <div className="relative w-full">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {/* Search Icon */}
        <button 
          type="submit"
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
        >
          🔍
        </button>
      </div>
    </form>
  );
};

export default TableSearch;
