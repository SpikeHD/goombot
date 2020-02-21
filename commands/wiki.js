const https = require('https')
const { RichEmbed } = require('discord.js')

exports.run = (client, message, args) => {
  args.shift()

  var q = args.join('%20')

  https.get('https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|extracts&titles=' + q + '&exintro=&exsentences=2&redirects=&explaintext=&formatversion=2&piprop=original&format=json', (res) => {
    var data = ''

    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', () => {
      var obj = JSON.parse(data).query.pages[0]

      if (!obj.missing) {
        console.log(obj)

        var embed = new RichEmbed()
          .setColor('BLUE')
          .setTitle(obj.title)
          .setDescription(obj.extract + '\n\n[Permalink](https://en.wikipedia.org/wiki/' + q + ')')
          .setFooter('Page ID: ' + obj.pageid)

        if (obj.original) embed.setThumbnail(obj.original.source)

        message.channel.send(embed)
      } else {
        message.channel.send('Page not found!')
      }
    })
  })
}
