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

const server = http.createServer(async (requestAnimationFrame, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if(req.method === 'GET' && url.pathname === '/healkh/db'){
        const started = Date.now();
        try{
            const [rows] = await pool.query('SELECT 1 AS ok');
            const latencyMs = Date.now() - started;
            return sendJson(res, 200, { ok: true, db: rows[0].ok === 1, latencyMs });
        }catch(err){
            return sendJson(res, 500, { ok: false, error: err.message });
        }
    }

    // default: 404 JSON
    sendJson(res, 404, { ok: false, error: 'Not Found' });
});

server.listen(PORT, () => {
    console.log(`HTTP server listening on http://localhost:${PORT}`);
});
