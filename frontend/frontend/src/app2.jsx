// App.js
import { useState } from "react";
import Navbar from "./components/Navbar";
import AddProduct from "./components/addProductForm";
import StatsSummary from "./components/statsSummary";

// inside your component return()

function App() {
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);

  const handleToggleForm = () => setShowForm(prev => !prev);

const handleAddProduct = (product) => {
  const formattedProduct = {
    name: product.name,
    url: product.url,
    price: Number(product.targetPrice) || 0, // convert to number
    change: 0, // default change value for now
  };
  setProducts([...products, formattedProduct]);
  setShowForm(false);
  console. log("Tracked Product:", formattedProduct);
};


  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onAddProductClick={handleToggleForm} />

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className = "bg-white rounded-xl p-6 max-w-md w-full relative shadow-lg">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={handleToggleForm}
            >
              ✕
            </button>
            <AddProduct handleAddProduct={handleAddProduct} />
          </div>
        </div>
      )}

<div className="max-w-md mx-auto mt-8 space-y-4">
  {/* Stats Summary at the top */}
  {/* <StatsSummary totalItems={products.length} avgChange={-1.5} /> */}

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
        className="bg-white p-4 rounded-2xl shadow-md flex justify-between items-center"
      >
        <div>
          <h3 className="text-gray-800 font-semibold">{product.name}</h3>
          <p className="text-lg font-bold">${product.price}</p>
          <p className="text-blue-500 text-sm cursor-pointer mt-1">
            View History
          </p>
        </div>

        <div className={`font-semibold px-3 py-1 rounded-full ${changeColor}`}>
          {changeSymbol}
        </div>
      </div>
    );
  })}
</div>


    </div>
  );
}

export default App;
