import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
    setLoading(true); // Show skeleton while fetching
    try {
      if (!token) {
        // GUEST MODE
        setProducts([
          { _id: '1', name: 'Sample Rolex Watch', currentPrice: 12000, targetPrice: 10000, change: -2.5, history: [] },
          { _id: '2', name: 'Sample Nike Dunk Low', currentPrice: 110, targetPrice: 90, change: 5.2, history: [] },
          { _id: '3', name: 'Sample MacBook Pro M3', currentPrice: 1999, targetPrice: 1750, change: 0, history: [] }
        ]);
        setLoading(false);
        return;
      }

      // USER MODE
      const res = await axios.get("https://pricewatch-4n3q.onrender.com/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false); // Stop loading regardless of success/fail
    }
  };

  fetchProducts();
}, [token]);// Runs whenever the user logs in or out

  const totalChange = products.reduce((acc, p) => acc + (Number(p.change) || 0), 0);
  const avgChange = products.length ? Math.round((totalChange / products.length) * 10) / 10 : 0;

  // --- RENDER HELPERS ---
const Dashboard = () => (
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
        <div className="bg-white/80 backdrop-blur-2xl dark:bg-gray-900 dark:backdrop-blur-none rounded-[2.5rem] p-6 w-full max-w-sm sm:max-w-md relative shadow-2xl border border-white dark:border-white">
          <button className="absolute top-5 right-5 text-gray-400 dark:text-gray-200" onClick={() => { setShowForm(false); setEditingProduct(null); }}>✕</button>
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
            <div key={product._id} className="bg-white/70 backdrop-blur-xl dark:bg-gray-800 dark:backdrop-blur-none p-6 rounded-[2rem] shadow-md border border-white/40 dark:border-none flex flex-col sm:flex-row justify-between items-start sm:items-center w-full transition-all">
              <div className="flex-1">
                <h3 className="text-slate-800 dark:text-white font-semibold text-lg">{product.name}</h3>
                <div className="mt-2 flex flex-wrap gap-4 text-sm">
                  <span className="text-slate-500 dark:text-gray-200">💰 Current: <span className="text-green-600 font-bold">${product.currentPrice}</span></span>
                  <span className="text-slate-500 dark:text-gray-200">🎯 Target: <span className="text-blue-600 font-bold">${product.targetPrice}</span></span>
                </div>
                <p 
  className="text-blue-500 cursor-pointer text-sm mt-2 font-medium hover:underline" 
  onClick={() => {
    if (checkAuth()) {
      setSelectedProduct(product);
    }
  }}
>
  View History
</p>
              </div>
              
              <div className="flex items-center gap-2 mt-3 sm:mt-0">
                <div className={`font-semibold px-3 py-1 rounded-full ${changeColor}`}>
                  {isPositive ? '+' : ''}{product.change}%
                </div>
                <button onClick={() => handleEditProduct(product)} className="text-blue-500 font-bold pl-2">Edit</button>
                <button onClick={() => handleDeleteProduct(product._id)} className="text-red-500 font-bold pl-2">✕</button>
              </div>
            </div>
          );
        })
      ) : (
        /* --- YOUR ORIGINAL EMPTY STATE --- */
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white/70 backdrop-blur-xl dark:bg-gray-800 dark:backdrop-blur-none rounded-[3rem] border border-white/40 dark:border-none shadow-xl transition-all">
          <div 
            onClick={() => { if (checkAuth()) setShowForm(true); }}
            className="group cursor-pointer relative w-20 h-20 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 transition-all hover:scale-110 mb-6"
          >
            <span className="text-white text-4xl font-light">+</span>
            <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Your list is empty</h3>
          <p className="text-slate-500 dark:text-gray-400 max-w-xs">
            You aren't tracking anything yet! Paste a link to your favorite items to start watching prices.
          </p>
          <button 
            onClick={() => { if (checkAuth()) setShowForm(true); }}
            className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25"
          >
            Track your first item
          </button>
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
                      beginAtZero: false, // Prevents the "flat line at bottom" look
                      grace: '15%',       // Adds padding so the line isn't touching the top/bottom
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
  return  (
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
      
      {/* REMOVED ProtectedRoute from "/" 
         Now guests can see the Dashboard with dummy data!
      */}
      <Route path="/" element={<Dashboard />} />
      
      {/* Keep this protected if you want a specific hidden URL */}
      <Route path="/products" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    </Routes>
  </Router>
);
}

export default App;





