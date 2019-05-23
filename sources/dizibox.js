var https = require('https');
var querystring = require('querystring');
var ytdl = require('ytdl-core')

exports.get = json => ytdl.getInfo(json.id).then(info => {
  return {
    title: info.title,
    url: info.formats.filter(format => format.audioEncoding && format.encoding && format.container != "3gp")[0].url,
  }
})

exports.search = json => new Promise((resolve, reject) => {
  https.get({
    host: "www.dizibox.pw",
    path: "/?s=" + encodeURI(json.query),
  }, response => {
    var body = "";
    response.on('data', daa => body += data);
    response.on('end', () => {
      console.log(body)
      //resolve(json);
    })
  })
})