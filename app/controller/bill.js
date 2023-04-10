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
const dayjs = require('dayjs')
var isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween)

const curMonthStart = dayjs().startOf('month')
const curMonthEnd = dayjs().endOf('month')


function handlerMulti(multiBook, user_id) {

    const isCreator = multiBook.creator_id === user_id
    if (isCreator) {
        // resolve(user_id)
        return user_id
    }

    /**验证是否是参与者 */
    function includeInParticipants() {
        console.log('判断用户ID,在不在当前多人账本的participants里')
        const participantsArray = multiBook.participants.split(',') // "2,1"  "4,2,4"  "" 
        if (participantsArray.length === 0) {
            return false
        }
        const isIncludeInParticipants = participantsArray.includes(user_id)
        return isIncludeInParticipants
    }
    /**验证是否是参与者 */
    // const isParticipant = !isCreator && includeInParticipants()
    const isParticipant = !isCreator
    const ShiftId = isParticipant && multiBook.creator_id

    // resolve(ShiftId)
    return ShiftId

}
function getBookInfo(list) {

    const expense_list = list.filter(bill => {
        return bill.pay_type == 2
    })
    const total_expense = keepTwoDecimalStr(expense_list.reduce((pre, cur) => {
        return pre += cur.amount
    }, 0))
    const income_list = list.filter(bill => {
        return bill.pay_type == 1
    })
    const total_income = keepTwoDecimalStr(income_list.reduce((pre, cur) => {
        return pre += cur.amount
    }, 0))
    const total_net = total_income - total_expense

    return { total_expense, total_income, total_net }

}
function filterList(list, date, CategoryId) {

    const _list = list.filter(item => {
        if (CategoryId != 'all') {
            // 如果传入了分类
            return moment(Number(item.date)).format('YYYY-MM') == date && CategoryId == item.category_id
        }
        return moment(Number(item.date)).format('YYYY-MM') == date
    })

    return _list

}
function formaterList(_list) {

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
    }, []).sort((a, b) => moment(b.date) - moment(a.date)) // 时间顺序为倒叙，时间越新，在越上面

    return listMap
}
function handlerCurChoiceMonth(list) {

    let ThisMonthInfo = list.reduce((pre, item) => {

        if (item.pay_type === 2) {
            pre.expense += Number(item.amount)
        }
        else if (item.pay_type == 1) {
            pre.income += Number(item.amount)
        }
        else if (item.pay_type == 3) {
            pre.asset += Number(item.amount)
        }

        return pre
    }, { expense: 0, income: 0, asset: 0 })

    return ThisMonthInfo

}
function handlerType(types, categories) {

    for (const key in types) {
        types[key].forEach(item => {
            Object.defineProperties(item, {
                'text': {
                    value: item.name,
                    writable: true,
                    enumerable: true,
                    configurable: true
                }
            })
            // item.categories 
            // 
            categories.forEach(category => {
                if (category.type_id == item.id) {
                    Object.defineProperties(category, {
                        'text': {
                            value: category.name,
                            writable: true,
                            enumerable: true,
                            configurable: true
                        }
                    })
                    if (item.children == undefined) {
                        item.children = []
                    }
                    item.children.push(category)
                }
            })
        })
    }

}

const Controller = require('egg').Controller
function keepTwoDecimalStr(num) {
    const result = Number(num.toString().match(/^\d+(?:\.\d{0,2})?/));
    let s = result.toString();
    let rs = s.indexOf('.');
    if (rs < 0) {
        rs = s.length;
        s += '.';
    }
    while (s.length <= rs + 2) {
        s += '0';
    }
    return Number(s);
};
class BillController extends Controller {
    async add() {
        // 
        const { ctx, app } = this
        // 获取请求头中携带的参数
        const { pay_type, account_id, book_id, book_type, category_id, category_name, amount, date = dayjs().format('YYYY-MM-DD HH:mm:ss'), remark = '' } = ctx.request.body
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
            if (!decode) return

            else {
                user_id = decode.id
                const [user] = await app.mysql.query(`select * from user where id=${user_id}`)
                // user_id默认添加到每个账单项，作为后续获取指定用户账单的标识,
                // 也就是, 登录A账户，那么所作的操作都得加上A的ID，
                // 后续对数据库操作的时候，就可以指定ID操作
                /**
                 * 找type_id和type_name 
                 * 找book_name
                 */
                const book_name = await app.mysql.query(`select name from book where id =${book_id}`)
                const type_id = await app.mysql.query(`select type_id from category where id =${category_id}`)
                const type_name = await app.mysql.query(`select name from type where id =${type_id[0].type_id}`)
                const result = await ctx.service.bill.add({
                    user_id,
                    pay_type,
                    account_id,
                    book_id,
                    book_name: book_name[0].name,
                    book_type,
                    type_id: type_id[0].type_id,
                    type_name: type_name[0].name,
                    category_id,
                    category_name,
                    amount,
                    date,  //存储的时候不用加八个小时
                    remark,
                })
                if (result) {
                    // ① 进行对账户的扣款
                    const ql = `update account set amount=amount-${amount} where id = ${account_id}`
                    const account = await app.mysql.query(ql)
                    // ② 对预算的扣款
                    const qql = `select budget_mode from user where id=${user_id}`
                    const [user_budget] = await app.mysql.query(qql)
                    // 是否是当月的账
                    const isCurMonth = dayjs(date).isBetween(curMonthStart, curMonthEnd)
                    let setBudget = 0
                    if (isCurMonth && user_budget.budget_mode == 1) {
                        const ql = `update user set current_budget=current_budget-${amount} where id = ${user_id}`
                        setBudget = await app.mysql.query(ql)
                    }
                    ctx.body = {
                        code: 200,
                        msg: '添加Bill成功',
                        data: {
                            userName: user.username,
                            budget_mode: user_budget.budget_mode,
                            // setBudget,
                            id: result.insertId,
                            user_id,
                            pay_type,
                            account_id,
                            book_id,
                            book_name: book_name[0].name,
                            book_type,
                            type_id: type_id[0].type_id,
                            type_name: type_name[0].name,
                            category_id,
                            category_name,
                            amount,
                            date,  //存储的时候不用加八个小时
                            remark,
                        }
                    }
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
    async transform() {
        const { ctx, app } = this
        // // 获取请求头中携带的参数
        const { out_account_id, in_account_id, amount, date = dayjs().format('YYYY-MM-DD HH:mm:ss'), remark = '' } = ctx.request.body
        //
        if (!out_account_id || !in_account_id || !amount || !date) {
            ctx.body = {
                code: 400,
                msg: '账单参数错误',
                data: null,
            }
        }
        try {
            let user_id
            const token = ctx.request.header.authorization
            const decode = await app.jwt.verify(token, app.config.jwt.secret)
            if (!decode) return
            else {
                user_id = decode.id
                //
                const result = await ctx.service.bill.add({
                    user_id,
                    pay_type: 3,
                    account_id: in_account_id,
                    amount,
                    date,  //存储的时候不用加八个小时
                    remark,

                    book_id: 0,
                    book_name: '',
                    book_type: 0,
                    type_id: 0,
                    type_name: '',
                    category_id: 0,
                    category_name: '',
                })
                if (result) {
                    // ① 进行对账户的扣款
                    const _ql = `update account set amount=amount-${amount} where id = ${out_account_id}`
                    const res1 = await app.mysql.query(_ql)
                    const ql_ = `update account set amount=amount+${amount} where id = ${in_account_id}`
                    const res2 = await app.mysql.query(ql_)
                    if (res1 && res2) {
                        ctx.body = {
                            code: 200,
                            msg: '添加Bill成功',
                            data: {
                                id: result.insertId,
                                user_id,
                                pay_type: 3,
                                in_account_id,
                                amount,
                                date,  //存储的时候不用加八个小时
                                remark,
                            }
                        }
                    }
                    else {
                        ctx.body = {
                            code: 500,
                            msg: 'transfrom--记账成功，转账失败',
                            data: null
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error);
            ctx.body = {
                code: 500,
                msg: 'transfrom--系统错误',
                data: null
            }
        }

    }
    // async list() {
    //     const { ctx, app } = this;
    //     // 前端传给后端的数据
    //     const { book_id, date, page, page_size, category_id = 'all' } = ctx.query
    //     try {
    //         // 通过 token 解析，拿到 user_id
    //         let user_id = tokenGetID(ctx.request.header, app)
    //         //查询user信息
    //         const [user] = await app.mysql.query(`select * from user where id=${user_id}`)

    //         // 💩 判断Book是否是多人账本，并且判断该Id是否是创建者。
    //         const [curBook] = await app.mysql.query(`select * from book where id=${book_id}`)
    //         const isMulti = curBook.multiuser === 1

    //         user_id = isMulti ? handlerMulti(book_id, user_id) : user_id

    //         // 拿到当前用户的账单列表
    //         let list = []
    //         if (!isMulti) list = await ctx.service.bill.list(user_id, book_id)
    //         else list = await ctx.service.bill.list(null, book_id)
    //         /**
    //           * 获取账本信息 ： net income expense
    //           */
    //         const { total_expense, total_income, total_net } = getBookInfo(list)

    //         /**
    //          *  筛选：条件
    //          * （日期相等、type相等；例如：2023年2月 学习类的所有账单）
    //          */
    //         const _list = filterList(list, date, category_id)

    //         // 格式化数据，将数据库里的一条条数据包裹成对象、数组
    //         let listMap = formaterList(_list)

    //         // 分页处理，listMap 为我们格式化后的全部数据，还未分页。
    //         const curPageList = listMap.slice((page - 1) * page_size, page * page_size)

    //         // 计算当月总收入和支出
    //         // 首先获取当月所有账单列表
    //         let CurChoiceMonthList = list.filter(item => moment(Number(item.date)).format('YYYY-MM') == date)

    //         const { expense: ThisMonthExpense, income: ThisMonthIncome, asset: ThisMonthAsset } = handlerCurChoiceMonth(CurChoiceMonthList)
    //         const ThisMonthNet = ThisMonthIncome - ThisMonthExpense

    //         /**
    //          * 账户
    //          */
    //         const qlForAccount = `select * from account where user_id=${user_id}`
    //         const accounts = await app.mysql.query(qlForAccount)
    //         /**
    //          * 分类
    //          */
    //         const ExpenseType = await ctx.service.category.getAlltype(1)
    //         const IncomeType = await ctx.service.category.getAlltype(2)
    //         const categories = await ctx.service.category.getAllCategory(user_id)
    //         const typess = { ExpenseType, IncomeType }

    //         // 转化数据 => types
    //         handlerType(typess, categories)

    //         // 返回数据
    //         ctx.body = {
    //             code: 200,
    //             msg: '请求成功',
    //             data: {
    //                 user_id,
    //                 isMulti,
    //                 username: decode.username,
    //                 account: accounts,
    //                 typess,
    //                 ThisMonthNet, ThisMonthIncome, ThisMonthExpense,
    //                 total_net, total_income, total_expense,  // 总收入支出，净余额
    //                 totalPage: Math.ceil(listMap.length / page_size), // 总分页
    //                 list: curPageList || [], // 格式化后，并且经过分页处理的数据
    //                 CurChoiceMonthList: CurChoiceMonthList || [],
    //             }
    //         }
    //     } catch {
    //         ctx.body = {
    //             code: 500,
    //             msg: '系统错误--bill-list',
    //             data: null
    //         }
    //     }
    // }
    async list() {
        const { ctx, app } = this;
        // 获取，日期 date，分页数据，类型 type_id，这些都是我们在前端传给后端的数据
        const { book_id, date, page, page_size, category_id = 'all' } = ctx.query
        // 
        try {
            let user_id
            // 通过 token 解析，拿到 user_id
            const token = ctx.request.header.authorization;
            const decode = await app.jwt.verify(token, app.config.jwt.secret);
            if (!decode) return
            user_id = decode.id
            // 
            const [user] = await app.mysql.query(`select * from user where id=${user_id}`)
            // 💩 判断Book是否是多人账本，并且判断该Id是否是创建者。
            const [oldbill] = await app.mysql.query(`select * from book where id=${book_id}`)
            const isMulti = oldbill.multiuser === 1
            // 如果是，则处理👇
            const [multiBook] = await app.mysql.query(`select * from multiuserbook where book_id=${book_id}`)
            // if (isMulti) {
            // user_id = isMulti ? handlerMulti(multiBook, user_id) : user_id
            // const isCreator = multiBook.creator === user_id
            // /**验证是否是参与者 */
            // function includeInParticipants() {
            //     console.log('判断用户ID,在不在当前多人账本的participants里')
            //     const participantsArray = multiBook.participants.split(',') // "2,1"  "4,2,4"  "" 
            //     if (participantsArray.length === 0) {
            //         return false
            //     }
            //     const isIncludeInParticipants = participantsArray.includes(user_id)
            //     return isIncludeInParticipants
            // }
            // /**验证是否是参与者 */
            // const isParticipant = !isCreator && includeInParticipants()
            // user_id = isParticipant && multiBook.creator_id
            // }

            // 拿到当前用户的账单列表
            let list = []
            if (!isMulti) list = await ctx.service.bill.list(user_id, book_id)
            else list = await ctx.service.bill.list(null, book_id)
            /**
              * 获取账本信息 ： net income expense 
              */
            const { total_expense, total_income, total_net } = getBookInfo(list)

            /**
             *  筛选：条件
             * （日期相等、type相等；例如：2023年2月 学习类的所有账单）
             */
            const _list = filterList(list, date, category_id)

            // 格式化数据，将数据库里的一条条数据包裹成对象、数组
            let listMap = formaterList(_list)

            // 分页处理，listMap 为我们格式化后的全部数据，还未分页。
            const filterListMap = listMap.slice((page - 1) * page_size, page * page_size)

            // 计算当月总收入和支出
            // 首先获取当月所有账单列表
            let CurChoiceMonthList = list.filter(item => moment(Number(item.date)).format('YYYY-MM') == date)

            const { expense: ThisMonthExpense, income: ThisMonthIncome, asset: ThisMonthAsset } = handlerCurChoiceMonth(CurChoiceMonthList)
            const ThisMonthNet = ThisMonthIncome - ThisMonthExpense

            /**
             * 账户
             */
            const ql = `select * from account where user_id=${user_id}`
            const account = await app.mysql.query(ql)
            // 
            const ExpenseType = await ctx.service.category.getAlltype(1) // pay_type === 1
            const IncomeType = await ctx.service.category.getAlltype(2) // pay_type === 2
            // 
            const categories = await ctx.service.category.getAllCategory(user_id)
            const typess = { Expense: ExpenseType, Income: IncomeType }

            // 转化数据 => types
            handlerType(typess, categories)
            // 返回数据
            ctx.body = {
                code: 200,
                msg: '请求成功',
                data: {
                    user_id,
                    isMulti,
                    username: decode.username,
                    account,
                    // categories,
                    typess,
                    ThisMonthNet, ThisMonthIncome, ThisMonthExpense,
                    total_net, total_income, total_expense,  // 总收入支出，净余额
                    totalPage: Math.ceil(listMap.length / page_size), // 总分页
                    list: filterListMap || [] // 格式化后，并且经过分页处理的数据
                }
            }
        } catch (error) {
            ctx.body = {
                code: 500,
                msg: '系统错误--bill-list',
                data: error
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
            const detail = await ctx.service.bill.detail(id)
            if (!detail) {
                ctx.body = {
                    code: 500,
                    msg: '获取到账单详情,但不给你',
                    data: null,
                }
                return
            }
            // 
            const [user] = await app.mysql.query(`select username from user where id=${detail.user_id}`)
            if (!user) {
                ctx.body = {
                    code: 500,
                    msg: '没有找到用户',
                    data: null,
                }
                return
            }
            ctx.body = {
                code: 200,
                msg: '请求成功',
                data: {
                    ...detail,
                    userName: user.username
                }
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
        const { id, amount = undefined, remark = '' } = ctx.request.body;
        // 判空处理
        if (!id) {
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
            const row = {
                id,
                amount,
                remark,
                user_id
            }
            const result = await ctx.service.bill.update(row);
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
            const infos = await app.mysql.query(`select date,amount,account_id from bill where id=${id}`);
            const { date, amount, account_id } = infos[0]
            // 
            let user_id
            const token = ctx.request.header.authorization;
            const decode = await app.jwt.verify(token, app.config.jwt.secret);
            if (!decode) return
            user_id = decode.id
            // 
            const result = await ctx.service.bill.delete(id, user_id);
            if (result) {
                // ① 进行对账户的汇款
                const ql = `update account set amount=amount+${amount} where id = ${account_id}`
                const account = await app.mysql.query(ql)
                ctx.body = {
                    code: 200,
                    msg: '请求成功',
                    data: {
                        infos,
                        account
                    }
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