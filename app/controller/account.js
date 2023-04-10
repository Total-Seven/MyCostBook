/** 
     * 账户接口 
    */

'use strict'

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
        let user_id
        const token = ctx.request.header.authorization;
        const decode = await app.jwt.verify(token, app.config.jwt.secret);
        if (!decode) return
        user_id = decode.id
        try {
            const result = await ctx.service.account.delete(id, user_id);
            ctx.body = {
                code: 200,
                msg: '删除Book成功',
                data: result,
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
        const { id, name, amount } = ctx.request.body;
        if (!id) {
            ctx.body = {
                code: 400,
                msg: 'ID为空',
                data: null
            }
        }

        let user_id
        const token = ctx.request.header.authorization
        const decode = await app.jwt.verify(token, app.config.jwt.secret)
        if (!decode) return
        try {
            user_id = decode.id
            const result = await ctx.service.account.update({
                id,
                name,
                amount,

                user_id,
            })
            if (result) {
                ctx.body = {
                    code: 200,
                    msg: '修改成功',
                    data: result
                }
            }
            else {
                ctx.body = {
                    code: 500,
                    msg: '修改失败',
                    data: null
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
    async getAllAccount() {
        const { ctx, app } = this
        let user_id
        const token = ctx.request.header.authorization
        const decode = await app.jwt.verify(token, app.config.jwt.secret)
        if (!decode) return

        user_id = decode.id

        // 查询账户
        const ql = `select * from account where user_id=${user_id}`
        const accounts = await app.mysql.query(ql)
        // if (!accounts) return

        // // 计算
        // let assets = 0
        // let debt = 0
        // const net = accounts.reduce((pre, cur) => {
        //     cur.amount > 0 ? assets += cur.amount : debt -= cur.amount
        //     return pre += cur.amount
        // }, 0)
        // 这样做获取的是目前所有账户的金额


        /**
         * 可能会出现紊乱的情况：
         * 1.用户调整了账户余额，但是没有记账
         * 2.用户删除or修改了账单信息，导致混乱
         */

        // Strict: 查询用户所有账单，同样得到Income，Expend，Net。
        // 与账户的assets、debt、net做比较
        // 并以目前所有账单为准并修改数据库的数据(自动比对并修改)

        /**Strict */
        const qlForbill = `select pay_type,amount,account_id from bill where user_id=${user_id}`
        const Billaccount = await app.mysql.query(qlForbill)

        if (!Billaccount) return

        const accountMap = {}
        let assets = 0
        let debt = 0
        Billaccount.reduce((pre, cur) => {

            if (!accountMap[cur.account_id]) accountMap[cur.account_id] = {}
            const billgroup = accountMap[cur.account_id]

            if (cur.pay_type == 1) {
                assets += cur.amount

                if (!billgroup.income) {
                    billgroup.income = cur.amount
                }
                else {
                    billgroup.income += cur.amount
                }
            }
            else if (cur.pay_type == 2) {
                debt += cur.amount

                if (!billgroup.expend) {
                    billgroup.expend = cur.amount
                }
                else {
                    billgroup.expend += cur.amount
                }
            }

            return pre += cur.amount
        }, 0)

        let trulyAccounts = [{
            net: undefined,
            assets: undefined,
            debt: undefined,
        }]
        let totalIncome = 0
        let totalExpend = 0

        for (const key in accountMap) {
            // 找账户
            const TI = accounts.findIndex(el => el.id == key)
            const account = accounts[TI]
            const amount = account.amount

            if (accountMap.hasOwnProperty.call(accountMap, key)) {
                const element = accountMap[key];
                element.amount = element.income - element.expend

                if (element.amount !== amount) {
                    element.false = false
                    await app.mysql.update('account', { id: +key, amount: element.amount })
                }

                // totalIncome += element.income
                // totalExpend += element.expend
            }
        }
        // const totalNet = totalIncome - totalExpend



        const net = assets - debt

        ctx.body = {
            code: 200,
            msg: '成功',
            data: {
                accountMap,
                accounts,
                net,
                assets,
                debt,
                // totalNet, totalIncome, totalExpend
            }
        }
    }

}

module.exports = BookController