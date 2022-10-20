'use strict';

const UserController = require("./controller/user");

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  // router.get('/', controller.home.index);
  // router.post('/add', controller.home.add);
  // router.get('/user', controller.home.user);
  // router.post('/add_user', controller.home.adduser)
  // router.post('/edit_user', controller.home.edituser)
  // router.post('/delete_user', controller.home.delete_user)
  //
  //
  //
  router.post('/api/user/register', controller.user.register)
  router.post('/api/user/login', controller.user.login)
  router.get('/api/user/test', controller.user.test)


};
// POST请求 考虑到：数据安全及大小
// 表面上的区别，内在本质是一样的，基于TCP协议，从理论上讲他们没差

// POST请求 浏览器无法手动发起，只能通过浏览器地址栏发起GET请求
// Postman
