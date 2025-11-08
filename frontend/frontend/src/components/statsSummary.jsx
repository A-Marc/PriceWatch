// src/components/StatsSummary.jsx
function StatsSummary({ totalItems, avgChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {/* Total Items Tracking */}
      <div className="bg-white p-4 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <h3 className="text-gray-600 text-sm font-medium">
            Total Items Tracking
          </h3>
          <p className="text-2xl font-bold mt-1">{totalItems}</p>
          <p className="text-blue-500 text-sm cursor-pointer mt-1">
            View History
          </p>
        </div>
        {/* <div className="text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full">
          +5.2%
        </div> */}
      </div>

      {/* Average Price Change */}
      <div className="bg-white p-4 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <h3 className="text-gray-600 text-sm font-medium">
            Average Price Change
          </h3>
          <p
            className={`text-2xl font-bold mt-1 ${
              avgChange >= 0 ? "text-red-600" : "text-green-500"
            }`}
          >
            {avgChange}%
          </p>
          <p className="text-blue-500 text-sm cursor-pointer mt-1">
            View History
          </p>
        </div>
        <div
          className={`${
            avgChange >= 0
              ? "text-green-600 bg-green-100"
              : "text-red-600 bg-red-100"
          } font-semibold px-3 py-1 rounded-full`}
        >
          {avgChange >= 0 ? `+${avgChange}%` : `${avgChange}%`}
        </div>
      </div>
    </div>
  );
}

export default StatsSummary;
