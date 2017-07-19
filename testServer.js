// const StatsToElasticSearch = require('./')
// const statsToElasticSearch = new StatsToElasticSearch({statsConfig: {tags: ['server', 'test']}}) // start it running

const http = require('http')

const server = http.createServer((req, res) => {
  res.write('hello world')
  res.end()
})

server.listen(4001, () => console.log('listening on port 4001'))

// setTimeout(() => {
//   statsToElasticSearch.close()
//   server.close()
// }, 4000)
