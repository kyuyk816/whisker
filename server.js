// 1. Import the http module
const http = require('http');

// 2. Define host and port
const hostname = '127.0.0.1';
const port = 3000;

// 3. Create server and define request handler
const server = http.createServer((req, res) => {
    // Set response status and headers
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');

    const pet = { name: 'Fluffy', age: 3, species: 'cat' };

    // Convert the object to a JSON string and send it
    res.end(JSON.stringify(pet));
});

// 4. Start listening on the specified host/port
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
