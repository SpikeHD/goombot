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

            var obj = { ownerID: rows[0].OwnerID, premiumGuild: rows[0].PremiumGuild, messages: 0 }

            client.mysql.query(`SELECT messages, users FROM daily_data WHERE timestamp > 0 AND guildID=${req.body.guildID} ORDER BY timestamp DESC`, (err, mRows) => {
              if (err) throw err
              if (mRows[0]) obj.messages = mRows[0].messages; obj.users = mRows[0].users

              res.send(obj)
            })
          })
          break
      }
    }
  })

  app.listen(3001, () => client.logger.log('Backend connection service ready', 'ready'))
}
