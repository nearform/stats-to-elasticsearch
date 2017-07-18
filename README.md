# stats-to-elasticsearch

[![Build Status](https://travis-ci.org/nearform/stats-to-elasticsearch.svg?branch=master)](https://travis-ci.org/nearform/stats-to-elasticsearch)

Collect and send [stats](http://github.com/nearform/stats) about your node.js process to elasticsearch.

This module exposes a function which initialises a connection to elasticsearch and creates a stats event emitter to gather stats to be sent via the connection.

## Installation

```
npm i -s @nearform/stats-to-elasticsearch
```

## Usage

```js
const StatsToElastic = require('@nearform/stats-to-elasticsearch')
const statsToElastic = StatsToElastic({elaticsearchConfig: {...}, statsConfig: {...}})
statsToElastic.start()
```

## API

```
StatsToElastic(opts)
```

Returns: An object configured with an open connection to elasticsearch and a stats event emitter to gather stats from.

`Opts` is an object which can contain the following properties:
- `elasticsearchConfig`: a configuration object which is passed to the [elasticsearch module](http://npm.im/elasticsearch) when initialising theconnection. Configured with the following defaults:
  - ```js
      {
        host: 'localhost:9200',
        log: 'error',
        maxRetries: Number.MAX_SAFE_INTEGER,
        sniffOnStart: true,
        keepAlive: true,
        sniffOnConnectionFault: true
      }
    ```
- `statsConfig`: A configuration object which is passed to the [stats module](http://github.com/nearform/stats) when initialising the stats event emitter. Configured to use the standard stats defaults.

The object which was returned contains the following methods:

```
statsToElastic.start()
```

Starts the stats event emitter emitting stats to be sent to elasticsearch

```
statsToElastic.stop()
```

Stops the stats event emitter emitting stats

## License

Apache 2.0