const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const { parse } = require('querystring')

app.use(bodyParser.urlencoded())
app.use(bodyParser.json())

const common = require('../modules/common.js')

exports.startService = (client) => {
  app.get('/', (req, res) => {
    // Send success mesage
    res.send({ status: 'success!' })

    if (req.method === 'GET') {
      client.logger.log('POST: ' + JSON.stringify(req.body), 'debug')

      switch (req.query.action) {
        case 'refreshPrefix':
          try {
            client.guildPrefixes.push({ GuildID: String(req.body.guildid), Prefix: req.body.prefix })
            console.log(client.guildPrefixes)
          } catch (e) {
            client.logger.log(e, 'error')
          }
          break

        case 'changeSettings':
          common.applySettings(client, req.body)
          break
      }
    }

    res.end()
  })

  app.listen(3000, () => client.logger.log('Backend connection service ready', 'ready'))
}
