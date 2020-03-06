const api = {
    user: {
        register: '/api/user/register',
        login: '/api/user/login',
        list: '/api/user/list',
        edit: '/api/user/edit',
        del: '/api/user/del',
        getAppName: '/api/user/getAppName'
    },
    application: {
        add: '/api/application/add',
        edit: '/api/application/edit',
        del: '/api/application/del',
        list: '/api/application/list'
    },
    authorize: {
        token: '/api/authorize/token',
        list: '/api/authorize/list',
        del: '/api/authorize/del'
    }
};

module.exports = api;
