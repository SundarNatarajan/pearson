// packages
var _ = require('underscore');
var uuid = require('node-uuid');

function getErrorInfo(code, message) {
    if (!_.isNumber(code)) {

        message = code + ': ' + message;
        code = 500;
    }

    return {
        code: code,
        message: message,
        ticket: uuid.v4()
    };


}

// EXPORTS
exports.getErrorInfo = getErrorInfo;

