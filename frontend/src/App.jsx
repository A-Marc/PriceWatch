import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Toaster } from 'react-hot-toast'; 
import toast from 'react-hot-toast'

import StatsSummary from "./components/statsSummary";
import Login from "./components/login"; 
import Signup from "./components/signup";
import AddProduct from "./components/addProductForm"; 

import PriceHistoryModal from "./components/dashboard/PriceHistoryModal";
import DeleteModal from "./components/dashboard/DeleteModal";
import ProductCard from "./components/dashboard/ProductCard";

import API from "./api";
import axios from 'axios';

import { Line } from "react-chartjs-2"; 
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
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
  const [loading, setLoading] = useState(true); 
  const [itemToDelete, setItemToDelete] = useState(null); // Added for Professional Delete

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
    localStorage.removeItem("userName"); 
    setToken(null);
    setUserName("");
    setProducts([]);
  };

const handleUpdateProduct = async (updatedProduct) => {
  if (!token) return toast.error("Please login!");

  // 1. SAVE THE OLD STATE (in case of error)
  const previousProducts = [...products];

  // 2. UPDATE UI INSTANTLY (Optimistic)
  setProducts((prev) => 
    prev.map((p) => (p._id === editingProduct._id ? { ...p, ...updatedProduct } : p))
  );
  setShowForm(false);
  setEditingProduct(null);

  try {
    // 3. DO THE SLOW WORK IN BACKGROUND
    await API.put(`/products/${editingProduct._id}`, updatedProduct);
    toast.success("Updated!");
  } catch (err) {
    // 4. IF SERVER FAILS, ROLL BACK
    setProducts(previousProducts);
    toast.error("Update failed. Reverting changes...");
  }
};

  // PROFESSIONAL DELETE LOGIC Logic
  const handleDeleteProduct = (id) => {
    if (checkAuth()) {
      setItemToDelete(id); // Opens the Custom Modal instead of window.confirm
    }
  };

const executeDelete = async () => {
  // 1. Capture the ID we want to delete
  const idToRemove = itemToDelete;
  
  // 2. OPTIMISTIC UPDATE: Remove it from the screen immediately
  // This makes the app feel "Instant"
  setProducts((prev) => prev.filter((p) => p._id !== idToRemove));
  
  // 3. Close the modal immediately so the user can keep working
  setItemToDelete(null);

  try {
    // 4. Do the actual work in the background
    await API.delete(`/products/${idToRemove}`);
    toast.success("Product removed", { icon: '🗑️' });
  } catch (err) { 
    // 5. If it actually fails, put the item back and show error
    console.error("Delete failed:", err);
    toast.error("Could not delete from server. Refreshing...");
    
    // Optional: Re-fetch products here to sync back up
    fetchProducts(); 
  }
};

 const handleAddProduct = async (product) => {
  if (!token) return toast.error("Please login!");

  // Create a temporary ID so React can render it immediately
  const tempId = Date.now().toString();
  const optimisticProduct = { 
    ...product, 
    _id: tempId, 
    change: 0, 
    history: [],
    currentPrice: Number(product.currentPrice)
  };

  // 1. Show it on screen immediately
  setProducts([...products, optimisticProduct]);
  setShowForm(false);

  try {
    const res = await API.post("/products", product);
    // 2. Replace temp item with real data from server (which has real DB ID)
    setProducts(prev => prev.map(p => p._id === tempId ? res.data : p));
    toast.success("Tracking started!");
  } catch (err) {
    // 3. Remove it if the server rejected it
    setProducts(prev => prev.filter(p => p._id !== tempId));
    toast.error("Failed to add product.");
  }
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
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      if (!token) {
        setTimeout(() => {
          setProducts([]);
          setLoading(false);
        }, 400);
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

  const Dashboard = () => {
    const navigate = useNavigate();
    return (
      <div className="min-h-screen bg-[#F0F4F8] dark:bg-gray-900 transition-colors duration-300">
        <Navbar 
          theme={theme} 
          toggleTheme={toggleTheme} 
          onAddProductClick={() => { if (checkAuth()) setShowForm(true); }}
          onLogout={handleLogout} 
          userName={userName} 
          token={token} 
        />

        {/* DELETE CONFIRMATION MODAL */}
        {itemToDelete && (<DeleteModal 
  isOpen={!!itemToDelete} 
  onCancel={() => setItemToDelete(null)} 
  onConfirm={executeDelete} 
/>
        )}

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
          ) :products.length > 0 ? (
  products.map((product) => (
    <ProductCard 
      key={product._id} 
      product={product} 
      onViewHistory={(p) => { if (checkAuth()) setSelectedProduct(p); }}
      onEdit={handleEditProduct}
      onDelete={handleDeleteProduct}
    />
  ))
) : !token ? (
            <div className="relative group overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 p-1 dark:from-blue-500 dark:to-purple-600 rounded-[3rem] shadow-2xl transition-all">
              <div className="bg-white/95 backdrop-blur-2xl dark:bg-gray-900/95 rounded-[2.8rem] p-8 sm:p-12 flex flex-col items-center text-center relative z-10">
                <div className="w-full max-w-md h-40 mb-10 bg-slate-50 dark:bg-gray-800/50 rounded-3xl p-4 border border-blue-100 dark:border-gray-700 relative overflow-hidden group-hover:border-blue-400 transition-colors duration-500">
                  <div onClick={() => navigate("/signup")} className="absolute top-4 right-4 z-20 cursor-pointer group/bell">
                    <div className="relative">
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 z-10 animate-bounce"></div>
                      <div className="p-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm group-hover/bell:bg-blue-600 transition-colors duration-300">
                        <svg className="w-5 h-5 text-gray-500 dark:text-gray-300 group-hover/bell:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                        </svg>
                      </div>
                    </div>
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
                </div>
                <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-purple-400 mb-4">Stop Overpaying.</h2>
                <p className="text-slate-600 dark:text-gray-300 max-w-sm text-lg leading-relaxed mb-8">
                  Track any product across the web and get notified the second the price drops. Join <span className="font-bold text-blue-600">PriceWatch</span> today.
                </p>
                <div className="flex flex-col w-full sm:flex-row gap-4 justify-center">
                  <button onClick={() => navigate("/signup")} className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/40">Start Tracking Free</button>
                  <button onClick={() => navigate("/login")} className="px-10 py-4 bg-white dark:bg-gray-800 text-blue-600 dark:text-white font-bold rounded-2xl border-2 border-blue-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all">Sign In</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden p-12 flex flex-col items-center justify-center text-center bg-white/40 backdrop-blur-md dark:bg-gray-800/40 rounded-[3rem] border-2 border-dashed border-blue-200 dark:border-gray-700 shadow-sm transition-all group/container">
              <div className="relative mb-8">
                <div onClick={() => { if (checkAuth()) setShowForm(true); }} className="cursor-pointer relative z-10 w-24 h-24 bg-gradient-to-b from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/30 transform transition-all duration-500 group-hover/container:scale-110 group-hover/container:rotate-3">
                  <span className="text-white text-5xl font-extralight transition-transform group-hover/container:rotate-90 duration-500">+</span>
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">Ready for your first hunt?</h3>
              <p className="text-slate-500 dark:text-gray-400 max-w-[280px] text-sm leading-relaxed mb-8">Your watchlist is a blank canvas. Drop a product link here and let us handle the price stalking.</p>
              <button onClick={() => { if (checkAuth()) setShowForm(true); }} className="px-10 py-4 bg-slate-900 dark:bg-white dark:text-gray-900 text-white font-black rounded-2xl transition-all active:scale-95 hover:shadow-2xl">Add Your First Item</button>
            </div>
          )}
        </div>

       {selectedProduct && ( <PriceHistoryModal 
  product={selectedProduct} 
  theme={theme} 
  onClose={() => setSelectedProduct(null)} 
/>
)}
      </div>
    );
  };

  return (
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