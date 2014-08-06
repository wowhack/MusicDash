function loadSong(deferred,trackID){
  $.getJSON('https://api.spotify.com/v1/tracks/'+ trackID, 
    {},
    function(data){
      var albumCover = data.album.images[0];
      var string = '<audio src="' + data.preview_url + '" id="' + trackID + '" preload="auto"></audio>'
       $('body').append(string);

       var response = {
        albumCover: albumCover
       }
      deferred.resolve(response);
  });
}

// function loadPlayList(deferred,URI){
//   // spotify:album:6bDO3SRBKew1imMdW6EnrJ
//   var id =
//   $.getJSON('https://api.spotify.com/v1/tracks/'+ trackID, 
//     {},
//     function(data){
//       var string = '<audio src="' + data.preview_url + '" id="' + trackID + '" preload="auto"></audio>'
//        $('body').append(string);
//       deferred.resolve();
//   });
// }

function playSound(trackID) {
  document.getElementById(trackID).play();
}