var fs = require('fs');
var autoprefixer = require('autoprefixer');
var postcss = require('postcss');
var sass = require("node-sass");

module.exports = (req, res) => {
  sass.render({ //first render with sass
    data: fs
      .readdirSync("./www/css")
      .map(file => fs.readFileSync("./www/css/" + file))
      .join("\n"),
    outputStyle: "compact"
  }, (err, sassResult) => {
    if (err) return res.send(err); //check errors on sass
    postcss([autoprefixer({ //if no error render with autoprefixer and send
      browsers: "Chrome >= 18"
    })]).process(sassResult.css.toString(), {
      from: undefined
    }).then(autoprefixerResult => {
      autoprefixerResult.warnings().forEach(function(warn) {
        console.warn(warn.toString());
      });
      res.type("css").send(autoprefixerResult.css)
    });
  })
}