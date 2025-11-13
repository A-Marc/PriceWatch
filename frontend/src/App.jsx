// App.js
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import Navbar from "./components/Navbar";
import AddProduct from "./components/addProductForm";
import StatsSummary from "./components/statsSummary";
import { Line } from "react-chartjs-2";
import API from "./api";



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

// Register chart components (required for Chart.js 4+)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
   const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        ticks: { display: false },
        grid: { drawTicks: false, drawBorder: false },
      },
      y: { beginAtZero: false },
    },
  };


  const handleDeleteProduct = (indexToDelete) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (confirmed) {
      setProducts(products.filter((_, index) => index !== indexToDelete));
    }
  };

  function handleToggleForm() {
    setShowForm((prev) => !prev);
    console.log(showForm);
  }

  const handleUpdatePrice = (indexToUpdate) => {
    const newPrice = prompt("Enter new price:");
    if (!newPrice || isNaN(newPrice)) return;

    setProducts((prevProducts) =>
      prevProducts.map((p, i) => {
        if (i === indexToUpdate) {
          const oldPrice = p.currentPrice;
          const percentChange = ((newPrice - oldPrice) / oldPrice) * 100;
          const roundedChange = Math.round(percentChange * 10) / 10;

          // Create new history entry
          const newHistoryEntry = {
            oldPrice,
            newPrice: Number(newPrice),
            change: roundedChange,
            date: new Date().toLocaleString(),
          };

          return {
            ...p,
            price: Number(newPrice),
            change: roundedChange,
           history: [...(p.history || []), newHistoryEntry],

          };
        }
        return p;
      })
    );
  };


  const handleAddProduct = async (product) => {
    const formattedProduct = {
      name: product.name,
      url: product.url,
      targetPrice: Number(product.targetPrice),
      currentPrice: Number(product.currentPrice),
      change: 1, // initial change
      history: [], // empty initially
    };
  try{
    const res=await API.post('/products',formattedProduct)
    setProducts([...products, res.data])
    setShowForm(false);
   


  }catch(err){
    console.error("err")
  }
    

  }
const totalChange = products.reduce(
  (acc, product) => acc + (Number(product.change) || 0),
  0
);

const avgChange = products.length
  ? Math.round((totalChange / products.length) * 10) / 10
  : 0;


      // ################  //DARKMODE

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark"); // add class to <html>
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme); // save preference
  }, [theme]);



useEffect(() => {
  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data); // ✅ populate state from backend
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  fetchProducts();
}, []);



  return (
   <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        onAddProductClick={handleToggleForm}
      />
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-auto border-gray-300 dark:border-white
">
     <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md relative shadow-lg border dark:bg-gray-900 dark:border-2-white">
  
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl dark:text-gray-200"
              onClick={handleToggleForm}
            >
              ✕
            </button>
            <AddProduct handleAddProduct={handleAddProduct} />
          </div>
        </div>
      )}

      <div className="w-full max-w-3xl mx-auto mt-8 space-y-4 px-4 sm:px-6 lg:px-8 ">
        {/* Stats Summary at the top */}
        <StatsSummary totalItems={products.length} avgChange={avgChange} />

        {/* Product List */}
        {products.map((product, index) => {
          const isPositive = product.change > 0;
          const isNegative = product.change < 0;

          const changeColor = isPositive
            ? "bg-red-100 text-red-600"
            : isNegative
            ? "bg-green-100 text-green-600"
            : "bg-gray-200 text-gray-700";

          const changeSymbol = isPositive
            ? `+${product.change}%`
            : isNegative
            ? `${product.change}%`
            : "0%";

          return (
           <div
  key={index}
  className="bg-white dark:bg-gray-800 p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center w-full transition-colors"
>
  {/* Product Info */}
  <div className="flex-1">
    <h3 className="text-gray-800 dark:text-white font-semibold text-lg sm:text-xl md:text-2xl">
      {product.name}
    </h3>
    <div className="flex items-center gap-2  dark:px-3 py-2 rounded-xl shadow-sm">
    <span className="text-gray-700 dark:text-gray-200 font-semibold">💰 Current Price:</span>
    <span className="text-green-600 dark:text-green-300 font-bold">${product.currentPrice}</span>
  </div>

  <div className="flex items-center gap-2 dark: px-3 py-2 rounded-xl shadow-sm">
    <span className="text-gray-700 dark:text-gray-200 font-semibold">🎯 Target Price:</span>
    <span className="text-blue-600 dark:text-blue-300 font-bold">${product.targetPrice}</span>
  </div>

    {/* View History Button */}
    <p
      className="text-blue-500 dark:text-blue-400 text-sm sm:text-base cursor-pointer mt-1"
      onClick={() => setSelectedProduct(product)}
    >
      View History
    </p>
  </div>

  {/* Action Buttons */}
  <div className="flex items-center gap-2 mt-3 sm:mt-0">
    <div
      className={`font-semibold px-3 py-1 sm:px-4 sm:py-2 rounded-full ${changeColor} transition-colors`}
    >
      {changeSymbol}
    </div>
    <button
      onClick={() => handleUpdatePrice(index)}
      className="text-red-500 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 text-sm sm:text-md font-bold pl-2 sm:pl-4 transition-colors"
    >
      Update Price
    </button>
    <button
      onClick={() => handleDeleteProduct(index)}
      className="text-red-500 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 text-sm sm:text-md font-bold pl-2 sm:pl-4 transition-colors"
    >
      ✕
    </button>
  </div>
</div>

          );
        })}
      </div>

    
      {selectedProduct && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 animate-fadeIn p-2 sm:p-0">
    <div
      className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900
                 p-4 sm:p-6 rounded-2xl w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl
                 relative shadow-2xl dark:shadow-black/50 transform transition-all scale-95 animate-scaleUp
                 overflow-auto max-h-[90vh]"
    >
      {/* Close Button */}
      <button
        className="absolute top-2 sm:top-4 right-2 sm:right-4 text-lg sm:text-2xl font-bold
                   text-gray-400 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white
                   transition-colors"
        onClick={() => setSelectedProduct(null)}
      >
        ✕
      </button>

      {/* Header */}
      <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-5 text-gray-800 dark:text-white text-center">
        {selectedProduct.name} Price History
      </h2>

      {/* Chart */}
      {selectedProduct.history.length > 0 &&
        (() => {
          const chartData = {
            labels: [
              selectedProduct.history.length > 0
                ? selectedProduct.history[0].date
                : new Date().toLocaleString(),
              ...selectedProduct.history.map((h) => h.date),
            ],
            datasets: [
              {
                label: "Price",
                data: [
                  selectedProduct.history.length > 0
                    ? selectedProduct.history[0].oldPrice
                    : selectedProduct.price,
                  ...selectedProduct.history.map((h) => h.newPrice),
                ],
                borderColor: "rgba(59, 130, 246, 1)",
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                tension: 0.3,
                fill: true,
              },
            ],
          };

          const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                ticks: { display: false },
                grid: { drawTicks: false, drawBorder: false, color: "rgba(203, 213, 225, 0.3)" }, // light gray grid
              },
              y: {
                beginAtZero: false,
                grid: { color: "rgba(203, 213, 225, 0.3)" },
              },
            },
          };

          return (
            <div className="mb-4 h-44 sm:h-64 md:h-72 lg:h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          );
        })()}

      {/* Price History List */}
      {selectedProduct.history.length ? (
        <ul className="space-y-3 max-h-40 sm:max-h-80 overflow-y-auto px-2">
          {selectedProduct.history.map((h, idx) => (
            <li
              key={idx}
              className="border border-gray-200 dark:border-gray-700 p-3 rounded-xl
                         bg-white dark:bg-gray-800 shadow hover:shadow-lg dark:hover:shadow-black/40
                         transition-shadow"
            >
              <p className="font-medium text-gray-700 dark:text-gray-300">
                Old: ${h.oldPrice}
              </p>
              <p className="font-medium text-gray-800 dark:text-white">
                New: ${h.newPrice}
              </p>
              <p
                className={`font-semibold ${
                  h.change > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                Change: {h.change}%
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">{h.date}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center">No history yet.</p>
      )}
    </div>
  </div>
)}


      
    </div>
  );
}

export default App;
