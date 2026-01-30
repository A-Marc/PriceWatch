const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
   
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error occured:", err);
    process.exit(1); // exit process if DB connection fails
  }
};

module.exports = connectDB;
