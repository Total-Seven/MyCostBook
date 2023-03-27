'use strict'
const { Controller } = require('egg')
class NspController extends Controller {
    async index() {
        const { ctx, app } = this;

        const nsp = app.io.of('/');
        const message = ctx.args[0];

        const socket = ctx.socket
        const client = socket.id;

        console.log(ctx.args, client);
        try {
            nsp.emit('res', `over`);
        } catch (error) {
            app.logger.error(error);
            console.log(error);
        }

        await socket.emit('res', `CNM! I've got your message: SB,${message}`);

        socket.on('message', async () => {
            await socket.emit('res', `CNM! I've got your message: SB`);
        })
    }
    async exchange() {
        const { ctx, app } = this;
        const nsp = app.io.of('/');
        const message = ctx.args[0] || {};
        const socket = ctx.socket;
        const client = socket.id;

        try {
            console.log('Nsp-exchange');

            const { target, payload } = message;
            if (!target) return;
            const msg = ctx.helper.parseMsg('exchange', payload, { client, target });
            nsp.emit(target, msg);
        } catch (error) {
            app.logger.error(error);
        }
    }

}
module.exports = NspController;