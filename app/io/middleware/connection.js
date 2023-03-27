
module.exports = app => {
    return async (ctx, next) => {
        // if (true) {
        //     ctx.socket.disconnect()
        //     return
        // }
        ctx.socket.emit('res', '这里是连接中间件,这里是连接中间件,你已经连接成功,真棒！ over!');
        await next();
        // execute when disconnect.
        console.log('disconnection!');
    };
};