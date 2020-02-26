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

            var obj = { ownerID: rows[0].OwnerID, premiumGuild: rows[0].PremiumGuild, dailyData: [] }

            client.mysql.query(`SELECT messages, users, timestamp FROM daily_data WHERE timestamp > 0 AND guildID=${req.body.guildID} ORDER BY timestamp DESC`, (err, mRows) => {
              if (err) throw err

              if (req.body.days) {
                // If there are specified days, get that amount unless that amount doesn't exist,
                // which in that case we just get the maximum we can
                obj.dailyData = mRows.slice(0, req.body.days > mRows.length ? req.body.days : mRows.length)
              } else {
                // If no days amount has been provided, just do the last week
                obj.dailyData = mRows.slice(0, 7)
              }

              res.send(obj)
            })
          })
          break
      }
    }
  })

  app.listen(3001, () => client.logger.log('Backend connection service ready', 'ready'))
}
