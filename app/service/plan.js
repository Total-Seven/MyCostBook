/**
     * 计划接口
     */

'use strict'

const Service = require('egg').Service

class PlanService extends Service {
    async add(params) {
        const { ctx, app } = this
        try {
            const result = await app.mysql.insert('plan', params)
            return result
        } catch (error) {
            console.error(error)
            return null
        }
    }
    async delete(id, user_id) {
        const { ctx, app } = this;
        try {
            let result = await app.mysql.delete('book', {
                id: id,
                user_id: user_id
            });
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    async update(params) {
        const { ctx, app } = this
        try {
            const result = app.mysql.update('book', { ...params }, { id: params.id, user_id: params.user_id })
            return result
        } catch (error) {
            console.log(error);
            return null
        }

    }
    async getAllbook(id) {
        const { ctx, app } = this
        const QUERY_STR = 'id, name,book_type';
        let sql = `select ${QUERY_STR} from book where user_id = ${id}`;
        try {
            const result = app.mysql.query(sql)
            return result
        } catch (error) {
            console.log(error);
            return null
        }

    }

}

module.exports = PlanService