// App.js
import { useState } from "react";
import Navbar from "./components/Navbar";
import AddProduct from "./components/addProductForm";
import StatsSummary from "./components/statsSummary";


function App() {
  const [showForm,setShowForm]=useState(false);
  const [products,setProducts]=useState([])

const handleDeleteProduct = (indexToDelete) => {
  const confirmed = window.confirm("Are you sure you want to delete this product?");
  if (confirmed) {
    setProducts(products.filter((_, index) => index !== indexToDelete));
  }
};

  function handleToggleForm(){
       setShowForm(prev=>!prev)
       console.log(showForm)
  }

  const handleUpdatePrice = (indexToUpdate) => {
  const newPrice = prompt("Enter new price:");
  if (!newPrice || isNaN(newPrice)) return;

  setProducts(prevProducts =>
    prevProducts.map((p, i) => {
      if (i === indexToUpdate) {
        const oldPrice = p.price;
        const percentChange = ((newPrice - oldPrice) / oldPrice) * 100;
        const roundedChange = Math.round(percentChange * 10) / 10;
        return { ...p, price: Number(newPrice), change: roundedChange };
      }
      return p;
    })
  );
};


  function handleAddProduct(product){
        const formattedProduct={
          name:product.name,
          url:product.url,
          price:Number(product.targetPrice) ,
          change:5
        };
        setProducts([...products,formattedProduct])
        setShowForm(false)
         console. log("Tracked Product:", formattedProduct);    
  }
const totalChange = products.reduce((acc, product) => acc + product.change, 0);
const avgChange = products.length
  ? Math.round((totalChange / products.length) * 10) / 10
  : 0;



  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar onAddProductClick={handleToggleForm} />
      {showForm && 
     ( <div className=" fixed bg-black bg-opacity-50 flex justify-center items-center z-50 inset-0 ">   
         <div className = "bg-white rounded-xl p-6 max-w-md w-full relative shadow-lg">
          <button
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 text-xl "
              onClick={handleToggleForm}
            >
              ✕
            </button>
            <AddProduct handleAddProduct={handleAddProduct} />
        </div>
     
        </div> )}


<div className="max-w-md mx-auto mt-8 space-y-4">
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
  className="bg-white p-4 rounded-2xl shadow-md flex justify-between items-center"
>
  <div>
    <h3 className="text-gray-800 font-semibold">{product.name}</h3>
    <p className="text-lg font-bold">${product.price}</p>
   
    <p className="text-blue-500 text-sm cursor-pointer mt-1">
      View History
    </p>
  </div>

  <div className="flex items-center gap-2">
    <div className={`font-semibold px-3 py-1 rounded-full ${changeColor}`}>
      {changeSymbol}
    </div>  <button
      onClick={() => handleUpdatePrice(index)}
      className="text-red-500 hover:text-red-900 text-md font-bold pl-4"
    >
   Update Price
    </button>
    <button
      onClick={() => handleDeleteProduct(index)}
      className="text-red-500 hover:text-red-900 text-md font-bold pl-4"
    >
      ✕
    </button>
   

  </div>
</div>

    );
  })}
</div>

    

       </div>


     
   
  );
}

export default App;
