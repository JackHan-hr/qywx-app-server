var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);
var mongoose = require("mongoose");
var redis = require('redis');
var Logger = require('./until/log');
const logger = Logger.init('App');
var config = require('./conf/config');
var AuthLogin = require('./auth/authLogin');

const app = express();

app.use(Logger.log4js.connectLogger(logger));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(bodyParser.xml({
  limit: '1MB',
  xmlParseOptions: {
    normalize: true,
    normalizeTags: true,
    explicitArray: false
  },
  verify: function(req, res, buf, encoding) {
    if(buf && buf.length) {
      req.rawBody = buf.toString(encoding || "utf8");
    }
  }
}));

var args = process.argv.splice(2);

if (!args || !args.length)
  return;

config.env(args);

var MOGO_CON_STR = config.mongodb();
var redisClient = redis.createClient(config.redis);

//连接mogodb数据库
mongoose.connect(MOGO_CON_STR);
//如果连接成功会执行open回调
mongoose.connection.on('open', function () {
  Logger.console(logger, 'mongo数据库连接成功 ===> ' + MOGO_CON_STR, 'debug');
  config.db.mongoose = mongoose;

  //wxapi
  app.use('/api', require('./routes/api'));

  //auth登录
  app.get('/api/v1/login/authorize', function(req, res, next) {
    var authLogin = new AuthLogin();
    authLogin.getSuiteToken(function(response) {
      response && response.errmsg ? res.send(response.errmsg) : response.callbackUri
                                  ? res.redirect(response.callbackUri) : res.redirect('/');
      return;
    });
  });

  app.use('/', serveStatic(path.join(__dirname, '../build')));
  app.use('/*', serveStatic(path.join(__dirname, '../build/index.html')));

  app.listen(9040);
});
// 链接错误
mongoose.connection.on('error', function(error) {
  Logger.console(logger, '数据库连接失败' + error, 'error');
});

//redis数据库连接
redisClient.on("ready", function(err) {
  if (err) return false;
  Logger.console(logger, 'redis数据库连接成功 ===> port: 6379 host: 127.0.0.1', 'debug');
  config.db.redisClient = redisClient;
});

redisClient.on("error", function (error) {
  Logger.console(logger, 'redis数据库连接失败 port: ' + error, 'error');
});
