window.YoutubePlayer = {};

YoutubePlayer.config = {
  host: document.location.origin,
  api: document.location.origin + "/source/youtube.js",
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
