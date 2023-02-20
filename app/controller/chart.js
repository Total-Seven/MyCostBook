/** 
     * 统计接口 （CRUD、复杂数据的处理、egg-mysql）
    */
// 1.全账本的统计（月）：
// 支出：
// 数目、金额(总，0-30天的)、各个账本的比例、用户类别中消费最高的Top10.

// 收入：
// 转账：

// 2.单账本的统计（月）：
// 支出：
// 总金额、总数目、用户类别中消费最高和次数最多的。

// 3.全账本的统计（年）：
// 支出：
// 各个月的总金额、各个月每个账本的消费金额、消费最高的账本Top5，用户类别中消费最高的Top10.

// 收入：
// 转账：
'use strict'
const moment = require('moment')
const jwtErr = require('../middleware/jwtErr')

const Controller = require('egg').Controller

class ChartController extends Controller {
    async AddCategory() {
        const { ctx, app } = this
        // 获取请求头中携带的参数
        const { name, book_type, } = ctx.request.body
        if (!name || !book_type) {
            ctx.body = {
                code: 200,
                msg: '账本参数错误',
                data: null,
            }
        }
        try {
            // 鉴权
            let id
            const token = ctx.request.header.authorization
            const decode = await app.jwt.verify(token, app.config.jwt.secret)
            if (!decode) {
                return
            }
            // 
            else {
                id = decode.id
                // id默认添加到每个账单项，作为后续获取指定用户账单的标识,
                // 也就是, 登录A账户，那么所作的操作都得加上A的ID，
                // 后续对数据库操作的时候，就可以指定ID操作
                const result = await ctx.service.book.add({
                    name,
                    book_type,
                    user_id: id,
                    date: this.app.mysql.literals.now,
                })
                ctx.body = {
                    code: 200,
                    msg: '添加Book成功',
                    data: result
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

}
module.exports = ChartController