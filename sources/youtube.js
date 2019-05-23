var https = require('https');
var querystring = require('querystring');
var ytdl = require('ytdl-core')

var request = (path, parser) => new Promise((resolve, reject) => {
  https.get({
    host: "www.youtube.com",
    path: path,
    headers: {
      "x-youtube-client-name": 1,
      "x-youtube-client-version": 2.20181221,
    }
  }, response => {
    var data = "";
    response.on('data', d => data += d);
    response.on('end', () => {
      var json = JSON.parse(data);
      if (parser) json = parser(json)
      resolve(json);
    })
  })
})

exports.get = json => ytdl.getInfo(json.id).then(info => {
  return {
    title: info.title,
    url: info.formats.filter(format => format.audioEncoding && format.encoding && format.container != "3gp")[0].url,
  }
})

exports.search = json => request("/results?search_query=" + encodeURI(json.query) + "&pbj=1", function(json) {
  var videos = json[1].response.contents
    .twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer
    .contents[0].itemSectionRenderer.contents;
  return videos.filter(video => !!video.videoRenderer).map(video => video.videoRenderer).map(video => ({
    id: video.videoId,
    title: video.title.simpleText,
    thumbnail: video.thumbnail.thumbnails[video.thumbnail.thumbnails.length - 1].url
  }));
})