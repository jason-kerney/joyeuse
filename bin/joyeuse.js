'use strict';

var knexFactory = require('knex');
var typeBuilder = require('./typeBuilder');
var types = require('./types');
var signet = typeBuilder.signet;

function getFactory(constuctorInfo) {
    var expectedType = typeBuilder.asVariant('undefined', types.typeNames.knex.knexConstructorParam);

    if (!signet.isTypeOf(types.typeNames.knex.knexConstructorParam)(constuctorInfo)) {
        var typeErrors = ['constuctor was not the correct type', ''];
        var knexChecker = types.knex;
        typeErrors.push(JSON.stringify(constuctorInfo, null, 4));
        typeErrors.push('');
        typeErrors.push('http://knexjs.org/');
        typeErrors.push('constuctorInfo: ' + String(knexChecker.isKnexConstructor(constuctorInfo)));
        typeErrors.push('constuctorInfo.client: ' + String(knexChecker.knexConstructorValidator.isClient(constuctorInfo.client)));
        typeErrors.push('constuctorInfo.searchPath: ' + String(knexChecker.knexConstructorValidator.isSearchPath(constuctorInfo.searchPath)));
        typeErrors.push('constuctorInfo.debug: ' + String(knexChecker.knexConstructorValidator.isDebug(constuctorInfo.debug)));
        typeErrors.push('constuctorInfo.pool: ' + String(knexChecker.knexConstructorValidator.isPool(constuctorInfo.debug)));
        typeErrors.push('constuctorInfo.acquireConnectionTimeout: ' + String(knexChecker.knexConstructorValidator.isAcquireConnectionTimeout(constuctorInfo.acquireConnectionTimeout)));

        var connectionValidation = knexChecker.knexConstructorValidator.Connection;
        var connectionObjectValidation = connectionValidation.ConnectionObject;
        typeErrors.push('constuctorInfo.connection{object}: ' + String(connectionValidation.isConnection(constuctorInfo.connection)));
        typeErrors.push('constuctorInfo.connection{object}.host: ' + String(connectionObjectValidation.isHost(constuctorInfo.connection.host)));
        typeErrors.push('constuctorInfo.connection{object}.user: ' + String(connectionObjectValidation.isUser(constuctorInfo.connection.user)));
        typeErrors.push('constuctorInfo.connection{object}.socketPath: ' + String(connectionObjectValidation.isSocketPath(constuctorInfo.connection.socketPath)));
        typeErrors.push('constuctorInfo.connection{object}.password: ' + String(connectionObjectValidation.isPassword(constuctorInfo.connection.password)));
        typeErrors.push('constuctorInfo.connection{object}.database: ' + String(connectionObjectValidation.isDatabase(constuctorInfo.connection.database)));

        typeErrors.push('constuctorInfo.connection{path}: ' + String(connectionValidation.knexConnectionFile.isFileNameObject(constuctorInfo.connection)));
        typeErrors.push('constuctorInfo.connection{path}.fileName: ' + String(connectionValidation.knexConnectionFile.isFileName(constuctorInfo.connection.isFileName)));
        
        var error = new Error(typeErrors.join('\r\n'));
        error.typeInfo = typeErrors;
        throw error;
    }


    var knex = knexFactory(constuctorInfo);

    return {
        knex: knex
    }
};

module.exports = {
    getFactory: getFactory
}