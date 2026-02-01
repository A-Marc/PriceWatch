import React from "react";
import { Line } from "react-chartjs-2";

const PriceHistoryModal = ({ product, theme, onClose }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[70] p-4">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh] border border-white/10 animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <button 
            className="absolute top-6 right-6 text-gray-400 hover:text-red-500 text-2xl transition-colors z-50" 
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="text-xl font-black dark:text-white pr-10 truncate">
            {product.name}
          </h2>
          <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mt-1">
            Price Analytics & History
          </p>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          
          {/* GRAPH */}
          <div className="h-56 w-full bg-slate-50/50 dark:bg-gray-800/50 rounded-3xl p-4 mb-6 border border-slate-100 dark:border-gray-800/50 flex-shrink-0">
            {(() => {
              const history = product.history || [];
              const initialPointPrice = product.initialPrice || product.currentPrice;
              
              const chartPrices = [initialPointPrice, ...history.map(h => h.newPrice)];
              const chartLabels = [
                "Added", 
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
                      pointRadius: chartPrices.length > 1 ? 4 : 6, 
                      pointBackgroundColor: '#3b82f6' 
                    }]
                  }}
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false, 
                    scales: { 
                      y: { 
                        beginAtZero: false, 
                        grace: '15%', 
                        ticks: { 
                          color: theme === 'dark' ? '#94a3b8' : '#64748b', 
                          callback: (val) => `$${val.toLocaleString()}` 
                        },
                        grid: { color: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } 
                      }, 
                      x: { 
                        ticks: { color: theme === 'dark' ? '#94a3b8' : '#64748b' }, 
                        grid: { display: false } 
                      } 
                    }, 
                    plugins: { legend: { display: false } } 
                  }}
                />
              );
            })()}
          </div>

          <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 sticky top-0 bg-white dark:bg-gray-900 py-1">
            Activity Logs
          </h3>

          <div className="space-y-3">
            {[...(product.history || [])].reverse().map((log, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800/40 rounded-2xl border border-slate-100 dark:border-gray-700/50 shadow-sm transition-all hover:border-blue-500/30">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Recorded At</span>
                  <span className="text-sm dark:text-gray-200 font-semibold">
                    {new Date(log.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Price</span>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    ${Number(log.newPrice || product.currentPrice).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 text-center">
          <button 
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryModal;