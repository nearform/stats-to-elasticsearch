'use strict'

const StatsProducer = require('stats')
const ElasticSearch = require('elasticsearch')
const utils = require('util')
const _ = require('lodash')

const defaultElasticSearchOpts = {
  host: 'localhost:9200',
  log: 'info'
}

module.exports = function (elasticSearchOpts, statsOpts) {
  const statsProducer = new StatsProducer(statsOpts)
  const client = new ElasticSearch.Client(Object.assign({}, elasticSearchOpts, defaultElasticSearchOpts))

  statsProducer.start()


  statsProducer.on('stats', (stats) => {
    client.bulk({ body: [
      { index:  { _index: 'node-stats', _type: 'process' } },
      Object.assign({}, { timestamp: stats.timestamp }, stats.process),
      { index:  { _index: 'node-stats', _type: 'system' } },
      Object.assign({}, { timestamp: stats.timestamp }, stats.system),
      { index:  { _index: 'node-stats', _type: 'eventloop' } },
      Object.assign({}, { timestamp: stats.timestamp }, stats.eventLoop),
      ..._.flatMap(stats.gcRuns, (run) => {
        return [
          { index:  { _index: 'node-stats', _type: 'gc' } },
          run
        ]
      })
    ]}, function (err) {
      if (err) console.error(err)
    })
  })
}
