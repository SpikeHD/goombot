exports.load = (client) => {
  client.mysql.getConnection(function (err, conn) {
    if (err) throw err
    client.logger.log('MySQL Database Ready', 'ready')

    // Gets all prefixes
    conn.query(`SELECT GuildID,Prefix FROM ${client.config.dbname}.guilds`, (err, result) => {
      if (err) throw err
      client.guildPrefixes = Object.values(JSON.parse(JSON.stringify(result)))
    })

    conn.query('SELECT timestamp FROM daily_data ORDER BY timestamp desc', (err, result) => {
      if (err) throw err
      if (!result[0]) return

      // Get the most recent timestamp, doesn't matter which one because they're all the same per day
      var timestamp = result[0].timestamp
      client.lastTimestamp = timestamp

      conn.query(`SELECT guildID, messages FROM daily_data WHERE timestamp = ${client.lastTimestamp}`, (err, tResult) => {
        if (err) throw err
        client.dailyData = Object.values(JSON.parse(JSON.stringify(tResult)))
      })
    })
  })
}

exports.applySettings = (client, data) => {
  // Placeholder for now
}
