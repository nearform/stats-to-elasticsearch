const statsToElasticSearch = require('./')

statsToElasticSearch() // start it running

const http = require('http')

http.createServer((req, res) => {
  res.write('hello world')
  res.end()
}).listen(4001)