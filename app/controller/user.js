'use strict'

// 默认头像 
const defaultAvatar = 'https://tse4-mm.cn.bing.net/th/id/OIP-C.MC8Z714Z8RHfT8Qadpps3gHaHa'
const inconFaultAvatar = 'https://s2.loli.net/2023/02/10/cZkBewG65J3SjHr.png'

const dayjs = require('dayjs')
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

function generative_initial_categories(user_id) {
    return [
        // 1
        {
            name: '三餐',
            type_id: 1,
            user_id: user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '柴米油盐',
            type_id: 1,
            user_id: user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '食材',
            type_id: 1,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '零食',
            type_id: 1,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '奶茶',
            type_id: 1,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '咖啡',
            type_id: 1,
            user_id,
            avatar: '',
            caution: 0,
        },
        // 2
        {
            name: '衣服',
            type_id: 2,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '鞋子',
            type_id: 2,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '帽子',
            type_id: 2,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '裤子',
            type_id: 2,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '配饰',
            type_id: 2,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '其他',
            type_id: 2,
            user_id,
            avatar: '',
            caution: 0,
        },
        // 3
        {
            name: '地铁',
            type_id: 3,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '地铁',
            type_id: 3,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '公交',
            type_id: 3,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '打车',
            type_id: 3,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '火车',
            type_id: 3,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '共享单车',
            type_id: 3,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '汽车',
            type_id: 3,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '加油',
            type_id: 3,
            user_id,
            avatar: '',
            caution: 0,
        },
        // 4
        {
            name: '快递',
            type_id: 4,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '理发',
            type_id: 4,
            user_id,
            avatar: '',
            caution: 0,
        },
        // 5
        {
            name: '日常',
            type_id: 5,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '鞋服',
            type_id: 5,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '数码',
            type_id: 5,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '包包',
            type_id: 5,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '厨房用品',
            type_id: 5,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '电器',
            type_id: 5,
            user_id,
            avatar: '',
            caution: 0,
        },
        // 6
        {
            name: '药',
            type_id: 6,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '治疗',
            type_id: 6,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '就诊',
            type_id: 6,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '住院',
            type_id: 6,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '保健',
            type_id: 6,
            user_id,
            avatar: '',
            caution: 0,
        },
        // 7
        {
            name: '理发',
            type_id: 7,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '网课',
            type_id: 7,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '书籍',
            type_id: 7,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '培训',
            type_id: 7,
            user_id,
            avatar: '',
            caution: 0,
        },
        // 8
        {
            name: '门票',
            type_id: 8,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '酒店',
            type_id: 8,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '团费',
            type_id: 8,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '伴手礼',
            type_id: 8,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '团费',
            type_id: 8,
            user_id,
            avatar: '',
            caution: 0,
        },
        // 9
        {
            name: '送礼',
            type_id: 9,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '发红包',
            type_id: 9,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '孝心',
            type_id: 9,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '请客',
            type_id: 9,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '亲密付',
            type_id: 9,
            user_id,
            avatar: '',
            caution: 0,
        },
        // 10
        {
            name: '其他',
            type_id: 10,
            user_id,
            avatar: '',
            caution: 0,
        },
        // 11
        {
            name: '工资(月)',
            type_id: 11,
            user_id,
            avatar: '',
            caution: 0,
        },
        // 12
        {
            name: '奖金',
            type_id: 12,
            user_id,
            avatar: '',
            caution: 0,
        },
        // 13
        {
            name: '转账',
            type_id: 13,
            user_id,
            avatar: '',
            caution: 0,
        },
        // 14
        {
            name: '基金',
            type_id: 14,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '股票',
            type_id: 14,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '期权',
            type_id: 14,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '债卷',
            type_id: 14,
            user_id,
            avatar: '',
            caution: 0,
        },
        // 15
        {
            name: '退款',
            type_id: 15,
            user_id,
            avatar: '',
            caution: 0,
        },
        // 16
        {
            name: '红包',
            type_id: 16,
            user_id,
            avatar: '',
            caution: 0,
        },
        // 17
        {
            name: '房租',
            type_id: 17,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '物业水电',
            type_id: 17,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '维修',
            type_id: 17,
            user_id,
            avatar: '',
            caution: 0,
        },
        // 18
        {
            name: '电影',
            type_id: 18,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '约会',
            type_id: 18,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '游戏',
            type_id: 18,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '演唱会',
            type_id: 18,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '健身',
            type_id: 18,
            user_id,
            avatar: '',
            caution: 0,
        },
        // 19
        {
            name: '化妆品',
            type_id: 19,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '护肤品',
            type_id: 19,
            user_id,
            avatar: '',
            caution: 0,
        },
        // 20
        {
            name: '视频VIP',
            type_id: 6,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '书籍VIP',
            type_id: 6,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '购物VIP',
            type_id: 6,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '社交VIP',
            type_id: 6,
            user_id,
            avatar: '',
            caution: 0,
        },
        // 21
        {
            name: '话费',
            type_id: 6,
            user_id,
            avatar: '',
            caution: 0,
        },
        {
            name: '宽带',
            type_id: 6,
            user_id,
            avatar: '',
            caution: 0,
        },
    ]
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
                /**
                * 创建：Not Accounted For，
                */
                const account = await ctx.service.account.add({
                    name: 'Not Accounted For',
                    pay_type: 2,
                    user_id: result.insertId,
                    amount: 0,
                })
                // ② 修改默认账本ID
                const newUser = await ctx.service.user.editUserInfo({
                    id: result.insertId,
                    default_book_id: book.insertId,
                    default_account_id: account.insertId,
                    last_login: dayjs().format('YYYY-MM-DD HH:mm:ss')
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
                 * 创建：默认类别
                 */
                const list_categories = generative_initial_categories(result.insertId)
                const categories = await app.mysql.insert('category', list_categories)
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
                                categories: categories.insertId || null,
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
        // 修改last_login
        await ctx.service.user.editUserInfo({
            ...userInfo,
            last_login: dayjs().format('YYYY-MM-DD HH:mm:ss')
        })
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
        //
        // account_list
        // const ql_ac1 = `select * from account where pay_type=1 and user_id=${userInfo.id}`
        // const ql_ac2 = `select * from account where pay_type=2 and user_id=${userInfo.id}`
        // const ac1 = await app.mysql.query(ql_ac1)
        // const ac2 = await app.mysql.query(ql_ac2)
        // category_list     拿type  过虑id==type&&type_id==1 
        const all_cg_ql = `select * from category where user_id=${userInfo.id}`
        const all_cg = await app.mysql.query(all_cg_ql)
        let expense_cg = []
        let income_cg = []
        all_cg.forEach(async (item) => {
            const cg_type = await app.mysql.query(`select type from type where id=${item.type_id}`)
            if (cg_type[0].type == 1) expense_cg.push(item)
            else if (cg_type[0].type == 2) income_cg.push(item)
        })
        // 
        const ql = `select * from account where user_id=${userInfo.id}`
        const account = await app.mysql.query(ql)
        const books = await ctx.service.book.getAllbook(userInfo.id)
        // 
        const plan = await app.mysql.query(`select * from plan where user_id=${userInfo.id}`)
        if (books) {
            let assets = 0
            let debt = 0
            const net = account.reduce((pre, cur) => {
                cur.amount > 0 ? assets += cur.amount : debt -= cur.amount
                return pre += cur.amount
            }, 0)
            // 
            const Saved_Money = plan.reduce((pre, cur) => {
                return pre += cur.saved_money
            }, 0)
            ctx.body = {
                code: 200,
                msg: '登录成功',
                data: {
                    plan,
                    Saved_Money,
                    all_cg,
                    category_list: [expense_cg, income_cg],
                    token,
                    userInfo,
                    books,
                    accounts: account,
                    // account_list: [ac1, ac2],
                    net,
                    assets,
                    debt,
                }
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
    // async getUserInfo() {
    //     const { ctx, app } = this
    //     const token = ctx.request.header.authorization
    //     const decode = app.jwt.verify(token, app.config.jwt.secret)
    //     if (!decode) return
    //     try { // 查找数据库
    //         const userInfo = await ctx.service.user.getUserByName(decode.username)
    //         const books = await ctx.service.book.getAllbook(userInfo.id)
    //         const categories = await ctx.service.category.getAllCategory(userInfo.id)
    //         const Expend = await ctx.service.category.getAlltype(1)
    //         const Income = await ctx.service.category.getAlltype(2)
    //         const inventory = await ctx.service.inventory.getAllInventory(userInfo.id)
    //         const account = await ctx.service.account.getAllAccount(userInfo.id)
    //         const plan = await app.mysql.query(`select * from plan where user_id=${userInfo.id}`)
    //         const typess = { Expend, Income }
    //         // 转化数据 => types
    //         let obj = {}
    //         for (const key in typess) {
    //             typess[key].forEach(item => {
    //                 categories.forEach(category => {
    //                     if (category.type_id == item.id) {
    //                         if (item.list == undefined) {
    //                             item.list = []
    //                             item.list.push(category)
    //                         }
    //                         else {
    //                             item.list.push(category)
    //                         }
    //                     }
    //                 })
    //             })
    //         }
    //         // 计算SavedMoney
    //         const Saved_Money = plan.reduce((pre, cur) => {
    //             return pre += cur.saved_money
    //         }, 0)
    //         //
    //         let assets = 0
    //         let debt = 0
    //         const net = account.reduce((pre, cur) => {
    //             cur.amount > 0 ? assets += cur.amount : debt -= cur.amount
    //             return pre += cur.amount
    //         }, 0)
    //         // 返回数据库中的信息
    //         ctx.body = {
    //             code: 200,
    //             msg: 'getUserInfo成功',
    //             data: {
    //                 plan,
    //                 net,
    //                 Saved_Money,
    //                 userInfo,
    //                 typess,
    //                 // id: userInfo.id,
    //                 // username: userInfo.username,
    //                 // signature: userInfo.signature || '',
    //                 // // 👇 初始化写法
    //                 // avatar: userInfo.avatar || defaultAvatar,
    //                 // default_book_id: userInfo.default_book_id,
    //                 books,
    //                 // typess: obj,
    //                 categories,
    //                 inventory,
    //                 account,
    //                 inconFaultAvatar,
    //             }
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         ctx.body = {
    //             code: 500,
    //             msg: '系统错误',
    //             data: null
    //         }
    //     }

    // }
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
            const plan = await app.mysql.query(`select * from plan where user_id=${userInfo.id}`)
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
            for (let index = 0; index < categories.length; index++) {
                // 查每个category对应的金额
                // 根据类别，写入expend or income 
                const allBill = await app.mysql.query(`select amount from bill where category_id=${categories[index].id}`)
                const totalamount = allBill.reduce((pre, cur) => {
                    return pre + cur.amount
                }, 0)
                categories[index].amount = totalamount
            }
            // 计算SavedMoney
            const Saved_Money = plan.reduce((pre, cur) => {
                return pre += cur.saved_money
            }, 0)
            // 
            let assets = 0
            let debt = 0
            const net = account.reduce((pre, cur) => {
                cur.amount > 0 ? assets += cur.amount : debt -= cur.amount
                return pre += cur.amount
            }, 0)
            // 返回数据库中的信息
            ctx.body = {
                code: 200,
                msg: 'getUserInfo成功',
                data: {
                    plan,
                    net,
                    Saved_Money,
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
        const { new_username } = ctx.request.body
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
                username: new_username,
            })
            if (result) {
                ctx.body = {
                    code: 200,
                    msg: '请求修改签名成功',
                    data: {
                        id: user_id,
                        // defaultBookID: default_book_id,
                        // signature,
                        // oldSignature: userInfo.signature,
                        new_username,
                        // avatar,
                        // ctime: userInfo.ctime,
                        // result: result
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