const Controller = require('egg').Controller;

const room = 'book';

const userMap = new Map()
// 存储用户映射表
// const userSocketId = userMap.get(`${userId}`) || null
// if (!userSocketId) {
//     userMap.set(userId, id)
//     userMap.delete('undefined')
// }
// if (args[0] === 'enterRoom') return
// // 给指定房间的每个人发送消息
// nsp.to(room).emit('UsersList', userMap);
/**
 * 模块：账本 
 * 涉及用户： 邀请者(多人账本创建者)、受邀请者
 *** 不论哪种用户进入，都存入用户映射表  ------  book(Client事件)
 * 


 * 邀请者动作：
 *** 1. 发送邀请 or 创建账本并向多人发送邀请  ------  book(Clinet、Service事件)
 *** 2. 等待邀请响应   ------  promise(Service事件)
 *** 3. 若对方同意  ------  agree(事件)
 ********* ①前端用户表立即多一个头
 ********* ②任何用户修改账本都会实时显示
 *** 4. 若不同意  ------  refuse(事件)
 ********* ①给发送者返回一个拒绝消息
 ********* ②Nothing
 *** 5. 若对方未登录   ------  waiting(Service事件)
 ********* ①将消息存入“message”表
 ********* ②当用户上线时，若message表有该用户消息，会弹出消息框
 ****************** 同意
 *************************** 是否有用户正在多人账本中
 ************************************ 是
 ********************************************* 与3.x相同
 ************************************ 否
 ********************************************* 只修改数据库
 ****************** 不同意 
 *************************** 与4.x相同


 * 受邀请者
 *** 1. 处理邀请
 *** 2. 同意
 *** 3. 不同意 
 *** 4. 进入多人账本
 *
 * 
 * 事件名（首字母小写，驼峰）
 * NSP:'/'
 * Room: 'book' 、 'global'
 * 
 * 事件表    Side    Event           Describe
 *         Client    Book    邀请者 向 服务器 发送 邀请 信息(有数据和无数据，无数据代表仅登入记录映射表,有数据即发送邀请)
 * 
 *         Client   Receive  受邀请者 向 服务器 回复 信息(Agree or Refuse)
 * 
 *        Service   Invite   服务器 向 受邀请者 发送 邀请 信息
 *        Service   Success   服务器 向 受邀请者 发送 “进入成功” 信息
 * 
 *        Service   Promise  服务器 向 邀请者 发送 “发送成功” 消息
 *        Service    Error   服务器 向 邀请者 发送 “发送失败” 消息
 *        Service   Waiting  服务器 向 邀请者 发送 "请等待" 消息
 *        Service   Agree    服务器 向 邀请者 发送 "已成功(对方同意)" 消息
 *        Service   Refuse   服务器 向 邀请者 发送 "已失败(对方拒绝)" 消息
 * 
 *        Service  newUser${BookId}   服务器 向 该账本所有在线用户 发送 “邀请成功” 消息
 */
class HomeController extends Controller {
    async index() {
        // Utils
        function emit(userId, event, message, socket = nsp.sockets) {
            socket[userId].emit(event, message)
        }
        // This.ctx
        const { app, query, args, socket } = this.ctx;
        // 参数
        const { bookId } = query
        const { data, msg } = args[0]
        const { targetUser, senderUser } = data
        // nameSpace
        const nsp = app.io.of('/');
        // 给谁发, socket连接的id
        const id = socket.id;
        //返回失败通知
        !query && !args && emit(id, 'error', '400 Error')

            // if (msg === 'del') {
            //     // 删除账本
            //     emit(id, 'promise', 'Send Delete Successed') // 返回发送成功通知

            //     return
            // }

            /**
             * 邀请用户加入账本
             * 
             * msg==='invitt
             */
            ; (function () {
                emit(id, 'promise', 'Send invite successed') // 返回发送成功通知
                //  发送广播 -- 找目标用户
                nsp.adapter.clients(['global'], (err, clients) => {
                    // console.table(JSON.stringify(clients));
                    for (let index = 0; index < clients.length; index++) {

                        const client = clients[index];

                        nsp.sockets[client].emit(`invite${client}`, {
                            msg: `🔈： ${targetUser}同学在吗?收到请回复`,
                            data: {
                                sender: senderUser,
                                targetUser,
                                id: client, //Socket Id
                                bookId,
                            }
                        });

                    }
                });
                emit(id, 'waiting', 'Waiting Please...') //返回等待通知
            })()
        /**
         * 返回
         */
        this.ctx.body = "发送成功";
    }
}

module.exports = HomeController;