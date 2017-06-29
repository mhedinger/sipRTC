var fs = require('fs');
var https = require('https');

var express = require('express');
var app = express();

var options = {
  key: fs.readFileSync('/etc/letsencrypt/live/www.siprtc.ch/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/www.siprtc.ch/fullchain.pem')
};
var serverPort = 3002;

var server = https.createServer(options, app);
var io = require('socket.io')(server);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

var counts = {};

io.on('connection', function(socket) {
	console.log('a user connected');

	socket.on('disconnect', function() {
		console.log("user disconnected");
		if (typeof socket.session != "undefined") {
			socket.broadcast.to(socket.session).emit('message', {
				type : 'leave',
				session : socket.session
			});
			counts[socket.session] = 0;
		}
	});

	socket.on('REGISTER', function(channel) {
		if (typeof counts[channel] == "undefined") {
			console.log("DEBUG: channel = " + channel
					+ " used for the first time");
			counts[channel] = 0;
		}

		var numClients = counts[channel];

		console.log('join: session = ' + channel);

		if (numClients === 0) {
			socket.join(channel);
			socket.session = channel;
			socket.emit('You are registered. Please wait for other user', channel);
			counts[channel]++;
		} else if (numClients === 1) {
			socket.join(channel);
			socket.session = channel;
			socket.emit('You are registered to an existing channel', channel);
			counts[channel]++;
			socket.broadcast.to(channel).emit('channelEstablished', channel);
		} else {
			socket.emit('full', channel);
		}

		console.log("DEBUG: counts = " + JSON.stringify(counts));
	});

	socket.on('chat message', function(msg) {
		console.log('message: msg = ' + JSON.stringify(msg));
		console.log("onmessage: counts = " + JSON.stringify(counts));
		socket.broadcast.to(socket.session).emit('chat message', msg);
		if (msg.type === "leave") {
			socket.leave(msg.session);
			counts[msg.session] = 0;
			console.log("user left");
		}
	});

});

server.listen(serverPort, function() {
	console.log('server up and running at %s port', serverPort);
});
