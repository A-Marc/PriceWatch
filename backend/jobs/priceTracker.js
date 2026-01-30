const cron = require('node-cron');
const Product = require('../models/product');
const { scrapePrice } = require('../services/scraper');

const initPriceTracker = () => {
  // Runs every 30 minutes. For testing, use '*/1 * * * *' (every minute)
 cron.schedule('*/30 * * * *', async () => {
    console.log('--- 🤖 Price Check Started ---');
    const products = await Product.find();
    console.log(`📂 Database contains ${products.length} items.`); // ADD THIS

    for (const product of products) {
        console.log(`🔎 Processing: ${product.name}`); // ADD THIS
        const newPrice = await scrapePrice(product.url);

      if (newPrice) {
        console.log(`Updated ${product.name}: ${product.currentPrice} -> ${newPrice}`);
        
        // Update price in DB
        product.currentPrice = newPrice;
        
        // Logic: If new price <= target price, we will add notification here later!
        if (newPrice <= product.targetPrice) {
          console.log(`!!! ALERT: ${product.name} hit target price!`);
        }

        await product.save();
      }
    }
    console.log('--- ✅ Price Check Finished ---');
  });
};

module.exports = initPriceTracker;