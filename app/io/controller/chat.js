'use strict';

const Controller = require('egg').Controller;
const room = 'book';

class ChatController extends Controller {
    async index() {
        const { app, socket, logger, helper } = this.ctx;
        const id = socket.id;
        const nsp = app.io.of('/');
        const message = this.ctx.args[0] || {};
        console.log('#chat.js : ', this.ctx.args);

        // 根据id给指定连接发送消息
        nsp.sockets[id].emit('res', "hello ....");
        // 指定房间连接信息列表
        nsp.adapter.clients([room], (err, clients) => {
            // console.table(JSON.stringify(clients));
        });
        //  给指定房间的每个人发送消息
        nsp.to(room).emit('online', this.ctx.socket.id + "上线了");
        // 测试
        const bookList = await app.mysql.query(`select * from book where user_id=2`)
        const resData = {
            // bookList,
            room: room,
            user: socket.id,
            message,
        }
        // nsp.to(room).emit('res', resData);
        // 断开连接
        // this.ctx.socket.disconnect();
    }
}
module.exports = ChatController;