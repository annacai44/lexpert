const axios = require('axios');
const cheerio = require('cheerio');

// Function to get authors and URLs by topic
async function getFirstAuthors(topic, maxPages = 1) {
    const authorsDict = {}; // Store authors and their article URLs
    let authorsCount = 0; // Track the number of unique authors

    // Loop through pages
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

            // Parse the page using cheerio
            const $ = cheerio.load(data);
            const articles = $(".gs_ri");

            // Exit loop if no articles are found (no more pages)
            if (articles.length === 0) {
                console.log("No more results found.");
                break;
            }

            for (let i = 0; i < articles.length; i++) {
                const article = articles[i];
                // Get citation information
                const citationInfo = $(article).find(".gs_a").text();
                if (!citationInfo) continue;

                // Extract the year and check if it's after 1970
                const yearMatch = citationInfo.match(/\b(19[7-9]\d|20[0-2]\d)\b/);
                if (yearMatch && parseInt(yearMatch[0]) > 1970) {
                    // Extract authors (before the hyphen separator)
                    const authorsPart = citationInfo.split('-')[0];
                    const authors = authorsPart.split(',');

                    // Extract article link
                    const titleTag = $(article).find(".gs_rt a");
                    const articleUrl = titleTag.length ? $(titleTag).attr("href") : "No URL Found";

                    // Clean up author names and add to the set
                    authors.forEach(author => {
                        const cleanedName = author.trim();
                        if (cleanedName) {
                            if (authorsDict[cleanedName]) {
                                authorsDict[cleanedName].add(articleUrl);
                            } else {
                                authorsDict[cleanedName] = new Set([articleUrl]);
                            }

                            // Increment authors count and break if limit is reached
                            authorsCount++;
                            if (authorsCount >= 10) {
                                // Return early to stop the loop
                                return;
                            }
                        }
                    });
                }

                // Exit loop early if we've collected 10 authors
                if (authorsCount >= 10) {
                    break;
                }
            }

            // If we reached 10 authors, exit the outer loop as well
            if (authorsCount >= 10) {
                break;
            }

            // Delay between requests to avoid IP blocking (2 seconds)
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            console.error("Failed to retrieve the page.", error.message);
            break;
        }
    }

    // Convert Set of URLs to Array for each author and return
    const formattedResult = {};
    for (const [author, urls] of Object.entries(authorsDict)) {
        formattedResult[author] = Array.from(urls);
    }

    return formattedResult;
}

module.exports = { getFirstAuthors };
