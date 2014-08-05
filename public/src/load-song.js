function loadSong(deferred,trackID){
  $.getJSON('https://api.spotify.com/v1/tracks/'+ trackID, 
    {},
    function(data){
      var string = '"<audio src="' + data.preview_url + '" id="mp3" preload="auto"></audio>'
       $('body').append(string);
      deferred.resolve();
  });
}

function playSound() {
  document.getElementById("mp3").play();
}