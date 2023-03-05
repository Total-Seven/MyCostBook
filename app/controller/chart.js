/** 
     * 统计接口 （CRUD、复杂数据的处理、egg-mysql）
    */
// 1.全账本的统计（月）：
// 支出：
// 数目、金额(总，0-30天的)、各个账本的比例、用户类别中消费最高的Top10.

// 收入：
// 转账：

// 2.单账本的统计（月）：
// 支出：
// 总金额、总数目、用户类别中消费最高和次数最多的。

// 3.全账本的统计（年）：
// 支出：
// 各个月的总金额、各个月每个账本的消费金额、消费最高的账本Top5，用户类别中消费最高的Top10.

// 收入：
// 转账：
'use strict'
const moment = require('moment')


const jwtErr = require('../middleware/jwtErr')
const inconFaultAvatar = 'https://s2.loli.net/2023/02/10/cZkBewG65J3SjHr.png'

const Controller = require('egg').Controller

/** 小数转百分比 */
function toPercent(point) {
    var str = Number(point * 100).toFixed(1);
    str += "%";
    return str;
}
/* 保留两位小数 */
function keepTwoDecimalStr(num) {
    const result = Number(num.toString().match(/^\d+(?:\.\d{0,2})?/));
    let s = result.toString();
    let rs = s.indexOf('.');
    if (rs < 0) {
        rs = s.length;
        s += '.';
    }
    while (s.length <= rs + 2) {
        s += '0';
    }
    return Number(s);
};
/**获取总金额 */
function getTotalAmount(array) {
    return keepTwoDecimalStr(array.reduce((pre, cur) => {
        return pre += cur.amount
    }, 0))
}
/** 过滤账本数据 */
function filter_book_array(array, bookName) {
    return array.filter(item => {
        return item.book_name == bookName
    })
}
/** 过滤时间 */
function determineIndex_inWeek(day) {
    for (let index = 0; index < 4; index++) {
        if (myisBetween('week', index, day)) return index
    }
    return null
}
function filter_array(array, day, mode) {
    return array.filter(item => {
        if (mode == 'day') {
            return moment(Number(item.date)).format('MM-DD') == day
        }
        if (mode == 'year') {
            return moment(Number(item.date)).format('YYYY') == day
        }
        if (mode == 'month') {
            return moment(Number(item.date)).format('YYYY-MM') == day
        }
        if (mode == 'week') {
            return determineIndex_inWeek(moment(Number(item.date)).format('YYYY-MM-DD')) == day
        }
    })
}
function map_index_week(index) {
    if (index == 0) return `${beforeDay_Start('week', 0).format('MM-DD')} ~ ${CST(dayjs()).format('MM-DD')}`
    else if (index == 1) return `${beforeDay_Start('week', 1).format('MM-DD')} ~ ${beforeDay_Start('week', 0).format('MM-DD')}`
    else if (index == 2) return `${beforeDay_Start('week', 2).format('MM-DD')} ~ ${beforeDay_Start('week', 1).format('MM-DD')}`
    else if (index == 3) return `${beforeDay_Start('week', 3).format('MM-DD')} ~ ${beforeDay_Start('week', 2).format('MM-DD')}`
    else return null
}
/** 解决dayjs自带的format会改变时间 */
function CST_Format(mode, date) {
    if (mode == 'day') return date.subtract(8, 'hour').format('MM-DD')
    if (mode == 'month') return date.subtract(8, 'hour').format('YYYY-MM')

}
/** 鉴权 */
function getToken(authorization, app) {
    const token = authorization
    const decode = app.jwt.verify(token, app.config.jwt.secret);
    if (!decode) return false
    else return decode
}
/** dayjs */
const dayjs = require('dayjs')
var isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween)
/** 中国标准时间 东八区 CST UTF +8 */
function CST(time) {
    return dayjs(time).add(8, 'hour')
}
function beforeDay_Start(mode, n) {
    // month?week?day?
    if (mode === 'day') return CST(dayjs().startOf('date').subtract(n, 'day'))
    if (mode === 'week') return CST(dayjs().startOf('week').subtract(n, 'week')).add(1, 'day')
    if (mode === 'month') return CST(dayjs().startOf('date').subtract(n, 'month'))
}
function myisBetween(mode, number, day) {
    if (mode == 'month') return dayjs(day).isBetween(beforeDay_Start('month', number), CST(dayjs()), 'day', '[]')
    if (mode == 'day') return dayjs(day).isBetween(beforeDay_Start('day', 7), CST(dayjs()), 'day', '[]')
    if (mode == 'week') return dayjs(day).isBetween(beforeDay_Start('week', number), CST(dayjs()), 'day', '[]')
}
function isFind(arr, what) {
    return arr.some(item => item[0] == what)
}
function isExist(pie_obj, top_obj, key, billLedger) {
    if (pie_obj[key] == undefined) {
        pie_obj[key] = []
        top_obj[key] = []
        return false
    }
    else if (pie_obj[key].some(iten => iten[0] == billLedger)) return true
    else { return false }
}

class ChartController extends Controller {
    // 
    async get_Exp_data() {

        // 
        const { app, ctx } = this
        // 鉴权
        const decode = getToken(ctx.request.header.authorization, app)
        if (!decode) return
        let user_id = decode.id
        // 查询
        const QUERY_STR = 'id,amount,book_id,book_name,date';
        /**
         *  Exp、Inc、Trf
         */
        let sql = `select ${QUERY_STR} from bill where user_id = ${user_id} and pay_type=1 `;  //Exp
        const list = await app.mysql.query(sql);
        if (list) {
            /**
             * 
             */
            function handle(mode, obj, formatKey, week_index) {
                obj.time.push(formatKey)
                // 
                let modeArr = []
                if (mode == 'week') { modeArr = filter_array(list, week_index, mode) }
                else { modeArr = filter_array(list, formatKey, mode) }
                // 
                obj.line_array.push([formatKey, (getTotalAmount(modeArr))])
                // 
                modeArr.forEach(item => {
                    // 账本
                    const billLedger = item.book_name
                    // 
                    const isexist = isExist(obj.pie_obj, obj.top_obj, formatKey, billLedger)
                    // 账本
                    if (!isexist) {
                        const cur__arr = filter_book_array(modeArr, billLedger)
                        // 
                        obj.pie_obj[formatKey].push([billLedger, getTotalAmount(cur__arr)])
                        // 
                        obj.top_obj[formatKey].push({
                            billLedger,
                            amount: getTotalAmount(cur__arr),
                            percentage: toPercent(getTotalAmount(cur__arr) / getTotalAmount(modeArr)),
                            number: cur__arr.length,
                            avatar: inconFaultAvatar
                        })
                    }
                })
            }
            // 
            class data {
                constructor(time, line_array, pie_obj, top_obj) {
                    this.time = time;
                    this.line_array = line_array;
                    this.pie_obj = pie_obj;
                    this.top_obj = top_obj;
                }
            }
            const year = new data([], [], {}, {})
            const month = new data([], [], {}, {})
            const week = new data([], [], {}, {})
            const day = new data([], [], {}, {})
            // 
            list.forEach(bill => {
                /**
                 * 时间
                 */
                const billYear = moment(Number(bill.date)).format('YYYY')  //年
                const billDay = CST(bill.date)                             //月、日
                /**
                 * falg
                 */
                const year_flag = year.line_array.some(item => item[0] == billYear)         //年
                // 
                const Month_flag = myisBetween('month', 3, billDay)                         //月
                const formater_month = CST_Format('month', billDay)                         //月
                const _Month_flag = isFind(month.line_array, formater_month)                //月
                // 
                const Day_flag = myisBetween('day', 7, billDay)                             //日
                const formater_date = CST_Format('day', billDay)                            //日
                const _Day_flag = isFind(day.line_array, formater_date)                     //日
                // 
                const week_flag = myisBetween('week', 4, billDay)                           //周
                const index = determineIndex_inWeek(billDay)                                //周
                const result = map_index_week(index)                                        //周
                const _week_flag = isFind(week.line_array, result)                          //周
                // 
                // 年
                if (!year_flag) {
                    handle('year', year, billYear)
                }
                // 月
                if (Month_flag && !_Month_flag) {
                    handle('month', month, formater_month)
                }
                // 日
                if (Day_flag && !_Day_flag) {
                    handle('day', day, formater_date)
                }
                // 周
                if (week_flag && !_week_flag && result) {
                    handle('week', week, result, index)
                }
            })
            /**
             * 排序的问题
             * 四个时间的对象 time需要升序 
             * 并且与pie_obj和top_obj的属性顺序也相同 与line_array的顺序也相同
             */
            year.line_array.sort((a, b) => a[0] - b[0])
            // 
            ctx.body = {
                code: 200,
                msg: '成功--get_Exp_data',
                data: {
                    year,
                    month,
                    day,
                    week,
                },
            }
        } else {
            ctx.body = {
                code: 500,
                msg: '失败--get_Exp_data',
                data: null
            }
        }
    }
    // async getYear_LinePieTop() {
    //     const { app, ctx } = this
    //     // 鉴权
    //     const decode = getToken(ctx.request.header.authorization, app)
    //     if (!decode) return
    //     let user_id = decode.id

    //     const QUERY_STR = 'id,amount,book_id,book_name,date';
    //     let sql = `select ${QUERY_STR} from bill where user_id = ${user_id} and pay_type=2 `;  //Exp
    //     const list = await app.mysql.query(sql);
    //     if (list) {
    //         // 
    //         const time = []
    //         const line_array = []
    //         const pie_obj = {}
    //         const top_obj = {}
    //         // 
    //         list.forEach(bill => {
    //             // 时间
    //             const billYear = moment(Number(bill.date)).format('YYYY')
    //             // flag
    //             const year_flag = line_array.some(item => item[0] == billYear)
    //             /**
    //              * 分别计算统计
    //              */
    //             // 时间
    //             if (!year_flag) {
    //                 time.push(billYear)
    //                 const cur_arr = filter_array(list, billYear, 'year')
    //                 line_array.push([billYear, getTotalAmount(cur_arr)])
    //                 // pie 在2023年的账单数组中，遍历每个元素 
    //                 // 判断 ledger_flag : pie_obj对象的[billYear]  去some 这个value 找 是否有item[0]==_billLedger
    //                 cur_arr.forEach(item => {
    //                     // 账本
    //                     const billLedger = item.book_name
    //                     // flag 
    //                     let _ledger_flag = false
    //                     if (pie_obj[billYear] == undefined) {
    //                         _ledger_flag = false
    //                         pie_obj[billYear] = []
    //                         // 
    //                         top_obj[billYear] = []
    //                     }
    //                     else if (pie_obj[billYear].some(iten => iten[0] == billLedger)) _ledger_flag = true
    //                     else { _ledger_flag = false }
    //                     /**
    //                      * 分别计算
    //                      */
    //                     // 账本
    //                     if (!_ledger_flag) {
    //                         const cur__arr = filter_book_array(cur_arr, billLedger)
    //                         pie_obj[billYear].push([billLedger, getTotalAmount(cur__arr)])
    //                         // pie_obj[billYear] = _pie_array
    //                         top_obj[billYear].push({
    //                             billLedger,
    //                             amount: getTotalAmount(cur__arr),
    //                             percentage: toPercent(getTotalAmount(cur__arr) / getTotalAmount(cur_arr)),
    //                             number: cur__arr.length,
    //                             avatar: inconFaultAvatar
    //                         })
    //                     }
    //                 })
    //             }
    //         })
    //         // 
    //         ctx.body = {
    //             code: 200,
    //             msg: '成功--getYear',
    //             data: {
    //                 time: time.sort((a, b) => a - b),
    //                 top_obj,
    //                 pie_obj,
    //                 line_array: line_array.sort((a, b) => a[0] - b[0]),
    //             },
    //         }
    //     } else {
    //         ctx.body = {
    //             code: 500,
    //             msg: '失败--getYear',
    //             data: null
    //         }
    //     }
    // }
    // async getMonth_LinePieTop() {
    //     const { app, ctx } = this
    //     // 鉴权
    //     const decode = getToken(ctx.request.header.authorization, app)
    //     if (!decode) return
    //     let user_id = decode.id
    //     // 
    //     const QUERY_STR = 'id,amount,book_id,book_name,date';
    //     // const QUERY_STR = 'id,amount,book_id,book_name,book_type,type_id,type_name,category_id,category_name,date';
    //     let sql = `select ${QUERY_STR} from bill where user_id = ${user_id} and pay_type=2 `;
    //     const list = await app.mysql.query(sql);
    //     if (list) {
    //         //
    //         /**
    //          * 
    //          * 功能函数
    //          */
    //         // 中国标准时间 东八区 CST UTF +8
    //         function myisBetween(mode, number, day) {
    //             if (mode == 'month') return dayjs(day).isBetween(beforeDay_Start('month', number), CST(dayjs()), 'day', '[]')
    //         }
    //         //
    //         // 
    //         const thisMonth_list = filter_array(list, '2023-02', 'month')
    //         let total_amount = getTotalAmount(thisMonth_list)
    //         // 
    //         const time = []
    //         const line_array = []
    //         const pie_obj = {}
    //         const top_obj = {}
    //         // 
    //         list.forEach(bill => {
    //             // 时间
    //             const billDay = CST(bill.date)       //数据库时间是正确的，但拿到这就是错的，需要转CST
    //             /**
    //              * 进一步过滤   
    //              */
    //             if (myisBetween('month', 2, billDay)) {
    //                 // flag
    //                 const formater_month = CST_Format('month', billDay)   //一用format又会加八小时
    //                 const Month_flag = line_array.some(item => item[0] == formater_month)
    //                 /**
    //                  * 计算统计
    //                  */
    //                 if (!Month_flag) {
    //                     time.push(formater_month)
    //                     //
    //                     const cur_arr = filter_array(list, formater_month, 'month')
    //                     line_array.push([formater_month, (getTotalAmount(cur_arr))])
    //                     // pie 在今天的账单数组中，遍历每个元素 
    //                     // 判断 ledger_flag : pie_obj对象的[billYear]  去some 这个value 找 是否有item[0]==_billLedger
    //                     cur_arr.forEach(item => {
    //                         // 账本
    //                         const billLedger = item.book_name
    //                         // flag 
    //                         let _ledger_flag = false
    //                         if (pie_obj[formater_month] == undefined) {
    //                             _ledger_flag = false
    //                             pie_obj[formater_month] = []
    //                             // 
    //                             top_obj[formater_month] = []
    //                         }
    //                         else if (pie_obj[formater_month].some(iten => iten[0] == billLedger)) _ledger_flag = true
    //                         else { _ledger_flag = false }
    //                         /**
    //                          * 分别计算
    //                          */
    //                         // 账本
    //                         if (!_ledger_flag) {
    //                             const cur__arr = filter_book_array(cur_arr, billLedger)
    //                             pie_obj[formater_month].push([billLedger, getTotalAmount(cur__arr)])
    //                             // pie_obj[formater_month] = _pie_array
    //                             top_obj[formater_month].push({
    //                                 billLedger,
    //                                 amount: getTotalAmount(cur__arr),
    //                                 percentage: toPercent(getTotalAmount(cur__arr) / getTotalAmount(cur_arr)),
    //                                 number: cur__arr.length,
    //                                 avatar: inconFaultAvatar
    //                             })
    //                         }
    //                     })
    //                 }
    //             }
    //             else { return }
    //         })
    //         function dateComparison(a, b) {
    //             return dayjs(a[0]) - dayjs(b[0])
    //         }
    //         line_array.sort(dateComparison)
    //         /**
    //          * 先按年排序，再按月排序
    //          */
    //         // top_array.sort((a, b) => a.amount - b.amount)
    //         // 遍历 筛选出的数组
    //         // 整理数据
    //         // 

    //         ctx.body = {
    //             code: 200,
    //             msg: '成功--getDay',
    //             data: {
    //                 time: time.reverse(),
    //                 total_amount,
    //                 line_array,
    //                 pie_obj,
    //                 top_obj,
    //                 before_3Month: {
    //                     'lastlast month': beforeDay_Start('month', 2).format('YYYY-MM'),
    //                     'last month': beforeDay_Start('month', 2).add(1, 'month').format('YYYY-MM'),
    //                     'this month': CST(dayjs()).format('YYYY-MM'),
    //                     'Now-BeiJing-Time': CST(dayjs()).subtract(8, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    //                 }
    //             }
    //         }
    //     } else {
    //         ctx.body = {
    //             code: 500,
    //             msg: '失败--getDay',
    //             data: null
    //         }
    //     }
    // }
    // async getWeek_LinePieTop() {
    //     const { app, ctx } = this
    //     // 鉴权
    //     const decode = getToken(ctx.request.header.authorization, app)
    //     if (!decode) return
    //     let user_id = decode.id
    //     const QUERY_STR = 'id,amount,book_id,book_name,date';
    //     // const QUERY_STR = 'id,amount,book_id,book_name,book_type,type_id,type_name,category_id,category_name,date';
    //     let sql = `select ${QUERY_STR} from bill where user_id = ${user_id} and pay_type=2 `;
    //     const list = await app.mysql.query(sql);
    //     if (list) {
    //         // 
    //         /**
    //          * 
    //          * 功能函数
    //          */
    //         // 时间
    //         function filter_week_array(array, week) {
    //             return array.filter(item => {
    //                 return determineIndex_inWeek(moment(Number(item.date)).format('YYYY-MM-DD')) == week
    //             })
    //         }
    //         function determineIndex_inWeek(day) {
    //             for (let index = 0; index < 4; index++) {
    //                 if (myisBetween('week', index, day)) return index
    //             }
    //             return null
    //         }
    //         function map_index_week(index) {
    //             if (index == 0) return `${beforeDay_Start('week', 0).format('MM-DD')} ~ ${CST(dayjs()).format('MM-DD')}`
    //             else if (index == 1) return `${beforeDay_Start('week', 1).format('MM-DD')} ~ ${beforeDay_Start('week', 0).format('MM-DD')}`
    //             else if (index == 2) return `${beforeDay_Start('week', 2).format('MM-DD')} ~ ${beforeDay_Start('week', 1).format('MM-DD')}`
    //             else if (index == 3) return `${beforeDay_Start('week', 3).format('MM-DD')} ~ ${beforeDay_Start('week', 2).format('MM-DD')}`
    //             else return null
    //         }
    //         //
    //         // 
    //         const thisMonth_list = filter_week_array(list, '2023-02')
    //         let total_amount = getTotalAmount(thisMonth_list)
    //         // 
    //         const time = []
    //         const line_array = []
    //         const pie_obj = {}
    //         const top_obj = {}
    //         // 
    //         list.forEach(bill => {
    //             // 时间
    //             const billDay = CST(bill.date)       //数据库时间是正确的，但拿到这就是错的，需要转CST
    //             /**
    //              * 进一步过滤   
    //              * 近 4周
    //              */
    //             if (myisBetween('week', 4, billDay)) {
    //                 const index = determineIndex_inWeek(billDay)
    //                 const result = map_index_week(index)
    //                 // flag
    //                 const Day_flag = line_array.some(item => item[0] == result)
    //                 /**
    //                  * 计算统计
    //                  */
    //                 if (!Day_flag) {
    //                     time.push(result)
    //                     // 过滤出 元素里date执行determine返回值与billDay相同的元素
    //                     const cur_arr = filter_week_array(list, index)
    //                     line_array.push([result, (getTotalAmount(cur_arr))])
    //                     // 
    //                     cur_arr.forEach(item => {
    //                         //                 // 账本
    //                         const billLedger = item.book_name
    //                         //                 // flag 
    //                         const isexist = isExist(pie_obj, top_obj, result, billLedger)
    //                         if (!isexist) {
    //                             const cur__arr = filter_book_array(cur_arr, billLedger)
    //                             pie_obj[result].push([billLedger, getTotalAmount(cur__arr)])
    //                             top_obj[result].push({
    //                                 billLedger,
    //                                 amount: getTotalAmount(cur__arr),
    //                                 percentage: toPercent(getTotalAmount(cur__arr) / getTotalAmount(cur_arr)),
    //                                 number: cur__arr.length,
    //                                 avatar: inconFaultAvatar
    //                             })
    //                         }
    //                     })
    //                 }
    //             }
    //             else { return }

    //         })
    //         ctx.body = {
    //             code: 200,
    //             msg: '成功--getWeek',
    //             data: {
    //                 time: time.sort((a, b) => { a - b }),
    //                 total_amount,
    //                 line_array,
    //                 pie_obj,
    //                 top_obj,
    //                 before_4Week: {
    //                     'lllast week': beforeDay_Start('week', 3),
    //                     'lastlast week': beforeDay_Start('week', 2),
    //                     'last week': beforeDay_Start('week', 1),
    //                     'this week': beforeDay_Start('week', 0),
    //                     'Now-BeiJing-Time': CST(dayjs().subtract(8, 'hour').format('YYYY-MM-DD')),
    //                 }
    //             }
    //         }
    //     } else {
    //         ctx.body = {
    //             code: 500,
    //             msg: '失败--getWeek',
    //             data: null
    //         }
    //     }
    // }
    // async getDay_LinePieTop() {
    //     const { app, ctx } = this
    //     // 鉴权
    //     const decode = getToken(ctx.request.header.authorization, app)
    //     if (!decode) return
    //     let user_id = decode.id
    //     // 
    //     const QUERY_STR = 'id,amount,book_id,book_name,date';
    //     let sql = `select ${QUERY_STR} from bill where user_id = ${user_id} and pay_type=2 `;
    //     const list = await app.mysql.query(sql);
    //     if (list) {
    //         // 时间
    //         function isbetween7day(day) {
    //             return dayjs(day).isBetween(beforeDay_Start('day', 7), CST(dayjs()), 'day', '[]')
    //         }
    //         // 
    //         const now_list = filter_array(list, CST_Format(dayjs()), 'day')
    //         const line_array = []
    //         const pie_obj = {}
    //         const top_obj = {}
    //         const time = []
    //         let now_total_amount = getTotalAmount(now_list)
    //         // 
    //         list.forEach(bill => {
    //             // 时间
    //             const billDay = CST(bill.date)       //数据库时间是正确的，但拿到这就是错的，需要转CST
    //             /**
    //              * 进一步过滤   
    //              * 近 30天 or 7天
    //              */
    //             if (isbetween7day(billDay)) {
    //                 // flag
    //                 const formater_date = CST_Format('day', billDay)   //一用format又会加八小时
    //                 const Day_flag = line_array.some(item => item[0] == formater_date)
    //                 /**
    //                  * 计算统计
    //                  */
    //                 if (!Day_flag) {
    //                     time.push(formater_date)
    //                     // 
    //                     const cur_arr = filter_array(list, formater_date, 'day')
    //                     line_array.push([formater_date, (getTotalAmount(cur_arr))])
    //                     // pie 在今天的账单数组中，遍历每个元素 
    //                     // 判断 ledger_flag : pie_obj对象的[billYear]  去some 这个value 找 是否有item[0]==_billLedger
    //                     cur_arr.forEach(item => {
    //                         // 账本
    //                         const billLedger = item.book_name
    //                         // flag 
    //                         let _ledger_flag = false
    //                         // isNull
    //                         function isNull(obj, key) {
    //                             if (obj[key] == undefined) {
    //                                 return true
    //                             }
    //                         }
    //                         if (isNull(pie_obj, 'formater_date')) {
    //                             _ledger_flag = false
    //                             pie_obj[formater_date] = []
    //                             top_obj[formater_date] = []
    //                         }
    //                         else if (pie_obj[formater_date].some(iten => iten[0] == billLedger)) _ledger_flag = true
    //                         else { _ledger_flag = false }
    //                         /**
    //                          * 分别计算
    //                          */
    //                         // 账本
    //                         if (!_ledger_flag) {
    //                             const cur__arr = filter_book_array(cur_arr, billLedger)
    //                             pie_obj[formater_date].push([billLedger, getTotalAmount(cur__arr)])
    //                             // pie_obj[formater_date] = _pie_array
    //                             top_obj[formater_date].push({
    //                                 billLedger,
    //                                 amount: getTotalAmount(cur__arr),
    //                                 percentage: toPercent(getTotalAmount(cur__arr) / getTotalAmount(cur_arr)),
    //                                 number: cur__arr.length,
    //                                 avatar: inconFaultAvatar
    //                             })
    //                         }
    //                     })
    //                 }
    //             }
    //             else { return }

    //         })
    //         // line_array.sort((a, b) => a[0] - b[0])
    //         // top_array.sort((a, b) => a.amount - b.amount)
    //         // 遍历 筛选出的数组
    //         // 整理数据
    //         // 
    //         ctx.body = {
    //             code: 200,
    //             msg: '成功--getDay',
    //             data: {
    //                 test: beforeDay_Start('day', 7),
    //                 testtest: isbetween7day(dayjs().subtract(7, 'day')),
    //                 time,
    //                 today: dayjs().format('MM-DD'),
    //                 now_total_amount,
    //                 line_array,
    //                 pie_obj,
    //                 top_obj,
    //                 before_7day: beforeDay_Start('day', 7),
    //                 now: CST(dayjs()),
    //             }
    //         }
    //     } else {
    //         ctx.body = {
    //             code: 500,
    //             msg: '失败--getDay',
    //             data: null
    //         }
    //     }
    // }
    async get_Exp_Inc_Trf() {
        /**
          * 功能函数
          */
        function myisBetween(mode, number, day) {
            if (mode == 'month') return dayjs(day).isBetween(beforeDay_Start('month', number), CST(dayjs()), 'day', '[]')
            if (mode == 'day') return dayjs(day).isBetween(beforeDay_Start('day', number), CST(dayjs()), 'day', '[]')
            if (mode == 'week') return dayjs(day).isBetween(beforeDay_Start('week', number), CST(dayjs()), 'day', '[]')
        }
        // 
        const { app, ctx } = this
        // 鉴权
        const decode = getToken(ctx.request.header.authorization, app)
        if (!decode) return
        let user_id = decode.id
        // 查询
        const QUERY_STR = 'id,amount,book_id,book_name,date';
        /**
         *  Exp、Inc、Trf
         */
        const resData = { Exp: {}, Inc: {}, Trf: {} }
        class data {
            constructor(time, line_array, pie_obj, top_obj) {
                this.time = time;
                this.line_array = line_array;
                this.pie_obj = pie_obj;
                this.top_obj = top_obj;
            }
        }
        for (let index = 1; index <= 3; index++) {
            let sql = `select ${QUERY_STR} from bill where user_id = ${user_id} and pay_type=${index} `;  //Exp
            const list = await app.mysql.query(sql);
            if (list) {
                function handle(mode, obj, formatKey, week_index) {
                    obj.time.push(formatKey)
                    // 
                    let modeArr = []
                    if (mode == 'week') { modeArr = filter_array(list, week_index, mode) }
                    else { modeArr = filter_array(list, formatKey, mode) }
                    // 
                    obj.line_array.push([formatKey, (getTotalAmount(modeArr))])
                    // 
                    modeArr.forEach(item => {
                        // 账本
                        const billLedger = item.book_name
                        // 
                        const isexist = isExist(obj.pie_obj, obj.top_obj, formatKey, billLedger)
                        // 账本
                        if (!isexist) {
                            const cur__arr = filter_book_array(modeArr, billLedger)
                            // 
                            obj.pie_obj[formatKey].push([billLedger, getTotalAmount(cur__arr)])
                            // 
                            obj.top_obj[formatKey].push({
                                billLedger,
                                amount: getTotalAmount(cur__arr),
                                percentage: toPercent(getTotalAmount(cur__arr) / getTotalAmount(modeArr)),
                                number: cur__arr.length,
                                avatar: inconFaultAvatar
                            })
                        }
                    })
                }
                // 
                const Year = new data([], [], {}, {})
                const Month = new data([], [], {}, {})
                const Week = new data([], [], {}, {})
                const Day = new data([], [], {}, {})
                // 
                list.forEach(bill => {
                    /**
                     * 时间
                     */
                    const billYear = moment(Number(bill.date)).format('YYYY')  //年
                    const billDay = CST(bill.date)                             //月、日
                    /**
                     * falg
                     */
                    const year_flag = Year.line_array.some(item => item[0] == billYear)         //年
                    // 
                    const Month_flag = myisBetween('month', 3, billDay)                         //月
                    const formater_month = CST_Format('month', billDay)                         //月
                    const _Month_flag = isFind(Month.line_array, formater_month)                //月
                    // 
                    const Day_flag = myisBetween('day', 7, billDay)                             //日
                    const formater_date = CST_Format('day', billDay)                            //日
                    const _Day_flag = isFind(Day.line_array, formater_date)                     //日
                    // 
                    const week_flag = myisBetween('week', 4, billDay)                           //周
                    const index = determineIndex_inWeek(billDay)                                //周
                    const result = map_index_week(index)                                        //周
                    const _week_flag = isFind(Week.line_array, result)                          //周
                    // 
                    // 年
                    if (!year_flag) {
                        handle('year', Year, billYear)
                    }
                    // 月
                    if (Month_flag && !_Month_flag) {
                        handle('month', Month, formater_month)
                    }
                    // 日
                    if (Day_flag && !_Day_flag) {
                        handle('day', Day, formater_date)
                    }
                    // 周
                    if (week_flag && !_week_flag && result) {
                        handle('week', Week, result, index)
                    }
                })
                /**
                 * 排序的问题
                 * 四个时间的对象 time需要升序 
                 * 并且与pie_obj和top_obj的属性顺序也相同 与line_array的顺序也相同
                 */
                Year.time.sort((a, b) => a - b)
                Year.line_array.sort((a, b) => a[0] - b[0])
                //
                /**
                 * 赋值
                 */
                function assignment(obj) {
                    if (index == 1) resData.Inc = obj
                    else if (index == 2) resData.Exp = obj
                    else if (index == 3) resData.Trf = obj
                }
                assignment({ Year, Month, Day, Week })
            } else {
                if (index == 1) {
                    resData.Exp = null
                }
                else if (index == 2) {
                    resData.Inc = null
                }
                else if (index == 3) {
                    resData.Trf = null
                }
            }
        }
        ctx.body = {
            code: 200,
            msg: '成功--get_all_data',
            data: resData,
        }
        // ctx.body = {
        //     data: {
        //         year,
        //         month,
        //         day,
        //         week,
        //     },
        // }
    }
}
module.exports = ChartController