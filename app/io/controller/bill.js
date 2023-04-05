const Controller = require('egg').Controller;

const dayjs = require('dayjs')

// const room = 'bill';
/*
 * 事件名（首字母小写，驼峰）
 * NSP:'/'
 * Room: 'book' 、 'global'
 * 
 * 事件表    Side    Event           Describe
 *         Client    Bill    用户 向 服务器 发送 增删改查 信息(通过msg区别：‘add’，‘del’，‘modify’，‘query’)
 *         Client   Receive  
 * 
 *        Service   billAdd   服务器 向 受邀请者 发送 邀请 信息
 *        Service  billDelect   服务器 向 受邀请者 发送 “进入成功” 信息
 *        Service  billModify  服务器 向 邀请者 发送 “发送成功” 消息
 *        Service  billQuery  服务器 向 邀请者 发送 “发送成功” 消息
 * 
 *        Service    Error   服务器 向 邀请者 发送 “发送失败” 消息
 *        Service   Waiting  服务器 向 邀请者 发送 "请等待" 消息
 */
class BillController extends Controller {
    async index() {
        // Utils
        function emit(userId, event, message, socket = nsp.sockets) {
            socket[userId].emit(event, message)
        }
        function toFirstUpperCase(word) {
            return word.charAt(0).toUpperCase() + word.slice(1)
        }
        // This.ctx
        const { app, query, args, socket } = this.ctx;
        // 参数
        const { bookId } = query  //连接参数
        let { data, msg } = args[0]  //请求参数
        const { targetUser, senderUser } = data
        // nameSpace
        const nsp = app.io.of('/');
        // 给谁发, socket连接的id
        const id = socket.id;

        const [user_name] = await app.mysql.query(`select username from user where id =${data.user_id}`)
        //返回失败通知
        !query && !args && emit(id, 'error', '400 Error')

            /**
             * 分类处理 增删改查
             */
            ; (async function () {

                // 本次事件名 bill+动作
                const EVENT = 'bill' + toFirstUpperCase(msg)
                const MODE = msg === 'add' ? 'insert' : msg === 'delete' ? 'delete' : msg === 'modify' ? 'update' : 'select'
                emit(id, 'waiting', `${EVENT} , Waiting Please...`) //返回等待通知

                /**数据处理 */
                let resultDel = {}

                if (MODE === 'insert') {
                    const [book_name] = await app.mysql.query(`select name from book where id =${data.book_id}`)
                    const [type_id] = await app.mysql.query(`select type_id from category where id =${data.category_id}`)
                    const [type_name] = await app.mysql.query(`select name from type where id =${type_id.type_id}`)


                    data.book_name = book_name.name
                    data.type_id = type_id.type_id
                    data.type_name = type_name.name
                    data.date = new Date()
                }
                else if (MODE === 'delete') {
                    delete data.user_id  //这个Operator/行为 非常慢
                    resultDel = await app.mysql.query(`select * from bill where id=${data.id}`)
                    // 令属性等于 undefined, 速度会很快, 但是会导致内容泄露,
                }
                else if (MODE === 'update') {

                }
                else if (MODE === 'select') {

                }

                /**数据库处理 */
                const result = await app.mysql[MODE]('bill', data)

                if (MODE === 'delete') data = resultDel[0]

                //  发送广播 -- 同账本(room) 
                nsp.adapter.clients([`${bookId}`], (err, clients) => {
                    // console.table(JSON.stringify(clients));
                    for (let index = 0; index < clients.length; index++) {

                        const client = clients[index];

                        nsp.sockets[client].emit(EVENT, {
                            code: 200,
                            msg: `🎉：${EVENT}成功啦~`,
                            data: {
                                id: result?.insertId,
                                user_name: user_name.name,
                                ...data,
                            }
                        });
                    }

                    console.log('#io:完成bill处理', data)

                });
            })()
        /**
         * 返回
         */
        this.ctx.body = "发送成功";
    }
}

module.exports = BillController;