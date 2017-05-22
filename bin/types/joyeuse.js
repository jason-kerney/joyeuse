'use strict';

var tables = require('./joyeuse.table');

module.exports = function () {
    return {
        tables: tables(),
    }
}