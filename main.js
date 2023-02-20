const { formatCount, formatDate, ArrOperator__nestArr } = require('./testtest.js')

// console.log(formatCount());
// console.log(formatDate());
// ArrOperator__nestArr()


console.info('你会打印多层对象吗？');
/**
 * 
 * JSON.stringify()
 * console.dir()
 */
function print_nest_Obj() {
    const obj = {
        name: 'ljl',
        num: 123,
        adress: {
            sheng: '福建省',
            shi: '福州市',
            xian: '福清市'
        }
    }
    console.log(JSON.stringify(obj, null, 2))
    console.dir(obj, { depth: 2 })   // 0  null  1  

}
