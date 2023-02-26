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
  router.post('/api/category/add', _jwt, controller.category.AddCategory); // 添加Category
  router.post('/api/category/delete', _jwt, controller.category.delete); // 添加Category
  // Budget 
  router.post('/api/budget/add', _jwt, controller.budget.setBudget); // 添加Budget
  router.get('/api/budget/getUserBudget', _jwt, controller.budget.getUserBudget); // 添加Budget
  // Plan
  router.post('/api/plan/add', _jwt, controller.plan.CreatePlan); // 添加Plan
  // Inventory
  router.post('/api/inventory/CreateInventory', _jwt, controller.inventory.CreateInventory); // 创建Inventory
  router.post('/api/inventory/add_goods', _jwt, controller.inventory.addGoods); // 添加goods  
  router.get('/api/inventory/delGoods', _jwt, controller.inventory.delGoods); // 删除goods
  router.post('/api/inventory/editInventory', _jwt, controller.inventory.edit); // 编辑Inventory
  router.post('/api/inventory/delete', _jwt, controller.inventory.delete); // 删除Inventory 
  router.get('/api/inventory/getAllInventory', _jwt, controller.inventory.getAllInventory); // 编辑Inventory
  router.post('/api/inventory/charge', _jwt, controller.inventory.charge); // 一键记账
  // Account
  router.post('/api/account/add', _jwt, controller.account.add); // 添加账户
  router.get('/api/account/getAllAccount', _jwt, controller.account.getAllAccount); // 获取所有账户信息
  // Chart  getYear_LinePieTop
  // get Expend Year、Month、Week、Day
  router.get('/api/chart/getYear_LinePieTop', _jwt, controller.chart.getYear_LinePieTop); // 获取所有账户信息
  // get Income Year、Month、Week、Day
  // get Transfer Year、Month、Week、Day
};
// POST请求 考虑到：数据安全及大小
// 表面上的区别，内在本质是一样的，基于TCP协议，从理论上讲他们没差

// POST请求 浏览器无法手动发起，只能通过浏览器地址栏发起GET请求
// Postman
