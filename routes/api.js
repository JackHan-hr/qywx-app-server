var express = require('express');
var config = require('../conf/config');
var WxCrypt = require('../until/wxCrypt');
var Message = require('../auth/message');
var Logger = require('../until/log');
const logger = Logger.init('Router');

// 创建一个路由对象，此对象将会监听文件下的url
var router = express.Router();
//配置文件
var appConf = config.app();
//加密解密对像
var wxCrypt = new WxCrypt(appConf.token, appConf.encodingAESKey, appConf.cropId);

//设置跨域访问
router.all('*', function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With");
   res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
   res.header("X-Powered-By", '3.2.1');
   res.header("Content-Type", "application/json;charset=utf-8");
   next();
});

//消息接收
router.post('/v1/auth/message', function(req, res, next) {
  var suiteid = req.body.xml ? req.body.xml.tousername : '';
  var encrypt = req.body.xml ? req.body.xml.encrypt : '';
  var agentid = req.body.xml ? req.body.xml.agentid : '';
  var msg_signature = req.query.msg_signature;
  var timestamp = req.query.timestamp;
  var nonce =  req.query.nonce;

  if (wxCrypt.getSignature(timestamp, nonce, encrypt) === msg_signature) {
    var cryptMsg = wxCrypt.decrypt(encrypt);
    var message = new Message(cryptMsg);
    var infoData = message.receiveMsgType();
    res.status(200).send('success');
  } else {
    Logger.console(logger, '刷新suiteTicket失败', 'error');
    res.status(401).end();
  }
  return;
});

module.exports = router;
