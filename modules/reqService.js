const http = require('http')
const { parse } = require('querystring')

exports.startService = (client) => {
  http.createServer((req, res) => {
    if (req.method === 'POST') {
      var obj = parse(req.url)
      var firstKey = Object.keys(obj)[0]
      obj[firstKey.replace('/?' || '?', '')] = obj[firstKey]

      delete obj[firstKey]

      client.logger.log('POST: ' + JSON.stringify(obj), 'debug')

      switch (obj.action) {
        case 'refreshPrefix':
          try {
            var exists = false

            client.guildPrefixes.some(g => {
              if (g.GuildID === obj.guildID) {
                if (client.guildPrefixes.indexOf(g)) {
                  client.guildPrefixes[client.guildPrefixes.indexOf(g)].Prefix = obj.prefix
                }
                exists = true
              }
            })

            if (!exists) client.guildPrefixes.push({ GuildID: obj.guildID, Prefix: obj.prefix })
          } catch (e) {
            client.logger.log(e, 'error')
          }
      }
    }

    res.end()
  }).listen(3000)

  client.logger.log('Backend connection service ready', 'ready')
}
