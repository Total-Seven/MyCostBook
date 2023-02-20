'use strict';
/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app;
  // router.get('/', controller.home.index);
  // router.post('/add', controller.home.add);
  router.get('/user', controller.home.user);
  // router.post('/add_user', controller.home.adduser)
  // router.post('/edit_user', controller.home.edituser)
  // router.post('/delete_user', controller.home.delete_user)
  //
  //
  // 鉴权
  const _jwt = middleware.jwtErr(app.config.jwt.secret)
  // 用户
  router.post('/api/user/register', controller.user.register)
  router.post('/api/user/login', controller.user.login)
  router.get('/api/user/test', _jwt, controller.user.test)
  router.get('/api/user/get_userinfo', _jwt, controller.user.getUserInfo)
  router.post('/api/user/edit_userinfo', _jwt, controller.user.editUserInfo)
  router.post('/api/upload/', controller.upload.upload)
  // 账单
  router.post('/api/bill/add', _jwt, controller.bill.add)
  // router.get('/api/bill/list', _jwt, controller.bill.list)
  router.get('/api/bill/list', _jwt, controller.bill.list); // 获取账单列表
  router.get('/api/bill/select_category_list', _jwt, controller.bill.select_category_list); // 获取账单列表

  router.get('/api/bill/select_list', _jwt, controller.bill.select_list)
  router.get('/api/bill/detail', _jwt, controller.bill.detail)
  router.post('/api/bill/update', _jwt, controller.bill.update); // 账单更新
  router.post('/api/bill/delete', _jwt, controller.bill.delete); // 删除账单
  router.get('/api/bill/data', _jwt, controller.bill.data); // 获取数据
  // Book
  router.post('/api/book/add', _jwt, controller.book.AddCategory); // 添加Book
  router.post('/api/book/del', _jwt, controller.book.delete); // // 删除Book
  router.post('/api/book/update', _jwt, controller.book.update); // Book更新
  // Category
  router.post('/api/category/add', _jwt, controller.category.AddCategory); // 添加Book
};
// POST请求 考虑到：数据安全及大小
// 表面上的区别，内在本质是一样的，基于TCP协议，从理论上讲他们没差

// POST请求 浏览器无法手动发起，只能通过浏览器地址栏发起GET请求
// Postman
