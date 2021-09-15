const url = require('url');
const http = require('http');
const https = require('https');
const { StringDecoder } = require('string_decoder');
const config = require('./config');
const fs = require('fs');

// Define the handlers
const handlers = {};

handlers.ping = function (data, callback) {
	callback(200);
};

// Not found handler
handlers.notFound = function (data, callback) {
	callback(404);
};

// Define a request router
const router = {
	ping: handlers.ping
};

// Server logic for both http and https
const unifiedServer = function (req, res) {
	// Get the URL and parse it
	const parsedUrl = url.parse(req.url, true);

	// Get the path
	const path = parsedUrl.pathname;
	const trimmedPath = path.replace(/^\/+|\/+$/g, '');

	// Get the query string as an object
	const queryStringObject = parsedUrl.query;

	// Get the HTTP method
	const method = req.method.toLowerCase();

	// Get the headers as an object
	const headers = req.headers;

	// Get the payload, if any
	const decoder = new StringDecoder('utf-8');
	let buffer = '';

	req.on('data', (data) => {
		buffer += decoder.write(data);
	});

	req.on('end', () => {
		buffer += decoder.end();

		// Choose the request handler
		const chosenHandler =
			typeof router[trimmedPath] !== undefined
				? router[trimmedPath]
				: handlers.notFound;

		// Construct data object to send to the handler
		const data = {
			path: trimmedPath,
			query: queryStringObject,
			method: method,
			headers: headers,
			payload: buffer
		};

		// Route the request to the handler specified in the router
		chosenHandler(data, (statusCode, payload) => {
			statusCode = typeof statusCode === 'number' ? statusCode : 200;

			payload = typeof payload === 'object' ? payload : {};

			// Send the response
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(JSON.stringify(payload));
		});
	});
};

// Instantiate the HTTP server
const httpServer = http.createServer((req, res) => unifiedServer(req, res));

// Start the HTTP server
httpServer.listen(config.httpPort, () => {
	console.log(
		`Server is listening on port ${config.httpPort} in ${config.envName} mode...`
	);
});

// Instantiate the HTTP server
const httpsOptions = {
	key: fs.readFileSync('./https/key.pem'),
	cert: fs.readFileSync('./https/cert.pem')
};

const httpsServer = https.createServer(httpsOptions, (req, res) =>
	unifiedServer(req, res)
);

// Start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
	console.log(
		`Server is listening on port ${config.httpsPort} in ${config.envName} mode...`
	);
});
