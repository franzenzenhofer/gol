//game of life module
/*Any live cell with fewer than two live neighbours dies, as if caused by under-population.
Any live cell with two or three live neighbours lives on to the next generation.
Any live cell with more than three live neighbours dies, as if by overcrowding.
Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.*/
var util = require('util');
var jQuery = require('jquery');  var $ = jQuery;

//controlling if a server broadcast is active
var active = false;

var falsy = 0;
var truly = 1;

var wait = 150; //irelevant // only gol server counts currently
var x = 100;
var y = 60;
//var x = 100;
//var y = 60;
//var x = 10;
//var y = 10;
var worldsize = x * y;
var defaultAliveColor = '00FF00';

//generation counter
var generation = 0;
var colorO = {};


var createCell = function(_alive, _color){
  var color=undefined;
  
  if(!_alive){var alive=falsy;}else{var alive=truly;}
  if(!_color && alive ){var color=defaultAliveColor};
  return {
    'alive': alive,
    'color': color,
    'ln':[]
  }
}


var getAWorld = function(x,y,seed)
{
  var w = [];
  var wsize = x*y;
  
  for(var i = 0; i<wsize; i++)
  {
    w[i]=createCell(falsy);
  }
  
  ////console.log('seed:'+seed);
  
  if(seed && typeof seed == "number")
  {
      seed=Math.floor(seed);
      ////console.log('floor seed:'+seed);
      for(var i = 0; i<seed; i++)
      {
        r = Math.floor(Math.random()*wsize)
        if(w[r].alive===falsy)
        {
          w[r].alive=truly;
          w[r].color=defaultAliveColor;
        }
        else { i--; }
      }
  }
  else if(seed && typeof seed == "object")
  {
    for (var color in seed)
    {
      //console.log('seed name color '+color);
      seednr = Math.floor(seed[color]);
      for(var i = 0; i<seednr; i++)
      {
        r = Math.floor(Math.random()*wsize)
        if(w[r].alive===falsy)
        {
          w[r].alive=truly;
          w[r].color=color;
        }
        else { i--; }
      }
    }
  }
  return w;
}

//var world = getAWorld(x,y,worldsize/5);
var world = getAWorld(x,y,{
'FF0000':worldsize/5,
'0000FF':worldsize/5,
'00FF00':worldsize/5,
'FFFF00':worldsize/5
});
//console.log('GOL');

//public world is the world that is communicated to the clients
var publicWorld = getAWorld(x,y);



var wayOfLife = function (cWorld, callback, timeout)
{
  //console.log('WOF')
  //var newWorld = [];
  var newWorld = getAWorld(x,y);
  for(var i = 0; i<cWorld.length; i++)
  {
    if(cWorld[i])
    {
       ////console.log(i);
    }
  }
  
  for(var i = 0; i<cWorld.length; i++)
  {
        for(var k = -1; k<=1; k++ )
        {
          for(var j = 1; j>=-1; j-- )
          {
            
             var ni=0;

              ni = i+((k*x)+j);
              if(ni<0){ni=ni+worldsize}else if(ni>=worldsize) {ni=ni-worldsize}
            
             if(ni != i)
             {
              if(cWorld[ni].alive)
              {
                if(!newWorld[i]['ln'][cWorld[ni].color]){
                newWorld[i]['ln'][cWorld[ni].color]=[ni];
                }else{
                newWorld[i]['ln'][cWorld[ni].color].push(ni);
                }
              }
              //else dead neighbours
            }
          }
        }
        
        //start callculation next generation
        var collisiontest = false;
       //console.log(util.inspect(cWorld[i], true, null));
        if(cWorld[i].alive)
        {
            var attackerwins = true;
          //console.log('alive');
            if(newWorld[i]['ln'])
            {
              for(var lncolor in newWorld[i]['ln'])
              {
                
                //same color
                if(lncolor == cWorld[i].color)
                { 
                  if(newWorld[i]['ln'][lncolor]&&newWorld[i]['ln'][lncolor].length==2||newWorld[i]['ln'][lncolor].length==3)
                  {
                    if(newWorld[i].alive&&attackerwins)
                    {
                    
                    }
                    else
                    {
                      newWorld[i].alive=truly;
                      newWorld[i].color=lncolor;
                    }
                  }
                 else
                  {
                   newWorld[i].alive=falsy;
                   newWorld[i].color=undefined;
                  }
                }
                else //other color
                {
                  //if((newWorld[i]['ln'][lncolor].length==3)&&(!newWorld[i]['ln'][cWorld[i].color]||newWorld[i]['ln'][cWorld[i].color]<3))
                  if((newWorld[i]['ln'][lncolor].length==3))
                  {
                    if(newWorld[i].alive&&attackerwins==false)
                    {
                    
                    }
                    else
                    {
                    newWorld[i].alive=truly;
                    newWorld[i].color=lncolor;
                    }
                   //newWorld[i].color='FF00FF';
                  }
                }
              }
            }
            else
            {
              //has no living neighbors at all, dead
              newWorld[i].alive=falsy;
              newWorld[i].color=undefined;
            }
        
           
        }
        else // not alive
        {
        
          if(newWorld[i]['ln'])
          {
            for(var lncolor in newWorld[i]['ln'])
            {
              if(newWorld[i]['ln'][lncolor]&&newWorld[i]['ln'][lncolor].length==3)
              {
                 newWorld[i].alive=truly;
                 newWorld[i].color=lncolor;
              }
            }
          }
         //  else it just stays dead
       
        }
      
       ////console.log(i+' '+LifeNeighbours);
    
  }
  generation++;
  //console.log('g:'+generation);
  ////console.log(util.inspect(newWorld, true, null));
    //now we emit the world
    for(var i = 0; i<newWorld.length; i++)
    {
      publicWorld[i]=newWorld[i];
    }
    
    //if(jQuery.isFunction(callback))
    if(callback)
    {
      setTimeout(callback, timeout, newWorld, callback, timeout)
    }
    else
    {
      return newWorld;
    }
}

var start = function(_w,_c,_t)
{ var w,c,t;
  if(_w){ w=_w; }else{ w=world; }
  if(_c){ c=_c; }else{ c=wayOfLife; }
  if(_t){ t=_t; wait=t; }else{ t=wait; }
  if(active!==true)
  {
    world = wayOfLife(w, c, t);
  }
}

exports.start = start;
exports.world = { 'x':x, 'y':y, 'g':generation, 't':wait, 'w':publicWorld };

exports.getStreamlinedWorld = function()
{
  var streamlinedWorld=[];
  
  for(var i = 0; i < publicWorld.length; i ++)
  {
    if(!publicWorld[i].alive)
    {
      streamlinedWorld[i]=0;
    }
    else
    {
      if(colorO[publicWorld[i].color])
      {
        streamlinedWorld[i]=colorO[publicWorld[i].color];
      }
      else
      {
        var j = 1;
        for(var color in colorO)
        {
          j++;
        }
        colorO[publicWorld[i].color]=j;
        streamlinedWorld[i]=j;
      }
    }
  }
  
  return { 'x':x, 'y':y, 'g':generation, 't':wait, 'w':streamlinedWorld };
}

//world = wayOfLife(world, wayOfLife, 500);
