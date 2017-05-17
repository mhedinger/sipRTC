var fs = require('fs');
var cfg = {
	ssl : true,
	port : 4001,
	ssl_key : '/etc/letsencrypt/live/www.siprtc.ch/privkey.pem',
	ssl_cert : '/etc/letsencrypt/live/www.siprtc.ch/fullchain.pem'
};

var httpServ = require('https');
var WebSocketServer = require('ws').Server;
var app = null;
var calleeReady = false;

var processRequest = function(req, res) {
	res.writeHead(200);
	res.end('This is a WebSockets server!\n');
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
		if (data == 'calleeReady') {
			calleeReady = true;
			console.log('calleeReady set to TRUE');
		} else if (data == 'calleeBusy') {
			calleeReady = false;
			console.log('calleeReady set to FALSE');
		} else if (data == 'stateRequest') {
			if (calleeReady) {
				ws.send('calleeReady')
			} else {
				ws.send('calleeBusy')
			}
		} else if (data == 'Ping') {
			console.log('Callee connected');
		}
		wss.clients.forEach(function each(client) {
			if (client !== ws) {
				client.send(data);
			}
		});
	});
});
