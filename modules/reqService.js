const http = require('http')
const { parse } = require('querystring')

exports.startService = (logger) => {
  http.createServer(function (req, res) {
    if (req.method === 'POST') {
      logger.log('POST: ' + JSON.stringify(parse(req.url)), 'debug')
    }

    res.end()
  }).listen(3000)

  logger.log('Backend connection service ready', 'ready')
}
