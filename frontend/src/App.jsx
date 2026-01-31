import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Toaster } from 'react-hot-toast'; // 1. Import it
import toast from 'react-hot-toast'



import StatsSummary from "./components/statsSummary";
// Change these to lowercase to match your actual files
import Login from "./components/login"; 
import Signup from "./components/signup";
import AddProduct from "./components/addProductForm"; // Check if 'A' is capital in the filename!

import API from "./api";

import axios from 'axios';


import { Line } from "react-chartjs-2"; // <--- THIS WAS MISSING
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);



const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    // If no token, send them to login
    return <Navigate to="/login" replace />;
  }
  return children;
};
function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
  const [loading, setLoading] = useState(true); // Start as true

  // Auth State


  // This helper returns 'true' if the user is logged in, 
// and 'false' (plus a toast) if they are a guest.
const checkAuth = () => {
  if (!token) {
    toast.error("Please login or signup to perform this action", {
      icon: '🚫',
      duration: 3000,
      style: {
        borderRadius: '10px',
        background: theme === 'dark' ? '#1f2937' : '#fff',
        color: theme === 'dark' ? '#fff' : '#1f2937',
        border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
      },
    });
    return false;
  }
  return true;
};
const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName"); // Clear it on logout!
    setToken(null);
    setUserName("");
    setProducts([]);
  };
// --- EXISTING LOGIC (Updated with Guest Checks) ---
  const handleUpdateProduct = async (updatedProduct) => {
    if (!token) {
      alert("Guest Mode: You cannot save changes. Please login to edit products!");
      return;
    }
    try {
      const res = await API.put(`/products/${editingProduct._id}`, updatedProduct);
      setProducts((prev) => prev.map((p) => (p._id === editingProduct._id ? res.data : p)));
      setEditingProduct(null);
      setShowForm(false);
    } catch (err) { console.error("Update failed:", err); }
  };

  const handleDeleteProduct = async (id) => {
if (!checkAuth()) return; // Stop here if guest

  if (!window.confirm("Are you sure?")) return;
    try {
      await API.delete(`/products/${id}`); 
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) { 
      console.error("Failed to delete:", err); 
      alert("Delete failed: " + (err.response?.data?.message || "Server error"));
    }
  };

  const handleAddProduct = async (product) => {
if (!token) {
    toast.error("Guest Mode: Please login to save products!", {
      icon: '🔒',
      style: { borderRadius: '10px', background: '#333', color: '#fff' },
    });
    return;
  }
    const formattedProduct = { ...product, targetPrice: Number(product.targetPrice), currentPrice: Number(product.currentPrice), change: 0, history: [] };
    try {
      const res = await API.post("/products", formattedProduct);
      setProducts([...products, res.data]);
      setShowForm(false);
    } catch (err) { console.error(err); }
  };

const handleEditProduct = (product) => {
  if (checkAuth()) {
    setEditingProduct(product);
    setShowForm(true);
  }
};

useEffect(() => {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  // Save choice for next visit
  localStorage.setItem("theme", theme);
}, [theme]);

const toggleTheme = () => {
  setTheme((prev) => (prev === "light" ? "dark" : "light"));
};
useEffect(() => {
  const fetchProducts = async () => {
    setLoading(true);
    
    // Tiny artificial delay to make the entrance feel "smooth" 
    // and not like a sudden flash
    if (!token) {
      setTimeout(() => {
        setProducts([]);
        setLoading(false);
      }, 400); // 400ms is the "sweet spot" for felt speed
      return;
    }

    try {
      const res = await axios.get("https://pricewatch-4n3q.onrender.com/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Fetch failed:", err);
      setProducts([]); 
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, [token]);

  const totalChange = products.reduce((acc, p) => acc + (Number(p.change) || 0), 0);
  const avgChange = products.length ? Math.round((totalChange / products.length) * 10) / 10 : 0;

  // --- RENDER HELPERS ---
const Dashboard = () => {
  const navigate = useNavigate();
  return (
  <div className="min-h-screen bg-[#F0F4F8] dark:bg-gray-900 transition-colors duration-300">
    <Navbar 
      theme={theme} 
      toggleTheme={toggleTheme} 
      onAddProductClick={() => {
        if (checkAuth()) setShowForm(true);
      }}
      onLogout={handleLogout} 
      userName={userName} 
      token={token} 
    />

    {showForm && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-auto">
        <div className="bg-white/80 backdrop-blur-2xl dark:bg-gray-900 dark:backdrop-blur-none rounded-[2.5rem] p-6 w-full max-sm:max-w-sm sm:max-w-md relative shadow-2xl border border-white dark:border-white">

          <AddProduct 
            handleAddProduct={editingProduct ? handleUpdateProduct : handleAddProduct} 
            initialData={editingProduct} 
            isEditing={!!editingProduct} 
            onClose={() => { setShowForm(false); setEditingProduct(null); }} 
          />
        </div>
      </div>
    )}

    <div className="w-full max-w-3xl mx-auto mt-8 space-y-6 px-4 pb-20">
      <StatsSummary totalItems={products.length} avgChange={avgChange} />
      
      {loading ? (
        /* --- SKELETON LOADERS --- */
        [1, 2, 3].map((n) => (
          <div key={n} className="bg-white/40 backdrop-blur-md dark:bg-gray-800/40 p-6 rounded-[2rem] border border-white/40 dark:border-gray-700 animate-pulse flex flex-col sm:flex-row justify-between items-center w-full">
            <div className="flex-1 w-full">
              <div className="h-6 bg-slate-200 dark:bg-gray-700 rounded-full w-3/4 mb-4"></div>
              <div className="flex gap-4">
                <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded-full w-24"></div>
                <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded-full w-24"></div>
              </div>
            </div>
            <div className="h-10 bg-slate-200 dark:bg-gray-700 rounded-full w-20 mt-4 sm:mt-0"></div>
          </div>
        ))
      ) : products.length > 0 ? (
        /* --- YOUR ORIGINAL PRODUCT LIST --- */
        products.map((product) => {
          const isPositive = product.change > 0;
          const isNegative = product.change < 0;
          const changeColor = isPositive 
            ? "bg-red-50/50 text-red-600 border-red-100/50 dark:bg-red-100 dark:text-red-600" 
            : isNegative 
            ? "bg-green-50/50 text-green-600 border-green-100/50 dark:bg-green-100 dark:text-green-600" 
            : "bg-slate-100/50 text-slate-500 dark:bg-gray-200 dark:text-gray-700";

          return (
           <div key={product._id} className="group relative bg-white/70 backdrop-blur-xl dark:bg-gray-800/80 p-6 rounded-[2rem] shadow-sm border border-white/40 dark:border-gray-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center w-full transition-all hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
  
  {/* Left Section: Content */}
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

    {/* View History "Tag" */}
    <button 
      className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-300 text-xs font-bold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all shadow-inner"
      onClick={() => { if (checkAuth()) { setSelectedProduct(product); } }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
      View History
    </button>
  </div>
  
  {/* Right Section: Actions */}
  <div className="flex items-center gap-3 mt-5 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 dark:border-gray-700 pt-4 sm:pt-0">
    <div className={`font-black px-4 py-2 rounded-2xl text-sm shadow-sm ${changeColor}`}>
      {isPositive ? '▲' : '▼'} {product.change}%
    </div>
    
    <div className="flex items-center gap-1">
      <button 
        onClick={() => handleEditProduct(product)} 
        className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
        title="Edit Item"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      
      <button 
        onClick={() => handleDeleteProduct(product._id)} 
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
        })
      ) : !token ? (
          /* --- CREATIVE "BEFORE LOGIN" HERO WITH MOCK GRAPH --- */
          <div className="relative group overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 p-1 dark:from-blue-500 dark:to-purple-600 rounded-[3rem] shadow-2xl transition-all">
            <div className="bg-white/95 backdrop-blur-2xl dark:bg-gray-900/95 rounded-[2.8rem] p-8 sm:p-12 flex flex-col items-center text-center relative z-10">
              
             {/* 1. THE MOCK GRAPH BOX WITH NOTIFICATION BELL */}
<div className="w-full max-w-md h-40 mb-10 bg-slate-50 dark:bg-gray-800/50 rounded-3xl p-4 border border-blue-100 dark:border-gray-700 relative overflow-hidden group-hover:border-blue-400 transition-colors duration-500">
  
  {/* The Bell Icon */}
  <div 
    onClick={() => navigate("/signup")}
    className="absolute top-4 right-4 z-20 cursor-pointer group/bell"
  >
    <div className="relative">
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 z-10 animate-bounce"></div>
      <div className="p-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm group-hover/bell:bg-blue-600 transition-colors duration-300">
        <svg 
          className="w-5 h-5 text-gray-500 dark:text-gray-300 group-hover/bell:text-white transition-colors" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
      </div>
    </div>
    {/* Tooltip */}
    <span className="absolute top-12 right-0 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bell:opacity-100 transition-opacity whitespace-nowrap">
      Enable Alerts
    </span>
  </div>

  <div className="flex justify-between items-center mb-2 px-2">
    <div className="flex flex-col items-start">
      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Demo Tracker</span>
      <span className="text-sm font-bold dark:text-white">Apple Airpods Max</span>
    </div>
    <span className="text-green-500 font-bold text-sm animate-pulse mr-10">-$120.00 Drop</span>
  </div>
  
  <div className="h-24">
    <Line 
      data={{
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          data: [549, 549, 549, 429, 429, 480, 429],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.5,
          pointRadius: 0,
        }]
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { y: { display: false }, x: { display: false } }
      }}
    />
  </div>
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
</div>

              <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-purple-400 mb-4">
                Stop Overpaying.
              </h2>
              
              <p className="text-slate-600 dark:text-gray-300 max-w-sm text-lg leading-relaxed mb-8">
                Track any product across the web and get notified the second the price drops. Join <span className="font-bold text-blue-600">PriceWatch</span> today.
              </p>

              <div className="flex flex-col w-full sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate("/signup")}
                  className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/40"
                >
                  Start Tracking Free
                </button>
                <button 
                  onClick={() => navigate("/login")}
                  className="px-10 py-4 bg-white dark:bg-gray-800 text-blue-600 dark:text-white font-bold rounded-2xl border-2 border-blue-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all"
                >
                  Sign In
                </button>
              </div>

              <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                Live Price Engine Connected
              </div>
            </div>
          </div>
        ) : (
        /* --- YOUR CLEAN AFTER LOGIN EMPTY STATE --- */
     /* --- CREATIVE "AFTER LOGIN" EMPTY STATE --- */
<div className="relative overflow-hidden p-12 flex flex-col items-center justify-center text-center bg-white/40 backdrop-blur-md dark:bg-gray-800/40 rounded-[3rem] border-2 border-dashed border-blue-200 dark:border-gray-700 shadow-sm transition-all group/container">
  
  {/* Floating Background Elements (Teasers) */}
  <div className="absolute top-10 left-10 text-2xl opacity-20 group-hover/container:translate-y-[-10px] transition-transform duration-700 delay-100">🏷️</div>
  <div className="absolute bottom-10 right-10 text-2xl opacity-20 group-hover/container:translate-y-[10px] transition-transform duration-700 delay-300">📱</div>
  <div className="absolute top-20 right-20 text-xl opacity-10 group-hover/container:rotate-12 transition-transform duration-500">👟</div>

  {/* Main Action Circle */}
  <div className="relative mb-8">
    <div 
      onClick={() => { if (checkAuth()) setShowForm(true); }}
      className="cursor-pointer relative z-10 w-24 h-24 bg-gradient-to-b from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/30 transform transition-all duration-500 group-hover/container:scale-110 group-hover/container:rotate-3"
    >
      <span className="text-white text-5xl font-extralight transition-transform group-hover/container:rotate-90 duration-500">+</span>
    </div>
    
    {/* Decorative Rings */}
    <div className="absolute inset-0 rounded-3xl bg-blue-400 animate-ping opacity-10 scale-125"></div>
    <div className="absolute inset-0 rounded-3xl border-2 border-blue-500/20 scale-150 group-hover/container:scale-110 transition-transform duration-700"></div>
  </div>

  <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
    Ready for your first hunt?
  </h3>
  
  <p className="text-slate-500 dark:text-gray-400 max-w-[280px] text-sm leading-relaxed mb-8">
    Your watchlist is a blank canvas. Drop a product link here and let us handle the price stalking.
  </p>

  <button 
    onClick={() => { if (checkAuth()) setShowForm(true); }}
    className="relative overflow-hidden px-10 py-4 bg-slate-900 dark:bg-white dark:text-gray-900 text-white font-black rounded-2xl transition-all active:scale-95 hover:shadow-2xl"
  >
    <span className="relative z-10">Add Your First Item</span>
    <div className="absolute inset-0 bg-blue-600 translate-y-full hover:translate-y-0 transition-transform duration-300"></div>
  </button>

  {/* Quick Tip Footer */}
  <div className="mt-8 py-2 px-4 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800/50">
    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
      💡 Pro Tip: Paste any link to start
    </p>
  </div>
</div>
      )}
    </div>

{selectedProduct && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] border border-white/10">
      
      {/* Header */}
      <div className="p-6 pb-2 border-b border-gray-100 dark:border-gray-800">
        <button 
          className="absolute top-5 right-5 text-gray-400 hover:text-red-500 text-2xl transition-colors" 
          onClick={() => setSelectedProduct(null)}
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold dark:text-white pr-8">{selectedProduct.name}</h2>
        <p className="text-sm text-blue-500 font-medium tracking-wide">Price Analytics & Logs</p>
      </div>

      <div className="p-6 overflow-y-auto custom-scrollbar">
        {/* 1. THE GRAPH FIX: Mapping to newPrice and fixing Y-Axis */}
        <div className="h-60 w-full bg-slate-50/50 dark:bg-gray-800/50 rounded-3xl p-4 mb-6">
          {(() => {
            const history = selectedProduct.history || [];
            // FIX: Map to 'newPrice' because that is what your Schema uses
            const chartData = history.map(h => h.newPrice || selectedProduct.currentPrice || 0);
            const labels = history.map(h => 
              new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            );

            return history.length > 0 ? (
              <Line 
                data={{
                  labels: labels,
                  datasets: [{
                    label: 'Price',
                    data: chartData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#3b82f6',
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
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                <span className="text-3xl">📉</span>
                <p className="italic text-sm">No price logs found for this item.</p>
              </div>
            );
          })()}
        </div>

        {/* 2. THE LOG LIST FIX: Mapping to newPrice */}
        <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">History Logs</h3>
        <div className="space-y-3">
          {(() => {
            const logs = [...(selectedProduct.history || [])].reverse();
            return logs.map((log, index) => {
              // FIX: Use newPrice to match your Mongoose Schema
              const displayPrice = log.newPrice || selectedProduct.currentPrice || 0;
              
              return (
                <div key={index} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800/40 rounded-2xl border border-slate-100 dark:border-gray-700/50 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Recorded At</span>
                    <span className="text-sm dark:text-gray-200 font-semibold">
                      {new Date(log.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Price</span>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${Number(displayPrice).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  </div>
)}
  </div>
);
};
  return  (
  <Router>
    <Toaster position="top-center" reverseOrder={false} />
    <Routes>
      
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login setToken={(data) => {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userName", data.user.name);
          setToken(data.token);
          setUserName(data.user.name);
      }} />} />
      
      <Route path="/" element={<Dashboard />} />
      
      <Route path="/products" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    </Routes>
  </Router>
);
}

export default App;