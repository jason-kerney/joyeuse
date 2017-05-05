'use strict';
var typeBuilder = require('./typeBuilder');
var signet = typeBuilder.signet;

var fullPathRegex =
    '^(' +
    '(\\.{0,2})|' +
    '(\\w\\:)|' +
    '(\\w{2,}\\:\\/)|' +
    '([\\w\\d\\.\\_]+)' +
    ')?' +
    '(' +
    '\\/[\\w\\d\\.\\_]+' +
    ')+' +
    '\\/?$';

var ip4Regex = '[0-2]?[0-9]?[0-9]\.[0-2]?[0-9]?[0-9]\.[0-2]?[0-9]?[0-9]';
var ip4Format = 'ip4Format';
var ip4String = 'ip4String';
var octet = 'octet';
var requiredString = 'requiredString';
var path = 'path'
var knexConnectionObject = 'knexConnectionObject';
var knexConnectionFileObject = 'knexConnectionFileObject';
var knexConnectionType = 'knexConnectionType';
var knexConstructorParam = 'knexConstructorParam';
var knexClients = 'knexClients';
var connectionPool = 'connectionPool';
var connectionAfterCreate = 'connectionAfterCreate';

var baseTypes = (function () {
    signet.alias(path, typeBuilder.asFormattedString(fullPathRegex));

    signet.subtype('string')(requiredString, function (value) {
        return value.trim().length > 0;
    });

    return {
        isRequiredString: signet.isTypeOf(requiredString),
        isPath: signet.isTypeOf(path)
    };
})();

var ip4 = (function () {
    signet.alias(ip4Format, typeBuilder.asFormattedString(ip4Regex));

    signet.subtype('int')(octet, function (value) { return value >= 0 && value <= 255; })

    signet.subtype(ip4Format)(ip4String, function (value) {
        var octets = value.split(['.']).map(function (v) { return parseInt(v); });
        return signet.isTypeOf(typeBuilder.asArray(octet))(octets);
    });

    return {
        isIp4String: signet.isTypeOf(ip4String),
        isOctet: signet.isTypeOf(octet)
    };
})();

var knexConnection = {
    host: typeBuilder.asOptionalProperty(ip4String),
    socketPath: typeBuilder.asOptionalProperty(path),
    user: requiredString,
    password: requiredString,
    database: requiredString,
};

var knexConnectionFile = {
    filename: path
};

var knexBaseTypes = (function () {
    const allowedDatabases = ['postgres', 'mssql', 'mysql', 'mariadb', 'sqlite3', 'oracle'];
    signet.subtype(requiredString)(knexClients, function (value) {
        return allowedDatabases.includes(value);
    });

    signet.defineDuckType('connectionMethodForConnectionPool', { query: 'function' });

    var connectionAfterCreateExample = {
        afterCreate: 'connectionMethodForConnectionPool'
    };
    var connectionPoolMinMaxExample = { min: typeBuilder.asBoundedInt(0), max: typeBuilder.asBoundedInt(0) };

    signet.defineDuckType(connectionPool + 'MinMax', connectionPoolMinMaxExample);

    signet.defineDuckType(connectionAfterCreate, connectionAfterCreateExample)

    signet.alias(connectionPool, typeBuilder.asVariant(connectionPool + 'MinMax', connectionAfterCreate));

    return {
        allowedDatabases: allowedDatabases,
        isClient: signet.isTypeOf(knexClients),
        isConnectionPool: signet.isTypeOf(connectionPool),
    };
})();

signet.defineDuckType(knexConnectionObject + 'Part', knexConnection);

signet.subtype(knexConnectionObject + 'Part')(knexConnectionObject, function (conn) {
    var hasHost = signet.isTypeOf('undefined')(conn.host);
    var hasSocketPath = signet.isTypeOf('undefined')(conn.socketPath);

    return (hasHost !== hasSocketPath);
});

signet.defineDuckType(knexConnectionFileObject, knexConnectionFile);

signet.alias(knexConnectionType, typeBuilder.asVariant(requiredString, knexConnectionFileObject, knexConnectionObject));

var knexConstructor = {
    client: knexClients,
    connection: knexConnectionType,
    searchPath: requiredString,
    debug: typeBuilder.asOptionalProperty('boolean'),
    pool: typeBuilder.asOptionalProperty(connectionPool),
    acquireConnectionTimeout: typeBuilder.asOptionalProperty(typeBuilder.asBoundedInt(0)),
};

signet.defineDuckType(knexConstructorParam, knexConstructor);

module.exports = {
    ip4: ip4,
    base: baseTypes,
    knex: {
        baseTypes: knexBaseTypes,
        connectionParts: {
            isSubConnectionInfo: signet.isTypeOf(knexConnectionObject),
            isSubConnectionInfoFilePath: signet.isTypeOf(knexConnectionFileObject),
        },
        isConnectionInfo: signet.isTypeOf(knexConnectionType),
        isKnexConstructor: signet.isTypeOf(knexConstructorParam),
    }
};