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
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");

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

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

useEffect(() => {
  const fetchProducts = async () => {
    try {
      // Use the 'token' variable from your state
      if (!token) {
        // --- GUEST MODE: Show Dummy Data ---
        setProducts([
          { _id: '1', name: 'Sample Rolex Watch', currentPrice: 12000, targetPrice: 10000, change: -2.5, history: [] },
          { _id: '2', name: 'Sample Nike Dunk Low', currentPrice: 110, targetPrice: 90, change: 5.2, history: [] },
          { _id: '3', name: 'Sample MacBook Pro M3', currentPrice: 1999, targetPrice: 1750, change: 0, history: [] }
        ]);
        return;
      }

      // --- USER MODE: Fetch Real Data ---
      const res = await axios.get("https://pricewatch-4n3q.onrender.com/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  fetchProducts();
}, [token]); // Runs whenever the user logs in or out

  const totalChange = products.reduce((acc, p) => acc + (Number(p.change) || 0), 0);
  const avgChange = products.length ? Math.round((totalChange / products.length) * 10) / 10 : 0;

  // --- RENDER HELPERS ---
  const Dashboard = () => (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
<Navbar 
  theme={theme} 
  toggleTheme={toggleTheme} 
 onAddProductClick={() => {
  if (checkAuth()) setShowForm(true);
}}
  onLogout={handleLogout} 
  userName={userName} 
  token={token} // 👈 Add this so Navbar knows if someone is logged in
/>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md relative shadow-lg border dark:bg-gray-900 dark:border-white">
            <button className="absolute top-3 right-3 text-gray-500 dark:text-gray-200" onClick={() => { setShowForm(false); setEditingProduct(null); }}>✕</button>
            <AddProduct 
              handleAddProduct={editingProduct ? handleUpdateProduct : handleAddProduct} 
              initialData={editingProduct} 
              isEditing={!!editingProduct} 
              onClose={() => { setShowForm(false); setEditingProduct(null); }} 
            />
          </div>
        </div>
      )}

      <div className="w-full max-w-3xl mx-auto mt-8 space-y-4 px-4">
        <StatsSummary totalItems={products.length} avgChange={avgChange} />
        {products.map((product) => {
          const isPositive = product.change > 0;
          const isNegative = product.change < 0;
          const changeColor = isPositive ? "bg-red-100 text-red-600" : isNegative ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-700";
          return (
            <div key={product._id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center w-full transition-colors">
              <div className="flex-1">
                <h3 className="text-gray-800 dark:text-white font-semibold text-lg">{product.name}</h3>
                <div className="flex items-center gap-2"><span className="dark:text-gray-200">💰 Current:</span><span className="text-green-600 font-bold">${product.currentPrice}</span></div>
                <div className="flex items-center gap-2"><span className="dark:text-gray-200">🎯 Target:</span><span className="text-blue-600 font-bold">${product.targetPrice}</span></div>
                <p className="text-blue-500 cursor-pointer text-sm" onClick={() => setSelectedProduct(product)}>View History</p>
              </div>
              <div className="flex items-center gap-2 mt-3 sm:mt-0">
                <div className={`font-semibold px-3 py-1 rounded-full ${changeColor}`}>{isPositive ? '+' : ''}{product.change}%</div>
                <button onClick={() => handleEditProduct(product)} className="text-blue-500 font-bold pl-2">Edit</button>
                <button onClick={() => handleDeleteProduct(product._id)} className="text-red-500 font-bold pl-2">✕</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* History Modal Logic stays exactly the same as your snippet... */}
      {selectedProduct && (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-2">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-lg relative overflow-auto max-h-[90vh]">
                <button className="absolute top-4 right-4 text-2xl dark:text-white" onClick={() => setSelectedProduct(null)}>✕</button>
                <h2 className="text-2xl font-bold mb-5 dark:text-white text-center">{selectedProduct.name} History</h2>
                {/* Chart and list logic here... */}
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








// // App.js
// import React from "react";
// import { useEffect } from "react";
// import { useState } from "react";
// import Navbar from "./components/Navbar";
// import AddProduct from "./components/addProductForm";
// import StatsSummary from "./components/statsSummary";
// import { Line } from "react-chartjs-2";
// import API from "./api";

// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// // Register chart components (required for Chart.js 4+)
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// function App() {
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [products, setProducts] = useState([]);
//   const [theme, setTheme] = useState(() => {
//     return localStorage.getItem("theme") || "light";
//   });

//   const [editingProduct, setEditingProduct] = useState(null);


//   const chartOptions = {
//     responsive: true,
//     plugins: { legend: { display: false } },
//     scales: {
//       x: {
//         ticks: { display: false },
//         grid: { drawTicks: false, drawBorder: false },
//       },
//       y: { beginAtZero: false },
//     },
//   };

//   const handleUpdateProduct = async (updatedProduct) => {
//   try {
//     const res = await API.put(`/products/${editingProduct.id}`, updatedProduct);

//     setProducts((prev) =>
//       prev.map((p) => (p.id === editingProduct.id ? res.data : p))
//     );

//     setEditingProduct(null);
//     setShowForm(false);
//   } catch (err) {
//     console.error("Update failed:", err);
//   }
// };


//   const handleDeleteProduct = async (id) => {
//     const confirmed = window.confirm(
//       "Are you sure you want to delete this product?"
//     );
//     if (!confirmed) return;

//     try {
//       await API.delete(`/products/${id}`); // ✅ use id, not index
//       setProducts((prev) => prev.filter((p) => p.id !== id)); // ✅ filter by id
//     } catch (err) {
//       console.error("Failed to delete product:", err);
//     }
//   };

//   function handleToggleForm() {
//     setShowForm((prev) => !prev);
//     console.log(showForm);
//   }

//   const handleEditProduct = (product) => {
//   setEditingProduct(product); // open the modal with the selected product
//   setShowForm(true); // reuse the same modal
// };


//   // const handleUpdatePrice = async (product) => {
//   //   const newPrice = Number(prompt("Enter new price:"));
//   //   if (!newPrice) return;

//   //   try {
//   //     const res = await API.put(`/products/${product.id}`, {
//   //       currentPrice: newPrice,
//   //     });

//   //     setProducts((prev) =>
//   //       prev.map((p) => (p.id === product.id ? res.data : p))
//   //     );
//   //   } catch (err) {
//   //     console.error("Update failed:", err);
//   //   }
//   // };

//   // const handleUpdatePrice = (indexToUpdate) => {
//   //   const newPrice = prompt("Enter new price:");
//   //  if (oldPrice === null || isNaN(oldPrice)) return p; // safer

//   //   setProducts((prevProducts) =>
//   //     prevProducts.map((p, i) => {
//   //       if (i === indexToUpdate) {
//   //         const oldPrice = Number(p.currentPrice);  // ✔ correct field

//   //         if (!oldPrice || oldPrice === 0) return p; // prevent Infinity

//   //         const percentChange = ((newPrice - oldPrice) / oldPrice) * 100;
//   //         const roundedChange = Math.round(percentChange * 10) / 10;

//   //         const newHistoryEntry = {
//   //           oldPrice,
//   //           newPrice: Number(newPrice),
//   //           change: roundedChange,
//   //           date: new Date().toLocaleString(),
//   //         };

//   //         return {
//   //           ...p,
//   //           currentPrice: Number(newPrice),  // ✔ FIXED
//   //           change: roundedChange,
//   //           history: [...(p.history || []), newHistoryEntry],
//   //         };
//   //       }
//   //       return p;
//   //     })
//   //   );
//   // };

//   const handleAddProduct = async (product) => {
//     const formattedProduct = {
//       name: product.name,
//       url: product.url,
//       targetPrice: Number(product.targetPrice),
//       currentPrice: Number(product.currentPrice),
//       change: 1, // initial change
//       history: [], // empty initially
//     };
//     try {
//       const res = await API.post("/products", formattedProduct);
//       setProducts([...products, res.data]);
//       setShowForm(false);
//     } catch (err) {
//       console.error("err");
//     }
//   };
//   const totalChange = products.reduce(
//     (acc, product) => acc + (Number(product.change) || 0),
//     0
//   );

//   const avgChange = products.length
//     ? Math.round((totalChange / products.length) * 10) / 10
//     : 0;

//   // ################  //DARKMODE

//   const toggleTheme = () => {
//     setTheme((prev) => (prev === "light" ? "dark" : "light"));
//   };

//   useEffect(() => {
//     if (theme === "dark") {
//       document.documentElement.classList.add("dark"); // add class to <html>
//     } else {
//       document.documentElement.classList.remove("dark");
//     }
//     localStorage.setItem("theme", theme); // save preference
//   }, [theme]);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const res = await API.get("/products");
//         setProducts(res.data); // ✅ populate state from backend
//       } catch (err) {
//         console.error("Failed to fetch products:", err);
//       }
//     };

//     fetchProducts();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
//       <Navbar
//         theme={theme}
//         toggleTheme={toggleTheme}
//         onAddProductClick={handleToggleForm}
//       />

      
//      {showForm && (
//   <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-auto">
//     <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md relative shadow-lg border dark:bg-gray-900 dark:border-white">
//       <button
//         className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl dark:text-gray-200"
//         onClick={() => {
//           setShowForm(false);
//           setEditingProduct(null);
//         }}
//       >
//         ✕
//       </button>

//       <AddProduct
//         handleAddProduct={editingProduct ? handleUpdateProduct : handleAddProduct}
//         initialData={editingProduct || null}
//         isEditing={!!editingProduct}
//         onClose={() => {
//           setShowForm(false);
//           setEditingProduct(null);
//         }}
//       />
//     </div>
//   </div>
// )}


//       <div className="w-full max-w-3xl mx-auto mt-8 space-y-4 px-4 sm:px-6 lg:px-8 ">
//         {/* Stats Summary at the top */}
//         <StatsSummary totalItems={products.length} avgChange={avgChange} />

//         {/* Product List */}

//         {products.map((product, index) => {
//           const isPositive = product.change > 0;
//           const isNegative = product.change < 0;

//           const changeColor = isPositive
//             ? "bg-red-100 text-red-600"
//             : isNegative
//             ? "bg-green-100 text-green-600"
//             : "bg-gray-200 text-gray-700";

//           const changeSymbol = isPositive
//             ? `+${product.change}%`
//             : isNegative
//             ? `${product.change}%`
//             : "0%";

//           return (
//             <div
//               key={index}
//               className="bg-white dark:bg-gray-800 p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center w-full transition-colors"
//             >
//               {/* Product Info */}
//               <div className="flex-1">
//                 <h3 className="text-gray-800 dark:text-white font-semibold text-lg sm:text-xl md:text-2xl">
//                   {product.name}
//                 </h3>
//                 <div className="flex items-center gap-2  dark:px-3 py-2 rounded-xl shadow-sm">
//                   <span className="text-gray-700 dark:text-gray-200 font-semibold">
//                     💰 Current Price:
//                   </span>
//                   <span className="text-green-600 dark:text-green-300 font-bold">
//                     ${product.currentPrice}
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-2 dark: px-3 py-2 rounded-xl shadow-sm">
//                   <span className="text-gray-700 dark:text-gray-200 font-semibold">
//                     🎯 Target Price:
//                   </span>
//                   <span className="text-blue-600 dark:text-blue-300 font-bold">
//                     ${product.targetPrice}
//                   </span>
//                 </div>

//                 {/* View History Button */}
//                 <p
//                   className="text-blue-500 dark:text-blue-400 text-sm sm:text-base cursor-pointer mt-1"
//                   onClick={() => setSelectedProduct(product)}
//                 >
//                   View History
//                 </p>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex items-center gap-2 mt-3 sm:mt-0">
//                 <div
//                   className={`font-semibold px-3 py-1 sm:px-4 sm:py-2 rounded-full ${changeColor} transition-colors`}
//                 >
//                   {changeSymbol}
//                 </div>
//              <button
//   onClick={() => handleEditProduct(product)}
//   className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm sm:text-md font-bold pl-2 sm:pl-4 transition-colors"
// >
//   Edit
// </button>
//                 <button
//                   onClick={() => handleDeleteProduct(product.id)}
//                   className="text-red-500 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 text-sm sm:text-md font-bold pl-2 sm:pl-4 transition-colors"
//                 >
//                   ✕
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {selectedProduct && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 animate-fadeIn p-2 sm:p-0">
//           <div
//             className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900
//                  p-4 sm:p-6 rounded-2xl w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl
//                  relative shadow-2xl dark:shadow-black/50 transform transition-all scale-95 animate-scaleUp
//                  overflow-auto max-h-[90vh]"
//           >
//             {/* Close Button */}
//             <button
//               className="absolute top-2 sm:top-4 right-2 sm:right-4 text-lg sm:text-2xl font-bold
//                    text-gray-400 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white
//                    transition-colors"
//               onClick={() => setSelectedProduct(null)}
//             >
//               ✕
//             </button>

//             {/* Header */}
//             <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-5 text-gray-800 dark:text-white text-center">
//               {selectedProduct.name} Price History
//             </h2>

//             {/* Chart */}
//             {selectedProduct.history.length > 0 &&
//               (() => {
//                 const chartData = {
//                   labels: [
//                     selectedProduct.history.length > 0
//                       ? selectedProduct.history[0].date
//                       : new Date().toLocaleString(),
//                     ...selectedProduct.history.map((h) => h.date),
//                   ],
//                   datasets: [
//                     {
//                       label: "Price",
//                       data: [
//                         selectedProduct.history.length > 0
//                           ? selectedProduct.history[0].oldPrice
//                           : selectedProduct.price, //change to current price
//                         ...selectedProduct.history.map((h) => h.newPrice),
//                       ],
//                       borderColor: "rgba(59, 130, 246, 1)",
//                       backgroundColor: "rgba(59, 130, 246, 0.2)",
//                       tension: 0.3,
//                       fill: true,
//                     },
//                   ],
//                 };

//                 const chartOptions = {
//                   responsive: true,
//                   maintainAspectRatio: false,
//                   plugins: { legend: { display: false } },
//                   scales: {
//                     x: {
//                       ticks: { display: false },
//                       grid: {
//                         drawTicks: false,
//                         drawBorder: false,
//                         color: "rgba(203, 213, 225, 0.3)",
//                       }, // light gray grid
//                     },
//                     y: {
//                       beginAtZero: false,
//                       grid: { color: "rgba(203, 213, 225, 0.3)" },
//                     },
//                   },
//                 };

//                 return (
//                   <div className="mb-4 h-44 sm:h-64 md:h-72 lg:h-80">
//                     <Line data={chartData} options={chartOptions} />
//                   </div>
//                 );
//               })()}

//             {/* Price History List */}
//             {selectedProduct.history.length ? (
//               <ul className="space-y-3 max-h-40 sm:max-h-80 overflow-y-auto px-2">
//                 {selectedProduct.history.map((h, idx) => (
//                   <li
//                     key={idx}
//                     className="border border-gray-200 dark:border-gray-700 p-3 rounded-xl
//                          bg-white dark:bg-gray-800 shadow hover:shadow-lg dark:hover:shadow-black/40
//                          transition-shadow"
//                   >
//                     <p className="font-medium text-gray-700 dark:text-gray-300">
//                       Old: ${h.oldPrice}
//                     </p>
//                     <p className="font-medium text-gray-800 dark:text-white">
//                       New: ${h.newPrice}
//                     </p>
//                     <p
//                       className={`font-semibold ${
//                         h.change > 0
//                           ? "text-green-600 dark:text-green-400"
//                           : "text-red-600 dark:text-red-400"
//                       }`}
//                     >
//                       Change: {h.change}%
//                     </p>
//                     <p className="text-gray-400 dark:text-gray-500 text-sm">
//                       {h.date}
//                     </p>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p className="text-gray-500 dark:text-gray-400 text-center">
//                 No history yet.
//               </p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;
