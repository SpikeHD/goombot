const handler = require('./modules/handler.js')
const common = require('./modules/common.js')
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
})

client.on('message', (message) => {
  // Find the prefix that exists for this guild
  var prefix = client.guildPrefixes.find(x => x.GuildID === message.channel.guild.id).Prefix

  if (!message.content.startsWith(prefix) || message.author.bot) return

  handler.handle(client, message, prefix)
})

client.login(client.config.token)
