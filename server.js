const http = require("http");

http.createServer((req, res) => {
  res.end("Hello from sample-test app");
}).listen(8080);