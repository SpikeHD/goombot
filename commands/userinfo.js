const { RichEmbed } = require('discord.js')

module.exports.run = async (client, message, args) => {
  var member = message.member

  if (args.length > 1) {
    var match = args[1].match(/^<@!?([0-9]+)>|^([0-9]+)/)

    member = await message.guild.fetchMember(match[1] || match[2])
  }

  var embed = new RichEmbed()
    .setColor(member.displayColor)
    .setAuthor(member.user.tag, member.user.avatarURL)
    .addField('Account Creation', `${new Date(member.user.createdAt).toLocaleString()}`, true)
    .addField('Joined Server', `${new Date(member.joinedAt).toLocaleString()}`, true)

  await message.channel.send(embed)
}
