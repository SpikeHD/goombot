exports.load = (client) => {
  client.mysql.getConnection(function (err, conn) {
    if (err) throw err
    client.logger.log('MySQL Database Ready', 'ready')

    // Gets all prefixes
    conn.query(`SELECT GuildID,Prefix FROM ${client.config.dbname}.guilds`, (err, result) => {
      if (err) throw err
      client.guildPrefixes = Object.values(JSON.parse(JSON.stringify(result)))
    })
  })
}

exports.applySettings = (client, data) => {
  // Placeholder for now
}
