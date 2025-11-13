const express = require('express');
const app = express();
const cors=require('cors')


app.use(express.json());
app.use(cors())
// In-memory database
let products = [];

// 🟢 GET all products
app.get('/products', (req, res) => {
  res.json(products); // send back all products as JSON
});


// 🟡 POST add new product
app.post('/products', (req, res) => {
  const { name, url, targetPrice, currentPrice } = req.body;

  if (!name || !url || !targetPrice) {
    return res.status(400).json({ message: "Name, URL, and targetPrice are required!" });
  }

const newProduct = {
  id: products.length + 1,
  name,
  url,
  targetPrice,
  currentPrice: currentPrice || null,
  change: 0,       // start at 0% change
  history: []      // always start with empty history
};


  products.push(newProduct);
  res.status(201).json(newProduct);
});


// 🔵 PUT update product (like when price changes)
app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Update fields if provided
  if (req.body.name) product.name = req.body.name;
  if (req.body.url) product.url = req.body.url;
  if (req.body.targetPrice) product.targetPrice = req.body.targetPrice;
  if (req.body.currentPrice) product.currentPrice = req.body.currentPrice;

  res.json(product);
});

// 🔴 DELETE remove product
app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) return res.status(404).json({ message: "Product not found" });

  products = products.filter(p => p.id !== id);
  res.json({ message: "Product deleted successfully" });
});

// 🚀 Start server
app.listen(3000, () => {
  console.log("Price Watcher API running on http://localhost:3000");
});
