const https = require('https')
const { RichEmbed } = require('discord.js')

exports.run = (client, message, args) => {
  args.shift()

  var q = args.join('%20')

  https.get('https://api.urbandictionary.com/v0/define?page=1&term=' + q, (res) => {
    var data = ''

    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', () => {
      var obj = JSON.parse(data).list[0]

      // Filter square brackets
      obj.definition = obj.definition.replace(new RegExp(/(\[|\])/, 'g'), '')

      var embed = new RichEmbed()
        .setColor('BLUE')
        .setTitle(obj.word + ' - Top Definition with ' + obj.thumbs_up + ' points')
        .setDescription(obj.definition + '\n\n[Permalink](' + obj.permalink + ')')
        .addField('Example', obj.example)
        .setFooter('Written on: ' + obj.written_on)

      message.channel.send(embed)
      console.log(obj)
    })
  })
}
