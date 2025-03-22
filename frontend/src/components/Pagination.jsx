// import React from 'react';

// const Pagination = ({ page, count, setPage, itemsPerPage = 10 }) => {
//   const totalPages = Math.ceil(count / itemsPerPage);
  
//   return (
//     <div className="flex justify-between items-center mt-4 px-2">
//       <span className="text-sm text-gray-500">
//         Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, count)} of {count} results
//       </span>
      
//       <div className="flex items-center gap-2">
//         <button 
//           className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
//           onClick={() => setPage(page - 1)}
//           disabled={page === 1}
//         >
//           Previous
//         </button>
        
//         {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//           let pageNumber;
//           if (totalPages <= 5) {
//             pageNumber = i + 1;
//           } else if (page <= 3) {
//             pageNumber = i + 1;
//           } else if (page >= totalPages - 2) {
//             pageNumber = totalPages - 4 + i;
//           } else {
//             pageNumber = page - 2 + i;
//           }
          
//           return (
//             <button
//               key={i}
//               className={`w-8 h-8 flex items-center justify-center rounded ${
//                 page === pageNumber ? 'bg-blue-500 text-white' : 'border border-gray-300'
//               }`}
//               onClick={() => setPage(pageNumber)}
//             >
//               {pageNumber}
//             </button>
//           );
//         })}
        
//         <button 
//           className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
//           onClick={() => setPage(page + 1)}
//           disabled={page === totalPages}
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Pagination;
import React from "react";

const Pagination = ({ page, count, onPageChange, setPage, itemsPerPage = 10 }) => {
  const totalPages = Math.ceil(count / itemsPerPage);

  if (totalPages <= 1) return null; // Hide pagination if only one page exists

  const handlePageChange = (newPage) => {
    if (onPageChange) {
      onPageChange(newPage); // When using onPageChange (for students)
    } else if (setPage) {
      setPage(newPage); // When using setPage (for parents)
    }
  };

  return (
    <div className="flex justify-between items-center mt-4 px-4">
      {/* Page Info */}
      <span className="text-sm text-gray-500">
        Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, count)} of {count} results
      </span>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>

        {/* Page Numbers Logic */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNumber;
          if (totalPages <= 5) {
            pageNumber = i + 1;
          } else if (page <= 3) {
            pageNumber = i + 1;
          } else if (page >= totalPages - 2) {
            pageNumber = totalPages - 4 + i;
          } else {
            pageNumber = page - 2 + i;
          }

          return (
            <button
              key={pageNumber}
              className={`w-8 h-8 flex items-center justify-center rounded ${
                page === pageNumber ? "bg-blue-500 text-white" : "border border-gray-300"
              }`}
              onClick={() => handlePageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
