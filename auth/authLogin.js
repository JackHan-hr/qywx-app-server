var config = require('../conf/config');
var url = require('../routes/url');
var AuthApi = require('../routes/authApi');
var Store = require('../conf/store');
var Logger = require('../until/log');
const logger = Logger.init('AuthLogin');

class AuthLogin {
  constructor() {
    var confApp = config.app();
    this.suiteId = confApp.suiteId;
    this.indexCallback = confApp.indexCallBack;
    this.suitSecret = confApp.suitSecret;
    this.redisClient = config.db.redisClient;
  }

  //获取并缓存suiteAccessToken
  getSuiteToken(callback, permanentCode) {
    if (!this.redisClient) {
      callback && callback({errmsg: 'redis数据库连接失败...'});
      return;
    }
    this.callback = callback;
    var self = this;
    const suiteTicket = this.redisClient.get('suite_ticket_' + this.suiteId, function(err, suiteTicket) {
      if (err) return false;
      Logger.console(logger, 'redisClient:suiteTicket ===> ' + suiteTicket, 'verbose');
      const data = {
        suite_id: self.suiteId,
        suite_secret: self.suitSecret,
        suite_ticket: suiteTicket
      }
      var accessTokenKey = `suite_access_token:${self.suiteId}`;
      self.redisClient.get(accessTokenKey, function(err, suiteAccessToken) {
        if (err) return false;
        Logger.console(logger, 'redisClient:suiteAccessToken ===> ' + suiteAccessToken, 'verbose');
        if (suiteAccessToken) {
          permanentCode ? permanentCode(suiteAccessToken) : self.getPreAuthCode(suiteAccessToken);
        } else {
          AuthApi.post(url.suiteToken, data, function(res) {
            if (res.errcode) {
              self.outputError(res.name, res.errcode, res.errmsg);
            } else {
              var suiteAccessToken = res.suite_access_token;
              Logger.console(logger, 'suiteAccessToken ===> ' + suiteAccessToken, 'prompt');
              permanentCode ? permanentCode(suiteAccessToken) : self.getPreAuthCode(suiteAccessToken);
              self.redisClient.set(accessTokenKey, suiteAccessToken);
              self.redisClient.expire(accessTokenKey, 7200);
            }
          });
        }
      });
    });
  }

  //获取预授权码
  getPreAuthCode(suiteAccessToken) {
    var self = this;
    AuthApi.get(url.preAuthCode(suiteAccessToken), function(res) {
      if (res.errcode) {
        self.outputError(res.name, res.errcode, res.errmsg);
      } else {
        var preAuthCode = res.pre_auth_code;
        Logger.console(logger, 'preAuthCode ===> ' + preAuthCode, 'prompt');
        self.authConfig(preAuthCode, suiteAccessToken);
      }
    });
  }

  //授权配置
  authConfig(preAuthCode, suiteAccessToken) {
    var self = this;
    const data = {
      pre_auth_code: preAuthCode,
      session_info: {
        auth_type: config.NODE_ENV === 'production' ? 0 : 1
      }
    };
    AuthApi.post(url.authConfig(suiteAccessToken), data, function(res) {
      if (res.errcode) {
        self.outputError(res.name, res.errcode, res.errmsg);
      } else {
        Logger.console(logger, '======== 授权成功 ========', 'info');
      }
    });
  }

  //获取并缓存永久授权码
  getPermanentCode(authCode) {
    var self = this;
    this.getSuiteToken(null, function(suiteAccessToken) {
      console.log(url.permanentCode(suiteAccessToken));
      AuthApi.post(url.permanentCode(suiteAccessToken), {auth_code: authCode}, function(res) {
        console.log(res);
        if (res.errcode) {
          self.outputError(res.name, res.errcode, res.errmsg);
        } else {
          console.log(res);
        }
      });
    });
  }

  //错误输出
  outputError(name, errcode, errmsg) {
    var errStr = `${name}(${errcode}): ${errmsg}`;
    Logger.console(logger, errStr, 'error');
    this.callback && this.callback({errmsg: errStr});
  }

}

module.exports = AuthLogin;
