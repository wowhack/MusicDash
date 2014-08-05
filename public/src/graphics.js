var sources = {
  resource1: "img/sprite1.png",
  resource2: "img/sprite2.png",
  resource3: "img/sprite3.png"
};

function loadImages(sources, callback, deferred) {
  var image = new Image();
}

function loadGraphics(){
  var terrainLoaded = $.Deferred();
  //Read the player spritesheet
  $.getJSON('/images/spritesheets/p1_spritesheet.json', {
  }, function(data){
    console.log(data);
    //deffered.resolve(BPM,terrain);
  });
}