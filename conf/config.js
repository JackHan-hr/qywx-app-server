var Logger = require('../until/log');
const logger = Logger.init('Config');

/**
 * @type {t: 腾讯云}
 * @type {a: 阿里云}
 * @type {production: 产品环境}
 * @type {staging: 测试环境}
 * @type {development: 开发环境/默认}
 */

const config = {
  //环境变量
  env: function(args) {
    this.NODE_CLOUD = args[0].split('.')[0];
    this.NODE_ENV = args[0].split('.')[1];
    Logger.console(logger, 'NODE_ENV =========== ' + this.NODE_ENV, 'info');
    Logger.console(logger, 'NODE_CLOUD =========== ' + this.NODE_CLOUD, 'info');
  },

  //mongodb数据库
  mongodb: function() {
    switch (this.NODE_ENV) {
      case 'development': {
        const mongodb = {
          host: '*.*.*.*',
          port: '8888',
          database: 'jackhancloud',
          user: 'jackhan',
          password: '********',
          session_name: 'master'
        };
        return `mongodb://${mongodb.user}:`      +
                          `${mongodb.password}@` +
                          `${mongodb.host}:` +
                          `${mongodb.port}/`     +
                          `${mongodb.database}`  +
                          '?server_selection_timeout=10';
      }
      case 'staging': {
        const mongodb = {
          host: '*.*.*.*',
          port: '8889',
          database: 'jackhancloud',
          user: 'jackhan',
          password: '********',
          session_name: 'master'
        };
        return `mongodb://${mongodb.user}:`       +
                          `${mongodb.password}@`  +
                          `${mongodb.host_stag}:` +
                          `${mongodb.port}/`      +
                          `${mongodb.database}`   +
                          '?server_selection_timeout=10';
      }
      case 'production': {
        const mongodb = {
          host: '*.*.*.*',
          port: '8890',
          database: 'jackhancloud',
        }
        return `mongodb://${mongodb.host}:`     +
                          `${mongodb.port}/`    +
                          `${mongodb.database}` +
                          '?server_selection_timeout=10';
      }
    }
  },

  //redis
  redis: {
    port: 6379,
    host: '127.0.0.1'
  },

  db: {
    redisClient: null,
    mongoose: null
  },

  //应用配置
  app: function() {
    switch (this.NODE_ENV) {
      case 'development': {
        return {
          cropId: '***********',
          suiteId: '***********',
          suitSecret: '***********',
          token: '***********',
          encodingAESKey: '***********',
          indexCallBack: 'http://***********/api/v1/login/callback'
        }
      }
      case 'staging': {
        return {
          cropId: '**********',
          suiteId: '**********',
          suitSecret: '**********',
          token: '**********',
          encodingAESKey: '**********',
          indexCallBack: 'http://***********/api/v1/login/callback'
        }
      }
      case 'production': {
        return {
          cropId: '***********',
          suiteId: '***********',
          suitSecret: '***********',
          token: '***********',
          encodingAESKey: '***********',
          indexCallBack: 'http://***********/api/v1/login/callback'
        }
      }
    }
  }
}

module.exports = config;
