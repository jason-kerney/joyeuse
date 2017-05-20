'use strict';

const typeBuilder = require('./typeBuilder');
const validator = require('./typesValidation');
const when = require('./when')();
const getTypeNames = require('./types/typeNames');
const baseTypes = require('./types/base')();
const ip4 = require('./types/ip4')();
const knexBaseTypes = require('./types/knexBase')();
const connectionParts = require('./types/connectionParts')();

const knex = require('./types/knex')();

const connectionString = 'knexConnectionString';
const connectionObject = 'knexConnectionObject';
const connectionFileObject = 'knexConnectionFileObject';
const connectionTypeDefs = typeBuilder.asVariantDefString(connectionObject, connectionFileObject, connectionString);
const signet = typeBuilder.signet;
const typeNames = getTypeNames();

const joyeuseTypes = require('./types/joyeuse')();

module.exports = {
    ip4: ip4,
    base: baseTypes,
    knex: knex,
    joyeuse: joyeuseTypes,
    typeNames: getTypeNames(),
};