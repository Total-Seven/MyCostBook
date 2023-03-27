const defaultRoom = "default_room";

module.exports = () => {
    return async (ctx, next) => {
        const { app, socket } = ctx;

        const id = socket.id;
        const query = ctx.socket.handshake.query
        const { room, userId } = query
        const nsp = app.io.of('/');
        // console.log('auth', `room:${query}`, `userId:${query}`);

        if (room !== 'demo') {
            // nsp.adapter.remoteDisconnect(id, true, (err) => {
            //     console.log(err);
            // });

            // socket.emit(id, '你被踢了');
            // ctx.socket.disconnect();

            // console.log('#tick:', nsp.adapter.remoteDisconnect);
        }

        /**t
         * 鉴权
         * 1. 登录页 or 记账页 
         * 
         * 登录页：
         * ** 消息队列中有user_id
         * 
         * 记账页：
         * ** 同一账本的用户们分类
         */
        socket.join(defaultRoom);  // 加入房间

        socket.emit('middle-res', `auth success,you have been join in ${defaultRoom}`);  // 通过


        await next();  // 放行

        // console.log('断开连接');
    }
};