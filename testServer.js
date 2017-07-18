const StatsToElasticSearch = require('./')

const statsToElasticSearch = new StatsToElasticSearch({}, {tags: ['server', 'test']}) // start it running
statsToElasticSearch.start()

const http = require('http')

http.createServer((req, res) => {
  res.write('hello world')
  res.end()
}).listen(4001, () => console.log('listening on port 4001'))
