(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
    // window.AudioContext = window.AudioContext||window.webkitAudioContext;
})();


// GLOBAL SPACE

var canvas = document.getElementById("canvas"),
  ctx = canvas.getContext("2d"),
  // audioCtx = new AudioContext(),
  width = 1000,
  height = 600,
  BeatsPerScreen = 10,
  boxWidth = width/BeatsPerScreen,
  BPM,
  player = {
    x: 100,
    y: 0,
    width: 20,
    height: 40,
    jumpSpeed: 8,
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
var msBetweenBeats;

var speed;
var grassHeigth = 20;

var trackID ="5U727Qt3K2zj4oicwNJajj";

var sound;

canvas.width = width;
canvas.height = height;



// FUNCTIONS!!!


function init(){
  var terrainValues;
  console.log("Generating terrain");

  var levelLoaded = $.Deferred();
  var songLoaded = $.Deferred();

  generateTerrain(levelLoaded,trackID);
  loadSong(songLoaded,trackID);

  $.when(levelLoaded,songLoaded).done(

    function(levelResponse,songRespons){
      console.log("Sound and terraing loaded");

      initTerrain(levelResponse.terrainValue);
      updatePublicVar(levelResponse.BPM);
      playSound();
      update(levelResponse.BPM);
    }

  );
}
function updatePublicVar(tempo){
  BPM = tempo;
  // msBetweenBeats = 1000 / (BPM/60);
  speed = BPM/60 * boxWidth;
}

function update() {
  // console.log(BPM);
  // console.log(msBetweenBeats);
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
    boxes[i].x = boxes[i].x - (dt/1000) * speed;
    // console.log((dt/1000) * speed);
    //Removes Terrainboxes outside screen and spawn a new one.
    if(boxes[i].x < -boxWidth){
      boxes.splice(i, 1);
    }
  }

  if(player.grounded){
         player.velY = 0;
    }
  player.y += player.velY;

  timeSinceLastBPM += dt;
  if(timeSinceLastBPM > msBetweenBeats){
    BPMLoop();
    timeSinceLastBPM = 0;
  }
}

function draw(){
  //Clear screen
  ctx.clearRect(0, 0, width, height);

  for (var i = 0; i < boxes.length; i++) {
    var grassGradiant = ctx.createLinearGradient(boxes[i].x, boxes[i].y, boxWidth ,grassHeigth);
    grassGradiant.addColorStop(0,"82ff5c");
    grassGradiant.addColorStop(1,"d48b2d");

    var dirtGradiant = ctx.createLinearGradient(boxes[i].x, boxes[i].y + grassHeigth,boxWidth,boxes[i].height - grassHeigth);
    dirtGradiant.addColorStop(0,"d48b2d");
    dirtGradiant.addColorStop(1,"8b5a1b");
    ctx.fill();
    ctx.fillStyle= grassGradiant;
    ctx.fillRect(boxes[i].x, boxes[i].y, boxes[i].width, grassHeigth);

    ctx.fill();
    ctx.fillStyle = dirtGradiant;   
    ctx.fillRect(boxes[i].x, boxes[i].y + grassHeigth, boxes[i].width, boxes[i].height - grassHeigth);
  }

  //Render Player.
  ctx.fill();
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function createTerrainBox(Y,X,width){
  boxHeight = height - Y;
  boxes.push({
    x: X,
    y: Y,
    width: width,
    height: boxHeight
  });
}

function initTerrain(values){
  for(var i = 0; i < values.length; i++){
    var x = 0;
    if(i > 0){
      x = boxes[boxes.length-1].x + boxes[boxes.length-1].width;
    }
    createTerrainBox(values[i].y, x, values[i].width * boxWidth);
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