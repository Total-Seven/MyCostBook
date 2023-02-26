// const arr = [1, 2, 3, 4, 5, 6]

const { fn } = require("moment")


// const moment = require('moment')
// console.log(moment('2022-10-21') - moment('2022-10-20') > 0);
// // 数组降维
// function ArrOperator__nestArr() {
//     let nest_arr = [1, 2, [3, 4, [5, 6]]]
//     let result = []
//     console.group('降一维')
//     // 1.
//     result = Array.prototype.concat.apply([], nest_arr)
//     console.table(result)
//     // 2.
//     console.table([].concat(...nest_arr))  //必须加...
//     console.groupEnd('降一维')
//     console.info('*************')
//     console.group('降好多维')
//     // 1.
//     while (nest_arr.some(item => Array.isArray(item))) {
//         nest_arr = [].concat(...nest_arr)   // ...去掉 变无限循环
//     }
//     console.table(nest_arr)
//     2.
//     console.table(nest_arr.flat(Infinity))
//     console.groupEnd('降好多维')
// }

// // [] 这代表是什么？ 对象？函数？
// function bracket() {
//     class a extends ArrOperator__nestArr {

//     }
//     const aa = new a()
//     console.group('[]是什么')
//     // 1. typeof
//     console.log(typeof []);               // 判断基本类型
//     // 2. instanceof
//     console.log([] instanceof Array);      //任何实例对象，一代原型是构造函数的模板原型
//     console.log([] instanceof Object);    //             二代原型就是object的原型了
//     console.log([] instanceof Function);
//     // 3.constructor
//     console.log([].constructor);          //但它有constructor？？？
//     console.log([].prototype);               //没有显示模板原型  不是构造函数
//     console.info(Object.getPrototypeOf([]))  //是个实例对象   不是构造函数
//     console.groupEnd('[]是什么')

//     console.log(ArrOperator__nestArr instanceof Function);
//     console.log(aa instanceof Function);
//     console.log(Array instanceof Function);
//     console.log(arr instanceof Function);
// }

// console.log(process.argv)  //process.argv

// const a = process.argv[2]
// const b = process.argv[3]
// console.info(a, b)

// // C : main()  argument counter参数的个数 argument vector具体的参数
// console.clear()
// console.trace()
// setTimeout(() => { }, 3000)
// setInterval(() => {
// }, interval);
// // setImmediate(callback: (...args: TArgs) => void, ...args: TArgs)
// process.nextTick(() => {
//     setImmediate(() => {

//     })
// });

// function formatCount() {
//     return "200W"
// }
// function formatDate() {
//     return "2022-10-22"
// }
// module.exports.formatCount = formatCount
// module.exports.formatDate = formatDate
// // module.exports  和  exports
// module.exports.ArrOperator__nestArr = ArrOperator__nestArr


// const arr = [1, 2, 3, 7, 5, 4, 6]

// const result = arr.sort((pre, next) => {
//     return pre - next
// })

// console.table(result)

// const body = {
//     name: 'sb3',
//     goods_list: [
//         { user_id: 46, name: '商品一', picture: '', amount: 77, list_id: 4, list_name: 'BeJson' },
//         { user_id: 46, name: '商品二', picture: '', amount: 88, list_id: 4, list_name: 'BeJson' },
//     ]
// }
// const json_body = JSON.stringify(body)
// const obj_body = JSON.parse(json_body)
// console.log(json_body);
// console.log(obj_body);

// const total = body.goods_list.reduce((pre, cur) => {
//     return pre += cur.amount
// }, 0)

// console.log(total);


// json = { "name": "sb8", "goods_list": [{ "user_id": 46, "name": "商品十一", "picture": "", "amount": 77, "list_id": 4, "list_name": "BeJson" }, { "user_id": 46, "name": "商品十二", "picture": "", "amount": 88, "list_id": 4, "list_name": "BeJson" }] }


const moment = require('moment')
console.log('时间戳 (13 位数字，从1970年1月1日 UTC 午夜开始所经过的毫秒数) ', moment.now());

// ISO 8601 : '2023-02-22T14:43:00.000Z'

// day.js
const dayjs = require('dayjs')
// 配件
// var customParseFormat = require('dayjs/plugin/customParseFormat')
// dayjs.extend(customParseFormat)
// var objectSupport = require("dayjs/plugin/objectSupport");
// dayjs.extend(objectSupport);

// 使用
// const now = dayjs()     //从 y年到 ms毫秒s
// const now_30 = now.add(30, 'day')
// console.log(now.format('YYYY-MM-DD'));
// console.log(now_30.format('YYYY-MM-DD'));

// const start_date = '2023-02-20'
// const middle_date = dayjs(start_date, 'YYYY-MM-DD').add(8, 'hour')
// console.log(middle_date);


function handle_PlanDetail(start_date, daily_money, period) {
    let detailArr = new Array()
    const hand = () => {
        for (let day = 0; day <= period - 1; day++) {
            const obj = {}
            obj.amount = daily_money
            detailArr.push(obj)
            obj.total = detailArr.reduce((pre, cur) => {
                return pre += cur.amount
            }, 0)
            obj.date = dayjs(start_date, 'YYYY-MM-DD').add(day, 'day').format('YYYY-MM-DD')
        }
        return detailArr
    }
    return hand
}
const hand = handle_PlanDetail('2023-02-22', 20, 10)
const detailArr = hand()

console.log(detailArr);

console.group('数据类型');
/**
 * 原始类型有一个特点就是不可变
 */
var str = "abc";
str[0] = "d";
console.log(str) // abc  

// 例子2
var str2 = "abc";
str2 = "dbc";
console.log(str2) // dbc

/**
 * 为什么要把基础类型的值设成不可变  (安全)
 * 
 * 像java之类的多线程语言， 更有可能造成线程不安全的问题。
 */

// 1.为了安全
// 假设基础类型的值是可变的， 那么下面的代码会变得很奇怪

var strTest = "varaiable";
var fun = (str) => { str + "---ok" };
fun(strTest);
console.log(strTest) // varaiable---ok

var map = new Map()     // 可以看到strTest的值被改变了， 特别是在map之类的对象中更为显著
var strTest = "t1";
map.set(strTest, 10);
strTest = "notT1";
map.get("t1"); // undefined;
map.get("notT1"); // 10


// 2.为了共享
// 实际上， 基础类型中， 值一样的变量是共享一个内存区域的。


var number1 = 1
var number2 = 1     //  1这个数据在内存中只保存了一份，而可以有多个标识符使用它。
console.groupEnd('数据类型')