import React from "react";
import { Line } from "react-chartjs-2";

const PriceHistoryModal = ({ product, theme, onClose }) => {
  if (!product) return null;

  return (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-start sm:items-center z-[150] p-2 sm:p-4 overflow-y-auto pt-20 sm:pt-4">
      
      {/* Container Logic */}
      <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] sm:rounded-[2.5rem] w-full max-w-lg shadow-2xl relative my-auto overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[85vh] border border-white/10 animate-in fade-in zoom-in duration-200">
        
        {/* HEADER - sticky-top of the modal itself */}
        <div className="p-5 sm:p-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-gray-900 z-10">
          <button 
            className="absolute top-5 right-5 text-gray-400 hover:text-red-500 text-xl sm:text-2xl transition-colors p-1" 
            onClick={onClose}
          >
            ✕
          </button>
          <div className="pr-10">
            <h2 className="text-lg sm:text-xl font-black dark:text-white truncate">
              {product.name}
            </h2>
            <p className="text-[10px] sm:text-xs text-blue-500 font-bold uppercase tracking-widest mt-1">
              Price Analytics
            </p>
          </div>
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
          
          {/* GRAPH CONTAINER */}
          <div className="h-44 sm:h-56 w-full bg-slate-50/50 dark:bg-gray-800/50 rounded-2xl sm:rounded-3xl p-3 sm:p-4 mb-6 border border-slate-100 dark:border-gray-800/50 flex-shrink-0">
            {(() => {
              const history = product.history || [];
              const initialPointPrice = product.initialPrice || product.currentPrice;
              
              const chartPrices = [initialPointPrice, ...history.map(h => h.newPrice)];
              const chartLabels = [
                "Start", 
                ...history.map(h => new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
              ];

              return (
                <Line 
                  data={{
                    labels: chartLabels,
                    datasets: [{ 
                      label: 'Price', 
                      data: chartPrices, 
                      borderColor: '#3b82f6', 
                      backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                      fill: true, 
                      tension: 0.4, 
                      pointRadius: chartPrices.length > 1 ? 3 : 5, 
                      pointBackgroundColor: '#3b82f6' 
                    }]
                  }}
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false, 
                    scales: { 
                      y: { 
                        beginAtZero: false, 
                        ticks: { 
                          font: { size: 10 },
                          color: theme === 'dark' ? '#94a3b8' : '#64748b',
                          callback: (value) => `$${value}`
                        },
                        grid: { color: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } 
                      }, 
                      x: { 
                        ticks: { font: { size: 10 }, color: theme === 'dark' ? '#94a3b8' : '#64748b' }, 
                        grid: { display: false } 
                      } 
                    }, 
                    plugins: { legend: { display: false } } 
                  }}
                />
              );
            })()}
          </div>

          <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 sticky top-0 bg-white dark:bg-gray-900 py-1 z-20">
            Activity Logs
          </h3>

          <div className="space-y-3">
            {[...(product.history || [])].reverse().map((log, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800/40 rounded-2xl border border-slate-100 dark:border-gray-700/50 shadow-sm transition-all hover:border-blue-500/30">
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-400 uppercase font-black tracking-tighter">Time</span>
                  <span className="text-xs sm:text-sm dark:text-gray-200 font-semibold">
                    {new Date(log.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-gray-400 uppercase font-black tracking-tighter">Price</span>
                  <p className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                    ${Number(log.newPrice || product.currentPrice).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryModal;