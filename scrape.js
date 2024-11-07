const axios = require('axios');
const cheerio = require('cheerio');

// URL to scrape
const url = 'https://timesofindia.indiatimes.com/';

// Fetch the page content
async function fetchPage(url) {
  try {
    const response = await axios.get(url);  // Sends HTTP request to fetch HTML
    return response.data;  // Returns HTML data
  } catch (error) {
    console.error('Error fetching the page:', error);
    return null;
  }
}

// Extract links from the page
function extractLinks(html) {
  const $ = cheerio.load(html);  // Loads HTML into cheerio
  const links = [];

  // Iterate through each anchor tag and extract href attribute
  $('a').each((index, element) => {
    const href = $(element).attr('href');
    if (href) {
      links.push(href);  // Push valid links into the array
    }
  });

  return links;  // Return all the links found on the page
}

// Filter valid article links
function isValidArticleLink(link) {
  // Match links that contain "articleshow" and some numbers followed by "cms"
  return /articleshow.*\d+.*cms/.test(link);
}

// Main scraping logic
async function scrape() {
  const html = await fetchPage(url);  // Fetch HTML content of the page

  if (html) {
    const links = extractLinks(html);  // Extract all links
    console.log(`Total number of links found: ${links.length}`);

    // Filter out valid article links
    const validLinks = links.filter(isValidArticleLink);
    console.log(`Valid article links (${validLinks.length}):`);
    
    // Log all valid links to the console
    validLinks.forEach(link => console.log(link));
  }
}

// Run the scraper
scrape();

