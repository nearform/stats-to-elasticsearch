'use strict'

const StatsProducer = require('@nearform/stats')
const ElasticSearch = require('elasticsearch')
const _ = require('lodash')

const defaultEsHost = process.env.ES_HOST || 'localhost'
const defaultEsPort = process.env.ES_PORT || '9200'

const defaultElasticSearchOpts = {
  host: `${defaultEsHost}:${defaultEsPort}`,
  log: 'error',
  maxRetries: Number.MAX_SAFE_INTEGER,
  sniffOnStart: true,
  keepAlive: true,
  sniffOnConnectionFault: true
}

function StatsToElasticSearch (opts = {}) {
  if (!(this instanceof StatsToElasticSearch)) {
    return new StatsToElasticSearch(opts)
  }
  const esOpts = Object.assign({}, defaultElasticSearchOpts, opts.elasticsearchConfig)

  this._statsProducer = new StatsProducer(opts.statsConfig)
  this._esClient = new ElasticSearch.Client(esOpts)

  this._statsProducer.on('stats', (stats) => {
    const body = this._formatStats(stats)

    this._esClient.bulk({ body }, function (err) {
      if (err) console.error('Error emitting stats:', err)
    })
  })

  // start emitting stats
  this._statsProducer.start()

  this.__emitting = true
  this.__open = true

  this.start = () => {
    if (!this.__emitting) {
      this._statsProducer.start()
      this.__emitting = true
    }
  }

  this.stop = () => {
    if (this.__emitting) {
      this._statsProducer.stop()
      this.__emitting = false
    }
  }

  this.close = () => {
    if (this.__emitting) {
      this._statsProducer.stop()
      this.__emitting = false
    }
    if (this.__open) {
      this._esClient.close()
      this.__open = false
    }
  }

  this.reconnect = () => {
    if (!this.__open) {
      this._esClient = new ElasticSearch.Client(esOpts)
    }
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

// check if preloaded and instantiate the connection
if (module.parent.id === 'internal/preload') {
  StatsToElasticSearch()
}
