/**
     * 账单接口
     */

'use strict'

const Service = require('egg').Service

class GoodsService extends Service {
    async add(params) {
        const { ctx, app } = this
        try {
            const result = await app.mysql.insert('goods', params)
            return result
        } catch (error) {
            console.error(error)
            return null
        }
    }
}

module.exports = GoodsService