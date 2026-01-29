const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // You'll need to run: npm install bcryptjs

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Name is required"],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, "Email is required"],
    unique: true, // Prevents duplicate accounts
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: [true, "Password is required"],
    minlength: 6 // Basic security check
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 🔥 ENCRYPTION: This runs automatically before saving a user
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  // Scramble the password so it's not readable in the database
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🛠️ HELPER: Function to check if password is correct during login
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);