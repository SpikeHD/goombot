const chalk = require('chalk')
const moment = require('moment')

exports.log = (content, type = 'log') => {
  const timestamp = `[${moment().format('YYYY-MM-DD HH:mm:ss')}]:`

  switch (type) {
    case 'log': {
      return console.log(`[${chalk.bgBlue(type.toUpperCase())}] ${chalk.gray(timestamp)} ${content}`)
    }
    case 'warn': {
      return console.log(`[${chalk.black.bgYellow(type.toUpperCase())}] ${chalk.gray(timestamp)} ${content}`)
    }
    case 'error': {
      return console.log(`[${chalk.bgRed(type.toUpperCase())}] ${chalk.gray(timestamp)} ${content}`)
    }
    case 'debug': {
      return console.log(`[${chalk.green(type.toUpperCase())}] ${chalk.gray(timestamp)} ${content}`)
    }
    case 'cmd': {
      return console.log(`[${chalk.black.bgWhite(type.toUpperCase())}] ${chalk.gray(timestamp)} ${content}`)
    }
    case 'ready': {
      return console.log(`[${chalk.black.bgGreen(type.toUpperCase())}] ${chalk.gray(timestamp)} ${content}`)
    }
    default: throw new TypeError('Logger type must be either warn, debug, log, ready, cmd or error.')
  }
}

exports.error = (...args) => this.log(...args, 'error')
exports.warn = (...args) => this.log(...args, 'warn')
exports.debug = (...args) => this.log(...args, 'debug')
exports.cmd = (...args) => this.log(...args, 'cmd')
