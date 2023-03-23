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
const inconFaultAvatar = 'https://s2.loli.net/2023/02/10/cZkBewG65J3SjHr.png'

class BookController extends Controller {
    async AddCategory() {
        const { ctx, app } = this
        // 获取请求头中携带的参数
        const { name, type_id, avatar = inconFaultAvatar } = ctx.request.body
        if (!name || !type_id || name == undefined) {
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
                const result = await ctx.service.category.add({
                    name,
                    type_id,
                    user_id: id,
                    avatar,
                    caution: 0,
                })
                const target = await app.mysql.query(`select * from category where id = ${result.insertId}`)
                if (result) {
                    ctx.body = {
                        code: 200,
                        msg: '添加二级分类成功',
                        data: { target, id, }
                    }
                } else {
                    ctx.body = {
                        code: 500,
                        msg: '失败--添加二级分类',
                        data: {
                            result,
                            name,
                            type_id,
                            user_id: id,
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 500,
                msg: '添加二级分类-蛋疼',
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
            const QUERY_STR = 'type_id'
            let sql = `select ${QUERY_STR} from category where id=${id}`
            const type_id = await app.mysql.query(sql);
            if (!type_id) {
                ctx.body = {
                    code: 400,
                    msg: '二级分类无效',
                    data: null
                }
                return
            }
            let user_id
            const token = ctx.request.header.authorization;
            const decode = await app.jwt.verify(token, app.config.jwt.secret);
            if (!decode) return
            user_id = decode.id
            const result = await ctx.service.category.delete(id, user_id);
            if (result) {
                ctx.body = {
                    code: 200,
                    msg: '删除category成功',
                    data: { result, type_id }
                }
            }
            else {
                ctx.body = {
                    code: 500,
                    msg: '失败--删除category',
                    data: null,
                }
            }
        } catch (error) {
            ctx.body = {
                code: 500,
                msg: '删除category系统错误',
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
            const result = await ctx.service.category.update({
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