/** 
     * 预算接口 
    */
// 1.设置预算
// 2.预算变动
'use strict'
const moment = require('moment')
const jwtErr = require('../middleware/jwtErr')

const Controller = require('egg').Controller

class BudgetController extends Controller {
    async setBudget() {
        const { ctx, app } = this
        // 获取请求头中携带的参数
        const { budget, current_budget = 0 } = ctx.request.body
        if (!budget) {
            ctx.body = {
                code: 200,
                msg: '预算参数错误',
                data: null,
            }
        }
        try {
            // 鉴权
            var id
            const token = ctx.request.header.authorization
            const decode = await app.jwt.verify(token, app.config.jwt.secret)
            if (!decode) return
            // 
            else {
                id = decode.id
                // id默认添加到每个账单项，作为后续获取指定用户账单的标识,
                // 也就是, 登录A账户，那么所作的操作都得加上A的ID，
                // 后续对数据库操作的时候，就可以指定ID操作
                const result = await ctx.service.user.editUserInfo({
                    budget,
                    current_budget,
                    id,
                })
                if (result) {
                    ctx.body = {
                        code: 200,
                        msg: '设置预算成功',
                        data: { result, }
                    }
                } else {
                    ctx.body = {
                        code: 500,
                        msg: '失败--设置预算',
                        data: {
                            result,
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 500,
                msg: '设置预算-蛋疼',
                data: { id, amount, }
            }
        }
    }
    async getUserBudget() {
        const { ctx, app } = this
        // 
        var id
        const token = ctx.request.header.authorization
        const decode = await app.jwt.verify(token, app.config.jwt.secret)
        if (!decode) return
        else {
            id = decode.id
            // id默认添加到每个账单项，作为后续获取指定用户账单的标识,
            // 也就是, 登录A账户，那么所作的操作都得加上A的ID，
            // 后续对数据库操作的时候，就可以指定ID操作
            const userInfo = await ctx.service.user.getUserByName(decode.username)
            if (userInfo) {
                ctx.body = {
                    code: 200,
                    msg: 'Get预算成功',
                    data: { userInfo, }
                }
            } else {
                ctx.body = {
                    code: 500,
                    msg: '失败--Get预算',
                    data: null,

                }
            }
        }
    }
}
module.exports = BudgetController