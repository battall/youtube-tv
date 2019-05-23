YoutubePlayer.player = {
  elem: document.querySelector(".player"),
  title: document.querySelector(".player__title"),
  video: document.querySelector(".player__video"),
  controls: document.querySelector(".player__controls"),
  timeSpans: document.querySelectorAll(".player__controls__time"),
  fill: document.querySelector(".player__controls__progress__fill"),
}

YoutubePlayer.player.changeVideo = function(url) {
  var that = this;
  var xhttp = new XMLHttpRequest();
  that.player.title.textContent = "Loading..."
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var json = JSON.parse(xhttp.responseText);
      that.player.title.textContent = json.title;
      that.player.video.src = json.url;
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}.bind(YoutubePlayer);

YoutubePlayer.player.toggleControls = function(mouse) { //gizlenmesi gerekiyorsa gizliyor, yani: mesela video durdurulduğunda gizlemiyor gibisinden.
  this.player.showControls();
  if (this.player.hideControlsTimeout) clearTimeout(this.player.hideControlsTimeout)
  if (!this.player.video.paused || (mouse && !this.player.video.paused)) this.player.hideControlsTimeout = setTimeout(this.player.hideControls, 1000)
}.bind(YoutubePlayer)

YoutubePlayer.player.showControls = function() {
  this.player.title.classList.remove("player__title--hide");
  this.player.controls.classList.remove("player__controls--hide");
}.bind(YoutubePlayer);

YoutubePlayer.player.hideControls = function() {
  this.player.title.classList.add("player__title--hide");
  this.player.controls.classList.add("player__controls--hide");
}.bind(YoutubePlayer);

YoutubePlayer.player.togglePlay = function() {
  this.player.video[this.player.video.paused ? "play" : "pause"]();
  YoutubePlayer.player.toggleControls();
}.bind(YoutubePlayer);

YoutubePlayer.player.handleProgress = function() {
  var video = this.player.video;
  var current = Math.floor(video.currentTime);
  var duration = video.duration ? Math.floor(video.duration) : 0;
  this.player.timeSpans[0].textContent = this.toHHMMSS(current);
  this.player.timeSpans[1].textContent = this.toHHMMSS(duration - current);
  this.player.fill.style.width = (video.currentTime / video.duration) * 100 + "%";
}.bind(YoutubePlayer);

window.addEventListener("mousemove", YoutubePlayer.player.toggleControls);
YoutubePlayer.player.video.addEventListener("timeupdate", YoutubePlayer.player.handleProgress);
YoutubePlayer.player.video.addEventListener("click", YoutubePlayer.player.togglePlay);