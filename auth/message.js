var config = require('../conf/config');
var AuthLogin = require('./authLogin');
var Store = require('../conf/store');
var parseString = require('xml2js').parseString;
var Logger = require('../until/log');
const logger = Logger.init('Message');

class Message {
  constructor(cryptMsg) {
    var self = this;
    var xmlMessage = cryptMsg.message;
    parseString(xmlMessage, function (err, result) {
      self.resultJson = result.xml;
    });
  }

  receiveMsgType() {
    Logger.console(logger, 'message ===> ' + JSON.stringify(this.resultJson), 'prompt');
    var infoType = this.resultJson.InfoType && this.resultJson.InfoType[0];
    var msgType = this.resultJson.MsgType && this.resultJson.MsgType[0];
    switch (infoType || msgType) {
      case 'suite_ticket':
        this.saveSuiteTicket();
        break;
      case 'create_auth':
        this.getPermanentCodeByAuthCode();
        break;
      case 'cancel_auth':
        break;
      case 'change_contact':
        break;
      case 'event':
        this.saveEventInfo();
        break;
      default:
    }
  }

  //获取并缓存suiteTicket
  saveSuiteTicket() {
    var suiteTicket = this.resultJson.SuiteTicket[0];
    var suiteid = this.resultJson.SuiteId[0];
    const redisClient = config.db.redisClient;
    redisClient.set('suite_ticket_' + suiteid, suiteTicket);
    Logger.console(logger, 'suiteTicket ===> ' + suiteTicket, 'prompt');
  }

  //获取并缓存event信息
  saveEventInfo() {
    var toUserName = this.resultJson.ToUserName[0];
    var fromUserName = this.resultJson.FromUserName[0];
    var agentId = this.resultJson.AgentID[0];
    Store.save('eventInfo', {toUserName: toUserName, fromUserName: fromUserName, agentId: agentId});
  }

  //使用auth_code换取永久授权码并缓存
  getPermanentCodeByAuthCode() {
    var authCode = this.resultJson.AuthCode[0];
    Logger.console(logger, 'auth_code ===> ' + authCode, 'prompt');
    var authLogin = new AuthLogin();
    authLogin.getPermanentCode(authCode);
  }
}

module.exports = Message;
