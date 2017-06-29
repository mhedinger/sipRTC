var fs = require('fs');
var https = require('https');

var express = require('express');
var app = express();

var options = {
  key: fs.readFileSync('/etc/letsencrypt/live/www.siprtc.ch/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/www.siprtc.ch/fullchain.pem')
};
var serverPort = 3000;

var server = https.createServer(options, app);
var io = require('socket.io')(server);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
	    console.log('user disconnected');
	  });
  socket.on('chat message', function(msg){
	io.emit('chat message', msg);
    console.log('message:' + msg);
  });
});

server.listen(serverPort, function() {
	  console.log('server up and running at %s port', serverPort);
});
