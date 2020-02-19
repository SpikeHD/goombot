const fs = require('fs')
const handler = require("./modules/handler.js")
const config = require('./config.json')
const Discord = require('discord.js')
const client = new Discord.Client()
client.commands = new Discord.Collection()

var mysql = require('mysql')

client.mysql = mysql.createPool({
  connectionLimit: 100,
  database: config.dbname,
  host: config.dbhost,
  user: config.dbuser,
  password: config.dbpass,
  charset: "utf8mb4"
})

handler.load(client);

client.once('ready', () => {
  console.log('Ready')

  client.mysql.getConnection(function (err, conn) {
    if (err) throw err
    console.log("MySQL Database Connected")

    //Gets all prefixes
    conn.query(`SELECT GuildID,Prefix FROM ${config.dbname}.guilds`, (err, result) => {
      if (err) throw err
      client.guildPrefixes = Object.values(JSON.parse(JSON.stringify(result)))
    })
  })
})

client.on('message', (message) => {
  //Find the prefix that exists for this guild
  var prefix = client.guildPrefixes.find(x => x.GuildID == message.channel.guild.id).Prefix

  if (!message.content.startsWith(prefix) || message.author.bot) return

  handler.handle(client, message, prefix);
})

client.login(config.token)