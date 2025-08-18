require('dotenv').config();
const http = require('http');
const { URL } = require('url');
const pool = require('../db/pool');

const PORT = process.env.PORT || 3000;

const sendJson = (res, status, body) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
};

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname.replace(/\/\+$/, '');

    // health check (reuse what you just built)
    if(req.method === 'GET' && pathname === '/health/db'){
        try {
            const [rows] = await pool.query('SELECT 1 AS ok');
            return sendJson(res, 200, { ok: true, db: rows[0].ok === 1});
        }catch(err){
            return sendJson(res, 500, { ok: false, error: err.message });
        }
    }

    // First MVP endpoint: list pets (dummy data for now)
    if(req.method === 'GET' && pathname === '/pets'){
        return sendJson(res, 200, [
            { id: 1, name: 'Fulffy', type: 'cat'},
            { id: 2, name: 'Buddy', type: 'dog' },
        ]);
    }

    // Default 404
    return sendJson(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
})