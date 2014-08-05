function generateTerrain(){
  console.log("inside terrain generation.");
  var apiKey = "ECLJI0GPBJVEXSZDT";
  var spotifySpace = "spotify";
  var echoNestHost = "http://developer.echonest.com/";
  var trackInfo;
  var goldenRatio = 0.381966;
  var level = {};
  //Fetch track info from echonest
  $.getJSON('http://developer.echonest.com/api/v4/track/profile', {
    'api_key':apiKey,
    'id':'spotify:track:5U727Qt3K2zj4oicwNJajj',
    'bucket':'audio_summary'
  }, function(data){
    trackInfo = data.response.track;

    var analysisURL = trackInfo.audio_summary.analysis_url;
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
            var loudness = 200+200*(segments[i].loudness_max+100)/100;
            terrain.push({
              x:i,
              y:loudness
            });
            if(totalDuration > goldenRatioStart+30){
              break;
            }
          }

        }
        console.log("Done with terrain generation");
        return terrain;
      });
  });
}