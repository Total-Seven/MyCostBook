/**
     * 账单接口
     */

'use strict'

const Service = require('egg').Service

class BillService extends Service {
    async add(params) {
        const { ctx, app } = this
        try {
            const result = await app.mysql.insert('bill', params)
            return result
        } catch (error) {
            console.error(error)
            return null
        }
    }
    // async list(id) {
    //     const { ctx, app } = this
    //     const QUERY_STR = 'id, pay_type, amount, date, type_id,type_name,remark'
    //     let sql = `select ${QUERY_STR} from bill where user_id=${id}`
    //     try {
    //         const result = await app.mysql.query(sql);
    //         return result;
    //     } catch (error) {
    //         console.log(error)
    //         return null
    //     }
    // }
    async list(id, book_id) {
        const { ctx, app } = this;
        const QUERY_STR = 'id , pay_type, amount, date, category_id, category_name, remark';
        let sql = ' '
        if (id) sql = `select ${QUERY_STR} from bill where user_id = ${id} and book_id=${book_id}`;
        else sql = `select ${QUERY_STR} from bill where book_id=${book_id}`;
        try {
            const result = await app.mysql.query(sql);
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    async select_list(id) {
        const { ctx, app } = this
        const QUERY_STR = 'date'
        let sql = `select ${QUERY_STR} from bill where user_id=${id}`
        try {
            const result = await app.mysql.query(sql);
            return result;
        } catch (error) {
            console.log(error)
            return null
        }
    }
    async detail(id,) {
        const { app, ctx } = this
        try {
            const result = await app.mysql.get('bill', { id })
            return result
        } catch (error) {
            console.log(error)
            return null
        }
    }
    async update(params) {
        const { ctx, app } = this;
        try {
            let result = await app.mysql.update(
                'bill',
                { ...params },
                { id: params.id, user_id: params.user_id });
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    async delete(id, user_id) {
        const { ctx, app } = this;
        //
        // 想修改自增顺序
        // 
        // const max_id = 122
        // const QUERY_STR = 'bill'
        // let sql = `ALTER TABLE ${QUERY_STR} AUTO_INCREMENT = ${max_id}`
        try {
            let result = await app.mysql.delete('bill', {
                id: id,
                user_id: user_id
            });
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    async getNow() {
        const { ctx, app } = this;
        try {
            let result = await this.app.mysql.insert(table, {
                create_time: this.app.mysql.literals.now,
            });
            return result;
        } catch (error) {
            console.log(error);
            return null
        }
    }
}

module.exports = BillService