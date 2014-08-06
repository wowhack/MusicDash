function loadSong(deferred,trackID){
  $.getJSON('https://api.spotify.com/v1/tracks/'+ trackID, 
    {},
    function(data){
      var string = '<audio src="' + data.preview_url + '" id="' + trackID + '" preload="auto"></audio>'
       $('body').append(string);
      deferred.resolve();
  });
}

function playSound(trackID) {
  document.getElementById(trackID).play();
}