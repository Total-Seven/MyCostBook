module.exports = secret => {
    return async function jwtErr(ctx, next) {
        const token = ctx.request.header.authorization

        if (token != 'null' && token) {
            try {
                let decode = ctx.app.jwt.verify(token, secret)
                await next()
            } catch (error) {
                console.error(error)
                ctx.status = 200
                ctx.body = {
                    msg: 'token已过期,请重新登录',
                    code: 401,
                }
                return
            }
        }
        else {
            ctx.status = 200
            ctx.body = {
                code: 401,
                token: token || 'Fuck',
                msg: 'token不存在'
            }
            return
        }
    }
}