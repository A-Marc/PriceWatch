import React from "react";
import { Line } from "react-chartjs-2";

const GlobalAnalytics = ({ products, theme }) => {
  // Logic to aggregate data: Find the average price change across all items
  const data = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"], // You can map real dates here later
    datasets: [
      {
        label: "Market Trend",
        data: [2, -5, -8, -12], // Dummy trend data
        borderColor: "#10b981", // Green for drops/savings
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-sm border border-white/40 dark:border-none flex flex-col sm:flex-row items-center gap-6">
      <div className="flex-1">
        <h3 className="text-slate-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
          Savings Trajectory
        </h3>
        <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
          +14.2% <span className="text-green-500 text-sm font-normal">potential saved</span>
        </p>
      </div>
      <div className="w-full sm:w-32 h-16">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default GlobalAnalytics;