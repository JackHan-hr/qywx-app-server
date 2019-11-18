const config = require('../conf/config');

const url = {
  //获取suite_token
  suiteToken: 'https://qyapi.weixin.qq.com/cgi-bin/service/get_suite_token',

  //获取pre_auth_code
  preAuthCode(suiteAccessToken) {
    return `https://qyapi.weixin.qq.com/cgi-bin/service/get_pre_auth_code?suite_access_token=${suiteAccessToken}`
  },

  //授权配置
  authConfig(suiteAccessToken) {
    return `https://qyapi.weixin.qq.com/cgi-bin/service/set_session_info?suite_access_token=${suiteAccessToken}`
  },

  //获取permanent_code
  permanentCode(suiteAccessToken) {
    return `https://qyapi.weixin.qq.com/cgi-bin/service/get_permanent_code?suite_access_token=${suiteAccessToken}`
  }
}

module.exports = url;
