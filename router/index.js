const fs = require('fs');
const path = require('path');
const router = require('koa-router')();
const api = require('../api');
const ctrls = require('../controllers');

/* 默认进入登录页面 */
const index = ctx => {
    ctx.type = 'html';
    const defaultPath = path.join(__dirname, '../public/login.html');
    ctx.body = fs.createReadStream(defaultPath);
};

const routes = router
    .get('/', index)
    /* 用户模块 */
    .post(api.user.register, ctrls.user.register) //注册
    .post(api.user.login, ctrls.user.login) //登录
    .get(api.user.list, ctrls.user.list) //列表
    .post(api.user.edit, ctrls.user.edit) //编辑
    .post(api.user.del, ctrls.user.del) //编辑
    .get(api.user.getAppName, ctrls.user.getAppName) //获取用户名

    /* 应用模块 */
    .post(api.application.add, ctrls.application.add) //添加
    .post(api.application.edit, ctrls.application.edit) //编辑
    .post(api.application.del, ctrls.application.del) //编辑
    .get(api.application.list, ctrls.application.list) //列表

    /* 鉴权token模块 */
    .post(api.authorize.token, ctrls.authorize.token) //token
    .get(api.authorize.list, ctrls.authorize.list) //list
    .post(api.authorize.del, ctrls.authorize.del) //list

    .routes();

module.exports = routes;
