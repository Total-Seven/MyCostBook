/** 
     * 计划接口 
    */
// 1.创建
// 2.添加
// 3.修改
// 4.删除

'use strict'

const dayjs = require('dayjs')
const moment = require('moment')
const jwtErr = require('../middleware/jwtErr')

function toPercent(point) {
    var str = Number(point * 100).toFixed(1);
    str += "%";
    return str;
}

const Controller = require('egg').Controller

class PlanController extends Controller {
    async AddPlan() {
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
    handle_PlanDetail(start_date, daily_money, period) {
        let detailArr = new Array()
        const hand = () => {
            for (let day = 0; day <= period - 1; day++) {
                const obj = {}
                obj.amount = daily_money
                detailArr.push(obj)
                obj.total = detailArr.reduce((pre, cur) => {
                    return pre += Number(cur.amount)
                }, 0)
                obj.date = dayjs(start_date, 'YYYY-MM-DD').add(day, 'day').format('YYYY-MM-DD')
            }
            return detailArr
        }
        return hand
    }
    async CreatePlan() {
        const { ctx, app } = this
        // 获取请求头中携带的参数
        const { name, period, start_date, daily_money, picture = '' } = ctx.request.body
        if (!name || !period || !start_date || !daily_money) {
            ctx.body = {
                code: 200,
                msg: '参数不能为空',
                data: null,
            }
        }
        try {
            // 鉴权
            let id
            const token = ctx.request.header.authorization
            const decode = await app.jwt.verify(token, app.config.jwt.secret)
            if (!decode) return
            //
            // id默认添加到每个账单项，作为后续获取指定用户账单的标识,
            // 也就是, 登录A账户，那么所作的操作都得加上A的ID，
            // 后续对数据库操作的时候，就可以指定ID操作
            const end_date = dayjs(start_date, 'YYYY-MM-DD').add(8, 'hour').add(period, 'day').format('YYYY-MM-DD')
            // 
            const target_money = daily_money * period
            const saved_money = 0
            const result = await ctx.service.plan.add({
                user_id: decode.id,
                name,
                period,
                start_date,
                'end-date': end_date,
                daily_money,
                target_money,
                saved_money,
                picture,
            })
            if (result) {
                // 根据period创建细节数组
                // [
                // { amount: , total: , date: , },
                // { },
                // ]
                const hand = this.handle_PlanDetail(start_date, daily_money, period)
                const detailArr = hand()
                ctx.body = {
                    code: 200,
                    msg: '添加Plan成功',
                    data: {
                        id: result.insertId,
                        detailArr,
                        name,
                        period,
                        start_date,
                        end_date,
                        daily_money,
                        target_money,
                        saved_money,
                        persentage: toPercent(saved_money / target_money),
                        picture,
                    }
                }
            } else {
                ctx.body = {
                    code: 500,
                    msg: '失败--添加计划',
                    data: {
                        // result,
                        // name,
                        // period,
                        start_date: dayjs(start_date, 'YYYY-MM-DD').add(8, 'hour').add(period, 'day'),
                        period,
                        // end_date,
                        // daily_money,
                    }
                }
            }

        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 500,
                msg: '添加计划-蛋疼',
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
            // const QUERY_STR = 'date'
            // let sql = `select ${QUERY_STR} from book where id=${id}`
            // const date = await app.mysql.query(sql);
            let user_id
            const token = ctx.request.header.authorization;
            const decode = await app.jwt.verify(token, app.config.jwt.secret);
            if (!decode) return
            user_id = decode.id
            const result = await ctx.service.plan.delete(id, user_id);
            ctx.body = {
                code: 200,
                msg: '删除Plan成功',
                data: id,
            }
        } catch (error) {
            ctx.body = {
                code: 500,
                msg: '删除Plan系统错误',
                data: null
            }
        }
    }
    async update() {
        const { ctx, app } = this
        const { id, daily_money, mode } = ctx.request.body;
        if (!id || !daily_money) {
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
            const qqll = `select * from plan where id=${id}`
            const plan = await this.app.mysql.query(qqll)
            const row = { saved_money: 0 }
            if (mode == 1) row.saved_money = plan[0].saved_money + Number(daily_money)
            if (mode == 2) row.saved_money = plan[0].saved_money - Number(daily_money)

            const options = {
                where: {
                    id: id
                }
            }
            const result = await this.app.mysql.update('plan', row, options);
            // const ql = `update plan set saved_money+=${amount} where id=${id}`
            // const result = await this.app.mysql.query(ql)
            ctx.body = {
                code: 200,
                msg: '修改成功',
                data: {
                    result,
                    plan
                }
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
module.exports = PlanController