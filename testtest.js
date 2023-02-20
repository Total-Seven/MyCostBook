// const arr = [1, 2, 3, 4, 5, 6]

const { fn } = require("moment")


// const moment = require('moment')
// console.log(moment('2022-10-21') - moment('2022-10-20') > 0);
// // 数组降维
function ArrOperator__nestArr() {
    let nest_arr = [1, 2, [3, 4, [5, 6]]]
    let result = []
    console.group('降一维')
    // 1.
    result = Array.prototype.concat.apply([], nest_arr)
    console.table(result)
    // 2.
    console.table([].concat(...nest_arr))  //必须加...
    console.groupEnd('降一维')
    console.info('*************')
    console.group('降好多维')
    // 1.
    while (nest_arr.some(item => Array.isArray(item))) {
        nest_arr = [].concat(...nest_arr)   // ...去掉 变无限循环
    }
    console.table(nest_arr)
    2.
    console.table(nest_arr.flat(Infinity))
    console.groupEnd('降好多维')
}

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

function formatCount() {
    return "200W"
}
function formatDate() {
    return "2022-10-22"
}
module.exports.formatCount = formatCount
module.exports.formatDate = formatDate
// module.exports  和  exports
module.exports.ArrOperator__nestArr = ArrOperator__nestArr


const arr = [1, 2, 3, 7, 5, 4, 6]

const result = arr.sort((pre, next) => {
    return pre - next
})

console.table(result)