import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const AttendanceChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
        <XAxis dataKey="name" axisLine={false} tick={{ fill: "#6b7280" }} tickLine={false} />
        <YAxis axisLine={false} tick={{ fill: "#6b7280" }} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }} />
        <Legend align="left" verticalAlign="top" wrapperStyle={{ paddingTop: "10px" }} />
        <Bar dataKey="present" fill="#4CAF50" legendType="circle" radius={[10, 10, 0, 0]} />
        <Bar dataKey="absent" fill="#E53E3E" legendType="circle" radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AttendanceChart;
