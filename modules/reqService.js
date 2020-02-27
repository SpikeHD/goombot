const express = require('express')
const moment = require('moment')
const cors = require('cors')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors({ origin: '*' }))

const common = require('../modules/common.js')

exports.startService = (client) => {
  app.post('/', (req, res) => {
    if (req.method === 'POST') {
      client.logger.log('POST: ' + JSON.stringify(req.body), 'debug')

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

              obj.dailyData.forEach(o => {
                var i = obj.dailyData.indexOf(o)

                obj.dailyData[i].date = moment(o.timestamp * 1000).format('MM/DD/YYYY')
              })

              res.send(obj)
            })
          })
          break
        case 'authorize':
          if (!req.body.code) return res.send({ message: 'failure' })

          try {
            request.post({
              json: true,
              url: 'https://discordapp.com/api/oauth2/token',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              form: {
                client_id: client.config.clientid,
                client_secret: client.config.clientsecret,
                grant_type: 'authorization_code',
                code: req.body.code,
                redirect_uri: 'http://localhost:3000'
              }
            }, (err, resp, body) => {
              if (err) return res.send({ message: 'failure' })
              return res.send(JSON.stringify(body))
            })
          } catch (e) {
            client.logger.error(e)
          }

          break
      }
    }
  })

  app.listen(3001, () => client.logger.log('Backend connection service ready', 'ready'))
}
