const puppeteer = require('puppeteer');

async function getFirstAuthors(query) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(`https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`);
    await page.waitForSelector('.gs_ri');

    const results = await page.evaluate(() => {
        const papers = [];
        const items = document.querySelectorAll('.gs_ri');

        items.forEach(item => {
            const authorsText = item.querySelector('.gs_a') ? item.querySelector('.gs_a').textContent : '';
            const firstAuthor = authorsText.split(',')[0].split(/\s*-\s*/)[0].trim();
            papers.push({ name: firstAuthor });
          });

        return papers;
    });

    await browser.close();

    return results;
}

module.exports = { getFirstAuthors };