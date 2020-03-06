const UserController = require('./user');
const ApplicationController = require('./application');
const AuthorizeController = require('./authorize');
class Controllers {
    static get user() {
        return UserController;
    }
    static get application() {
        return ApplicationController;
    }
    static get authorize() {
        return AuthorizeController;
    }
}

module.exports = Controllers;
