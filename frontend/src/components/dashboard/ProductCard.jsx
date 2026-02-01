import React from "react";

const ProductCard = ({ product, onViewHistory, onEdit, onDelete }) => {
  const isPositive = product.change > 0;
  const isNegative = product.change < 0;
  
  const changeColor = isPositive 
    ? "bg-red-50/50 text-red-600 border-red-100/50 dark:bg-red-100 dark:text-red-600" 
    : isNegative 
    ? "bg-green-50/50 text-green-600 border-green-100/50 dark:bg-green-100 dark:text-green-600" 
    : "bg-slate-100/50 text-slate-500 dark:bg-gray-200 dark:text-gray-700";

  return (
    <div className="group relative bg-white/70 backdrop-blur-xl dark:bg-gray-800/80 p-6 rounded-[2rem] shadow-sm border border-white/40 dark:border-gray-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center w-full transition-all hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
      <div className="flex-1 w-full">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-slate-800 dark:text-white font-black text-lg tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>
          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest ${isPositive ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500 animate-pulse'}`}>
            {isPositive ? 'Rising' : 'Dropping'}
          </div>
        </div>
        <div className="flex flex-wrap gap-5 text-sm">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Current Price</span>
            <span className="text-slate-700 dark:text-white font-bold text-lg">${product.currentPrice}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-blue-500 tracking-tighter">Target Goal</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">${product.targetPrice}</span>
          </div>
        </div>
        <button 
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-300 text-xs font-bold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all shadow-inner"
          onClick={() => onViewHistory(product)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          View History
        </button>
      </div>
      <div className="flex items-center gap-3 mt-5 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 dark:border-gray-700 pt-4 sm:pt-0">
        <div className={`font-black px-4 py-2 rounded-2xl text-sm shadow-sm ${changeColor}`}>
          {isPositive ? '▲' : '▼'} {product.change}%
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onEdit(product)} 
            className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
            title="Edit Item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button 
            onClick={() => onDelete(product._id)} 
            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
            title="Delete Item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;