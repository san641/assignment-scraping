
const mysql = require('mysql2');


const db = mysql.createConnection({
  host: 'localhost',
  user: 'user1',
  password: 'Company123!',
  database: 'companies'
});


async function fetchSourceFromDatabase() {
  try {
    
    const [rows] = await db.promise().query('SELECT website_url  FROM source'); 
    return rows;
  } catch (error) {
    console.error('Error fetching source data from database:', error);
    return []; 
  }
}

async function insertSource(website_url) {
  try {
    
    const [existingRow] = await db.promise().query('SELECT COUNT(*) AS count FROM source WHERE name = ? AND url = ?', [website_url]);
    if (existingRow[0].count === 0) {
      
      await db.promise().query('INSERT INTO source (website_url) VALUES (?, ?)', [website_url]);
      console.log(`Inserted: with URL: ${url}`);
    } else {
      console.log(`Source with URL ${url} already exists.`);
    }
  } catch (error) {
    console.error('Error inserting source data:', error);
  }
}


async function processSource() {
  try {
    
    const source = await fetchSourceFromDatabase();
    console.log(`Fetched ${source.length} source entries from the database.`);

    for (const { website_url } of source) {
      await insertSource(wesite_url);
    }

    console.log('Source  processing and insertion completed!');
    db.end();  
  } catch (error) {
    console.error('Error in the main processing function:', error);
    db.end();
  }
}


processSource().catch(console.error);

