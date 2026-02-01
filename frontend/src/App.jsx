import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import toast, { Toaster } from 'react-hot-toast'; // Merged imports

import StatsSummary from "./components/statsSummary";
import Login from "./components/login"; 
import Signup from "./components/signup";
import AddProduct from "./components/addProductForm"; 
import PriceHistoryModal from "./components/dashboard/PriceHistoryModal";
import DeleteModal from "./components/dashboard/DeleteModal";
import ProductCard from "./components/dashboard/ProductCard";
import EmptyState from "./components/dashboard/EmptyState";
import LoadingSkeleton from "./components/dashboard/LoadingSkeleton";
import FirstItemCTA from "./components/dashboard/FirstItemCTA";
import API from "./api";
// import axios from 'axios'; // Removed: Use your 'API' instance instead for consistency

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
  return token ? children : <Navigate to="/login" replace />;
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
  const [itemToDelete, setItemToDelete] = useState(null); 

  // Simplified: Since routes are protected, checkAuth is mostly for logging out expired sessions
  const checkAuth = () => {
    if (!token) {
      toast.error("Please login to continue");
      return false;
    }
    return true;
  };

  const handleLogout = () => {
    localStorage.clear(); // Clears token, userName, and theme in one go
    setToken(null);
    setUserName("");
    setProducts([]);
  };

  // FETCH PRODUCTS - Using the API instance
  const fetchProducts = async () => {
    if (!token) return setLoading(false);
    setLoading(true);
    try {
      // Consistency: Use API instance instead of raw axios
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Fetch failed:", err);
      if (err.response?.status === 401) handleLogout(); // Auto logout if token expires
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  // THEME EFFECT
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");

  // CRUD OPERATIONS
  const handleUpdateProduct = async (updatedProduct) => {
    const previousProducts = [...products];
    setProducts(prev => prev.map(p => p._id === editingProduct._id ? { ...p, ...updatedProduct } : p));
    setShowForm(false);
    setEditingProduct(null);

    try {
      const res = await API.put(`/products/${editingProduct._id}`, updatedProduct);
      setProducts(prev => prev.map(p => p._id === editingProduct._id ? res.data : p));
      toast.success("Updated!");
    } catch (err) {
      setProducts(previousProducts);
      toast.error("Update failed.");
    }
  };

  const handleAddProduct = async (product) => {
    const tempId = Date.now().toString();
    setProducts([...products, { ...product, _id: tempId, change: 0, history: [] }]);
    setShowForm(false);
    try {
      const res = await API.post("/products", product);
      setProducts(prev => prev.map(p => p._id === tempId ? res.data : p));
      toast.success("Tracking started!");
    } catch (err) {
      setProducts(prev => prev.filter(p => p._id !== tempId));
      toast.error("Failed to add.");
    }
  };

  // STATS
  const avgChange = products.length 
    ? Math.round((products.reduce((acc, p) => acc + (Number(p.change) || 0), 0) / products.length) * 10) / 10 
    : 0;

  const Dashboard = () => {
    const navigate = useNavigate();
    return (
      <div className="min-h-screen bg-[#F0F4F8] dark:bg-gray-900 transition-colors duration-300">
        <Navbar 
          theme={theme} 
          toggleTheme={toggleTheme} 
          onAddProductClick={() => setShowForm(true)}
          onLogout={handleLogout} 
          userName={userName} 
          token={token} 
        />

        {itemToDelete && (
          <DeleteModal 
            isOpen={!!itemToDelete} 
            onCancel={() => setItemToDelete(null)} 
            onConfirm={async () => {
                const id = itemToDelete;
                setItemToDelete(null);
                try {
                    await API.delete(`/products/${id}`);
                    setProducts(prev => prev.filter(p => p._id !== id));
                    toast.success("Removed");
                } catch { toast.error("Delete failed"); }
            }} 
          />
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white/80 dark:bg-gray-900 rounded-[2.5rem] p-6 w-full max-w-md relative shadow-2xl border border-white/20">
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
    <LoadingSkeleton />
  ) : products.length > 0 ? (
    // 1. Show the products if they exist
    products.map((product) => (
      <ProductCard 
        key={product._id} 
        product={product} 
        onViewHistory={setSelectedProduct}
        onEdit={(p) => { setEditingProduct(p); setShowForm(true); }}
        onDelete={setItemToDelete}
      />
    ))
  ) : token ? (
    // 2. Logged in but no products yet
    <FirstItemCTA onAddClick={() => setShowForm(true)} />
  ) : (
    // 3. Not logged in -> SHOW THE HERO SECTION
    <EmptyState 
      onSignup={() => navigate("/signup")} 
      onLogin={() => navigate("/login")} 
    />
  )}
</div>

        {selectedProduct && ( 
          <PriceHistoryModal 
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
      <Toaster position="top-center" />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login setToken={(data) => {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userName", data.user.name);
            setToken(data.token);
            setUserName(data.user.name);
        }} />} />
        {/* Simplified Routes */}
        <Route path="/" element={<Dashboard /> } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;