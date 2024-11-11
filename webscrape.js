const mysql = require('mysql2');


const db = mysql.createConnection({
  host: 'localhost',
  user: 'user1',
  password: 'Company123!',  
  database: 'companies'  
});


function isValidArticleLink(link) {
  
  return /articleshow.*\d+.*cms/.test(link);
}


async function getLinksFromTimesOfIndia() {
  const [rows] = await db.promise().query('SELECT id, link FROM times_of_india_links');
  return rows; 
}

async function insertArticleLinks(validLinks) {
  for (let link of validLinks) {
    await db.promise().query('INSERT INTO article_links (link) VALUES (?)', [link]);
    console.log(`Inserted valid article link: ${link}`);
  }
}


async function processLinks() {
  
  const links = await getLinksFromTimesOfIndia();
  console.log(`Total links found in times_of_india_links: ${links.length}`);

  
  const validLinks = links.filter(row => isValidArticleLink(row.link)).map(row => row.link);

  console.log(`Valid article links found: ${validLinks.length}`);

  
  await insertArticleLinks(validLinks);

  console.log('Link processing and insertion completed!');
  db.end(); 
}


processLinks().catch(console.error);



