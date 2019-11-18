var axios = require('axios');

const authApi = {

  /**
  * 对返回结果的一层封装，如果遇见微信返回的错误，将返回一个错误
  * 参见：http://mp.weixin.qq.com/wiki/index.php?title=返回码说明
  */
  wrapper: function(data) {
    if (data.errcode) {
      err = new Error();
      err.name = 'WeChatAPIError';
      err.errmsg = data.errmsg;
      err.errcode = data.errcode;
      return err;
    }
    return data;
  },


  get: function(url, cb) {
    axios({
      url: url,
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    }).then(function (response) {
        cb && cb(authApi.wrapper(response.data));
        return;
      })
      .catch(function (error) {
        return error;
      });
  },

  post: function(url, data, cb) {
    axios({
      url: url,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data: JSON.stringify(data)
    }).then(function (response) {
        cb && cb(authApi.wrapper(response.data));
        return;
      })
      .catch(function (error) {
        return error;
      });
  }

}

module.exports = authApi;
