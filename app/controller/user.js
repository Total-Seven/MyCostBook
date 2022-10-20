'use strict'

// 默认头像 
const defaultAvatar = 'https://tse4-mm.cn.bing.net/th/id/OIP-C.MC8Z714Z8RHfT8Qadpps3gHaHa'
var myDate = new Date();	//创建Date对象
function getNowTime() {
    let nowDate = ''
    var Y = myDate.getFullYear();   //获取当前完整年份
    var M = myDate.getMonth() + 1;  //获取当前月份
    var D = myDate.getDate();   //获取当前日1-31
    var H = myDate.getHours();  //获取当前小时
    var i = myDate.getMinutes();    //获取当前分钟
    var s = myDate.getSeconds();    //获取当前秒数
    // 月份不足10补0
    if (M < 10) {
        M = '0' + M;
    }
    // 日不足10补0
    if (D < 10) {
        D = '0' + D;
    }
    // 小时不足10补0
    if (H < 10) {
        H = '0' + H;
    }
    // 分钟不足10补0
    if (i < 10) {
        i = '0' + i;
    }
    // 秒数不足10补0
    if (s < 10) {
        s = '0' + s;
    }
    // 拼接日期分隔符根据自己的需要来修改
    return nowDate = Y + '-' + M + '-' + D + ' ' + H + ':' + i + ':' + s;
}

const Controller = require('egg').Controller

class UserController extends Controller {
    async register() {
        const { ctx } = this
        // 获取用户输入的 用户名 和 密码
        const { username, password } = ctx.request.body;
        // 判断 输入是否为空
        if (!username || !password) {
            ctx.body = {
                code: 500,
                msg: '用户名和密码不能为空哦',
                data: null
            }
            return
        }
        // 验证用户名是否已存在
        const userInfo = await ctx.service.user.getUserByName(username)
        // 判断
        if (userInfo && userInfo.id) {
            ctx.body = {
                code: 500,
                msg: '账号已被注册，请重新输入',
                DATA: null
            }
            return
        }
        // 将数据存入数据库 成功返回200 失败返回500
        const result = await ctx.service.user.register({
            username,
            password,
            signature: '$$$$',
            avatar: defaultAvatar,
            ctime: getNowTime()
        })
        if (result) {
            ctx.body = {
                code: 200,
                msg: '注册成功',
                data: null
            }
        }
        else {
            ctx.body = {
                code: 500,
                msg: '注册失败',
                data: null
            }
        }
    }
    async login() {
        const { ctx, app } = this
        const { username, password } = ctx.request.body
        // 根据用户名，查找数据库
        const userInfo = await ctx.service.user.getUserByName(username)
        if (!userInfo || !userInfo.id) {
            ctx.body = {
                code: 500,
                msg: '登录失败',
                data: null
            }
            return
        }
        // 找到用户 ，
        if (userInfo && password != userInfo.password) {
            ctx.body = {
                code: 500,
                msg: '账号密码错误',
                data: null
            }
            return
        }
        //
        // 生成token
        //  app.jwt.sign 两个参数: 第一个是对象，第二个是加密字符
        const token = app.jwt.sign({
            id: userInfo.id,
            username: userInfo.username,
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
        }, app.config.jwt.secret)
        ctx.body = {
            code: 200,
            msg: '登录成功',
            data: {
                token
            }
        }
    }
    async test() {
        console.log('*********************************');
        console.log('*********************************');
        console.log('*********************************');

        const { ctx, app } = this
        const token = ctx.request.header.authorization
        const decode = await app.jwt.verify(token, app.config.jwt.secret)
        // if (decode) {
        console.log(decode);
        console.log('*********************************');
        console.log('*********************************');
        if (decode) {
            ctx.body = {
                code: 200,
                msg: '获取成功',
                data: {
                    ...decode
                }
            }
        } else {
            ctx.body = {
                code: 500,
                msg: '获取失败',
                data: null
            }
        }

        // }


    }
}

module.exports = UserController