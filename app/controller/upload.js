// 1.客户端 调用 上传接口，把图片参数传入
// 2.服务端（读） 接收 读取图片，保存
// 3.服务端（写） 把图片放到指定的文件夹（位置）
// 4.返回图片地址：host+IP+图片名称+后缀

'use strict'

const fs = require('fs')
const moment = require('moment')
const mkdirp = require('mkdirp')
const path = require('path')

const Controller = require('egg').Controller

class UpLoadController extends Controller {
    async upload() {
        const { ctx } = this
        let file = ctx.request.files[0]
        let uploadDir = ' '
        try {
            let f = fs.readFileSync(file.filepath)
            // 1.获取当前日期
            let day = moment(new Date()).format('YYYYMMDD')
            console.log('************');
            console.log('day:', day);
            console.log('************');
            // 2.创建图片路径
            day = day.toString()

            let test = ''
            let test_dir = path.join(test, day)
            console.log('************');
            console.log('test_dir:', test_dir);
            console.log('************');
            let dir = path.join(this.config.uploadDir, day)
            console.log('************');
            console.log('dir:', dir);
            console.log('************');
            let date = Date.now()
            await mkdirp(dir)
            // 3.创建图片保存的路径
            uploadDir = path.join(dir, date + path.extname(file.filename))
            console.log('************');
            console.log('uploadDir:', uploadDir);
            console.log('************');
            // 4.写入文件
            fs.writeFileSync(uploadDir, f)
        } finally {
            ctx.cleanupRequestFiles()
        }
        ctx.body = {
            code: 200,
            msg: '上传成功',
            data: uploadDir.replace(/app/g, '')
        }
    }
} module.exports = UpLoadController