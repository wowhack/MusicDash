var sources = {
  p1_sprite:"/images/spritesheets/p1_spritesheet.png"
};

function sprite (options) {

    var that = {};
    //that.context = options.context;
    that.image = options.image;
    that.spriteData = options.spriteData;
    return that;
}
function loadImages(sources, callback, deferred) {
  var image = new Image();
}

function loadGraphics(deferred){
  var graphicsDataLoaded = $.Deferred();
  var assMan = new AssetManager();
  for(var source in sources){
    if (sources.hasOwnProperty(source)) {
        assMan.queueDownload(sources[source]);
    }
  }
  assMan.downloadAll(function(){
    $.when(graphicsDataLoaded).done(//levelLoaded
    function(sheetData){
      var spriteName = sheetData.spritename;
      var frames = sheetData.spriteframes;
      var spriteData = {};
      for(var frameData in frames){
        var dataFrames = frames[frameData];
        spriteData[frameData] = [];
        for(var i = 0; i < dataFrames.length; i++){
          spriteData[frameData][i] = {
            x:parseInt(dataFrames[i][0], 10),
            y:parseInt(dataFrames[i][1], 10),
            w:parseInt(dataFrames[i][2], 10),
            h:parseInt(dataFrames[i][3], 10)
          };
        }
      }

      var playerSprite = sprite({
        image:assMan.getAsset(sources[spriteName]),
        spriteData:spriteData
      });
      //console.log(sheetData);
      var response = {playerSprite:playerSprite};
      deferred.resolve(response);
    });
  });
  //Read the player spritesheet
  $.getJSON('/images/spritesheets/p1_spritesheet.json', {
  }, function(data){
    graphicsDataLoaded.resolve(data.tilesheet);
  });
}