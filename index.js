const fs = require('fs')
const config = require('./config.json')
const Discord = require('discord.js')
const client = new Discord.Client()
client.commands = new Discord.Collection()

var mysql = require('mysql')

const con = mysql.createPool({
  connectionLimit: 100,
  database: config.dbname,
  host: config.dbhost,
  user: config.dbuser,
  password: config.dbpass,
  charset: "utf8mb4"
})

var guildPrefixes;

fs.readdir("./commands/", (err, files) => {
  if (err) throw err
  var commands = files.filter(f => f.endsWith("js"))

  commands.forEach(command => {
      console.log(`Loading ${command}`)

      let props = require(`./commands/${command}`)
      client.commands.set(command.replace('.js', ''), props);
  })
})

client.once('ready', () => {
  console.log('Ready')

  con.getConnection(function (err, conn) {
    if (err) throw err
    console.log("MySQL Database Connected")

    //Gets all prefixes
    conn.query(`SELECT GuildID,Prefix FROM ${config.dbname}.guilds`, (err, result) => {
      if (err) throw err
      guildPrefixes = Object.values(JSON.parse(JSON.stringify(result)))
    })
  })
})

client.on('message', (message) => {
  //Find the prefix that exists for this guild
  var prefix = guildPrefixes.find(x => x.GuildID == message.channel.guild.id).Prefix

  if (!message.content.startsWith(prefix) || message.author.bot) return

  console.log(`${message.author.username}: ${message.content}`)
})

client.login(config.token)