'use strict';

const { Controller } = require('egg');

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    await ctx.render('index.html', {
      title: '林灵七^egg', // 将参数传入index.html
    });
    // const { id } = ctx.query;
    // ctx.body = id;
  }
  // 基础 GET请求接口， 地址：/user/id  通过id获取的用户信息
  async user() {
    const { ctx } = this;
    const { id } = ctx.params;
    ctx.body = id;
  }

  // async user() {
  //   const { ctx } = this;
  //   const { id, name } = await ctx.service.home.user();
  //   ctx.body = {
  //     id,
  //     name
  //   }
  // }

  // async user() {
  //   const { ctx } = this
  //   const result = await ctx.service.home.user()
  //   ctx.body = result
  // }

  async adduser() {
    const { ctx } = this
    const { name } = ctx.request.body
    const result = await ctx.service.home.adduser(name)
    ctx.body = {
      code: 200,
      msg: '添加成功',
      data: null
    }
  }
  async edituser() {
    const { ctx } = this
    const { id, name } = ctx.request.body;
    const result = await ctx.service.home.edituser(id, name)
    ctx.body = {
      code: 200,
      msg: '编辑成功',
      data: null
    }
  }
  async delete_user() {
    const { ctx } = this
    const { name } = ctx.request.body
    const result = ctx.service.home.delete_user(name)
    ctx.body = {
      code: 200,
      ms: '删除成功',
      data: null
    }
  }

  async add() {
    const { ctx } = this;
    const { title } = ctx.request.body;
    ctx.body = {
      title,
    };
  }
}

module.exports = HomeController;
