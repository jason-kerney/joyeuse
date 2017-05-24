'use strict';

const tables = require('./joyeuse.table');
const schema = require('./joyeuse.schema');

module.exports = function () {
    return {
        tables: tables(),
        schema: schema(),
    }
}