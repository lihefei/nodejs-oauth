const fs = require('fs');
const path = require('path');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const koaJwt = require('koa-jwt');

/**
 * 读取json文件
 * @param {Stirng} filePath 文件路径
 * @returns {Object} 返回读取数据或错误信息
 */
function readFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', function(err, data) {
            if (err) {
                reject({ err });
            } else {
                resolve({ data: data || '[]' });
            }
        });
    });
}

/**
 * 写入json文件
 * @param {Stirng} filePath 文件路径
 * @param {Stirng} content 需要写入的内容
 * @returns {Object} 返回读取数据或错误信息
 */
function writeFile(filePath, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, content, function(err) {
            if (err) {
                console.log(err);
                reject({ err });
            } else {
                console.log('文件创建成功，地址：' + filePath);
                resolve({});
            }
        });
    });
}

class authorizeController {
    static async token(ctx) {
        const filePath = path.resolve(__dirname, '../../data/user.json');
        const readResult = await readFile(filePath);
        let response = {};
        if (readResult.err) {
            response.code = 1001;
            response.msg = readResult.err;
        } else {
            const userList = JSON.parse(readResult.data);
            const name = ctx.request.body.name;
            const pswd = ctx.request.body.pswd;

            let flag = false;
            for (let i = 0; i < userList.length; i++) {
                console.log(userList[i].name, userList[i].pswd);
                console.log(userList[i].name === name && userList[i].pswd === pswd);

                if (userList[i].name === name && userList[i].pswd === pswd) {
                    flag = true;
                    break;
                }
            }

            if (!flag) {
                response.code = 1004;
                response.msg = '用户名或密码错误';
            } else {
                const appFilePath = path.resolve(__dirname, '../../data/application.json');
                const readAppResult = await readFile(appFilePath);

                if (readAppResult.err) {
                    response.code = 1001;
                    response.msg = readAppResult.err;
                } else {
                    const appList = JSON.parse(readAppResult.data);
                    //const grant_type = ctx.request.body.grant_type;
                    const clientId = ctx.request.body.client_id;
                    const clientSecret = ctx.request.body.client_secret;

                    let appFlag = false;

                    for (let i = 0; i < appList.length; i++) {
                        console.log(appList[i].name, appList[i].pswd);

                        if (appList[i].client_id === clientId && appList[i].client_secret === clientSecret) {
                            appFlag = true;
                            break;
                        }
                    }

                    if (!appFlag) {
                        response.code = 1007;
                        response.msg = 'client_id或client_secret错误';
                    } else {
                        const tokenFilePath = path.resolve(__dirname, '../../data/authorize.json');

                        const readTokenResult = await readFile(tokenFilePath);

                        if (readTokenResult.err) {
                            response.code = 1001;
                            response.msg = readTokenResult.err;
                        } else {
                            const tokenList = JSON.parse(readTokenResult.data);
                            let userToken = {
                                name
                            };
                            const secret = 'jwt demo';
                            const token = jwt.sign(userToken, secret, { expiresIn: '1h' }); //token签名 有效期为1小时

                            let tokenFlag = false;
                            const createTime = moment().format('YYYY-MM-DD HH:mm:ss');

                            for (let i = 0; i < tokenList.length; i++) {
                                //若果已经有历史token，则更新token
                                if (tokenList[i].client_id === clientId) {
                                    tokenList[i].token = token;
                                    tokenList[i].createTime = createTime;
                                    tokenFlag = true;
                                    break;
                                }
                            }

                            if (!tokenFlag) {
                                //无历史token便新增token
                                tokenList.push({
                                    client_id: clientId,
                                    token: token,
                                    createTime: createTime
                                });
                            }

                            const writeContent = JSON.stringify(tokenList);

                            const writeResult = await writeFile(tokenFilePath, writeContent);

                            if (writeResult.err) {
                                response.code = 1002;
                                response.msg = writeResult.err;
                            } else {
                                response.code = 0;
                                response.msg = '获取token成功';
                                response.token = token;
                            }
                        }
                    }
                }
            }
        }

        ctx.body = response;
    }

    /**
     *查询Token列表
     *@returns {Object} 返回查询结果，列表数据包含在list中
     */
    static async list(ctx) {
        const filePath = path.resolve(__dirname, '../../data/authorize.json');
        let response = {};

        const readResult = await readFile(filePath);

        if (readResult.err) {
            response.code = 1001;
            response.msg = readResult.err;
        } else {
            response.code = 0;
            response.msg = '查询成功';
            response.data = readResult.data;
        }

        ctx.body = response;
    }

    static async del(ctx) {
        let response = {};
        const clientId = ctx.request.body.client_id;
        if (!clientId) {
            response.code = 1008;
            response.msg = '应用ID为空';
        } else {
            const filePath = path.resolve(__dirname, '../../data/authorize.json');
            const readResult = await readFile(filePath);
            if (readResult.err) {
                response.code = 1001;
                response.msg = readResult.err;
            } else {
                const list = JSON.parse(readResult.data);

                let flag = false;

                for (let i = 0; i < list.length; i++) {
                    if (list[i].client_id === clientId) {
                        list.splice(i, 1);
                        flag = true;
                        break;
                    }
                }

                if (!flag) {
                    response.code = 1007;
                    response.msg = '应用不存在';
                } else {
                    const writeContent = JSON.stringify(list);
                    if (!/^\[.*\]$/.test(writeContent)) {
                        response.code = 1005;
                        response.msg = '删除失败';
                    } else {
                        const writeResult = await writeFile(filePath, writeContent);
                        if (writeResult.err) {
                            response.code = 1002;
                            response.msg = writeResult.err;
                        }
                        response.code = 0;
                        response.msg = '删除成功';
                    }
                }
            }
        }

        ctx.body = response;
    }
}

module.exports = authorizeController;
