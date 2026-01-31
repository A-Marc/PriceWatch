import React from 'react';

function StatsSummary({ totalItems, avgChange }) {
  // Logic: In price tracking, a NEGATIVE average change is usually "Good" (prices went down)
  // But usually, dashboards show the 'Amount Saved' as a positive Green number.
  // Here we follow your UI: Green for positive trajectory, Red for negative.
  const isPositive = avgChange >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 px-2 sm:px-0">
      
      {/* Total Items Tracking Card */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-[2rem] shadow-md flex justify-between items-center flex-col sm:flex-row border border-white/20 dark:border-none transition-colors">
        <div className="text-center sm:text-left">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
            Total Items
          </h3>
          <p className="text-3xl sm:text-4xl font-bold mt-1 dark:text-white">
            {totalItems}
          </p>
          <p className="text-blue-500 dark:text-blue-400 text-sm cursor-pointer mt-2 hover:underline">
            View Analytics
          </p>
        </div>
        <div className="mt-3 sm:mt-0 text-green-600 dark:text-green-400 font-semibold bg-green-100 dark:bg-green-900/30 px-4 py-1.5 rounded-full text-sm">
          Active Tracking
        </div>
      </div>

      {/* Average Price Change Card */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-[2rem] shadow-md flex justify-between items-center flex-col sm:flex-row border border-white/20 dark:border-none transition-colors">
        <div className="text-center sm:text-left">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
            Avg. Market Shift
          </h3>
          <p className={`text-3xl sm:text-4xl font-bold mt-1 ${
              isPositive ? "text-red-500" : "text-green-500"
            }`}>
            {avgChange}%
          </p>
          <p className="text-blue-500 dark:text-blue-400 text-sm cursor-pointer mt-2 hover:underline">
            View Trends
          </p>
        </div>
        <div className={`mt-3 sm:mt-0 font-semibold px-4 py-1.5 rounded-full text-sm ${
            isPositive 
              ? "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30" 
              : "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30"
          }`}>
          {isPositive ? `↑ +${avgChange}%` : `↓ ${avgChange}%`}
        </div>
      </div>

    </div>
  );
}

export default StatsSummary;