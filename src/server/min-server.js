require('dotenv').config();
const http = require('http');
const { URL } = require('url');
const pool = require('../db/pool');

const PORT = process.env.PORT || 3000;

const sendJson = (res, status, body) => {
    const data = JSON.stringify(body);
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(data);
};

const server = http.createServer(async (req, res) => {
    try{
        const url = new URL(req.url, `http://${req.headers.host}`); 
        const pathname = (decodeURIComponent(url.pathname).toLowerCase().replace(/\/+$/, '')) || '/'; // Normalize path
        console.log(req.method, pathname); // Quick debug log

        if(req.method === 'GET' && pathname === '/health/db'){
            const started = Date.now();
            const [rows] = await pool.query('SELECT 1 AS ok');
            const latencyMs = Date.now() - started;
            return sendJson(res, 200, { ok: true, db: rows[0].ok === 1, latencyMs });
        }

    // default: 404 JSON
        return sendJson(res, 404, { ok: false, error: 'Not Found', saw: { method: req.method, path: pathname }});
    }catch(err){
        return sendJson(res, 500, { ok: false, error: err.message });
    }
});

server.listen(PORT, () => {
    console.log(`[MIN-SERVER] listening on http://localhost:${PORT} (file: src/server/min-server.js)`);
});
