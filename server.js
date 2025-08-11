require('dotenv').config();
// server.js
const http = require('http');
const { URL } = require('url');
const mysql = require('mysql2/promise');

const PORT = 3000;
const HOST = '127.0.0.1';

// 1) Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',                       // todo: switch to a dedicated user later
    password: 'ModOperatti5%',
    database: 'petsocial',
    waitForConnections: true,
    connectionLimit: 10
});

// 2) Ensure table exists (idempotent)
async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pets (
      id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(50)  NOT NULL,
      breed       VARCHAR(50),
      age         TINYINT UNSIGNED,
      description VARCHAR(255),
      photo_url   VARCHAR(255),
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// 3) Small helper to read JSON bodies safely
function readJson(req, maxBytes = 1e6){
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
            if(data.length > maxBytes){
                reject(new Error('Payload too large'));
                req.destroy();
            }
        });
        req.on('end', () => {
            try{
                resolve(data ? JSON.parse(data) : {});
            }catch(e){
                reject(new Error('Invalid JSON'));
            }
        });
        req.on('error', reject);
    });
}

// 4) HTTP server with basic routing
const server = http.createServer(async(req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);

    try{
        if(req.method === 'GET' && pathname === '/pets'){
            const[rows] = await pool.query('SELECT * FROM pets ORDER BY id');
            res.statusCode = 200;
            return res.end(JSON.stringify(rows));
        }

        if(req.method === 'POST' && pathname === '/pets'){
            const body = await readJson(req);
            if(!body.name){
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'name is required' }));
            }

            const { name, breed = null, age = null, description = null, photo_url = null } = body;
            const [result] = await pool.query(
                `INSERT INTO pets (name, breed, age, description, photo_url)
                 VALUES(?,?,?,?,?)`,
                [name, breed, age, description, photo_url]
            );

            const [rows] = await pool.query('SELECT * FROM pets WHERE id = ?', [result.insertId]);
            res.statusCode = 201;
            return res.end(JSON.stringify(rows[0]));
        }

        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Route not found' }));
    }catch(err){
        // Basic error mapping
        res.statusCode = err.message === 'Invalid JSON' ? 400
            : err.message === 'Payload too large' ? 413
            : 500;
        res.end(JSON.stringify({ error: err.message }));
    }
});

// 5) Start
ensureSchema().then(() => {
    server.listen(PORT, HOST, () => 
        console.log(`Server running at http://${HOST}:${PORT}/`)
    );
}).catch(err => {
    console.error(`Startup error:`, err);
    process.exit(1);
});

// Graceful shutdown
process.on(`SIGINT`, async() =>{
    console.log('\nShutting down...');
    await pool.end();
    process.exit(0);
});
