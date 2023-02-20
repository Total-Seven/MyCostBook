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

class BillController extends Controller {
    async add() {
        const { ctx, app } = this
        // 获取请求头中携带的参数
        const { pay_type, account_id, book_id, book_name, book_type, category_id, category_name, amount, date, remark = '' } = ctx.request.body
        // ❌处理参数中“key”写错的情况



        if (!amount || !category_id || !category_name || !date || !pay_type || !account_id) {
            ctx.body = {
                code: 200,
                msg: '账单参数错误',
                data: null,
            }
        }
        try {
            let user_id
            const token = ctx.request.header.authorization
            const decode = await app.jwt.verify(token, app.config.jwt.secret)
            if (!decode) {
                return
            }
            else {
                user_id = decode.id
                // user_id默认添加到每个账单项，作为后续获取指定用户账单的标识,
                // 也就是, 登录A账户，那么所作的操作都得加上A的ID，
                // 后续对数据库操作的时候，就可以指定ID操作
                const result = await ctx.service.bill.add({
                    user_id,
                    pay_type,
                    account_id,
                    book_id,
                    book_name,
                    book_type,
                    category_id,
                    category_name,
                    amount,
                    date: date ? date : this.app.mysql.literals.now,
                    remark,
                })
                ctx.body = {
                    code: 200,
                    msg: '添加Bill成功',
                    data: result
                }
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 500,
                msg: 'BillAdd-系统错误',
                data: null
            }
        }
    }
    // async list() {
    //     const { ctx, app } = this
    //     const { date, page = 1, page_size = 5, category_id = 'all' } = ctx.query
    //     try {
    //         let user_id
    //         // Token解析，拿到user_id
    //         const token = ctx.request.header.authorization
    //         const decode = await app.jwt.verify(token, app.config.jwt.secret)
    //         if (!decode) return
    //         else {
    //             user_id = decode.id
    //             // 拿到账单
    //             const list = await ctx.service.bill.list(user_id)
    //             // 过滤出 月份和类型 所对应的帐单列表
    //             const _list = list.filter(item => {
    //                 // 如果 category_id不为 “all”
    //                 if (category_id != 'all') {
    //                     // 账单日期与用户当前提交的日期 相等 
    //                     return moment(Number(item.date)).format('YYYY-MM') == date && category_id == item.category_id //用户提交的id与账单的id一致
    //                 }
    //                 // category_id为 “all”
    //                 else {
    //                     return moment(Number(item.date)).format('YYYY-MM') == date   // 账单日期与用户当前提交的日期 相等 
    //                 }
    //             })
    //             // 格式化数据  将其封装成对象格式
    //             let listMap = _list.reduce((prev, crrV) => {
    //                 // prev默认初始值是一个空数组[]
    //                 // 把第一个账单项的时间格式化为YYYY-MM-DD
    //                 const date = moment(Number(crrV.date)).format('YYYY-MM-DD')
    //                 // 如果能在累加的数组中找到当前项日期date，那么在数组中加入项bills数组
    //                 if (prev && prev.length && prev.findIndex(crrV => crrV.date == date) > -1) {
    //                     const index = prev.findIndex(item => item.date == date)
    //                     prev[index].bills.push(crrV)
    //                 }
    //                 if (prev && prev.length && prev.findIndex(crrV => crrV.date == date) == -1) {
    //                     prev.push({
    //                         date,
    //                         bills: [crrV]
    //                     })
    //                 }
    //                 // 如果是空数组，则添加第一个crrV，格式化为下列模式
    //                 if (!prev.length) {
    //                     prev.push({
    //                         date,
    //                         bills: [crrV]
    //                     })
    //                 }
    //                 return prev
    //             }, [].sort((a, b) => moment(b.date) - moment(a.date))
    //             )
    //             //             console.log('////////格式化封装对象/////////');
    //             //             console.log(listMap);
    //             //             console.log('////////格式化封装对象/////////');

    //             //             //             /**
    //             //             //              * 分页处理，listMap是格式化后的全部数据，还未分页。
    //             //             //              */
    //             const filterListMap = listMap.slice((page - 1) * page_size, page * page_size)

    //             //             //             // 计算月总收入与指出
    //             //             //             // 获取当月所有帐单列表
    //             let __list = list.filter(item => moment(Number(item.date)).format('YYYY-MM') == date)
    //             //             //             // 计算支出
    //             let totalExpense = __list.reduce((curr, item) => {
    //                 if (item.pay_type == 1) {
    //                     curr += Number(item.amount)
    //                     return curr
    //                 }
    //                 return curr
    //             }, 0)
    //             //             // 计算收入
    //             let totalIncome = __list.reduce((curr, item) => {
    //                 if (item.pay_type == 2) {
    //                     curr += Number(item.amount)
    //                     return curr
    //                 }
    //                 return curr
    //             }, 0)

    //             const _format = item => moment(Number(item)).format('YYYY-MM-DD')
    //             const edit_date = arr => arr.map(item => item.date = _format(item.date))
    //             function format_date(arr) {
    //                 arr.map(item => edit_date(item.bills))
    //             }
    //             format_date(filterListMap)

    //             ctx.body = {
    //                 code: 200,
    //                 msg: '数据请求成功',
    //                 data: {
    //                     totalExpense,
    //                     totalIncome,
    //                     totalPage: Math.ceil(listMap.length / page_size),
    //                     list: filterListMap || [],

    //                 }
    //             }
    //         }
    //     }
    //     catch (error) {
    //         console.error(error)
    //         ctx.body = {
    //             code: 500,
    //             msg: 'list系统错误',
    //             data: {
    //                 date,
    //                 page,
    //                 page_size,
    //                 category_id,
    //             }
    //         }
    //     }
    // }
    async list() {
        const { ctx, app } = this;
        // 获取，日期 date，分页数据，类型 type_id，这些都是我们在前端传给后端的数据
        const { book_id, date, page = 1, page_size = 5, category_id = 'all' } = ctx.query
        try {
            let user_id
            // 通过 token 解析，拿到 user_id
            const token = ctx.request.header.authorization;
            const decode = await app.jwt.verify(token, app.config.jwt.secret);
            if (!decode) return
            user_id = decode.id
            // 拿到当前用户的账单列表   ❌：要加账本
            const list = await ctx.service.bill.list(user_id, book_id)

            // 筛选：条件（日期相等、type相等；例如：2023年2月 学习类的所有账单）
            const _list = list.filter(item => {
                if (category_id != 'all') {
                    return moment(Number(item.date)).format('YYYY-MM') == date && category_id == item.category_id
                }
                return moment(Number(item.date)).format('YYYY-MM') == date
            })

            // 格式化数据，将数据库里的一条条数据包裹成对象、数组
            let listMap = _list.reduce((curr, item) => {
                // curr 默认初始值是一个空数组 []
                // 把第一个账单项的时间格式化为 YYYY-MM-DD
                const date = moment(Number(item.date)).format('YYYY-MM-DD')
                // 如果能在累加的数组中找到当前项日期 date，那么在数组中的加入当前项到 bills 数组。
                if (curr && curr.length && curr.findIndex(item => item.date == date) > -1) {
                    const index = curr.findIndex(item => item.date == date)
                    curr[index].bills.push(item)
                }
                // 如果在累加的数组中找不到当前项日期的，那么再新建一项。
                if (curr && curr.length && curr.findIndex(item => item.date == date) == -1) {
                    curr.push({
                        date,
                        bills: [item]
                    })
                }
                // 如果 curr 为空数组，则默认添加第一个账单项 item ，格式化为下列模式
                if (!curr.length) {
                    curr.push({
                        date,
                        bills: [item]
                    })
                }
                return curr
            }, []).sort((a, b) => moment(b.date) - moment(a.date)) // 时间顺序为倒叙，时间约新的，在越上面


            // 分页处理，listMap 为我们格式化后的全部数据，还未分页。
            const filterListMap = listMap.slice((page - 1) * page_size, page * page_size)

            // 计算当月总收入和支出
            // 首先获取当月所有账单列表
            let __list = list.filter(item => moment(Number(item.date)).format('YYYY-MM') == date)
            // 累加计算支出
            let totalExpense = __list.reduce((curr, item) => {
                if (item.pay_type == 1) {
                    curr += Number(item.amount)
                    return curr
                }
                return curr
            }, 0)
            // 累加计算收入
            let totalIncome = __list.reduce((curr, item) => {
                if (item.pay_type == 2) {
                    curr += Number(item.amount)
                    return curr
                }
                return curr
            }, 0)
            // 累加计算资产
            let totalAsset = __list.reduce((curr, item) => {
                if (item.pay_type == 3) {
                    curr += Number(item.amount)
                    return curr
                }
                return curr
            }, 0)

            // 返回数据
            ctx.body = {
                code: 200,
                msg: '请求成功',
                data: {
                    totalExpense, // 当月支出
                    totalIncome, // 当月收入
                    totalAsset,
                    totalPage: Math.ceil(listMap.length / page_size), // 总分页
                    list: filterListMap || [] // 格式化后，并且经过分页处理的数据
                }
            }
        } catch {
            ctx.body = {
                code: 500,
                msg: '系统错误',
                data: null
            }
        }
    }
    async select_category_list() {
        const { ctx, app } = this;
        // 获取，日期 date，分页数据，类型 type_id，这些都是我们在前端传给后端的数据
        const { book_id, date, category_id = 'all', page = 1, page_size = 5, } = ctx.query
        let user_id
        // 通过 token 解析，拿到 user_id
        const token = ctx.request.header.authorization;
        const decode = await app.jwt.verify(token, app.config.jwt.secret);
        if (!decode) return
        user_id = decode.id


        // 拿到当前用户的账单列表   ❌：要加账本
        const list = await ctx.service.bill.list(user_id, book_id)

        // 筛选：条件（日期相等、type相等；例如：2023年2月 学习类的所有账单）
        const _list = list.filter(item => {
            if (category_id != 'all') {
                return moment(Number(item.date)).format('YYYY-MM') == date && category_id == item.category_id
            }
            else {
                ctx.body = {
                    code: 500,
                    msg: '失败',
                    data: null
                }
            }
        })
        if (_list == null) {
            ctx.body = {
                code: 500,
                msg: '失败',
                data: null
            }
        }
        ctx.body = {
            code: 200,
            msg: '成功',
            data: _list
        }
    }
    async select_list() {
        const { ctx, app } = this
        const token = ctx.request.header.authorization
        const decode = app.jwt.verify(token, app.config.jwt.secret)
        const result = await ctx.service.bill.select_list(decode.id)
        for (let i = 0; i < result.length; i++) {
            result[i].date = moment(Number(result[i].date)).format('YYYY-MM-DD')
        }
        moment(Number(crrV.date)).format('YYYY-MM-DD')
        ctx.body = {
            code: 200,
            msg: 'select_list',
            data: decode,
            result: result,
        }
    }
    async detail() {
        const { ctx, app } = this
        const { id = '' } = ctx.query
        let user_id
        const token = ctx.request.header.authorization
        const decode = app.jwt.verify(token, app.config.jwt.secret)
        if (!decode) return
        user_id = decode.id
        // 是否传入账单
        if (!id) {
            ctx.body = {
                code: 500,
                msg: '订单id不能为空',
                data: null
            }
            return
        }
        try {
            const detail = await ctx.service.bill.detail(id, user_id)
            ctx.body = {
                code: 200,
                msg: '请求成功',
                data: detail
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 500,
                msg: '系统错误',
                data: null,
            }
        }
    }
    async update() {
        const { ctx, app } = this;
        // 账单的相关参数，这里注意要把账单的 id 也传进来
        const { id, pay_type, amount, category_id, type_name, date, remark = '' } = ctx.request.body;
        // 判空处理
        if (!amount || !category_id || !type_name || !date || !pay_type) {
            ctx.body = {
                code: 400,
                msg: '参数错误',
                data: null
            }
        }

        try {
            let user_id
            const token = ctx.request.header.authorization;
            const decode = await app.jwt.verify(token, app.config.jwt.secret);
            if (!decode) return
            user_id = decode.id
            // 根据账单 id 和 user_id，修改账单数据
            const result = await ctx.service.bill.update({
                id, // 账单 id
                user_id, // 用户 id
                pay_type, // 消费类型
                amount, // 金额
                category_id, // 消费类型 id
                type_name, // 消费类型名称
                date, // 日期
                remark, // 备注
            });
            ctx.body = {
                code: 200,
                msg: '请求成功',
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
            let sql = `select ${QUERY_STR} from bill where id=${id}`
            const date = await app.mysql.query(sql);
            let user_id
            const token = ctx.request.header.authorization;
            const decode = await app.jwt.verify(token, app.config.jwt.secret);
            if (!decode) return
            user_id = decode.id
            const result = await ctx.service.bill.delete(id, user_id);
            ctx.body = {
                code: 200,
                msg: '请求成功',
                data: date,
            }
        } catch (error) {
            ctx.body = {
                code: 500,
                msg: '系统错误',
                data: null
            }
        }
    }
    async data() {
        const { ctx, app } = this
        const { date = '' } = ctx.query
        let user_id
        const token = ctx.request.header.authorization;
        const decode = await app.jwt.verify(token, app.config.jwt.secret);
        if (!decode) return
        user_id = decode.id
        try {
            const result = await ctx.service.bill.list(user_id)
            const start = moment(date).startOf('month').unix() * 1000; // 选择月份，月初时间
            const end = moment(date).endOf('month').unix() * 1000; // 选择月份，月末时间
            const _data = result.filter(item => (Number(item.date) > start && Number(item.date) < end))
            const total_expense = _data.reduce((arr, cur) => {
                if (cur.pay_type == 1) {
                    arr += Number(cur.amount)
                }
                return arr
            }, 0)
            // 总收入
            const total_income = _data.reduce((arr, cur) => {
                if (cur.pay_type == 2) {
                    arr += Number(cur.amount)
                }
                return arr
            }, 0)
            // 获取收支构成
            let total_data = _data.reduce((arr, cur) => {
                const index = arr.findIndex(item => item.category_id == cur.category_id)
                if (index == -1) {
                    arr.push({
                        category_id: cur.category_id,
                        type_name: cur.type_name,
                        pay_type: cur.pay_type,
                        number: Number(cur.amount)
                    })
                }
                if (index > -1) {
                    arr[index].number += Number(cur.amount)
                }
                return arr
            }, [])

            total_data = total_data.map(item => {
                item.number = Number(Number(item.number).toFixed(2))
                return item
            })

            ctx.body = {
                code: 200,
                msg: '请求成功',
                data: {
                    total_expense: Number(total_expense).toFixed(2),
                    total_income: Number(total_income).toFixed(2),
                    total_data: total_data || [],
                }
            }
        } catch (error) {
            console.log(error);
            ctx.body = {
                code: 500,
                msg: '请求data失败',
                data: null
            }
        }
    }
}
module.exports = BillController