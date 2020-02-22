const handler = require('./modules/handler.js')
const common = require('./modules/common.js')
const moment = require('moment')
const Discord = require('discord.js')
const client = new Discord.Client()

client.commands = new Discord.Collection()
client.config = require('./config.json')
client.logger = require('./modules/logger.js')
client.server = require('./modules/reqService.js')

var mysql = require('mysql')

client.mysql = mysql.createPool({
  connectionLimit: 100,
  database: client.config.dbname,
  host: client.config.dbhost,
  user: client.config.dbuser,
  password: client.config.dbpass,
  charset: 'utf8mb4'
})

handler.load(client)

client.once('ready', () => {
  client.logger.log('Client Ready', 'ready')
  client.server.startService(client)
  common.loadPrefixes(client)

  // Check and update outages
  client.mysql.query(`UPDATE bot_crashes SET onlineTime=${Date.now()} WHERE onlineTime=0`, (err, row) => {
    if (err) throw err
    if (row.affectedRows !== 0) {
      client.mysql.query('SELECT * FROM bot_crashes ORDER BY onlineTime DESC LIMIT 1', (err, rows) => {
        if (err) throw err
        client.logger.log('Detected outage that lasted ' + moment.duration(rows[0].onlineTime - rows[0].crashTime).asSeconds() + ' seconds', 'warn')
      })
    }
  })
})

client.on('message', (message) => {
  // Find the prefix that exists for this guild
  var prefix = client.guildPrefixes.find(x => x.GuildID === message.channel.guild.id).Prefix

  if (!message.content.startsWith(prefix) || message.author.bot) return

  handler.handle(client, message, prefix)
})

client.login(client.config.token)

process.on('uncaughtException', function (err) {
  client.logger.log('Caught exception: ' + err, 'error')

  // Assume MySQL is still working
  client.mysql.query(`INSERT INTO bot_crashes(crashTime) VALUES(${Date.now()})`, (err, row) => {
    if (err) process.exit()
    if (row) {
      client.logger.log('Outage entry created. See you in the afterlife o7', 'log')
      process.exit()
    }
  })
})
