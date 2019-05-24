"use strict";

window.addEventListener("error", function(error) {
  alert(error.filename + " " + error.message);
  return true;
});
window.YoutubePlayer = {};

YoutubePlayer.config = {
  host: document.location.origin,
  api: document.location.origin + "/source/youtube",
}

YoutubePlayer.routes = {
    search: YoutubePlayer.config.api + "?method=search",
    get: YoutubePlayer.config.api + "?method=get"
}

YoutubePlayer.createElement = function(type, attributes, children) {
  var element = document.createElement(type);

  for (var key in attributes) {
    if (key.slice(0, 2) == "on") {
      element.addEventListener(key.slice(2), attributes[key]);
    } else {
      element.setAttribute(key, attributes[key]);
    }
  }

  if (children) {
    if (!Array.isArray(children)) children = [children];
    for (var i = 0, len = children.length; i < len; i++) {
      if (typeof children[i] == "string") {
        element.appendChild(document.createTextNode(children[i]));
      } else {
        element.appendChild(children[i]);
      }
    }
  }

  return element;
}

YoutubePlayer.toHHMMSS = function(secs) {
  var hours = Math.floor(secs / 3600) % 24;
  var minutes = Math.floor(secs / 60) % 60;
  var seconds = secs % 60;
  return [hours, minutes, seconds]
    .map(function(v) {
      return v < 10 ? "0" + v : v;
    })
    .filter(function(v, i) {
      return v !== "00" || i > 0;
    })
    .join(":");
}

YoutubePlayer.nav = {
  elem: document.querySelector(".nav"),
  searchInput: document.querySelector(".nav__search__input"),
  searchButton: document.querySelector(".nav__search__button"),
  result: document.querySelector(".nav__result")
}

YoutubePlayer.nav.open = function() {
  this.nav.elem.classList.add("nav--open");
  window.addEventListener("click", this.nav.close);
}.bind(YoutubePlayer);

YoutubePlayer.nav.close = function(mouse) {
  if (mouse && mouse.pageX < 280) return;
  this.nav.elem.classList.remove("nav--open");
  window.removeEventListener("click", this.nav.close);
}.bind(YoutubePlayer);

YoutubePlayer.nav.processResults = function(videos) { //refactor this.
  while (this.nav.result.firstChild) {
    this.nav.result.removeChild(this.nav.result.firstChild);
  }
  var that = this;
  for (var i = 0, len = videos.length; i < len; i++) {
    var item = videos[i];
    this.nav.result.appendChild(
      this.createElement("div", {
        class: "video-list__item",
        onclick: function() {
          that.player.changeVideo(that.routes.get + "&id=" + this.id);
          that.nav.close();
        }.bind(item)
      }, [this.createElement("img", {
        class: "video-list__item__thumbnail",
        src: item.thumbnail
      }), this.createElement("span", {
        class: "video-list__item__title"
      }, item.title)])
    );
  }
}.bind(YoutubePlayer);

YoutubePlayer.nav.search = function(query) {
  var nav = this.nav;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      nav.processResults(JSON.parse(xhttp.responseText));
    }
  };
  xhttp.open("GET", this.routes.search + "&query=" + query, true);
  xhttp.send();
}.bind(YoutubePlayer)

window.addEventListener("mousemove", function(mouse) {
  if (mouse.pageX < 30) {
    this.nav.elem.classList.add("nav--show");
    this.nav.elem.addEventListener("click", this.nav.open);
  } else {
    this.nav.elem.classList.remove("nav--show");
    this.nav.elem.removeEventListener("click", this.nav.open);
  }
}.bind(YoutubePlayer));

YoutubePlayer.nav.searchInput.addEventListener("keyup", function(event) {
  event.preventDefault();
  if (event.keyCode !== 13) return;
  this.nav.search(this.nav.searchInput.value);
}.bind(YoutubePlayer));

YoutubePlayer.nav.searchButton.addEventListener("click", function() {
  this.nav.search(this.nav.searchInput.value);
}.bind(YoutubePlayer))

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