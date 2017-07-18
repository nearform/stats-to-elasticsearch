'use strict'

const StatsProducer = require('@nearform/stats')
const ElasticSearch = require('elasticsearch')
const _ = require('lodash')

const defaultElasticSearchOpts = {
  host: 'localhost:9200',
  log: 'error',
  maxRetries: Number.MAX_SAFE_INTEGER,
  sniffOnStart: true,
  keepAlive: true,
  sniffOnConnectionFault: true
}

function StatsToElasticSearch (opts) {
  if (!(this instanceof StatsToElasticSearch)) {
    return new StatsToElasticSearch(opts)
  }

  this._statsProducer = new StatsProducer(opts.statsConfig)
  this._esClient = new ElasticSearch.Client(Object.assign({}, defaultElasticSearchOpts, opts.elasticsearchConfig))

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
      id: stats.id,
      tags: stats.tags,
      pid: stats.process.pid,
      hostname: stats.system.hostname
    }
    stats.process.meta = meta
    stats.system.meta = meta
    stats.eventLoop.meta = meta
    return [
      { index: { _index: 'node-stats', _type: 'process' } },
      stats.process,
      { index: { _index: 'node-stats', _type: 'system' } },
      stats.system,
      { index: { _index: 'node-stats', _type: 'eventloop' } },
      stats.eventLoop
    ].concat(_.flatMap(stats.gcRuns, (run) => {
      run.meta = meta
      return [ { index: { _index: 'node-stats', _type: 'gc' } }, run ]
    }))
  }
}

module.exports = StatsToElasticSearch
