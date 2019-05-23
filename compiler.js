var fs = require('fs');
var autoprefixer = require('autoprefixer');
var postcss = require('postcss');
var sass = require("node-sass");

var dir = "dist/"

var cssFolder = "./www/css/"
var css = fs
  .readdirSync(cssFolder)
  .map(file => fs.readFileSync(cssFolder + file))
  .join("\n");
var outputStyle = "compact";
var browsers = "Chrome >= 18"

var jsFolder = "./www/js/"
var js = fs
  .readdirSync(jsFolder)
  .map(file => fs.readFileSync(jsFolder + file))
  .join("\n");

sass.render({ //first render with sass
  data: css,
  outputStyle: outputStyle
}, (err, sassResult) => {
  if (err) return res.send(err); //check errors on sass
  postcss([autoprefixer({ //if no error render with autoprefixer and send
    browsers: browsers
  })]).process(sassResult.css.toString(), {
    from: undefined
  }).then(autoprefixerResult => {
    autoprefixerResult.warnings().forEach(function(warn) {
      console.warn(warn.toString());
    });
    fs.mkdirSync(dir);
    fs.writeFileSync(dir + "css.css", autoprefixerResult.css)
    fs.writeFileSync(dir + "js.js", js)
  });
})
