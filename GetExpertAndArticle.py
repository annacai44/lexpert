import requests
from bs4 import BeautifulSoup
import re
import time

def get_authors_and_urls_by_topic(topic, max_pages=5):
    # Set up headers to mimic a browser
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
    }
    
    # Collecting authors and article links
    authors_dict = {}  # Using a dictionary to map authors to their article URLs
    
    # Loop through pages
    for page in range(0, max_pages * 10, 10):  # 10 results per page
        # Construct the search URL with pagination
        url = f"https://scholar.google.com/scholar?hl=en&as_sdt=0%2C14&q={topic}&start={page}"
        
        # Send a GET request to Google Scholar
        response = requests.get(url, headers=headers)
        
        # Check if the request was successful
        if response.status_code != 200:
            print("Failed to retrieve the page.")
            break
        
        # Parse the page with BeautifulSoup
        soup = BeautifulSoup(response.content, "html.parser")
        
        # Find all result items
        articles = soup.find_all("div", class_="gs_ri")
        
        # If no articles are found, exit loop (no more pages)
        if not articles:
            print("No more results found.")
            break
        
        for article in articles:
            # Get citation information
            citation_info = article.find("div", class_="gs_a")
            if not citation_info:
                continue
            
            citation_text = citation_info.text
            
            # Extract the year and check if it's after 1970
            year_match = re.search(r'\b(19[7-9]\d|20[0-2]\d)\b', citation_text)
            if year_match:
                year = int(year_match.group(0))
                if year > 1970:
                    # Extract authors (before the hyphen separator)
                    authors_part = citation_text.split('-')[0]
                    authors = authors_part.split(',')
                    
                    # Extract article link
                    title_tag = article.find("h3", class_="gs_rt")
                    if title_tag and title_tag.find("a"):
                        article_url = title_tag.find("a")["href"]
                    else:
                        article_url = "No URL Found"
                    
                    # Clean up author names and add to the set
                    for author in authors:
                        cleaned_name = author.strip()
                        if cleaned_name:  # Avoid empty strings
                            # If author is already in dict, append new URL
                            if cleaned_name in authors_dict:
                                authors_dict[cleaned_name].add(article_url)
                            else:
                                authors_dict[cleaned_name] = {article_url}
        
        # Add a delay between page requests to avoid IP blocking
        time.sleep(2)
    
    # Convert set of URLs to a list for each author and return
    return {author: list(urls) for author, urls in authors_dict.items()}

# Example usage
topic = "marbury vs madison"
authors_and_urls = get_authors_and_urls_by_topic(topic, max_pages=3)  # Scrape up to 3 pages

print("\nAuthors and their articles related to this topic after 1970:")
print("-------------------------------------------------------------")
for author, urls in authors_and_urls.items():
    for url in urls:
        print(f"{author} - {url}")
