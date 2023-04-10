const defaultRoom = "default_room";

module.exports = () => {
    return async (ctx, next) => {
        const { app, socket } = ctx;
        const nsp = app.io.of('/');

        const { id, handshake } = socket;
        const { room, bookId, userId } = handshake.query
        // 加入房间 global or bookId
        const _room = room == 'global' ? 'global' : `${bookId}`
        socket.join(_room);
        // nsp.sockets[id].emit('res', `Hi! You've been entered the ${room} room `);
        // 通过
        socket.emit('middle-auth', `Welcome  You've been entered the ${_room} room `);
        // 给对应房间的每个人发送消息
        if (_room == 'global') {
            nsp.to(_room).emit('online', `有个傻瓜🤓上线了,扁他!`);
        }
        else {
            nsp.to(_room).emit('online', `有个帅哥:${userId}进入房间了,扁他!`);
        }

        await next();  // 放行
    }
};