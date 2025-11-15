import React, { useState, useEffect } from "react";

function AddProduct({ handleAddProduct, initialData = null, isEditing = false, onClose }) {
  // Use initialData if editing, otherwise empty
  const [name, setName] = useState(initialData?.name || "");
  const [url, setUrl] = useState(initialData?.url || "");
  const [targetPrice, setTargetPrice] = useState(initialData?.targetPrice || "");
  const [currentPrice, setCurrentPrice] = useState(initialData?.currentPrice || "");

  // Reset form if initialData changes (important for editing multiple items)
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

    // Validate numeric fields
    const formattedProduct = {
      name,
      url,
      targetPrice: Number(targetPrice),
      currentPrice: Number(currentPrice),
    };

    handleAddProduct && handleAddProduct(formattedProduct);

    // Reset form only if adding new product
    if (!isEditing) {
      setName("");
      setUrl("");
      setTargetPrice("");
      setCurrentPrice("");
    }

    // Optionally close modal after edit
    onClose && onClose();
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mt-8">
      <h2 className="text-2xl font-semibold mb-6 text-center dark:text-white">
        {isEditing ? "Edit Product" : "Track a Product"}
      </h2>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 
                     dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 transition-colors"
        />

        <input
          type="text"
          placeholder="Product URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 
                     dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 transition-colors"
        />

        <input
          type="text"
          placeholder="Target Price"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          required
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 
                     dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 transition-colors"
        />

        <input
          type="text"
          placeholder="Current Price"
          value={currentPrice}
          onChange={(e) => setCurrentPrice(e.target.value)}
          required
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 
                     dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 transition-colors"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors shadow-md dark:shadow-none"
        >
          {isEditing ? "Update Product" : "Track Product"}
        </button>
      </form>
    </div>
  );
}

export default AddProduct;
