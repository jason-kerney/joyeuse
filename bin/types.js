'use strict';
const ip4 = require('./types/ip4');
const baseTypes = require('./types/base');
const knex = require('./types/knex');
const joyeuseTypes = require('./types/joyeuse');
const getTypeNames = require('./types/typeNames');

module.exports = function () {
    return {
        ip4: ip4(),
        base: baseTypes(),
        knex: knex(),
        joyeuse: joyeuseTypes(),
        typeNames: getTypeNames(),
    };
}