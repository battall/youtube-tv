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
