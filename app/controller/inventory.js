/** 
     * 购物清单接口 
    */

'use strict'

const moment = require('moment')
const jwtErr = require('../middleware/jwtErr')

const Controller = require('egg').Controller

class InventoryController extends Controller {
    async CreateInventory() {
        const { ctx, app } = this
        // 获取请求头中携带的参数
        const { name, goods_list, } = ctx.request.body
        if (!name) {
            ctx.body = {
                code: 200,
                msg: '清单名不能为空',
                data: null,
            }
        }
        try {
            // 鉴权
            let id
            const token = ctx.request.header.authorization
            const decode = await app.jwt.verify(token, app.config.jwt.secret)
            if (!decode) return
            // 计划商品列表的总金额、总数
            let total_amount = 0
            if (goods_list.length != 0) {
                total_amount = goods_list.reduce((pre, cur) => {
                    return pre += cur.amount
                }, 0)
            }
            // 创建清单
            const result = await ctx.service.inventory.add({
                user_id: decode.id,
                name,
                ctime: this.app.mysql.literals.now,
                include_number: goods_list.length || 0,
                total_amount: total_amount || 0,
            })
            if (result) {
                const QUERY_STR = '*';
                let sql = `select ${QUERY_STR} from inventory where user_id = ${decode.id} and id=${result.insertId}`;
                let inventory = await app.mysql.query(sql);
                // 判断用户是否添加了商品
                if (goods_list.length == 0 || !goods_list) {
                    ctx.body = {
                        code: 200,
                        msg: `创建了一个空清单`,
                        data: {
                            inventory,
                        }
                    }
                }
                else {
                    const goods = await ctx.service.goods.add(goods_list)
                    if (goods) {
                        // inventory = await app.mysql.query(sql);
                        ctx.body = {
                            code: 200,
                            msg: `创建清单成功,内含${goods_list.length}件商品`,
                            data: {
                                inventory,
                                goods,
                            }
                        }
                    }
                    else {
                        ctx.body = {
                            code: 500,
                            msg: `创建清单成功,但商品添加失败`,
                            data: {
                                result,
                                goods,
                            }
                        }
                    }

                }

            }
            else {
                ctx.body = {
                    code: 500,
                    msg: '失败--创建清单',
                    data: null
                }
            }

        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 500,
                msg: '添加清单-蛋疼',
                data: { goods_list_length: goods_list.length }
            }
        }
    }
    async addGoods() {
        const { ctx, app } = this
        // 获取请求头中携带的参数
        const { name, amount, picture = '', list_id, list_name } = ctx.request.body
        if (!name || !amount || !picture) {
            ctx.body = {
                code: 500,
                msg: '参数不能为空',
                data: null,
            }
        }
        try {
            // 鉴权
            let id
            const token = ctx.request.header.authorization
            const decode = await app.jwt.verify(token, app.config.jwt.secret)
            if (!decode) { return }   //
            // 
            else {
                id = decode.id
                const result = await app.mysql.insert('goods', {
                    user_id: id,
                    name,
                    amount,
                    picture,
                    list_id,
                    list_name,
                })
                if (result) {
                    // 修改对应清单的总金额和商品总数
                    const ql = `update inventory set total_amount=total_amount+${amount},include_number=include_number+1 where id = ${list_id}`
                    const res = await app.mysql.query(ql)
                    // 查找goods和inventory
                    const new_goods = await app.mysql.query(`select * from goods where user_id = ${id} and id = ${result.insertId}`)
                    const new_inventory = await app.mysql.query(`select * from inventory where user_id = ${id} and id = ${list_id}`)

                    ctx.body = {
                        code: 200,
                        msg: '添加Goods成功',
                        data: {
                            res,
                            new_goods,
                            new_inventory,
                        }
                    }
                } else {
                    ctx.body = {
                        code: 500,
                        msg: '失败--添加商品',
                        data: null
                    }
                }

            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 500,
                msg: '添加商品-蛋疼',
                data: null
            }
        }
    }
    async delGoods() {
        const { ctx, app } = this
        const { id } = ctx.query
        const token = ctx.request.header.authorization
        const decode = await app.jwt.verify(token, app.config.jwt.secret)
        if (!decode) return
        else {
            try {
                let user_id = decode.id
                const result = await app.mysql.delete('goods', {
                    id,
                    user_id,
                })
                if (result) {
                    ctx.body = {
                        code: 200,
                        msg: 'succeed',
                        data: { id, user_id }
                    }
                }
                else {
                    ctx.body = {
                        code: 500,
                        msg: 'failed',
                        data: null,
                    }
                }
            }
            catch (error) {
                console.log(error);
                ctx.body = {
                    code: 500,
                    msg: '系统错误',
                    data: null
                }
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
            let user_id
            const token = ctx.request.header.authorization;
            const decode = await app.jwt.verify(token, app.config.jwt.secret);
            if (!decode) return
            else {
                user_id = decode.id
                const result = await ctx.service.inventory.delete(id, user_id);
                if (result) {
                    ctx.body = {
                        code: 200,
                        msg: '删除inventory成功',
                        data: result,
                    }
                } else {
                    ctx.body = {
                        code: 500,
                        msg: '失败--删除inventory',
                        data: null,
                    }
                }
            }
        } catch (error) {
            ctx.body = {
                code: 500,
                msg: '删除inventory系统错误',
                data: null
            }
        }
    }
    async edit() {
        const { ctx, app } = this
        // 参数
        // ,id,user_id,ctime不可修改
        const { ...params } = ctx.request.body;
        if (!params) {
            ctx.body = {
                code: 500,
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
            const result = await app.mysql.update('inventory', {
                ...params
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
    async getAllInventory() {
        const { ctx, app } = this
        const token = ctx.request.header.authorization
        const decode = app.jwt.verify(token, app.config.jwt.secret)
        if (!decode) return
        else {
            let user_id = decode.id
            const result = await ctx.service.inventory.getAllInventory(user_id)
            if (result) {
                ctx.body = {
                    code: 200,
                    msg: "获取清单成功",
                    data: {
                        length: result.length,
                        list: result
                    }
                }
            }
            else {
                ctx.body = {
                    code: 500,
                    msg: "获取清单失败",
                    data: null
                }
            }
        }
    }
    async charge() {
        // 用户点击一键记账
        // 选择账户
        const { ctx, app } = this
        const { inventory_id, account_id } = ctx.request.body

        const token = ctx.request.header.authorization
        const decode = app.jwt.verify(token, app.config.jwt.secret)
        if (!decode) return
        else {
            try {
                let user_id = decode.id
                // 查找goods
                const amounts = await app.mysql.query(`select amount from goods where user_id=${user_id} and list_id=${inventory_id}`)
                const total_amount = amounts.reduce((pre, cur) => {
                    return pre += cur.amount
                }, 0)
                // 自动类别：购物清单（）
                // 自动账本：购物清单（）
                // const ql = '购物清单'
                const book_id = await app.mysql.query(`select id from book where user_id=${user_id} and name='购物清单' `)
                const category_id = await app.mysql.query(`select id from category where user_id=${user_id} and name='购物清单' `)
                if (total_amount || book_id || category_id) {
                    const result = await ctx.service.bill.add({
                        user_id,
                        pay_type: 2,
                        account_id,
                        book_id: book_id[0].id,
                        book_name: '购物清单',
                        book_type: 10,
                        type_id: 5,
                        type_name: '购物',
                        category_id: category_id[0].id,
                        category_name: '购物清单',
                        amount: total_amount,
                        date: app.mysql.literals.now,
                    })
                    if (result) {
                        ctx.body = {
                            code: 200,
                            msg: "成功",
                            data: {
                                result,
                                user_id,
                                inventory_id,
                                total_amount,
                                book_id: book_id[0].id,
                                category_id: category_id[0].id,
                            }
                        }
                    }
                    else {
                        ctx.body = {
                            code: 500,
                            msg: "失败--添加bill失败",
                            data: null
                        }
                    }

                }
                else {
                    ctx.body = {
                        code: 500,
                        msg: '失败--账户、类别出错',
                        data: null
                    }
                }
            } catch (error) {
                console.log(error);
                ctx.body = {
                    code: 500,
                    msg: '系统错误',
                    data: {
                        user_id: decode.id,
                        inventory_id,
                    }
                }
            }
        }
        // 属于有规划的消费
        // 为每个商品指定类别？
    }
}
module.exports = InventoryController