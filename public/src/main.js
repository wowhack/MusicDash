(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

var canvas = document.getElementById("canvas"),
  ctx = canvas.getContext("2d"),
  width = 1000,
  height = 600,
  boxWidth = 100,
  BPM = 150,
  player = {
    x: width / 2,
    y: 0,
    width: 20,
    height: 40,
    jumpSpeed: 12,
    velY: 0,
    jumping: false,
    grounded: false
  },
  keys = [],
  friction = 0.8,
  gravity = 0.3;

var boxes = [];

var time;
var timeSinceLastBPM = 0;
var msBetweenBeats = 1000/ (BPM/60);

canvas.width = width;
canvas.height = height;

function init(){
  var terrainValues;
  console.log("Generating terrain");

  var terrainLoaded = $.Deferred();
  
  generateTerrain(terrainLoaded);

  terrainLoaded.done( 
    function(terrainValues){
      initTerrain();
      console.log("Terrain generated.");
      console.log(terrainValues);
      console.log("Starting Game.");
      update();
    }
  );
}

function update() {
  //Recursiv call next frame.
  requestAnimationFrame(update);
  //Time since last update
  var dt = calcDt();
  // keys[32] = space , keys[38] = up arrow ,keys[87] = w);
  logic(dt,keys[32],keys[38],keys[87]);
  draw(dt);
}


function calcDt(){
  var now = new Date().getTime(),
    dt = now - (time || now);
  time = now;
  return dt;
}

function logic(dt,space,up,w, callback){
  // check keys
  if (space || up || w) {
    // up arrow or space
    if (!player.jumping && player.grounded) {
      player.jumping = true;
      player.grounded = false;
      player.velY = -player.jumpSpeed;
    }
  }


  player.velY += gravity;
  player.grounded = false;

  for (var i = 0; i < boxes.length; i++) {
    var dir = colCheck(player, boxes[i]);

    if (dir === "l" || dir === "r") {
        player.jumping = false;
    } else if (dir === "b") {
        player.grounded = true;
        player.jumping = false;
    } else if (dir === "t") {
        player.velY *= -1;
    }

    //moves a terrainBox in X-axis
    boxes[i].x = boxes[i].x - 2;

    //Removes Terrainboxes outside screen and spawn a new one.
    if(boxes[i].x < -boxWidth){
      boxes.splice(i, 1);
      createTerrainBox(Math.floor((Math.random() * height) + 1), width);
    }    
  }

  if(player.grounded){
         player.velY = 0;
    }
  player.y += player.velY;
}

function draw(){
  //Clear screen
  ctx.clearRect(0, 0, width, height);

  //Render Boxes
  ctx.fillStyle = "black";    
  ctx.beginPath();    

  for (var i = 0; i < boxes.length; i++) {
    ctx.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
  }

  //Render Player.
  ctx.fill();
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, player.width, player.height);    
}

function createTerrainBox(Y,X){
  boxHeight = height - Y;
  boxes.push({
    x: X,
    y: Y,
    width: boxWidth,
    height: boxHeight,
    color: "#000"
  });
}

function initTerrain(){
  for(var i = 0; i < 10; i++){
    createTerrainBox(Math.floor((Math.random() * height) + 1), i * 100);
  }
}

function BPMLoop(){

}

function colCheck(shapeA, shapeB) {
  // get the vectors to check against
  var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
      vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
      // add the half widths and half heights of the objects
      hWidths = (shapeA.width / 2) + (shapeB.width / 2),
      hHeights = (shapeA.height / 2) + (shapeB.height / 2),
      colDir = null;

  // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
  if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
    // figures out on which side we are colliding (top, bottom, left, or right)
    var oX = hWidths - Math.abs(vX),
      oY = hHeights - Math.abs(vY);
    if (oX >= oY) {
      if (vY > 0) {
        colDir = "t";
        shapeA.y += oY;
      } else {
        colDir = "b";
        shapeA.y -= oY;
      }
    } else {
      if (vX > 0) {
        colDir = "l";
        shapeA.x += oX;
      } else {
        colDir = "r";
        shapeA.x -= oX;
      }
    }
  }
  return colDir;
}

document.body.addEventListener("keydown", function (e) {
  keys[e.keyCode] = true;
});

document.body.addEventListener("keyup", function (e) {
  keys[e.keyCode] = false;
});

window.addEventListener("load", function () {
  init();
});