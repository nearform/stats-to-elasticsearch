'use strict'

const StatsProducer = require('stats')
const ElasticSearch = require('elasticsearch')
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
      if (err) console.error('error emitting stats:', err)
    })
  })

  this.start = () => {
    this._statsProducer.start()
  }

  this.stop = () => {
    this._statsProducer.stop()
  }

  this._formatStats = (stats) => {
    const meta = {
      timestamp: stats.timestamp,
      pid: stats.process.pid,
      title: stats.process.title,
      tags: stats.tags
    }
    return [
      { index: { _index: 'node-stats', _type: 'process' } },
      Object.assign({}, { meta }, stats.process),
      { index: { _index: 'node-stats', _type: 'system' } },
      Object.assign({}, { meta }, stats.system),
      { index: { _index: 'node-stats', _type: 'eventloop' } },
      Object.assign({}, { meta }, stats.eventLoop)
    ].concat(_.flatMap(stats.gcRuns, (run) => [ { index: { _index: 'node-stats', _type: 'gc' } }, Object.assign({}, run, {meta}) ]))
  }
}

module.exports = StatsToElasticSearch
