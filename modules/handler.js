const fs = require('fs')

module.exports.load = (client) => {
  fs.readdir('./commands/', (err, files) => {
    if (err) throw err
    var commands = files.filter(f => f.endsWith('js'))

    commands.forEach(command => {
      client.logger.debug(`Loading command: ${command}`)

      const props = require(`../commands/${command}`)
      client.commands.set(command.replace('.js', ''), props)
    })
  })
}

module.exports.handle = (client, message, prefix) => {
  var command = message.content.split(prefix)[1].split(' ')[0]
  var args = message.content.split(' ')
  var cmd = client.commands.get(command)

  if (cmd) {
    cmd.run(client, message, args)
  }
}
