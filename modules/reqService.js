const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const common = require('../modules/common.js')

exports.startService = (client) => {
  app.get('/', (req, res) => {
    if (req.method === 'GET') {
      client.logger.log('GET: ' + JSON.stringify(req.body), 'debug')

      switch (req.query.action) {
        case 'refreshPrefix':
          try {
            client.guildPrefixes.push({ GuildID: String(req.body.guildid), Prefix: req.body.prefix })

            client.mysql.query(`SELECT PremiumGuild FROM guilds WHERE GuildID=${req.body.guildid}`, (err, row) => {
              if (err) throw err

              var isPremium = row[0].PremiumGuild
              if (isPremium) {
                client.mysql.query(`UPDATE guilds SET Prefix=${req.body.prefix}`, (err) => {
                  if (err) throw err
                })
              }
            })
          } catch (e) {
            client.logger.log(e, 'error')
          }
          break

        case 'changeSettings':
          common.applySettings(client, req.body)
          break

        case 'guildInfo':
          if (!req.body.guildID) return res.send({ message: 'failure' })
          client.mysql.query(`SELECT PremiumGuild, OwnerID FROM guilds WHERE GuildID=${req.body.guildID}`, (err, rows) => {
            if (err) throw err

            var data = rows[0]

            res.send({ ownerID: data.OwnerID, premiumGuild: data.PremiumGuild, message: 'success' })
          })
          break
      }
    }
  })

  app.listen(3001, () => client.logger.log('Backend connection service ready', 'ready'))
}
