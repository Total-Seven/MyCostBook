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
        const { budget } = ctx.request.body
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
            /**
             * 判断是否是创建预算的标准 ： from 0 to sth  ，并再月初将所有用户的预算改为0 并记录上个月的信息。
             * 创建： current_budget=0 ； 设置mode ； 修改budget 。未来账单的budget模式都写入1  表示扣除预算
             * 修改： current_budget不变 ；mode不变； 修改budget ，如果改为0 账单模式写入0 ，表示不扣除预算。否则不变。
             */

            // if (budget) {
            //     const budget_mode = 1
            // }
            else {
                id = decode.id
                // id默认添加到每个账单项，作为后续获取指定用户账单的标识,
                // 也就是, 登录A账户，那么所作的操作都得加上A的ID，
                // 后续对数据库操作的时候，就可以指定ID操作
                const ql = `select budget_mode,budget,current_budget from user where id=${id}`
                let user_budget = await app.mysql.query(ql)
                let result = 0
                let current_budget = 0
                if (user_budget[0].budget_mode == 0 && budget !== 0 && user_budget[0].budget == 0 && user_budget[0].current_budget == 0) {
                    // 第一次创建
                    result = await ctx.service.user.editUserInfo({
                        budget,
                        current_budget: budget,
                        budget_mode: 1,
                        id,
                    })
                    current_budget = budget
                }
                // 在有预算的情况下，设为零
                else if (user_budget[0].budget_mode == 1 && budget == 0) {
                    // 修改为0 
                    result = await ctx.service.user.editUserInfo({
                        budget,
                        current_budget: 0,
                        budget_mode: 0,
                        id,
                    })
                    current_budget = 0
                }
                // 在有预算的情况下修改
                else if (user_budget[0].budget_mode == 1 && budget !== 0) {
                    // 修改为0 
                    let number = 0
                    let already_expense_budget = Number(user_budget[0].budget) - Number(user_budget[0].current_budget)
                    // 如果预算还没花就加预算，那就继续满上
                    if (user_budget[0].budget == user_budget[0].current_budget) number = Number(budget)
                    // 如果设置的预算小于current_预算，那就在想要设置的预算上减去之前花的
                    // if (budget < user_budget[0].current_budget)
                    else { number = budget - already_expense_budget }
                    // 如果已经花了一部分，并且设置的预算也不少于目前剩余的。
                    // else number = user_budget[0].current_budget
                    result = await ctx.service.user.editUserInfo({
                        budget,
                        current_budget: number,
                        budget_mode: 1,
                        id,
                    })
                    current_budget = user_budget[0].current_budget
                }
                else if (user_budget[0].budget_mode == 0 && budget == 0) {
                    // 修改为0 
                    result = await ctx.service.user.editUserInfo({
                        budget: 0,
                        current_budget: 0,
                        budget_mode: 0,
                        id,
                    })
                    current_budget = 0
                }
                // 再查一次
                user_budget = await app.mysql.query(ql)
                if (result) {
                    ctx.body = {
                        code: 200,
                        msg: '设置预算成功',
                        data: {
                            user_budget,
                            result,
                        }
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
                data: null
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