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
    return s;
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
function filter_array(array, day, mode) {
    return array.filter(item => {
        if (mode == 'day') {
            return moment(Number(item.date)).format('MM-DD') == day
        }
    })
}
/** 解决dayjs自带的format会改变时间 */
function CST_Format(date) {
    return date.subtract(8, 'hour').format('MM-DD')
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

class ChartController extends Controller {
    // 
    async getYear_LinePieTop() {
        const { app, ctx } = this
        // 鉴权
        const decode = getToken(ctx.request.header.authorization, app)
        if (!decode) return
        let user_id = decode.id

        const QUERY_STR = 'id,amount,book_id,book_name,date';
        let sql = `select ${QUERY_STR} from bill where user_id = ${user_id} and pay_type=2 `;  //Exp
        const list = await app.mysql.query(sql);
        if (list) {
            const _list = filter_year_array(list, '2023')
            // 
            /**
             * 
             * 功能函数
             */
            // 时间
            function filter_year_array(array, year) {
                return array.filter(item => {
                    return moment(Number(item.date)).format('YYYY') == year
                })
            }
            // 账本
            function filter_book_array(array, bookName) {
                return array.filter(item => {
                    return item.book_name == bookName
                })
            }

            // 
            let total_amount = getTotalAmount(list)
            // 
            const time = []
            const line_array = []
            const pie_array = []
            const top_array = []
            const pie_obj = {}
            const top_obj = {}
            // 
            list.forEach(bill => {
                // 时间
                const billYear = moment(Number(bill.date)).format('YYYY')
                // flag
                const year_flag = line_array.some(item => item[0] == billYear)
                /**
                 * 分别计算统计
                 */
                // 时间
                if (!year_flag) {
                    time.push(billYear)
                    const cur_arr = filter_year_array(list, billYear)
                    line_array.push([billYear, getTotalAmount(cur_arr)])
                    // pie 在2023年的账单数组中，遍历每个元素 
                    // 判断 ledger_flag : pie_obj对象的[billYear]  去some 这个value 找 是否有item[0]==_billLedger
                    cur_arr.forEach(item => {
                        // 账本
                        const _billLedger = item.book_name
                        // flag 
                        let _ledger_flag = false
                        if (pie_obj[billYear] == undefined) {
                            _ledger_flag = false
                            pie_obj[billYear] = []
                            // 
                            top_obj[billYear] = []
                        }
                        else if (pie_obj[billYear].some(iten => iten[0] == _billLedger)) _ledger_flag = true
                        else { _ledger_flag = false }
                        /**
                         * 分别计算
                         */
                        // 账本
                        if (!_ledger_flag) {
                            const cur__arr = filter_book_array(cur_arr, _billLedger)
                            pie_obj[billYear].push([_billLedger, getTotalAmount(cur__arr)])
                            // pie_obj[billYear] = _pie_array
                            top_obj[billYear].push({
                                _billLedger,
                                amount: getTotalAmount(cur__arr),
                                percentage: toPercent(getTotalAmount(cur__arr) / getTotalAmount(cur_arr)),
                                number: cur__arr.length,
                                avatar: inconFaultAvatar
                            })
                        }
                    })
                }
            })
            line_array.sort((a, b) => a[0] - b[0])
            top_array.sort((a, b) => a.amount - b.amount)
            // 遍历 筛选出的数组
            // 整理数据
            // 
            ctx.body = {
                code: 200,
                msg: '成功--getYear',
                data: {
                    year: {
                        time: time.sort((a, b) => a - b),
                        amouont_2022: getTotalAmount(filter_year_array(list, '2022')),
                        amouont_2023: getTotalAmount(filter_year_array(list, '2023')),
                        amouont_2024: getTotalAmount(filter_year_array(list, '2024')),
                        top_obj,
                        pie_obj,
                        total_amount,
                        line_array,
                    },
                }
            }
        } else {
            ctx.body = {
                code: 500,
                msg: '失败--getYear',
                data: null
            }
        }
    }
    async getMonth_LinePieTop() {
        const { app, ctx } = this
        // 鉴权
        const decode = getToken(ctx.request.header.authorization, app)
        if (!decode) return
        let user_id = decode.id
        // 
        const QUERY_STR = 'id,amount,book_id,book_name,date';
        // const QUERY_STR = 'id,amount,book_id,book_name,book_type,type_id,type_name,category_id,category_name,date';
        let sql = `select ${QUERY_STR} from bill where user_id = ${user_id} and pay_type=2 `;
        const list = await app.mysql.query(sql);
        if (list) {
            // 
            /**
             * 
             * 功能函数
             */
            // 时间
            function filter_month_array(array, month) {
                return array.filter(item => {
                    return moment(Number(item.date)).format('YYYY-MM') == month
                })
            }
            // 账本
            function filter_book_array(array, bookName) {
                return array.filter(item => {
                    return item.book_name == bookName
                })
            }
            function toPercent(point) {
                var str = Number(point * 100).toFixed(1);
                str += "%";
                return str;
            }
            // dayjs
            const dayjs = require('dayjs')
            var isBetween = require('dayjs/plugin/isBetween')
            dayjs.extend(isBetween)
            // 中国标准时间 东八区 CST UTF +8
            function CST(time) {
                return dayjs(time).add(8, 'hour')
            }
            function CST_Format(date) {
                return date.subtract(8, 'hour').format('YYYY-MM')
            }
            function before3Month_start() {
                return CST(dayjs().startOf('month').subtract(2, 'month'))
            }
            function isbetween_3Month(day) {
                return dayjs(day).isBetween(before3Month_start(), CST(dayjs()), 'day', '[]')
            }
            //
            // 
            const thisMonth_list = filter_month_array(list, '2023-02')
            let total_amount = getTotalAmount(thisMonth_list)
            // 
            const time = []
            const line_array = []
            const pie_obj = {}
            const top_obj = {}
            // 
            list.forEach(bill => {
                // 时间
                const billDay = CST(bill.date)       //数据库时间是正确的，但拿到这就是错的，需要转CST
                /**
                 * 进一步过滤   
                 * 近 30天 or 7天
                 */
                if (isbetween_3Month(billDay)) {
                    // flag
                    const formater_month = CST_Format(billDay)   //一用format又会加八小时
                    const Day_flag = line_array.some(item => item[0] == formater_month)
                    /**
                     * 计算统计
                     */
                    if (!Day_flag) {
                        if (formater_month == dayjs().format('YYYY-MM')) {
                            time.push('This Month')
                        }
                        else { time.push(formater_month) }
                        //
                        const cur_arr = filter_month_array(list, formater_month)
                        line_array.push([formater_month, (getTotalAmount(cur_arr))])
                        // pie 在今天的账单数组中，遍历每个元素 
                        // 判断 ledger_flag : pie_obj对象的[billYear]  去some 这个value 找 是否有item[0]==_billLedger
                        cur_arr.forEach(item => {
                            // 账本
                            const billLedger = item.book_name
                            // flag 
                            let _ledger_flag = false
                            if (pie_obj[formater_month] == undefined) {
                                _ledger_flag = false
                                pie_obj[formater_month] = []
                                // 
                                top_obj[formater_month] = []
                            }
                            else if (pie_obj[formater_month].some(iten => iten[0] == billLedger)) _ledger_flag = true
                            else { _ledger_flag = false }
                            /**
                             * 分别计算
                             */
                            // 账本
                            if (!_ledger_flag) {
                                const cur__arr = filter_book_array(cur_arr, billLedger)
                                pie_obj[formater_month].push([billLedger, getTotalAmount(cur__arr)])
                                // pie_obj[formater_month] = _pie_array
                                top_obj[formater_month].push({
                                    billLedger,
                                    amount: getTotalAmount(cur__arr),
                                    percentage: toPercent(getTotalAmount(cur__arr) / getTotalAmount(cur_arr)),
                                    number: cur__arr.length,
                                    avatar: inconFaultAvatar
                                })
                            }
                        })
                    }
                }
                else { return }
            })
            line_array.sort((a, b) => a[0] - b[0])
            // top_array.sort((a, b) => a.amount - b.amount)
            // 遍历 筛选出的数组
            // 整理数据
            // 

            ctx.body = {
                code: 200,
                msg: '成功--getDay',
                data: {
                    Month: {
                        time: time.reverse(),
                        total_amount,
                        line_array,
                        pie_obj,
                        top_obj,
                        before_3Month: {
                            'lastlast month': before3Month_start().format('YYYY-MM'),
                            'last month': before3Month_start().add(1, 'month').format('YYYY-MM'),
                            'this month': CST(dayjs()).format('YYYY-MM'),
                            'Now-BeiJing-Time': CST(dayjs()).subtract(8, 'hour').format('YYYY-MM-DD HH:mm:ss'),
                        }
                    },
                }
            }
        } else {
            ctx.body = {
                code: 500,
                msg: '失败--getDay',
                data: null
            }
        }
    }
    async getWeek_LinePieTop() {
        const { app, ctx } = this
        // 鉴权
        const decode = getToken(ctx.request.header.authorization, app)
        if (!decode) return
        let user_id = decode.id
        const QUERY_STR = 'id,amount,book_id,book_name,date';
        // const QUERY_STR = 'id,amount,book_id,book_name,book_type,type_id,type_name,category_id,category_name,date';
        let sql = `select ${QUERY_STR} from bill where user_id = ${user_id} and pay_type=2 `;
        const list = await app.mysql.query(sql);
        if (list) {
            // 
            /**
             * 
             * 功能函数
             */
            // 时间
            function filter_week_array(array, week) {
                return array.filter(item => {
                    return determineIndex_inWeek(moment(Number(item.date)).format('YYYY-MM-DD')) == week
                })
            }
            // 账本
            function filter_book_array(array, bookName) {
                return array.filter(item => {
                    return item.book_name == bookName
                })
            }
            function toPercent(point) {
                var str = Number(point * 100).toFixed(1);
                str += "%";
                return str;
            }

            // dayjs
            const dayjs = require('dayjs')
            var isBetween = require('dayjs/plugin/isBetween')
            dayjs.extend(isBetween)
            // 中国标准时间 东八区 CST UTF +8
            function CST(time) {
                return dayjs(time).add(8, 'hour')
            }
            function CST_Format(date) {
                return date.subtract(8, 'hour').format('YYYY-MM')
            }
            function beforeWeek_start(n) {
                return CST(dayjs().startOf('week').subtract(n, 'week')).add(1, 'day')
            }
            function isbetween_4Week(day, index) {
                return dayjs(day).isBetween(beforeWeek_start(index), CST(dayjs()), 'day', '[]')
            }
            function determineIndex_inWeek(day) {
                for (let index = 0; index < 4; index++) {
                    if (isbetween_4Week(day, index)) return index
                    // 第0周 就是本周
                    // 第1周 就是一周前
                    // 第2周 就是两周前
                    // 第3周 就是三周前
                }
                return null
            }
            function map_index_week(index) {
                if (index == 0) return 'This Week'
                else if (index == 1) return 'last Week'
                else if (index == 2) return 'lsat lsat Week'
                else if (index == 3) return 'lllast Week'
                else return null
            }

            //
            // 
            const thisMonth_list = filter_week_array(list, '2023-02')
            let total_amount = getTotalAmount(thisMonth_list)
            // 
            const time = []
            const line_array = []
            const pie_array = []
            const top_array = []
            const pie_obj = {}
            const top_obj = {}
            // 
            list.forEach(bill => {
                // 时间
                const billDay = CST(bill.date)       //数据库时间是正确的，但拿到这就是错的，需要转CST
                /**
                 * 进一步过滤   
                 * 近 4周
                 */
                if (isbetween_4Week(billDay, 4)) {
                    const index = determineIndex_inWeek(billDay)
                    const result = map_index_week(index)
                    // flag
                    const Day_flag = line_array.some(item => item[0] == result)
                    /**
                     * 计算统计
                     */
                    if (!Day_flag) {
                        time.push(result)
                        // 过滤出 元素里date执行determine返回值与billDay相同的元素
                        const cur_arr = filter_week_array(list, index)
                        line_array.push([result, (getTotalAmount(cur_arr))])
                        //             // pie 在今天的账单数组中，遍历每个元素 
                        //             // 判断 ledger_flag : pie_obj对象的[billYear]  去some 这个value 找 是否有item[0]==_billLedger
                        cur_arr.forEach(item => {
                            //                 // 账本
                            const billLedger = item.book_name
                            //                 // flag 
                            let _ledger_flag = false
                            if (pie_obj[result] == undefined) {
                                _ledger_flag = false
                                pie_obj[result] = []
                                // 
                                top_obj[result] = []
                            }
                            else if (pie_obj[result].some(iten => iten[0] == billLedger)) _ledger_flag = true
                            else { _ledger_flag = false }
                            //                 /**
                            //                  * 分别计算
                            //                  */
                            //                 // 账本
                            if (!_ledger_flag) {
                                const cur__arr = filter_book_array(cur_arr, billLedger)
                                pie_obj[result].push([billLedger, getTotalAmount(cur__arr)])
                                // pie_obj[result] = _pie_array
                                top_obj[result].push({
                                    billLedger,
                                    amount: getTotalAmount(cur__arr),
                                    percentage: toPercent(getTotalAmount(cur__arr) / getTotalAmount(cur_arr)),
                                    number: cur__arr.length,
                                    avatar: inconFaultAvatar
                                })
                            }
                        })
                    }
                }
                else { return }

            })
            // line_array.sort((a, b) => a[0] - b[0])
            // top_array.sort((a, b) => a.amount - b.amount)
            // 遍历 筛选出的数组
            // 整理数据
            // 
            // '2023-02-27 11:19:24'
            // '2023-02-22 10:06:07' 
            const test_Determine = determineIndex_inWeek('2022-07-28 19:52:36')
            ctx.body = {
                code: 200,
                msg: '成功--getWeek',
                data: {
                    Week: {
                        time: time.sort((a, b) => { a - b }),
                        total_amount,
                        line_array,
                        pie_obj,
                        top_obj,
                        before_4Week: {
                            'lllast week': beforeWeek_start(3),
                            'lastlast week': beforeWeek_start(2),
                            'last week': beforeWeek_start(1),
                            'this week': beforeWeek_start(0),
                            'Now-BeiJing-Time': CST(dayjs().subtract(8, 'hour').format('YYYY-MM-DD')),
                        }
                    },
                }
            }
        } else {
            ctx.body = {
                code: 500,
                msg: '失败--getWeek',
                data: null
            }
        }
    }
    async getDay_LinePieTop() {
        const { app, ctx } = this
        // 鉴权
        const decode = getToken(ctx.request.header.authorization, app)
        if (!decode) return
        let user_id = decode.id
        // 
        const QUERY_STR = 'id,amount,book_id,book_name,date';
        let sql = `select ${QUERY_STR} from bill where user_id = ${user_id} and pay_type=2 `;
        const list = await app.mysql.query(sql);
        if (list) {
            // 时间
            function before7day() {
                return CST(dayjs().startOf('date').subtract(7, 'day'))
            }
            function isbetween7day(day) {
                return dayjs(day).isBetween(before7day(), CST(dayjs()), 'day', '[]')
            }
            // 
            const now_list = filter_array(list, CST_Format(dayjs()), 'day')
            const line_array = []
            const pie_obj = {}
            const top_obj = {}
            const time = []
            let now_total_amount = getTotalAmount(now_list)
            // 
            list.forEach(bill => {
                // 时间
                const billDay = CST(bill.date)       //数据库时间是正确的，但拿到这就是错的，需要转CST
                /**
                 * 进一步过滤   
                 * 近 30天 or 7天
                 */
                if (isbetween7day(billDay)) {
                    // flag
                    const formater_date = CST_Format(billDay)   //一用format又会加八小时
                    const Day_flag = line_array.some(item => item[0] == formater_date)
                    /**
                     * 计算统计
                     */
                    if (!Day_flag) {
                        if (formater_date == dayjs().format('MM-DD')) {
                            time.push('Today')
                        }
                        else {
                            time.push(formater_date)
                        }
                        // 
                        const cur_arr = filter_array(list, formater_date, 'day')
                        line_array.push([formater_date, (getTotalAmount(cur_arr))])
                        // pie 在今天的账单数组中，遍历每个元素 
                        // 判断 ledger_flag : pie_obj对象的[billYear]  去some 这个value 找 是否有item[0]==_billLedger
                        cur_arr.forEach(item => {
                            // 账本
                            const billLedger = item.book_name
                            // flag 
                            let _ledger_flag = false
                            /**
                             * 判断：
                             * 新建对象的时间属性是否为空： 是=>执行，并在执行前初始化该属性的value为空[]数组
                             *                             否:
                             *                                该属性的value里是否能找到目标账本： 是=> 不执行
                             *                                                                   否=> 执行
                             */
                            // isNull
                            function isNull(obj, key) {
                                if (obj[key] == undefined) {
                                    return true
                                }
                            }
                            // isExist
                            function isExist(obj, key, target) {
                                if (obj[key].some(iten => iten[0] == target)) {
                                    return true
                                }
                            }
                            if (isNull(pie_obj, 'formater_date')) {
                                _ledger_flag = false
                                pie_obj[formater_date] = []
                                top_obj[formater_date] = []
                            }
                            else if (pie_obj[formater_date].some(iten => iten[0] == billLedger)) _ledger_flag = true
                            else { _ledger_flag = false }
                            /**
                             * 分别计算
                             */
                            // 账本
                            if (!_ledger_flag) {
                                const cur__arr = filter_book_array(cur_arr, billLedger)
                                pie_obj[formater_date].push([billLedger, getTotalAmount(cur__arr)])
                                // pie_obj[formater_date] = _pie_array
                                top_obj[formater_date].push({
                                    billLedger,
                                    amount: getTotalAmount(cur__arr),
                                    percentage: toPercent(getTotalAmount(cur__arr) / getTotalAmount(cur_arr)),
                                    number: cur__arr.length,
                                    avatar: inconFaultAvatar
                                })
                            }
                        })
                    }
                }
                else { return }

            })
            // line_array.sort((a, b) => a[0] - b[0])
            // top_array.sort((a, b) => a.amount - b.amount)
            // 遍历 筛选出的数组
            // 整理数据
            // 
            ctx.body = {
                code: 200,
                msg: '成功--getDay',
                data: {
                    Day: {
                        time,
                        today: dayjs().format('MM-DD'),
                        now_total_amount,
                        line_array,
                        pie_obj,
                        top_obj,
                        before_7day: before7day(),
                        now: CST(dayjs()),
                    },
                }
            }
        } else {
            ctx.body = {
                code: 500,
                msg: '失败--getDay',
                data: null
            }
        }
    }
}
module.exports = ChartController