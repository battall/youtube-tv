var port = 3000;
var getPort = () => {
  require('get-port')().then(e => port = e);
  return {
    port: port
  };
}

var fs = require('fs');
var WebSocket = require('ws');
var wss = new WebSocket.Server({
  port: 81
});

wss.on('connection', ws => {
  ws.wss = new WebSocket.Server(getPort());

  //when controller send message, send to only player; when player send message, send to all controllers.
  ws.wss.on('connection', c => c.on('message', message => ws.send(message)))
  ws.on('message', message => ws.wss.clients.forEach(c => c.readyState === WebSocket.OPEN ? c.send(message) : {}))

  ws.send(new Uint8Array([0, ws.wss.options.port / 256, ws.wss.options.port]));
  ws.on('close', () => ws.wss.close());
});

var express = require('express');
var app = express();

app.get('/source/:source/:method', (req, res) => {
  var source = "./sources/" + req.params.source + ".js"
  if (!fs.existsSync(source)) return res.send(`Source not found (${req.params.source})`)
  if (!require(source)[req.params.method]) return res.send(`Method not found (${req.params.method})`)
  require(source)[req.params.method](req.query).then(e => res.send(e)).catch(e => res.send(e))
});
app.get('/style.css', require('./styleCompiler.js'));

app.use(express.static('./www/'));
app.listen(80, () => console.log("Started", require('perf_hooks').performance.nodeTiming.duration.toFixed(0)))
