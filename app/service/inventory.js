/**
     * 清单接口
     */

'use strict'

const Service = require('egg').Service

class InventoryService extends Service {
    async add(params) {
        const { ctx, app } = this
        try {
            const result = await app.mysql.insert('inventory', params)
            return result
        } catch (error) {
            console.error(error)
            return null
        }
    }
    async delete(id, user_id) {
        const { ctx, app } = this
        try {
            const result = await app.mysql.delete('inventory', {
                id,
                user_id,
            })
            return result
        } catch (error) {
            console.error(error)
            return null
        }
    }
    async getAllInventory(user_id) {
        const { ctx, app } = this
        try {
            const QUERY_STR = '*';
            let sql = `select ${QUERY_STR} from inventory where user_id = ${user_id}`;
            const result = await app.mysql.query(sql);
            return result;
        } catch {
            return null
        }
    }
}

module.exports = InventoryService