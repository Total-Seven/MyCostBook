'use strict'

// 默认头像 
const defaultAvatar = 'https://tse4-mm.cn.bing.net/th/id/OIP-C.MC8Z714Z8RHfT8Qadpps3gHaHa'
const inconFaultAvatar = 'https://s2.loli.net/2023/02/10/cZkBewG65J3SjHr.png'

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
        const { ctx, app } = this
        // 获取用户输入的 用户名 和 密码 以及 默认账本名
        const { username, password, bookname = '默认账本' } = ctx.request.body;
        // 判断 输入是否为空
        if (!username || !password || !bookname) {
            ctx.body = {
                code: 500,
                msg: '参数不能为空哦',
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
        try {
            const result = await ctx.service.user.register({
                username,
                password,
                signature: '$$$$',
                avatar: defaultAvatar,
                ctime: getNowTime(),
                default_book_id: 0,
                budget: 0,
                current_budget: 0,
                // 创建默认账本，
                // 跟着一起注册
                // 再返回给前端
            })
            // 如果注册成功，自动登入并修改用户的默认账本ID
            if (result) {
                // ① 创建默认账本，购物清单账本
                // 
                const default_book = {
                    name: bookname || '默认账本',
                    book_type: 0,
                    user_id: result.insertId,
                    date: this.app.mysql.literals.now,
                }
                const inventory_book = {
                    name: '购物清单',
                    book_type: 10,
                    user_id: result.insertId,
                    date: this.app.mysql.literals.now,
                }
                const rows = [default_book, inventory_book]
                // 自动添加账本
                const book = await ctx.service.book.add(rows)
                // ② 修改默认账本ID
                const newUser = await ctx.service.user.editUserInfo({
                    id: result.insertId,
                    default_book_id: book.insertId
                })
                /**
                 * 创建：购物清单类别，
                 */
                const category = await ctx.service.category.add({
                    name: '购物清单',
                    type_id: 5,
                    user_id: result.insertId,
                    avatar: inconFaultAvatar,
                    caution: 0,
                })
                /**
                * 创建：Not Accounted For，
                */
                const account = await ctx.service.account.add({
                    name: 'Not Accounted For',
                    pay_type: 2,
                    user_id: result.insertId,
                    amount: 0,
                })
                // 自动登入
                // 生成token
                //  app.jwt.sign 两个参数: 第一个是对象，第二个是加密字符
                const token = app.jwt.sign({
                    id: result.insertId,
                    username: username,
                    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
                }, app.config.jwt.secret)
                if (token) {
                    const userInfo = await ctx.service.user.getUserByName(username)
                    ctx.body = {
                        code: 200,
                        msg: '注册成功',
                        data: {
                            token,
                            userInfo: {
                                ...userInfo,
                                default_book_name: bookname,
                                inventory_book_id: book.insertId + 1,
                                inventory_category_id: category.insertId,
                                account_id: account.insertId,
                            },
                        }
                    }
                }
                else {
                    ctx.body = {
                        code: 500,
                        msg: '自动登入失败',
                        data: null
                    }
                }

            }
            else {
                ctx.body = {
                    code: 500,
                    msg: '注册失败',
                    data: null
                }
            }
        } catch (error) {
            ctx.body = {
                code: 500,
                msg: '系错',
                data: '系统错误'
            }
            throw new Error('系统错误')
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
                msg: '登录失败,账号不存在',
                data: null
            }
            return
        }
        // 找到用户 ，
        if (userInfo && password != userInfo.password) {
            ctx.body = {
                code: 500,
                msg: '登录失败，密码有误',
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
                token,
                userInfo,
            }
        }
    }
    async test() {
        const { ctx, app } = this
        const token = ctx.request.header.authorization
        const decode = await app.jwt.verify(token, app.config.jwt.secret)
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
    async getUserInfo() {
        const { ctx, app } = this
        const token = ctx.request.header.authorization
        const decode = app.jwt.verify(token, app.config.jwt.secret)
        if (!decode) return
        try { // 查找数据库
            const userInfo = await ctx.service.user.getUserByName(decode.username)
            const books = await ctx.service.book.getAllbook(userInfo.id)
            const categories = await ctx.service.category.getAllCategory(userInfo.id)
            const Expend = await ctx.service.category.getAlltype(1)
            const Income = await ctx.service.category.getAlltype(2)
            const inventory = await ctx.service.inventory.getAllInventory(userInfo.id)
            const account = await ctx.service.account.getAllAccount(userInfo.id)
            const typess = { Expend, Income }

            // 转化数据 => types 
            let obj = {}
            for (const key in typess) {
                typess[key].forEach(item => {
                    categories.forEach(category => {
                        if (category.type_id == item.id) {
                            if (item.list == undefined) {
                                item.list = []
                                item.list.push(category)
                            }
                            else {
                                item.list.push(category)
                            }
                        }
                    })
                })
            }
            // 返回数据库中的信息
            ctx.body = {
                code: 200,
                msg: 'getUserInfo成功',
                data: {
                    userInfo,
                    typess,
                    // id: userInfo.id,
                    // username: userInfo.username,
                    // signature: userInfo.signature || '',
                    // // 👇 初始化写法
                    // avatar: userInfo.avatar || defaultAvatar,
                    // default_book_id: userInfo.default_book_id,
                    books,
                    // typess: obj,
                    categories,
                    inventory,
                    account,
                    inconFaultAvatar,
                }
            }
        } catch (error) {
            console.log(error);
            ctx.body = {
                code: 500,
                msg: '系统错误',
                data: null
            }
        }

    }
    async editUserInfo() {
        const { ctx, app } = this
        const { default_book_id, signature = ' ', avatar = defaultAvatar } = ctx.request.body
        try {
            let user_id
            const token = ctx.request.header.authorization
            const decode = await app.jwt.verify(token, app.config.jwt.secret)
            if (!decode) return

            user_id = decode.id
            // 通过username 查找数据库
            const userInfo = await ctx.service.user.getUserByName(decode.username)
            // 修改signature
            const result = await ctx.service.user.editUserInfo({
                ...userInfo,
                default_book_id,
                signature,
                avatar
            })
            if (result) {
                ctx.body = {
                    code: 200,
                    msg: '请求修改签名成功',
                    data: {
                        id: user_id,
                        defaultBookID: default_book_id,
                        signature,
                        oldSignature: userInfo.signature,
                        username: userInfo.username,
                        avatar,
                        ctime: userInfo.ctime,
                        result: result
                    }
                }
            }

        } catch (error) {
            console.error(error)
        }
    }
    /** 
     * 账单接口 （CRUD、复杂数据的处理、egg-mysql）
    */
    // 1.帐单列表
    // 2.添加账单
    // 3.修改账单
    // 4.删除账单
    // 5.账单详情
}

module.exports = UserController