import React from "react";

const Table = ({ columns, data, renderRow }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse mt-4">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((column) => (
              <th
                key={column.accessor || column.header}
                className={`p-4 text-left ${column.className || ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) =>
              renderRow ? (
                renderRow(item) // ✅ Use renderRow for Parent Table
              ) : (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  {columns.map((column, index) => (
                    <td key={index} className={`p-4 ${column.className || ""}`}>
                      {column.render ? column.render(item) : item[column.accessor] || "N/A"}
                    </td>
                  ))}
                </tr>
              )
            )
          ) : (
            <tr>
              <td colSpan={columns.length} className="p-4 text-center">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
