/* eslint valid-jsdoc: "off" */
'use strict';
/**
 * @param {Egg.EggAppInfo} appInfo app info
 */

module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
  **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1666087255401_6516';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    uploadDir: 'app/public/upload'
  };
  config.mysql = {
    client: {
      host: 'localhost',
      port: '3306',
      user: 'root',
      password: '7777',
      database: 'juejue-cost',
    },
    app: true,
    agent: false,
  };
  config.jwt = {
    secret: 'Link',
  }
  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: true,
    },
    domainWhiteList: ['*'],
  };
  config.view = {
    mapping: { '.html': 'ejs' }, // 左边写成.html后缀，会自动渲染.html文件
  };
  config.multipart = {
    mode: 'file'
  };

  config.cors = {
    origin: '*', //允许所有跨域访问
    credentials: true, //允许Cookie 跨域
    allowMethods: 'GET,HEAD,POST,PUT,DELETE,PATCH'
  };
  config.logger = {
    level: 'NONE',
    outputJSON: true
  }
  return {
    ...config,
    ...userConfig,
  };
};