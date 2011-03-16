//gol2.js

var express = require('express');
var io = require('socket.io');
var app = express.createServer();
var socket = io.listen(app);
var gol = require('./gol.js');
var fs = require('fs');
var util = require('util');


app.enable('jsonp callback');
var wait = 150;
for(var i = 0; i<process.ARGV.length; i++)
{
  var start = false;
  console.log(process.ARGV[i]);
  if(process.ARGV[i]=='start'){ start = true; }
  if(typeof process.ARGV[i] == "number"){ wait = process.ARGV[i]; }
  //if(start) { gol.start(false,false,wait); }
}

gol.start(false,false,wait);

app.get('/', function(req, res) {
    fs.readFile('./index.html', 'utf-8', function (err, data) {
    if (err) throw err;
      res.send(data);
    });
});

app.get('/start', function(req, res) {
    gol.start();
});

app.get('/debug', function(req, res) {
           console.log(util.inspect(gol.getStreamlinedWorld(), true, null));
});

app.get('/jsonp', function(req, res) {
    res.send(gol.world);
});

//socket.io
var activeBroadCast = false;
socket.on('connection', function(client)
{
    client.on('message', function(){
      //client.broadcast(gol.world);
      client.broadcast('hiho');
    });
    
    if(!activeBroadCast)
    {
     //activeBroadCast=setInterval(function(){client.broadcast(gol.world);console.log('interval');}, wait);
     activeBroadCast=setInterval(function(){client.broadcast(gol.getStreamlinedWorld());console.log('interval');}, wait);
    }

});



//jsonp?callback=test
//test({ foo: 'bar' });

app.listen(3000);