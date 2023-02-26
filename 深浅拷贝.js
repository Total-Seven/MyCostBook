/**
 * 数组
 */

// let list = [1, 2, 3, 4]
// // let box = list.slice();//方案一
// // let box = [].concat(list); //方案二
// // let box = [...list];//方案三
// let box = Array.from(list);//方案四

// console.log('拷贝前:', list, box);

// list[3] = 'a'

// console.log('拷贝后:', list, box);


/**
 * 对象
 */

/**
 * (一) Object.assign() 、 解构赋值 和 扩展运算符(...)
 * 仅针对基本数据类型
 */

/**
 * (二) 用 JSON.stringify 把对象转换成字符串，再用JSON.parse把字符串转换成新的对象
 * (可以转成 JSON 格式的对象才能使用这种方法，如果对象中包含 function 或 RegExp 则不能用这种方法。)
 */

/**
 * (三) 使用递归
 * 1、用new obj.constructor ()构造函数新建一个空的对象，而不是使用{}或者[],这样可以保持原形链的继承；
 * 2、用obj.hasOwnProperty(key)来判断属性是否来自原型链上，因为for..in..也会遍历其原型链上的可枚举属性。
 * 3、上面的函数用到递归算法，在函数有名字，而且名字以后也不会变的情况下，这样定义没有问题。但问题是这个函数的执行与函数名 factorial 紧紧耦合在了一起。为了消除这种紧密耦合的现象，需要使用 arguments.callee。
 */
// const a = {
//     name: 'ljl',
//     friend: [
//         { name: 'YTL' },
//         { name: 'WZJ' },
//     ],
// }
// var clone = function (obj) {
//     var newObj = new obj.constructor();  // 保持继承链
//     for (var key in obj) {               // for..in..默认会遍历其原型链上的可枚举属性。
//         if (obj.hasOwnProperty(key)) {   // 不遍历其原型链上的属性
//             var val = obj[key];
//             newObj[key] = typeof val === 'object' ? arguments.callee(val) : val; // 使用arguments.callee解除与函数名的耦合
//         }
//     }
// }
// const b = clone(a)
// console.log(b);



const obj = {
    expend: [],
    income: []
}

for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
        const element = obj[key];
        console.log(element);
    }
}