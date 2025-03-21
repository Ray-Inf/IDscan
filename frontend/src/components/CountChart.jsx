
import axios from "axios";
import React, { useEffect, useState } from "react";

import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CountChart = () => {
  const [boys, setBoys] = useState(0);
  const [girls, setGirls] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/students/count")
      .then((response) => {
        if (!response.data || typeof response.data !== "object") {
          throw new Error("Invalid API response");
        }
        setBoys(response.data.boys || 0);
        setGirls(response.data.girls || 0);
      })
      .catch((error) => {
        console.error("Error fetching student count:", error);
        setError("Failed to load student data");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading student count data...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const data = [
    { name: "Total", count: boys + girls, fill: "white" },
    { name: "Girls", count: girls, fill: "#FAE27C" },
    { name: "Boys", count: boys, fill: "#C3EBFA" },
  ];

  return (
    <div className="relative w-full h-[75%]">
      <ResponsiveContainer>
        {data.length > 0 ? (
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="100%"
            barSize={32}
            data={data}
          >
            <RadialBar background dataKey="count" />
            <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
          </RadialBarChart>
        ) : (
          <div className="text-center">No data available</div>
        )}
      </ResponsiveContainer>
      <img
        src="/maleFemale.png"
        alt="Male/Female Icon"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12"
      />
    </div>
  );
};

export default CountChart;
