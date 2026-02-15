const { chromium } = require('playwright');

async function scrapePrice(url) {
  try { new URL(url); } catch (e) { return null; }

  const browser = await chromium.launch({ 
    headless: true, 
    args: ['--disable-blink-features=AutomationControlled']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  try {
    console.log(`📡 Navigating to: ${url.substring(0, 40)}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // 1. PRIORITY SELECTORS: These target the MAIN listing price only.

    const prioritySelectors = [
      'div[data-testid="x-price-primary"]', 
      '#prcIsum',                           
      '.x-price-primary'                    
    ];

    let priceText = null;

    // 2. Try to find the MAIN price first
    for (const selector of prioritySelectors) {
      try {
        const element = await page.waitForSelector(selector, { timeout: 5000 });
        if (element) {
          priceText = await element.innerText();
          console.log(`✅ Found Main Price via ${selector}: ${priceText}`);
          break;
        }
      } catch (e) {
        continue; 
      }
    }

    // 3. FALLBACK: Only if priority selectors fail, look for anything price-like
    if (!priceText) {
      console.log("⚠️ Priority selectors failed, trying fallback...");
      const fallbackSelector = '.a-price-whole, .price_color, span:has-text("$")';
      priceText = await page.$eval(fallbackSelector, el => el.innerText).catch(() => null);
    }

    if (!priceText) throw new Error("Price element not found");

    // 4. CLEANING: Remove "US", "$", "ea", and spaces.
    // This regex grabs only the digits and the decimal point.
    const cleanPriceMatch = priceText.match(/\d+\.\d{2}/);
    const cleanPrice = cleanPriceMatch ? parseFloat(cleanPriceMatch[0]) : null;

    console.log(`💰 Final Scraped Price: ${cleanPrice}`);
    
    await browser.close();
    return cleanPrice;

  } catch (error) {
    console.error(`⚠️ Scrape Error: ${error.message}`);
    await browser.close();
    return null;
  }
}

module.exports = { scrapePrice };