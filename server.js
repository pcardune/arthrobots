var express = require('express');
var rewrite = require("connect-url-rewrite");
var app = express();

app.set('port', (process.env.PORT || 8000));
app.use(
  rewrite(["^\/[^\.]+$ /index.html"]),
  express.static(__dirname)
);

app.get('/', function(request, response) {
  response.send('Hello World!')
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});
