const fs = require('fs');
const path = require('path');
const moment = require('moment');
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

class userController {
    static async register(ctx) {
        const filePath = path.resolve(__dirname, '../../data/user.json');
        let response = {};

        const readResult = await readFile(filePath);

        if (readResult.err) {
            response.code = 1001;
            response.msg = readResult.err;
        } else {
            const userList = JSON.parse(readResult.data);
            const requestResult = Object.assign({}, ctx.request.body);
            const userName = requestResult.name;
            let flag = false;
            for (let i = 0; i < userList.length; i++) {
                if (userList[i].name === userName) {
                    flag = true;
                    break;
                }
            }

            if (flag) {
                response.code = 1006;
                response.msg = '帐号已存在';
            } else {
                requestResult.createTime = moment().format('YYYY-MM-DD HH:mm:ss');
                userList.push(requestResult);
                const writeContent = JSON.stringify(userList);

                const writeResult = await writeFile(filePath, writeContent);
                if (writeResult.err) {
                    response.code = 1002;
                    response.msg = writeResult.err;
                } else {
                    response.code = 0;
                    response.msg = '注册成功';
                }
            }
        }

        ctx.body = response;
    }

    static async login(ctx) {
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

            let flag = 0;
            for (let i = 0; i < userList.length; i++) {
                console.log(userList[i].name, userList[i].pswd);
                console.log(userList[i].name === name && userList[i].pswd === pswd);

                if (userList[i].name === name) {
                    flag = userList[i].pswd === pswd ? 1 : 2;
                    break;
                }
            }

            if (!flag) {
                response.code = 1004;
                response.msg = '用户名不存在';
            } else if (flag == 2) {
                response.code = 1005;
                response.msg = '密码错误';
            } else {
                response.code = 0;
                response.msg = '登录成功';
                response.token = 'xxxxxxxxxx';
            }
        }

        ctx.body = response;
    }

    /**
     *查询用户列表
     *@returns {Object} 返回查询结果，列表数据包含在list中
     */
    static async list(ctx) {
        const filePath = path.resolve(__dirname, '../../data/user.json');
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

    static async edit(ctx) {
        let response = {};
        const name = ctx.request.body.name;
        const phone = ctx.request.body.phone;
        const email = ctx.request.body.email;
        if (!name) {
            response.code = 1008;
            response.msg = '参数错误，账号为空';
        } else {
            const filePath = path.resolve(__dirname, '../../data/user.json');
            const readResult = await readFile(filePath);
            if (readResult.err) {
                response.code = 1001;
                response.msg = readResult.err;
            } else {
                const list = JSON.parse(readResult.data);

                let flag = false;

                for (let i = 0; i < list.length; i++) {
                    if (list[i].name === name) {
                        list[i] = Object.assign({}, list[i], {
                            phone,
                            email
                        });
                        flag = true;
                        break;
                    }
                }

                if (!flag) {
                    response.code = 1007;
                    response.msg = '帐号不存在';
                } else {
                    const writeContent = JSON.stringify(list);

                    if (!/^\[.*\]$/.test(writeContent)) {
                        response.code = 1005;
                        response.msg = '保存失败';
                    } else {
                        const writeResult = await writeFile(filePath, writeContent);
                        if (writeResult.err) {
                            response.code = 1002;
                            response.msg = writeResult.err;
                        }
                        response.code = 0;
                        response.msg = '保存成功';
                    }
                }
            }
        }

        ctx.body = response;
    }

    static async del(ctx) {
        let response = {};
        const name = ctx.request.body.name;
        if (!name) {
            response.code = 1008;
            response.msg = '参数错误，用户name为空';
        } else {
            const filePath = path.resolve(__dirname, '../../data/user.json');
            const readResult = await readFile(filePath);
            if (readResult.err) {
                response.code = 1001;
                response.msg = readResult.err;
            } else {
                const list = JSON.parse(readResult.data);

                let flag = false;

                for (let i = 0; i < list.length; i++) {
                    if (list[i].name === name) {
                        list.splice(i, 1);
                        flag = true;
                        break;
                    }
                }

                if (!flag) {
                    response.code = 1007;
                    response.msg = '用户不存在';
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

    static async getAppName(ctx) {
        const filePath = path.resolve(__dirname, '../../data/authorize.json');
        const readResult = await readFile(filePath);
        let response = {};
        if (readResult.err) {
            response.code = 1001;
            response.msg = readResult.err;
        } else {
            const tokenList = JSON.parse(readResult.data);
            const token = ctx.request.query.token;
            let clientId = '';

            for (let i = 0; i < tokenList.length; i++) {
                if (tokenList[i].token === token) {
                    clientId = tokenList[i].client_id;
                    break;
                }
            }

            if (!clientId) {
                response.code = 1004;
                response.msg = 'token未注册或已过期';
            } else {
                const appFilePath = path.resolve(__dirname, '../../data/application.json');
                const readAppResult = await readFile(appFilePath);

                if (readAppResult.err) {
                    response.code = 1001;
                    response.msg = readResult.err;
                } else {
                    const appList = JSON.parse(readAppResult.data);
                    let appName = '';

                    for (let i = 0; i < appList.length; i++) {
                        if (appList[i].client_id === clientId) {
                            appName = appList[i].appName;
                            break;
                        }
                    }

                    if (!appName) {
                        response.code = 1004;
                        response.msg = '应用不存在';
                    } else {
                        response.code = 0;
                        response.msg = '获取应用名称成功';
                        response.data = { appName };
                    }
                }
            }
        }

        ctx.body = response;
    }
}

module.exports = userController;
