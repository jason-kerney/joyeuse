'use strict';

const tables = require('./joyeuse.table');

module.exports = function () {
    return {
        tables: tables(),
    }
}