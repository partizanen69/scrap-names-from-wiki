const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const pages = [
  'https://en.wikipedia.org/wiki/Category:Greek-language_surnames',
];

(async () => {
  let names = [];

  for (const pageUrl of pages) {
    const browser = await chromium.launch({
      // headless: false,
      args: [
        '--no-first-run',
      ]
    });
    const page = await browser.newPage();
    await page.goto(pageUrl);
  
    let items = await page.evaluate(() => {
      const links = document.querySelectorAll('div.mw-category li a');
  
      const names = [];
      
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        if (link.innerText) {
          names.push(link.innerText);
        };
      }
  
      return names;
    });
    
    const uniqueItems = {};
    items = items
      .map(item => {
        item = item.toLowerCase()
        .replace(/(given name)/gmi, '')
        .trim();
        
        return item.slice(0, 1).toUpperCase() + item.slice(1);
      })
      .filter(item => {
        return item.split(' ').length === 1 
          && item.indexOf('-') === -1;
      })
      .forEach(item => uniqueItems[item] = true);
    
    names = names.concat(Object.keys(uniqueItems));
    
    await browser.close();
  }

  console.log('names', names);
  
  const filePath = path.resolve(__dirname, 'names.json');
  await fs.promises.writeFile(filePath, JSON.stringify(names));
})();