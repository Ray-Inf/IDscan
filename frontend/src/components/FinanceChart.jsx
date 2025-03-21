import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinanceChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get('http://127.0.0.1:5000/api/finance')
            .then(response => {
                console.log("📊 Finance API Response:", response.data); // ✅ Debugging
                setData(Array.isArray(response.data) ? response.data : []); // ✅ Ensure it's an array
            })
            .catch(error => {
                console.error("❌ Finance API Error:", error);
                setData([]); // ✅ Prevent errors if API fails
            });
    }, []);

    // ✅ Ensure data is always an array to avoid `.map()` crash
    const safeData = Array.isArray(data) ? data : [];

    return (
        <div className="bg-white rounded-xl w-full h-full p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold">Finance</h1>
                <img src="/moreDark.png" alt="" width={20} height={20} />
            </div>
            {safeData.length > 0 ? ( // ✅ Show chart only if data exists
                <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={safeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                        <XAxis dataKey="name" axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} tickMargin={10} />
                        <YAxis axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} tickMargin={20} />
                        <Tooltip />
                        <Legend align="center" verticalAlign="top" wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px" }} />
                        <Line type="monotone" dataKey="income" stroke="#C3EBFA" strokeWidth={5} />
                        <Line type="monotone" dataKey="expense" stroke="#CFCEFF" strokeWidth={5} />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <p className="text-center text-gray-500">No financial data available</p> // ✅ Show fallback message
            )}
        </div>
    );
};

export default FinanceChart;
