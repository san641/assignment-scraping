const mysql = require('mysql2');
const axios = require('axios');
const cheerio = require('cheerio');


const db = mysql.createConnection({
  host: 'localhost',
  user: 'user1',
  password: 'Company123!',
  database: 'companies'
});

function isValidArticleLink(link) {
  return /articleshow.*\d+.*cms/.test(link);
}


function getSourceFromLink(link) {
  const sources = [
    { domain: 'timesofindia.indiatimes.com', source: 'timesofindia' },
    { domain: 'indiatimes.com', source: 'indiatimes' }
  ];

  
  for (const { domain, source } of sources) {
    if (link.includes(domain)) {
      return source;
    }
  }

  return null; 
}


async function linkExistsInSourceTable(link) {
  const [rows] = await db.promise().query('SELECT COUNT(*) AS count FROM source WHERE link = ?', [link]);
  return rows[0].count > 0; 
}


async function fetchTimesOfIndiaLinks() {
  try {
    const response = await axios.get('https://timesofindia.indiatimes.com/');
    
    
    const $ = cheerio.load(response.data);
    
    
    const links = [];
    $('a').each((i, element) => {
      const link = $(element).attr('href');
      if (link) {
        links.push(link);
      }
    });
    
    console.log(`Found ${links.length} links on the homepage.`);
    return links;
  } catch (error) {
    console.error('Error fetching Times of India links:', error);
  }
}


async function insertNonValidLinks(nonValidLinks) {
  for (let link of nonValidLinks) {
    const source = getSourceFromLink(link);
    
    if (source && !(await linkExistsInSourceTable(link))) {
     
      await db.promise().query('INSERT INTO source (link, source) VALUES (?, ?)', [link, source]);
      console.log(`Inserted non-valid link into source table: ${link} from ${source}`);
    } else if (await linkExistsInSourceTable(link)) {
      console.log(`Link already exists in the source table: ${link}`);
    } else {
      console.log(`Link did not match any valid source: ${link}`);
    }
  }
}


async function processLinks() {
  const links = await fetchTimesOfIndiaLinks();
  console.log(`Total links fetched from Times of India: ${links.length}`);

  
  const validLinks = links.filter(link => isValidArticleLink(link));
  const nonValidLinks = links.filter(link => !isValidArticleLink(link));

  console.log(`Valid article links found: ${validLinks.length}`);
  console.log(`Non-valid links found: ${nonValidLinks.length}`);

  
  await insertNonValidLinks(nonValidLinks);

  console.log('Link processing and insertion completed!');
  db.end();
}

processLinks().catch(console.error);

