'use strict'

const StatsProducer = require('stats')
const ElasticSearch = require('elasticsearch')
const initialiseDashboard = require('./initialiseDashboard')
const _ = require('lodash')

const defaultElasticSearchOpts = {
  host: 'localhost:9200',
  log: 'info'
}

function StatsToElasticSearch (elasticSearchOpts, statsOpts) {
  if (!(this instanceof StatsToElasticSearch)) {
    return new StatsToElasticSearch(elasticSearchOpts, statsOpts)
  }

  this._statsProducer = new StatsProducer(statsOpts)
  this._esClient = new ElasticSearch.Client(Object.assign({}, elasticSearchOpts, defaultElasticSearchOpts))

  this._statsProducer.on('stats', (stats) => {
    const body = this._formatStats(stats)

    this._esClient.bulk({ body }, function (err) {
      if (err) console.error(err)
    })
  })

  this.start = () => {
    this._statsProducer.start()
  }

  this.stop = () => {
    this._statsProducer.stop()
  }

  this.initialiseDashboardIfNeeded = () => initialiseDashboard(this._esClient)

  this._formatStats = (stats) => {
    return [
      { index: { _index: 'node-stats', _type: 'process' } },
      Object.assign({}, { timestamp: stats.timestamp }, stats.process),
      { index: { _index: 'node-stats', _type: 'system' } },
      Object.assign({}, { timestamp: stats.timestamp }, stats.system),
      { index: { _index: 'node-stats', _type: 'eventloop' } },
      Object.assign({}, { timestamp: stats.timestamp }, stats.eventLoop)
    ].concat(_.flatMap(stats.gcRuns, (run) => [ { index: { _index: 'node-stats', _type: 'gc' } }, run ]))
  }
}

module.exports = StatsToElasticSearch
