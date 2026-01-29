const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    url: { 
        type: String, 
        required: true 
    },
    targetPrice: { 
        type: Number, 
        required: true 
    },
    currentPrice: { 
        type: Number 
    },
    change: { 
        type: Number, 
        default: 0 
    },
    // This links the product to a specific user
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    history: [
        {
            oldPrice: Number,
            newPrice: Number,
            change: Number,
            date: {
                type: Date, // Capital 'D' for Mongoose Date type
                default: Date.now
            }
        }
    ]
});

module.exports = mongoose.model("Product", ProductSchema);