import React, { useState, useEffect } from "react";

function AddProduct({ handleAddProduct, initialData = null, isEditing = false, onClose }) {
  const [name, setName] = useState(initialData?.name || "");
  const [url, setUrl] = useState(initialData?.url || "");
  const [targetPrice, setTargetPrice] = useState(initialData?.targetPrice || "");
  const [currentPrice, setCurrentPrice] = useState(initialData?.currentPrice || "");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setUrl(initialData.url || "");
      setTargetPrice(initialData.targetPrice || "");
      setCurrentPrice(initialData.currentPrice || "");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedProduct = {
      name,
      url,
      targetPrice: Number(targetPrice),
      currentPrice: Number(currentPrice),
    };
    handleAddProduct && handleAddProduct(formattedProduct);
    if (!isEditing) {
      setName(""); setUrl(""); setTargetPrice(""); setCurrentPrice("");
    }
    onClose && onClose();
  };

  return (
    <div className="w-full max-w-md mx-auto relative group animate-in fade-in zoom-in duration-300">
      {/* Glow effect stays strictly behind */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[1.5rem] blur opacity-20"></div>
      
      {/* SOLID background prevents ghosting */}
      <div className="relative bg-white dark:bg-[#0f172a] rounded-[1.5rem] p-6 shadow-2xl border border-slate-100 dark:border-gray-800">
        
        {/* --- THE INTERNAL X BUTTON --- */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-gray-800 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 z-[100] cursor-pointer shadow-sm"
        >
          <span className="text-xl font-bold">✕</span>
        </button>

        {/* Header Section */}
        <div className="flex items-center gap-3 mb-6 pr-10 border-b border-slate-50 dark:border-gray-800 pb-4">
          <span className="text-2xl">{isEditing ? "⚙️" : "🚀"}</span>
          <h2 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-cyan-400">
            {isEditing ? "Edit Tracker" : "New Tracker"}
          </h2>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-800/80 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white text-sm"
            />
            <input
              type="url"
              placeholder="Paste Product Link"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-800/80 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Current ($)</span>
              <input
                type="number"
                placeholder="0.00"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-800/80 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-blue-500 uppercase ml-1">Target ($)</span>
              <input
                type="number"
                placeholder="0.00"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                required
                className="w-full px-4 py-3 bg-blue-50/50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white text-sm font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            {isEditing ? "Save Changes" : "Start Tracking"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;