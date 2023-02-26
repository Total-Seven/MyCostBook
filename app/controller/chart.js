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

class ChartController extends Controller {


    // 
    async getYear_LinePieTop() {
        const { app, ctx } = this
        // 鉴权
        let user_id
        // 通过 token 解析，拿到 user_id
        const token = ctx.request.header.authorization;
        const decode = await app.jwt.verify(token, app.config.jwt.secret);
        if (!decode) return
        user_id = decode.id

        const QUERY_STR = 'id,amount,book_id,book_name,date';
        // const QUERY_STR = 'id,amount,book_id,book_name,book_type,type_id,type_name,category_id,category_name,date';
        let sql = `select ${QUERY_STR} from bill where user_id = ${user_id} and pay_type=2 `;
        const list = await app.mysql.query(sql);
        if (list) {
            const _list = filter_year_array(list, '2023')
            // 
            /**
             * 
             * 功能函数
             */
            // 时间
            function getYear_total_amount(array) {
                return array.reduce((pre, cur) => {
                    return pre += cur.amount
                }, 0)
            }
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
            function toPercent(point) {
                var str = Number(point * 100).toFixed(1);
                str += "%";
                return str;
            }
            // 
            let total_amount = getYear_total_amount(list)
            // 
            const line_array = []
            const pie_array = []
            const top_array = []
            const pie_obj = {}
            const top_obj = {}
            // 
            list.forEach(bill => {
                // 时间
                const billYear = moment(Number(bill.date)).format('YYYY')
                // 账本
                const billLedger = bill.book_name
                // flag
                const year_flag = line_array.some(item => item[0] == billYear)
                const ledger_flag = pie_array.some(item => item[0] == billLedger)
                /**
                 * 分别计算统计
                 */
                // 时间
                if (!year_flag) {
                    const cur_arr = filter_year_array(list, billYear)
                    line_array.push([billYear, getYear_total_amount(cur_arr)])
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
                            pie_obj[billYear].push([_billLedger, getYear_total_amount(cur__arr)])
                            // pie_obj[billYear] = _pie_array
                            top_obj[billYear].push({
                                _billLedger,
                                amount: getYear_total_amount(cur__arr),
                                percentage: toPercent(getYear_total_amount(cur__arr) / getYear_total_amount(cur_arr)),
                                number: cur__arr.length,
                                avatar: inconFaultAvatar
                            })
                        }
                    })
                }
                // 账本
                // if (!ledger_flag) {
                //     const cur__arr = filter_book_array(list, billLedger)
                //     pie_array.push([billLedger, getYear_total_amount(cur__arr)])
                //     top_array.push({
                //         billLedger,
                //         amount: getYear_total_amount(cur__arr),
                //         percentage: toPercent(getYear_total_amount(cur__arr) / total_amount),
                //         number: cur__arr.length,
                //         avatar: inconFaultAvatar
                //     })
                // }
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
                        amouont_2022: getYear_total_amount(filter_year_array(list, '2022')),
                        amouont_2023: getYear_total_amount(filter_year_array(list, '2023')),
                        amouont_2024: getYear_total_amount(filter_year_array(list, '2024')),
                        top_obj,
                        pie_obj,
                        total_amount,
                        pie_array,
                        line_array,
                        top_array,
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
}
module.exports = ChartController