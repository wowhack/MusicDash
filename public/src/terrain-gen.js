var TERRAIN_MULTIPLIER = 25;//Increases block severity
var TERRAIN_TRESHOLD = 50;//A lower threshold will cause a bigger part of the blocks to be affected by the chance (averageY-blockY) < treshold
var TRESHOLD_CHANGE = 60;//How much the affected blocks will shift towards the average value
function generateTerrain(deferred,trackID){
  var apiKey         = "ECLJI0GPBJVEXSZDT";
  var spotifySpace   = "spotify";
  var echoNestHost   = "http://developer.echonest.com/";
  var format         = "json";
  var trackInfo;
  var goldenRatio = 0.381966;
  var level = {};

  //Fetch track info from echonest
  $.getJSON('http://developer.echonest.com/api/v4/track/profile', {
    'api_key':apiKey,
    'id':'spotify:track:'+trackID,
    'format':format,
    'bucket':'audio_summary'
  }, function(data){
    trackInfo = data.response.track;
    var BPM = trackInfo.audio_summary.tempo;

    var analysisURL = trackInfo.audio_summary.analysis_url;
    console.log(analysisURL);
    //console.log(analysisURL);
    //Fetch the track analysis, proxied through yahooapi (base on an example which said "temporary, but it works")
     $.getJSON("http://query.yahooapis.com/v1/public/yql",
      { q: "select * from json where url=\"" + analysisURL + "\"", format: "json"}, function(data){
        var trackInfo = data.query.results.json;
        var segments = trackInfo.segments;

        //the x/y values that will be returned
        var terrain = [];

        //Find where the preview starts
        var goldenRatioStart = Math.round(trackInfo.track.duration*goldenRatio);
        //Loop through the segments and add up duration until we find the start of the preview (golden ratio) and the end (golden ratio+ 0)
        var totalDuration = 0;
        for(var i = 0; i < segments.length; i++){
          totalDuration += parseFloat(segments[i].duration);
          if(totalDuration > goldenRatioStart){
            var loudness = 550+TERRAIN_MULTIPLIER*segments[i].loudness_max;//300 + 500 * (segments[i].loudness_max+100)/100;
            terrain.push({
              y:loudness,
              width: segments[i].duration / (60/BPM)
            });
            if(totalDuration > goldenRatioStart+30){
              break;
            }
          }

        }
        var avg = 0;
        for(i = 0; i < terrain.length; i++){
          avg += terrain[i].y;
        }
        avg = avg/terrain.length;
        for(i = 0; i < terrain.length; i++){
          var negTreshold = -1*TERRAIN_TRESHOLD;
          if(avg-terrain[i].y < negTreshold){
            terrain[i].y = terrain[i].y - TRESHOLD_CHANGE;
          } else if(avg-terrain[i].y > TERRAIN_TRESHOLD){
            terrain[i].y = terrain[i].y + TRESHOLD_CHANGE;
          }
        }
        var response = {
          BPM: BPM,
          terrainValue: terrain
        };
        console.log("resolve terrain");
        deferred.resolve(response);
      });
  });
}