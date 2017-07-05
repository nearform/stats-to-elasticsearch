const StatsToElasticsearch = require('../')
const test = require('tape')

test('the stats to elasticsearch object should send stats to elasticsearch when elasticsearch is running', (t) => {
  const statsToElasticsearch = new StatsToElasticsearch({}, {sampleInterval: 0.5})

  statsToElasticsearch.start()
  statsToElasticsearch._statsProducer.on('stats', (stats) => {
    t.doesNotThrow(() => statsToElasticsearch._formatStats(stats))
  })

  setTimeout(() => {
    statsToElasticsearch.stop()
    t.end()
  }, 1500)
})
