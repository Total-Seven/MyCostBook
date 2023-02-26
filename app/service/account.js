/**
     * 账户接口
     */

'use strict'

const Service = require('egg').Service

class AccountService extends Service {
    async add(params) {
        const { ctx, app } = this
        try {
            const result = await app.mysql.insert('account', params)
            return result
        } catch (error) {
            console.error(error)
            return null
        }
    }
    async getAllAccount(user_id) {
        const { ctx, app } = this
        try {
            const QUERY_STR = '*';
            let sql = `select ${QUERY_STR} from account where user_id = ${user_id}`;
            const result = await app.mysql.query(sql);
            return result;
        } catch {
            return null
        }
    }
    async initAccount(user_id) {
        const { ctx, app } = this
        try {
            const QUERY_STR = '*';
            let sql = `select ${QUERY_STR} from account where user_id = ${user_id}`;
            const result = await app.mysql.query(sql);
            return result;
        } catch {
            return null
        }
    }
}

module.exports = AccountService