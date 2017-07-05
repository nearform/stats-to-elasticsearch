const statsToElasticSearch = require('./')

statsToElasticSearch() // start it running

const http = require('http')

http.createServer((req, res) => {
  res.end('hello world')
}).listen(4001)