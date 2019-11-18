var log4js = require('log4js');
var colors = require('colors');

log4js.configure({
  appenders: {
    server: {
      type: 'file',
      filename: 'server.log'
    }
  },
  categories: {
    default: {
      appenders: ['server'],
      level: 'debug',
      format:':method :url :status'
    }
  }
});

colors.setTheme({
    input: 'grey',
    verbose: 'cyan',
    prompt: 'red',
    info: 'green',
    data: 'blue',
    help: 'cyan',
    warn: 'yellow',
    debug: 'magenta',
    error: 'red'
});

var Logger = {

  log4js: log4js,

  init(name) {
    var logger = log4js.getLogger(name);
    return logger;
  },

  console(logger, context, color) {
    logger.info(context);
    switch (color) {
      case 'debug':
        console.log(context.debug);
        break;
      case 'verbose':
        console.log(context.verbose);
        break;
      case 'prompt':
        console.log(context.prompt);
        break;
      case 'error':
        console.log(context.error);
        break;
      case 'warn':
        console.log(context.warn);
        break;
      case 'help':
        console.log(context.help);
        break;
      case 'data':
        console.log(context.data);
        break;
      case 'info':
        console.log(context.info);
        break;
      case 'input':
        console.log(context.input);
        break;
      default:
    }
  }
}

module.exports = Logger;
