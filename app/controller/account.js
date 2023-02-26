/** 
     * 账单接口 （CRUD、复杂数据的处理、egg-mysql）
    */
// 1.帐单列表
// 2.添加账单
// 3.修改账单
// 4.删除账单
// 5.账单详情
'use strict'
const moment = require('moment')
const jwtErr = require('../middleware/jwtErr')

const Controller = require('egg').Controller

class BookController extends Controller {
    async add() {
        const { ctx, app } = this
        // 获取请求头中携带的参数
        const { name, pay_type, amount = 0 } = ctx.request.body
        if (!name || !pay_type) {
            ctx.body = {
                code: 200,
                msg: '参数不能为空',
                data: null,
            }
        }
        try {
            // 鉴权
            let user_id
            const token = ctx.request.header.authorization
            const decode = await app.jwt.verify(token, app.config.jwt.secret)
            if (!decode) {
                return
            }
            // 
            else {
                user_id = decode.id
                // 添加账户
                const result = await ctx.service.account.add({
                    name,
                    pay_type,
                    user_id,
                    amount,
                })
                if (result) {
                    ctx.body = {
                        code: 200,
                        msg: '添加Account成功',
                        data: result
                    }
                } else {
                    ctx.body = {
                        code: 500,
                        msg: '失败--添加Account',
                        data: null
                    }
                }
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 500,
                msg: '添加账本-蛋疼',
                data: null
            }
        }
    }
    async delete() {
        const { ctx, app } = this;
        const { id } = ctx.request.body;

        if (!id) {
            ctx.body = {
                code: 400,
                msg: 'ID为空',
                data: null
            }
        }

        try {
            const QUERY_STR = 'date'
            let sql = `select ${QUERY_STR} from book where id=${id}`
            const date = await app.mysql.query(sql);
            let user_id
            const token = ctx.request.header.authorization;
            const decode = await app.jwt.verify(token, app.config.jwt.secret);
            if (!decode) return
            user_id = decode.id
            const result = await ctx.service.book.delete(id, user_id);
            ctx.body = {
                code: 200,
                msg: '删除Book成功',
                data: date,
            }
        } catch (error) {
            ctx.body = {
                code: 500,
                msg: '删除Book系统错误',
                data: null
            }
        }
    }
    async update() {
        const { ctx, app } = this
        const { id, name } = ctx.request.body;
        if (!id || !name) {
            ctx.body = {
                code: 400,
                msg: '参数错误',
                data: null
            }
        }

        let user_id
        const token = ctx.request.header.authorization
        const decode = await app.jwt.verify(token, app.config.jwt.secret)
        if (!decode) return
        try {

            user_id = decode.id
            const result = await ctx.service.book.update({
                id,
                user_id,
                name,
            })
            ctx.body = {
                code: 200,
                msg: '修改成功',
                data: result
            }
        } catch (error) {
            ctx.body = {
                code: 500,
                msg: '系统错误',
                data: null
            }
        }
    }
    async getAllAccount() {
        const { ctx, app } = this
        let user_id
        const token = ctx.request.header.authorization
        const decode = await app.jwt.verify(token, app.config.jwt.secret)
        if (!decode) return
        else {
            user_id = decode.id
            const ql = `select * from account where user_id=${user_id}`
            const result = await app.mysql.query(ql)
            if (result) {
                let assets = 0
                let debt = 0
                const net = result.reduce((pre, cur) => {
                    cur.amount > 0 ? assets += cur.amount : debt -= cur.amount
                    return pre += cur.amount
                }, 0)
                ctx.body = {
                    code: 200,
                    msg: '成功',
                    data: {
                        accounts: result,
                        net,
                        assets,
                        debt,
                    }
                }
            }
        }
    }
}
module.exports = BookController