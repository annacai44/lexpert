const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrapes Google Scholar and retrieves ONLY the first author for each paper.
 * @param {string} topic - The topic to search for.
 * @param {number} maxPages - Maximum number of pages to scrape.
 * @returns {Promise<Object>} - Object with first authors and their article URLs.
 */
async function getFirstAuthors(topic, maxPages = 3) {
    const authorsDict = {}; // Store first authors and their article URLs
    let authorsCount = 0; // Track the number of unique first authors

    for (let page = 0; page < maxPages * 10; page += 10) {
        const url = `https://scholar.google.com/scholar?hl=en&as_sdt=0%2C14&q=${encodeURIComponent(topic)}&start=${page}`;
        console.log(`Fetching: ${url}`);

        try {
            // Send GET request to Google Scholar
            const { data } = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
                }
            });

            // Parse the page using Cheerio
            const $ = cheerio.load(data);
            const articles = $(".gs_ri");

            if (articles.length === 0) {
                console.log("No more results found.");
                break;
            }

            for (let i = 0; i < articles.length; i++) {
                const article = articles[i];

                // Get citation information
                const citationInfo = $(article).find(".gs_a").text();
                if (!citationInfo) continue;

                // Extract the first author (before the first comma or hyphen)
                const firstAuthor = citationInfo.match(/^[^,-]+/)[0].trim();

                // Extract article link
                const titleTag = $(article).find(".gs_rt a");
                const articleUrl = titleTag.length ? $(titleTag).attr("href") : "No URL Found";

                // Ensure we store only the first author
                if (firstAuthor && !authorsDict[firstAuthor]) {
                    authorsDict[firstAuthor] = [articleUrl];
                    authorsCount++;

                    // Stop once we have collected 20 authors
                    if (authorsCount >= 20) {
                        break;
                    }
                }
            }

            // Exit if we reached 20 authors
            if (authorsCount >= 20) {
                break;
            }

            // Delay between requests (to prevent IP blocking)
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            console.error("Failed to retrieve the page:", error.message);
            break;
        }
    }

    return authorsDict;
}

module.exports = { getFirstAuthors };
