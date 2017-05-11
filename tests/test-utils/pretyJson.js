'use strict';

module.exports = function (item) {
    return JSON.stringify(item, null, 4) + '\r\n';
}