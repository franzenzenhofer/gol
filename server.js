var express = require("express"), io = require("socket.io"), app = express.createServer(), socket = io.listen(app, {transports:["websocket"], port:9980}), gol_i = require("./gol.js"), gol = Object.create(gol_i), fs = require("fs"), util = require("util"), wait = 300, nrClients = 0;


app.get("/", function(a, b) {
  fs.readFile("./index.html", "utf-8", function(c, d) {
    if(c) {
      throw c;
    }
    b.send(d)
  })
});

app.get("/default.css", function(a, b) {
  fs.readFile("./default.css", "utf-8", function(c, d) {
    if(c) {
      throw c;
    }
    b.send(d)
  })
});
app.get("/debug", function() {
  console.log(util.inspect(gol.getStreamlinedWorld(), true, null))
});
var activeBroadCast = false;
var clientsA = [];
socket.on("connection", function(a) {
  nrClients++;
  clientsA.push(a);
  console.log(util.inspect(a));
  a.send('hi');
  a.on("message", function(b) {
   // console.log(util.inspect(b));
    if(!activeBroadCast) {
      gol.start(false, false, wait);
      activeBroadCast = setInterval(function() {
        if(clientsA.length==1) {
          a.send(gol.getStreamlinedWorld());
          //console.log("clients: " + nrClients)
        }else {

          a.broadcast(gol.getStreamlinedWorld());
          console.log("clients: " + nrClients)

        }
      }, wait)
    }
    console.log(util.inspect(b));
    console.log(typeof b);
    //if(isArray(b)&&)
    if(b.type=='selectionA'&&b.id)
    {
      for(var k = 0; k<b.selectionA.length; k++)
      {
        if(b.selectionA[k].x!=undefined&&b.selectionA[k].y!=undefined)
        {
          console.log(util.inspect(b[k]));
          gol.force(b.selectionA[k], b.id);
        }
      }
    }
  });
  a.on("disconnect", function() {
    console.log("disconnect serverside");
    nrClients--
  })
});
app.listen(3001);