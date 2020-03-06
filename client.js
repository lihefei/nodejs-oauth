const path = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const bodyParser = require('koa-bodyparser'); //post解析
//const router = require('koa-router')();
const routes = require('./router');

const app = new Koa();

app.use(bodyParser());
app.use(routes);
app.use(serve(path.join(__dirname + '/public')));

const hostName = require('./libs/getIPAdress'); //本地IP
const port = 8888; //端口
app.listen(port, hostName, () => {
    console.log(`服务运行在http://${hostName}:${port}`);
});
console.log('服务启动成功');
