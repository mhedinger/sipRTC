var fs = require('fs');
var cfg = {
	port : 4000,
	ssl_key : '/etc/letsencrypt/live/www.siprtc.ch/privkey.pem',
	ssl_cert : '/etc/letsencrypt/live/www.siprtc.ch/fullchain.pem'
};

var httpServ = require('https');
var WebSocketServer = require('ws').Server;
var app = null;

var processRequest = function(req, res) {
	res.writeHead(200);
	res.end('All glory to WebSockets!\n');
};

app = httpServ.createServer({
	key : fs.readFileSync(cfg.ssl_key),
	cert : fs.readFileSync(cfg.ssl_cert)
}, processRequest).listen(cfg.port);

var wss = new WebSocketServer({
	server : app
});

wss.on('connection', function connection(ws) {
	ws.on('message', function message(data) {
		// Broadcast to everyone else.
		wss.clients.forEach(function each(client) {
			if (client !== ws)
				client.send(data);
		});
	});
});