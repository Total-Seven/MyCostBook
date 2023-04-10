/** 
     * 账单接口 （CRUD、复杂数据的处理、egg-mysql）
    */
// 1.帐单列表
// 2.添加账单
// 3.修改账单
// 4.删除账单
// 5.账单详情
'use strict'

const dayjs = require('dayjs')

const moment = require('moment')
const jwtErr = require('../middleware/jwtErr')

const Controller = require('egg').Controller

class BookController extends Controller {
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
                    date: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
                })
                ctx.body = {
                    code: 200,
                    msg: '添加Book成功',
                    data: result
                }
            }
        } catch (error) {
            ctx.body = {
                code: 500,
                msg: '添加账本-蛋疼',
                data: error
            }
        }
    }
    async CreateDefaultBook() {
        const { ctx, app } = this
        // 获取请求头中携带的参数
        const { name, id } = ctx.request.body
        if (!name) {
            ctx.body = {
                code: 200,
                msg: '账本名不能为空',
                data: null,
            }
        }
        try {
            // 鉴权
            // let id
            // const token = ctx.request.header.authorization
            // const decode = await app.jwt.verify(token, app.config.jwt.secret)
            // if (!decode) {
            //     return
            // }
            // 
            // id默认添加到每个账单项，作为后续获取指定用户账单的标识,
            // 也就是, 登录A账户，那么所作的操作都得加上A的ID，
            // 后续对数据库操作的时候，就可以指定ID操作
            const result = await ctx.service.book.add({
                name,
                book_type: 0,
                user_id: id,
                date: this.app.mysql.literals.now,
            })
            ctx.body = {
                code: 200,
                msg: '添加Book成功',
                data: result
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
            // 查询
            const QUERY_STR = 'date,multiuser'
            let sql = `select ${QUERY_STR} from book where id=${id}`
            const [book] = await app.mysql.query(sql);
            // Token
            let user_id
            const token = ctx.request.header.authorization;
            const decode = await app.jwt.verify(token, app.config.jwt.secret);
            if (!decode) return
            user_id = decode.id
            // 删除
            const result = await ctx.service.book.delete(id, user_id);
            if (result && book.multiuser == 1) {
                // 多人账本信息也删除
                const resultMulti = await app.mysql.delete('multiuserbook', { book_id: id })
                if (resultMulti) {
                    ctx.body = {
                        code: 200,
                        msg: '删除MultiuserBook成功',
                        data: book.date,
                    }
                    return
                }
            }
            ctx.body = {
                code: 200,
                msg: '删除Book成功',
                data: book.date,
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
module.exports = BookController