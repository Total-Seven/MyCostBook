'use strict';
/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware, io } = app;
  // 鉴权
  const _jwt = middleware.jwtErr(app.config.jwt.secret)


  // io.of('/').route('index', io.controller.nsp.index);
  // io.of('/').route('exchange', io.controller.nsp.exchange);
  io.of('/').route('chat', io.controller.chat.index);
  io.route('chat', io.controller.chat.index);
  io.route('book', io.controller.book.index);
  io.route('receive', io.controller.receive.index);
  io.route('bill', io.controller.bill.index);


  // 用户
  router.post('/api/user/register', controller.user.register)
  router.post('/api/user/login', controller.user.login)
  router.get('/api/user/test', _jwt, controller.user.test)
  router.get('/api/user/get_userinfo', _jwt, controller.user.getUserInfo)
  router.post('/api/user/edit_userinfo', _jwt, controller.user.editUserInfo)
  router.post('/api/upload/', controller.upload.upload)

  // 账单
  router.post('/api/bill/add', _jwt, controller.bill.add)
  router.post('/api/bill/transform', _jwt, controller.bill.transform)
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
  router.post('/api/category/update', _jwt, controller.category.update); // 添加Category
  // Budget 
  router.post('/api/budget/add', _jwt, controller.budget.setBudget); // 添加Budget
  router.get('/api/budget/getUserBudget', _jwt, controller.budget.getUserBudget); // 添加Budget
  // Plan 
  router.post('/api/plan/add', _jwt, controller.plan.CreatePlan); // 添加Plan
  router.post('/api/plan/delete', _jwt, controller.plan.delete); // 添加Plan
  router.post('/api/plan/update', _jwt, controller.plan.update); // 添加Plan
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
  router.post('/api/account/delete', _jwt, controller.account.delete); // 添加账户
  router.post('/api/account/update', _jwt, controller.account.update); // 修改账户
  router.get('/api/account/getAllAccount', _jwt, controller.account.getAllAccount); // 获取所有账户信息
  // Chart  getYear_LinePieTop
  router.get('/api/chart/get_Exp_Inc_Trf', _jwt, controller.chart.get_Exp_Inc_Trf); // 获取所有账户信息

};
