var express = require("express"), io = require("socket.io"), app = express.createServer(), socket = io.listen(app, {transports:["websocket"], port:9980}), gol_i = require("./gol.js"), gol = Object.create(gol_i), fs = require("fs"), util = require("util"), wait = 150, nrClients = 0;
app.get("/", function(a, b) {
  fs.readFile("./index.html", "utf-8", function(c, d) {
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
socket.on("connection", function(a) {
  nrClients++;
  console.log(util.inspect(a));
  a.on("message", function(b) {
   // console.log(util.inspect(b));
    if(!activeBroadCast) {
      gol.start(false, false, wait);
      activeBroadCast = setInterval(function() {
        if(nrClients == 1) {
          a.send(gol.getStreamlinedWorld());
          //console.log("clients: " + nrClients)
        }else {
          activeBroadCast = setInterval(function() {
            a.broadcast(gol.getStreamlinedWorld());
            //console.log("clients: " + nrClients)
          }, wait)
        }
      }, wait)
    }
    
    if(b.x&&b.y&&b.id)
    {
       console.log(util.inspect(b));
       gol.force(b);
    }
  });
  a.on("disconnect", function() {
    console.log("disconnect serverside");
    nrClients--
  })
});
app.listen(3E3);