/**
     * 二级分类接口
     */

'use strict'

const Service = require('egg').Service

class CategoryService extends Service {
    async add(params) {
        const { ctx, app } = this
        try {
            const result = await app.mysql.insert('category', params)
            return result
        } catch (error) {
            console.error(error)
            return null
        }
    }
    async delete(id, user_id) {
        const { ctx, app } = this;
        try {
            let result = await app.mysql.delete('category', {
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
            const result = app.mysql.update('category', { ...params }, { id: params.id, user_id: params.user_id })
            return result
        } catch (error) {
            console.log(error);
            return null
        }

    }
    async getAllCategory(id) {
        const { ctx, app } = this
        const QUERY_STR = 'id,name,type_id,user_id,avatar';
        let sql = `select ${QUERY_STR} from category where user_id = ${id}`;
        try {
            const result = app.mysql.query(sql)
            return result
        } catch (error) {
            console.log(error);
            return null
        }

    }
    async getAlltype() {
        const { ctx, app } = this
        const QUERY_STR = '*';
        let sql = `select ${QUERY_STR} from type`;
        try {
            const result = app.mysql.query(sql)
            return result
        } catch (error) {
            console.log(error);
            return null
        }

    }
}

module.exports = CategoryService