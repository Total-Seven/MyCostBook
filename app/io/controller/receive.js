'use strict';

const Controller = require('egg').Controller;

class ReceiveController extends Controller {
    async index() {
        receive: {
            const { app, query, socket, logger, helper, args } = this.ctx;
            // 
            const nsp = app.io.of('/');
            const message = args[0] || {};
            const msg = message.msg
            // 参数
            const { data } = message
            const { bookId, creatorId, participantId } = data
            const id = socket.id;
            // Utils
            function broadcast(client, data) {  // 广播

                nsp.sockets[client].emit(client, data)

            }
            function pullIntoTheRomm(room) {    // 拉进房间
                socket.join(room);
                nsp.sockets[id].emit(id, {
                    msg: `#watch_Id: 你已加入房间${room}`,
                    data: null
                });
            }
            // 根据id给指定连接发送消息
            nsp.sockets[id].emit('res', "Receive 消息已被接收");


            // 查询Book情况
            const [currentBook] = await app.mysql.query(`select * from book where id=${bookId}`)
            // 查询邀请者
            const [creator] = await app.mysql.query(`select * from user where id=${creatorId}`)
            // 查询被邀请者
            const [participant] = await app.mysql.query(`select * from user where id=${participantId}`)

            if (!currentBook) return

            if (msg !== 'agree') return

            // 受邀请者“同意”的处理👇
            async function update(sheet, bookId) {
                if (currentBook.multiuser === 1) return false
                else {
                    const row = {
                        id: bookId,
                        multiuser: 1,
                    };
                    const res = await app.mysql.update(sheet, row);
                    return res // 更新 posts 表中的记录
                }
            }

            update('book', bookId).then(async res => {
                pullIntoTheRomm(bookId)
                /**
                 * 成功后 
                 * To 受邀请者： 显示Book
                 * To 邀请者：   显示User
                 */

                if (!res) {
                    /**
                     * 已经是多人账本的情况
                     * 查询
                     */
                    const result = await app.mysql.query(`update multiuserbook set participants = CONCAT(participants,',${participantId}') where book_id=${bookId} `)
                    if (!result) return
                    /**
                     * 1.拿到原账本信息
                     * 2.拿到多用户账本信息
                     * 3.遍历books.participants 
                     * 4.对账本内所有用户进行查询
                     * 5.将多用户账本的信息直接添加原账本对象的属性。
                     */
                    // 1.currentBook
                    // 2.
                    const [currentmultiBook] = await app.mysql.query(`select * from multiuserbook where book_id=${bookId}`)
                    // 3.
                    // 3.1转化为数组
                    let participantList = []
                    if (!currentmultiBook.participants.includes(',')) { participantList.push(currentmultiBook.participants) }
                    else {
                        participantList = currentmultiBook.participants.split(',')
                    }
                    // 3.2
                    let userInfolist = []
                    for (let index = 0; index < participantList.length; index++) {
                        // 4.
                        const participant = participantList[index];
                        const [user] = await app.mysql.query(`select * from user where id=${participant}`)
                        userInfolist.push(user)
                    }
                    // 5.
                    currentBook.MultiInfo = {
                        MultiBookInfo: currentmultiBook,
                        ParticipantInfoList: userInfolist,
                    }
                    // 给被邀请者返回一个Book对象
                    nsp.sockets[id].emit(`success${id}`, {
                        msg: `#watch_Id: 你已加入账本${bookId},已经是多人账本了，不用创建了`,
                        code: 'old',
                        data: currentBook
                    });
                    // 给邀请者返回一个user对象
                    const broadcastData = {
                        msg: `🔈： user ${participantId} 已加入账本🎉🎉🎉`,
                        data: participant,
                    }
                    // 给邀请者返回一个user对象
                    nsp.adapter.clients([bookId], (err, clients) => {
                        for (let index = 0; index < clients.length; index++) {
                            const client = clients[index]
                            nsp.sockets[client].emit(`newUser${bookId}`, broadcastData)
                        }
                    });
                    //
                }
                else {
                    // 修改CurrentBook
                    currentBook.multiuser = 1

                    // 拿新的Book信息（multiuser改为1之后的）
                    const addrow = {
                        book_id: bookId,
                        name: currentBook.name,
                        creator_id: creatorId,
                        participants: `${creatorId},${participantId}`
                    };
                    // 新增一个 “multiuserBook”
                    async function addBook(sheet, bookId) {
                        return await app.mysql.insert(sheet, addrow); // 更新 posts 表中的记录
                    }
                    await addBook('multiuserbook', bookId).then((res) => {
                        res && foo()
                        // 给被邀请者返回一个Book对象
                        function foo() {
                            nsp.sockets[id].emit(`success${id}`, {
                                msg: `#watch_Id: 你已加入账本${bookId},创建New多人账本`,
                                data: {
                                    ...currentBook,
                                    MultiInfo: {
                                        MultiBookInfo: {
                                            id: res.insetId,
                                            ...addrow,
                                        },
                                        ParticipantInfoList: [creator, participant],
                                    }
                                },
                            });
                        }
                        // 给邀请者返回一个user对象
                        nsp.adapter.clients([bookId], (err, clients) => {
                            // console.table(JSON.stringify(clients));
                            for (let index = 0; index < clients.length; index++) {
                                const client = clients[index]
                                const broadcastData = {
                                    msg: `🔈： user ${participantId} 已加入账本🎉🎉🎉`,
                                    data: participant
                                }
                                nsp.sockets[client].emit(`newUser${bookId}`, broadcastData)
                            }
                        });
                    })
                }
            })
            // 断开连接
        }
        // this.ctx.socket.disconnect();
    }
}
module.exports = ReceiveController;