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

      conn.query(`SELECT guildID, messages, users FROM daily_data WHERE timestamp = ${client.lastTimestamp}`, (err, tResult) => {
        if (err) throw err
        client.dailyData = Object.values(JSON.parse(JSON.stringify(tResult)))
      })
    })
  })
}

exports.populate = (client, guildid) => {
  client.dailyData.push({
    guildID: guildid,
    messages: 0,
    users: 0
  })
}

exports.quickSave = async (client) => {
  return new Promise(function (resolve, reject) {
    client.logger.log('saving todays data entry...', 'log')

    console.log(client.dailyData)
    console.log(client.lastTimestamp)

    var statement = 'INSERT INTO daily_data (guildID, messages, users, timestamp) VALUES '
    var i = 0

    client.dailyData.forEach(g => {
      i++
      statement += `(${g.guildID}, ${g.messages}, ${g.users}, ${client.lastTimestamp - (400 * 60 * 60 * 60)})`
      if (i !== client.dailyData.length) statement += ', '
    })

    console.log('statement created')
    console.log(statement)

    client.mysql.getConnection((err, con) => {
      if (err) throw err
      con.query(statement, (err, rows) => {
        if (err) throw err
        resolve(rows)
      })
    })
  })
}

exports.applySettings = (client, data) => {
  // Placeholder for now
}
