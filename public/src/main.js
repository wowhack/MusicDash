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
    x: 500 - 18,
    y: 0,
    width: 36,
    height: 48,
    jumpSpeed: 8,
    speed: 4,
    velY: 0,
    velX: 0,
    jumping: false,
    grounded: false
  },
  keys = [],
  friction = 0.8,
  gravity = 0.3;

var boxes = [];


var numberOfSongs = 0;
var time;
var timeSinceLastBPM = 0;
var msBetweenBeats;
var startedDownload = false;

var speed;
var grassHeigth = 39;


var trackID = [];
var grassImage;
var playerSprite;
var currentAnimation;// = "p1_walk";
var frameDuration = 50;
var frameTime = 0;
var currentFrame = 0;
var albumCoverURL;

canvas.width = width;
canvas.height = height;


$('#canvas').hide();

// FUNCTIONS!!!

var graphicsLoaded = $.Deferred();

$('#addSong').click(function(){
  var list = $('#songInput').val().split(":");
  var id = list[list.length - 1];
  trackID.push(id);
  var html = '<span> spotify:track:' + id + '</span><br>';
  $('#trackID').append(html);
  $('#songInput').val('');
});

$('#presentation').click(function(){
  id1 = "4bz7uB4edifWKJXSDxwHcs";
  id2 = "1QzFhzIOW7CyRJLpmq5CM0";
  trackID.push(id1);
  trackID.push(id2);
  var html = '<span> spotify:track:' + id1 + '</span><br>';
  $('#trackID').append(html);
  html = '<span> spotify:track:' + id2 + '</span><br>';
  $('#trackID').append(html);
  $('#songInput').val('');
});

$('#startGame').click(function(){
  if(trackID.length < 0){
    alert('no songs added');
  }
  else{
    $('#trackID').hide();
    $('#canvas').show();
    init();    
  }
});


function init(){
  startedDownload = true;
  var terrainValues;
  console.log("Loading song nr: " + numberOfSongs);
  console.log("Loading URI: " + trackID[numberOfSongs]);


  var levelLoaded = $.Deferred();
  var songLoaded = $.Deferred();

  if(numberOfSongs == 0){
    loadGraphics(graphicsLoaded);
  }

  generateTerrain(levelLoaded,trackID[numberOfSongs]);
  loadSong(songLoaded,trackID[numberOfSongs]);
  numberOfSongs++;

  $.when(levelLoaded, graphicsLoaded, songLoaded).done(//levelLoaded
    function(levelResponse, graphicsResponse, songRespons){//function(levelResponse,songRespons){

      startedDownload = false;

      grassImage = assMan.getAsset("/images/grassHalfMid.png");
      playerSprite = graphicsResponse.playerSprite;
      currentAnimation = playerSprite.spriteData["p1_jump"];
      //console.log(currentAnimation);

      initTerrain(levelResponse.terrainValue);
      updatePublicVar(levelResponse.BPM,songRespons.albumCover.url);
      // console.log(songRespons.albumCover);
      if(numberOfSongs > 1){
        console.log((60 * 1000)/BPM );
        setTimeout(function(){
        playSound(trackID[numberOfSongs-1]);
        // console.log("albumCoverURL");
        // console.log(albumCoverURL);
        $('body').css({"background":"url("+albumCoverURL+") no-repeat center center fixed"});
        $('body').css({"-webkit-background-size":"cover"});
        $('body').css({"-moz-background-size":"cover"});
        $('body').css({"-o-background-size":"cover"});
        $('body').css({"background-size":"cover"});        
        }, (60 * 1000 * 5)/BPM );
      }
      else{
        playSound(trackID[numberOfSongs-1]);
        // console.log("albumCoverURL");
        // console.log(albumCoverURL);
        $('body').css({"background":"url("+albumCoverURL+") no-repeat center center fixed"});
        $('body').css({"-webkit-background-size":"cover"});
        $('body').css({"-moz-background-size":"cover"});
        $('body').css({"-o-background-size":"cover"});
        $('body').css({"background-size":"cover"});
        // $('body').css('background', 'background: url(' + albumCoverURL + ') no-repeat center center fixed' );
      }
      update(levelResponse.BPM);
    }

  );
}
function updatePublicVar(tempo,url){
  BPM = tempo;
  // msBetweenBeats = 1000 / (BPM/60);
  speed = BPM/60 * boxWidth;
  player.speed = speed;
  albumCoverURL = url;
}

function update() {


  //are you dead?
  // if (player.x+10 < 80 || (player.y > height)){
  //   location.reload();
  // }

  // console.log(BPM);
  // console.log(msBetweenBeats);
  //Recursiv call next frame.
  requestAnimationFrame(update);
  //Time since last update
  var dt = calcDt();
  frameTime += dt;
  if(frameTime >= frameDuration){
    frameTime = 0;
    currentFrame = (currentFrame+1)%currentAnimation.length;
  }
  // keys[32] = space , keys[38] = up arrow ,keys[87] = w);
  logic(dt,keys[32],keys[38],keys[87],keys[39],keys[37],keys[68],keys[65]);
  draw(dt);
}


function calcDt(){
  var now = new Date().getTime(),
    dt = now - (time || now);
  time = now;
  return dt;
}

function logic(dt,space,up,w,right,left,d,a,callback){
  // check keys
  if (space || up || w) {
    // up arrow or space
    currentAnimation=playerSprite.spriteData["p1_jump"];
    currentFrame=0;
    if (!player.jumping && player.grounded) {
      player.jumping = true;
      player.grounded = false;
      player.velY = -player.jumpSpeed;
    }
  }  
  else{
    if(player.velY < 0){
      player.velY += gravity;
    }
  }
  if (right || d) {
    // console.log('hoger');
      // right arrow
      if (player.velX < player.speed) {
          player.velX++;
      }
  }
  if (left || a) {
      // left arrow
      player.x = player.x - (dt/1000) * speed;
      currentAnimation=playerSprite.spriteData["p1_stand"];
      currentFrame=0;
  }

    player.velX *= friction;  


  player.velY += gravity;
  player.grounded = false;
  player.x += player.velX;
  player.y += player.velY

  var lastBox = boxes[boxes.length - 1];

  if(lastBox.x <= width + 1 - lastBox.width){
    if(!startedDownload){
      init();
    }
    var newHeight;
    if(Math.abs(lastBox.y - height/2) ){
      newHeight = lastBox.y;
    }
    else if( lastBox.y < height/2 ){
      newHeight = lastBox.y + 2;
    }
    else{
      newHeight = lastBox.y - 2;
    }
    createTerrainBox(newHeight,width,boxWidth,"#a5a5a5");
  }

  for (var i = 0; i < boxes.length; i++) {
    var dir = colCheck(player, boxes[i]);

    if (dir === "l" || dir === "r") {
        player.jumping = false;
    } else if (dir === "b") {
        player.grounded = true;
        player.jumping = false;
        currentAnimation=playerSprite.spriteData["p1_run"];
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
    if(boxes[i].boxColor){
      ctx.fill();
      ctx.fillStyle = boxes[i].boxColor;
      ctx.fillRect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
    }
    else{

      var boxWidth = boxes[i].width;
      var grassCount = 0;
      while(boxWidth > 70){
        boxWidth -= 70;
        ctx.drawImage(grassImage, 0, 0, 70, grassHeigth, boxes[i].x+70*grassCount, boxes[i].y, 70, 40);
        grassCount++;
      }
      ctx.drawImage(grassImage, 0, 0, boxWidth, grassHeigth, boxes[i].x+70*grassCount, boxes[i].y, boxWidth, 40);
      ctx.fill();
      ctx.fillStyle = "#c99869";
      ctx.fillRect(boxes[i].x, boxes[i].y + grassHeigth, boxes[i].width, boxes[i].height);
    }
  }

  //Render Player.
  ctx.drawImage(playerSprite.image, currentAnimation[currentFrame].x,currentAnimation[currentFrame].y,currentAnimation[currentFrame].w,currentAnimation[currentFrame].h, player.x, player.y, player.width, player.height);
}

function createTerrainBox(Y,X,width,color){
  boxHeight = height - Y;
  boxes.push({
    x: X,
    y: Y,
    width: width,
    height: boxHeight,
    boxColor: color
  });
}

function initTerrain(values){
  for(var i = 0; i < values.length; i++){
    var x = 500;
    if(boxes.length > 0){
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

// window.addEventListener("load", function () {
//   init();
// });
