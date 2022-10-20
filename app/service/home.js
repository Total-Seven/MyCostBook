'use strict'

const service = require('egg').Service

class HomeService extends service {
  async user() {
    const { app } = this;   // ctx, app
    const QUERY_STR = '*';  // 'id, name'
    let sql = `select ${QUERY_STR} from list`;
    try {
      const result = await app.mysql.query(sql);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async adduser(name) {
    const { ctx, app } = this
    const result = await app.mysql.insert('list', { name })
    return result

  }
  async edituser(id, name) {
    let result = await this.app.mysql.update('list', { name }, {
      where: {
        id
      }
    });
    return result
  }
  async delete_user(name) {
    let result = await this.app.mysql.delete('list', { name })
    return result
  }
}
module.exports = HomeService