const initPriceTracker = require('./jobs/priceTracker');

const express = require('express');
const app = express();
const cors=require('cors')
const jwt = require('jsonwebtoken'); 
const connectDB=require('./config/db')
const Product=require('./models/product')
const User=require("./models/User")

require('dotenv').config();

app.use(cors());
app.use(express.json());

// In-memory database




// Connect to MongoDB
connectDB();


const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Store the user ID so the routes can use it
    next();
  } catch (error) {
    res.status(401).json({ message: "Access denied. Please log in." });
  }
};
// 🟢 GET all products
// 🟢 GET all products
app.get('/products', auth, async (req, res) => {
  try {
    const products = await Product.find({owner:req.userId}); // fetch all products from MongoDB
    res.json(products); // send them as JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});




// 🟡 POST add new product
// 🟡 POST add new product
app.post('/products', auth,async (req, res) => {
  const { name, url, targetPrice, currentPrice } = req.body;

  if (!name || !url || !targetPrice) {
    return res.status(400).json({ message: "Name, URL, and targetPrice are required!" });
  }

  try {
    const newProduct = new Product({
      name,
      url,
      targetPrice,
      currentPrice: currentPrice || null,
      owner: req.userId,
      change: 0,   // start at 0% change
      history: []  // empty history
    });

    const savedProduct = await newProduct.save(); // save to MongoDB
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add product" });
  }
});


// 🔵 PUT update product (Secure Version)
app.put('/products/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { name, url, targetPrice, currentPrice } = req.body;

  try {
    // 1. Find the product by ID and ensure it belongs to the logged-in user
    const product = await Product.findOne({ _id: id, owner: req.userId });
    
    if (!product) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }

    // 2. Update simple fields if they are provided in the request
    if (name) product.name = name;
    if (url) product.url = url;
    if (targetPrice) product.targetPrice = targetPrice;

    // 3. Update price & history logic
    if (currentPrice && currentPrice > 0) {
      const oldPrice = product.currentPrice || 0;
      const newPrice = Number(currentPrice);

      if (oldPrice > 0) {
        const percentChange = ((newPrice - oldPrice) / oldPrice) * 100;
        const roundedChange = Math.round(percentChange * 10) / 10;

        product.history.push({
          oldPrice,
          newPrice,
          change: roundedChange,
          date: new Date()
        });

        product.change = roundedChange;
      }

      product.currentPrice = newPrice;
    }

    // 4. Save the changes to MongoDB
    const updatedProduct = await product.save();
    res.json(updatedProduct);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// 🔴 DELETE remove product (Secure Version)
app.delete('/products/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    // We search for the product by ID AND ensure the owner is the current user
    const deletedProduct = await Product.findOneAndDelete({ 
      _id: id, 
      owner: req.userId 
    });

    if (!deletedProduct) {
      return res.status(404).json({ 
        message: "Product not found or you do not have permission to delete it" 
      });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete product" });
  }
});



app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("Attempting signup for:", email); // Log the email to Render console
    
    const user = new User({ name, email, password });
    await user.save();
    
    res.status(201).json({ message: "user created successfully" });
  } catch (error) {
    console.error("SIGNUP ERROR DETAILS:", error); // Check Render logs for this!
    res.status(400).json({ 
      error: "Signup failed", 
      details: error.message // This will tell you if it's a validation or connection error
    });
  }      
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }); // Added .toLowerCase() for safety
    if (!user) return res.status(404).json({ message: "User not found" });

    // --- DEBUG LOGS START ---
    console.log("DEBUG: Login attempt for:", email);
    console.log("DEBUG: Password from frontend:", password);
    console.log("DEBUG: Hashed password in DB:", user.password);
    // --- DEBUG LOGS END ---

    // 2. Check if password is correct
    const isMatch = await user.comparePassword(password);
    
    console.log("DEBUG: Does Bcrypt match?:", isMatch);

    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // 3. Create a token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  } 
});



const PORT = process.env.PORT || 5000;

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Launch the tracker!
  initPriceTracker(); 
});