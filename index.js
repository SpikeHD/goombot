const config = require('./config.json')
const Discord = require('discord.js')
const client = new Discord.Client()

var mysql = require('mysql')

var con = mysql.createConnection({
    host: config.dbhost,
    user: config.dbuser,
    password: config.dbpass
  })

var guildPrefixes;


client.once('ready', () => {
    console.log('Ready')

    con.connect(function(err) {
        if (err) throw err
        console.log("MySQL Database Connected")

        //Gets all prefixes
        con.query(`SELECT GuildID,Prefix FROM ${config.dbname}.guilds`, (err, result) => {
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