'use strict';

var knexFactory = require('knex');
var typeBuilder = require('./typeBuilder');
var types = require('./types');
var signet = typeBuilder.signet;

function getFactory(constuctorInfo) {
    var expectedType = typeBuilder.asVariant('undefined', types.typeNames.knex.knexConstructorParam);

    if (!signet.isTypeOf(types.typeNames.knex.knexConstructorParam)(connectionInfo)) {
        var typeErrors = [];
        var knexChecker = types.knex;
        typeErrors.push(JSON.stringify(constuctorInfo, null, 4));
        typeErrors.push('constuctorInfo:', knexChecker.isKnexConstructor(constuctorInfo))
        typeErrors.push('constuctorInfo.client:', knexChecker.knexConstructorValidator.isClient(constuctorInfo.client));
        typeErrors.push('constuctorInfo.searchPath:', knexChecker.knexConstructorValidator.isSearchPath(constuctorInfo.searchPath));
        typeErrors.push('constuctorInfo.debug:', knexChecker.knexConstructorValidator.isDebug(constuctorInfo.debug));
        typeErrors.push('constuctorInfo.pool:', knexChecker.knexConstructorValidator.isPool(constuctorInfo.debug));
        typeErrors.push('constuctorInfo.acquireConnectionTimeout:', knexChecker.knexConstructorValidator.isAcquireConnectionTimeout(constuctorInfo.acquireConnectionTimeout));

        var connectionValidation = knexChecker.knexConstructorValidator.Connection;
        var connectionObjectValidation = connectionValidation.ConnectionObject;
        typeErrors.push('constuctorInfo.connection{object}:', connectionValidation.isConnection(constuctorInfo.connection));
        typeErrors.push('constuctorInfo.connection{object}.host:', connectionObjectValidation.isHost(constuctorInfo.connection.host));
        typeErrors.push('constuctorInfo.connection{object}.user:', connectionObjectValidation.isUser(constuctorInfo.connection.user));
        typeErrors.push('constuctorInfo.connection{object}.socketPath:', connectionObjectValidation.isSocketPath(constuctorInfo.connection.socketPath));
        typeErrors.push('constuctorInfo.connection{object}.password:', connectionObjectValidation.isPassword(constuctorInfo.connection.password));
        typeErrors.push('constuctorInfo.connection{object}.database:', connectionObjectValidation.isDatabase(constuctorInfo.connection.database));

        typeErrors.push('constuctorInfo.connection{path}:', connectionValidation.knexConnectionFile.isFileNameObject(constuctorInfo.connection));
        typeErrors.push('constuctorInfo.connection{path}.fileName:', connectionValidation.knexConnectionFile.isFileName(constuctorInfo.connection.isFileName));
        
        var error = new Error("constuctor was not the correct type");
        error.typeInfo = typeErrors;
        throw error;
    }
    
    //typeBuilder.asOptionalProperty(typeNames.ip4.format)
    // if () {
    // }
    // var knex = knexFactory(connectionInfo);

    // return {
    //     knex: knex
    // };
};

module.exports = {
    getFactory: getFactory
}