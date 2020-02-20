const http = require('http')

exports.startService = (logger) => {
  http.createServer(function (req, res) {
    if (req.method === 'POST') {
      logger.log('POST: ' + req.url, 'debug')
    }

    res.end()
  }).listen(3000)

  logger.log('Backend connection service ready', 'ready')
}
