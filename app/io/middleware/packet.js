module.exports = app => {
    return async (ctx, next) => {
        ctx.socket.emit('res', `中间件packet收到数据,中间件packet收到数据,over`);
        console.log('packet:', ctx.packet);
        // packet: [
        //     'message',
        //     {
        //         msgContent: '你好!Mon Mar 27 2023 09:51:53 GMT+0800 (China Standard Time)'
        //     }
        // ]
        await next();
    };
};