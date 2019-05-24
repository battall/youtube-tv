var https = require('https');
var querystring = require('querystring');
var ytdl = require('ytdl-core')
var yt = {};

yt.request = (path, parser) => new Promise((resolve, reject) => {
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

yt.get = json => ytdl.getInfo(json.id).then(info => ({
    title: info.title,
    url: info.formats.filter(format => format.audioEncoding && format.encoding && format.container != "3gp")[0].url,
}))

yt.search = json => yt.request("/results?search_query=" + encodeURI(json.query) + "&pbj=1", function(json) {
  var videos = json[1].response.contents
    .twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer
    .contents[0].itemSectionRenderer.contents;
  return videos.filter(video => !!video.videoRenderer).map(video => video.videoRenderer).map(video => ({
    id: video.videoId,
    title: video.title.simpleText,
    thumbnail: video.thumbnail.thumbnails[video.thumbnail.thumbnails.length - 1].url
  }));
})

//nowsh requests
const { parse } = require('url')

module.exports = (req, res) => {
  const { query } = parse(req.url, true)
  console.log(query)
  if(!yt[query.method]) return res.end("Source Not Found (dev)")
  yt[query.method](query).then(e => res.end(e)).catch(e => res.end(e))
}
