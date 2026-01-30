const { chromium } = require('playwright');

async function scrapePrice(url) {
  try { new URL(url); } catch (e) { return null; }

const browser = await chromium.launch({ 
  headless: true, // Try turning it back on with these args
  args: [
    '--disable-blink-features=AutomationControlled',
  ]
});
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  try {
    console.log(`📡 Navigating to: ${url.substring(0, 40)}...`);
    
    // FIX: Use 'domcontentloaded' instead of 'networkidle' to avoid hanging
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const priceSelectors = [
      '.x-price-primary', '#prcIsum', '.a-price-whole', '.price_color',
      'span:has-text("$")', '.price'
    ];

    console.log(`🔍 Looking for price tags...`);
    
    const combinedSelector = priceSelectors.join(', ');
    
    // Wait for the price to appear, but don't wait forever
    await page.waitForSelector(combinedSelector, { timeout: 10000 });

    let priceText = null;
    const elements = await page.$$(combinedSelector); // Find all potential matches
    
    for (const element of elements) {
      const text = await element.innerText();
      if (text && text.match(/\d/)) { // If it has a number, it's likely the price
        priceText = text;
        break;
      }
    }

    if (!priceText) throw new Error("Price element found but was empty");

    const cleanPrice = parseFloat(priceText.replace(/[^0-9.-]+/g, ""));
    console.log(`💰 Scraped Price: ${cleanPrice}`);
    
    await browser.close();
    return cleanPrice;

  } catch (error) {
    console.error(`⚠️ Scrape Error: ${error.message}`);
    await browser.close();
    return null;
  }
}

module.exports = { scrapePrice };