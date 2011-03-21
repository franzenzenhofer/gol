//game of life module
/*Any live cell with fewer than two live neighbours dies, as if caused by under-population.
Any live cell with two or three live neighbours lives on to the next generation.
Any live cell with more than three live neighbours dies, as if by overcrowding.
Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.*/
var util = require("util");
var jQuery = require("jquery");
var $ = jQuery;
var active = false;
var wait = 150;
var x = 50;
var y = 30;
var worldsize = x * y;
var defaultParty = "a";
var generation = 0;
var partyO = {};
var forceQueue = [];
//var Worker = require('webworker').Worker;
//var worker = new Worker("golworker.js");



var createCell = function(_alive, _party) {
  var party = undefined;
  if(!_alive) {
    var alive = false
  }else {
    var alive = true
  }
  if(!_party && alive) {
    var party = defaultParty
  }
  return{alive:alive, party:party, ln:[]}
};

var getAWorld = function(x, y, seed) {
  var w = [];
  var wsize = x * y;
  for(var i = 0;i < wsize;i++) {
    w[i] = createCell(false)
  }
  if(seed && typeof seed == "number") {
    seed = Math.floor(seed);
    for(var i = 0;i < seed;i++) {
      r = Math.floor(Math.random() * wsize);
      if(w[r].alive === false) {
        w[r].alive = true;
        w[r].party = defaultParty
      }else {
        i--
      }
    }
  }else {
    if(seed && typeof seed == "object") {
      for(var party in seed) {
        seednr = Math.floor(seed[party]);
        for(var i = 0;i < seednr;i++) {
          r = Math.floor(Math.random() * wsize);
          if(w[r].alive === false) {
            w[r].alive = true;
            w[r].party = party
          }else {
            //i--
          }
        }
      }
    }
  }
  return w
};
var world = getAWorld(x, y, {"a":worldsize / 5, "b":worldsize / 5, "c":worldsize / 5, "d":worldsize / 5, "e":worldsize / 5, "f":worldsize / 5, "g":worldsize / 5});
var publicWorld = getAWorld(x, y);
var wayOfLife = function(cWorld, callback, timeout) {
  
  var newWorld = getAWorld(x, y);
  for(var i = 0;i < cWorld.length;i++) {
    for(var k = -1;k <= 1;k++) {
      for(var j = 1;j >= -1;j--) {
        var ni = 0;
        ni = i + (k * x + j);
        if(ni < 0) {
          ni = ni + worldsize
        }else {
          if(ni >= worldsize) {
            ni = ni - worldsize
          }
        }
        if(ni != i) {
          if(cWorld[ni].alive) {
            if(!newWorld[i]["ln"][cWorld[ni].party]) {
              newWorld[i]["ln"][cWorld[ni].party] = [ni]
            }else {
              newWorld[i]["ln"][cWorld[ni].party].push(ni)
            }
          }
        }
      }
    }
    var collisiontest = true;
    if(cWorld[i].alive) {
      var attackerwins = true;
      if(newWorld[i]["ln"]) {
        for(var lnparty in newWorld[i]["ln"]) {
          if(lnparty == cWorld[i].party) {
            if(newWorld[i]["ln"][lnparty] && newWorld[i]["ln"][lnparty].length == 2 || newWorld[i]["ln"][lnparty].length == 3) {
              if(newWorld[i].alive && attackerwins) {
              }else {
                newWorld[i].alive = true;
                newWorld[i].party = lnparty
              }
            }else {
              newWorld[i].alive = false;
              newWorld[i].party = undefined
            }
          }else {
            if(newWorld[i]["ln"][lnparty].length == 3) {
              if(newWorld[i].alive && newWorld[i].party==cWorld[i].party && attackerwins == true) {
                newWorld[i].alive = true;
                newWorld[i].party = lnparty
              }else if(newWorld[i].alive && newWorld[i].party!=cWorld[i].party && attackerwins == true)
              {
                //we have a conflict
                newWorld[i].alive = true;
                newWorld[i].party = 'x';
              }
              else
              {
                //current one wins
              }
            }
          }
        }
      }else {
        newWorld[i].alive = false;
        newWorld[i].party = undefined
      }
    }else {
      if(newWorld[i]["ln"]) {
        for(var lnparty in newWorld[i]["ln"]) {
          if(newWorld[i]["ln"][lnparty] && newWorld[i]["ln"][lnparty].length == 3) {
            if(newWorld[i].alive==true&&collisiontest==true) //we have a colltision
            {
              newWorld[i].alive = true;
              newWorld[i].party = 'z';
            }else 
            {
              newWorld[i].alive = true;
              newWorld[i].party = lnparty;
            }
          }
        }
      }
    }
  }
  
  //we pull in external cells
  var c;
  while(c = forceQueue.pop())
  {
    var posi = c.y*x+c.x;
    console.log('change'+posi);
    newWorld[posi].alive = true;
    newWorld[posi].party = 'z';
  }
  generation++;
  for(var i = 0;i < newWorld.length;i++) {
    publicWorld[i] = newWorld[i]
  }
  if(callback) {
    setTimeout(callback, timeout, newWorld, callback, timeout)
  }else {
    return newWorld
  }
};
var start = function(_w, _c, _t) {
  var w, c, t;
  if(_w) {
    w = _w
  }else {
    w = world
  }
  if(_c) {
    c = _c
  }else {
    c = wayOfLife
  }
  if(_t) {
    t = _t;
    wait = t
  }else {
    t = wait
  }
  if(active !== true) {
    world = wayOfLife(w, c, t)
  }
};
exports.start = start;
exports.world = {x:x, y:y, g:generation, t:wait, w:publicWorld};
exports.getStreamlinedWorld = function() {
  var streamlinedWorld = [];
  for(var i = 0;i < publicWorld.length;i++) {
    if(!publicWorld[i].alive) {
      streamlinedWorld[i] = 0
    }else {
      if(partyO[publicWorld[i].party]) {
        streamlinedWorld[i] = partyO[publicWorld[i].party]
      }else {
        var j = 1;
        for(var party in partyO) {
          j++
        }
        partyO[publicWorld[i].party] = j;
        streamlinedWorld[i] = j;
        console.log(util.inspect(partyO))
      }
    }
  }
  return{x:x, y:y, g:generation, t:wait, w:streamlinedWorld}
};

exports.force = function(c)
{
  forceQueue.push(c);
}
