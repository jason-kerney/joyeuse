'use strict';

var typeBuilder = require('./typeBuilder');
var signet = typeBuilder.signet;

var typeNames = {
    ip4: {
        format: 'ip4String',
    },
    knex: {
        connectionType: 'knexConnectionType',
        clients: 'knexClients',
        connectionPool: 'connectionPool',
    },
    requiredString: 'requiredString',
    path: 'path',
};

var baseTypes = (function () {
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

    signet.alias(typeNames.path, typeBuilder.asFormattedString(fullPathRegex));

    signet.subtype('string')(typeNames.requiredString, function (value) {
        return value.trim().length > 0;
    });

    return {
        isRequiredString: signet.isTypeOf(typeNames.requiredString),
        isPath: signet.isTypeOf(typeNames.path)
    };
})();

var ip4 = (function () {
    var ip4Format = 'ip4Format';
    var ip4Regex = '[0-2]?[0-9]?[0-9]\.[0-2]?[0-9]?[0-9]\.[0-2]?[0-9]?[0-9]';
    var octet = 'octet';

    signet.alias(ip4Format, typeBuilder.asFormattedString(ip4Regex));

    signet.subtype('int')(octet, function (value) { return value >= 0 && value <= 255; })

    signet.subtype(ip4Format)(typeNames.ip4.format, function (value) {
        var octets = value.split(['.']).map(function (v) { return parseInt(v); });
        return signet.isTypeOf(typeBuilder.asArray(octet))(octets);
    });

    return {
        isIp4String: signet.isTypeOf(typeNames.ip4.format),
        isOctet: signet.isTypeOf(octet)
    };
})();

var knexBaseTypes = (function () {
    var connectionAfterCreate = 'connectionAfterCreate';

    const allowedDatabases = ['postgres', 'mssql', 'mysql', 'mariadb', 'sqlite3', 'oracle'];
    signet.subtype(typeNames.requiredString)(typeNames.knex.clients, function (value) {
        return allowedDatabases.includes(value);
    });

    signet.defineDuckType('connectionMethodForConnectionPool', { query: 'function' });

    var connectionAfterCreateExample = {
        afterCreate: 'connectionMethodForConnectionPool'
    };
    var connectionPoolMinMaxExample = { min: typeBuilder.asBoundedInt(0), max: typeBuilder.asBoundedInt(0) };

    signet.defineDuckType(typeNames.knex.connectionPool + 'MinMax', connectionPoolMinMaxExample);

    signet.defineDuckType(connectionAfterCreate, connectionAfterCreateExample)

    signet.alias(typeNames.knex.connectionPool, typeBuilder.asVariant(typeNames.knex.connectionPool + 'MinMax', connectionAfterCreate));

    return {
        allowedDatabases: allowedDatabases,
        isClient: signet.isTypeOf(typeNames.knex.clients),
        isConnectionPool: signet.isTypeOf(typeNames.knex.connectionPool),
    };
})();

var connectionParts = (function () {
    var knexConnectionObject = 'knexConnectionObject';
    var knexConnectionFileObject = 'knexConnectionFileObject';

    var knexConnection = {
        host: typeBuilder.asOptionalProperty(typeNames.ip4.format),
        socketPath: typeBuilder.asOptionalProperty(typeNames.path),
        user: typeNames.requiredString,
        password: typeNames.requiredString,
        database: typeNames.requiredString,
    };

    var knexConnectionFile = {
        filename: typeNames.path
    };

    signet.defineDuckType(knexConnectionObject + 'Part', knexConnection);

    signet.subtype(knexConnectionObject + 'Part')(knexConnectionObject, function (conn) {
        var hasHost = signet.isTypeOf('undefined')(conn.host);
        var hasSocketPath = signet.isTypeOf('undefined')(conn.socketPath);

        return (hasHost !== hasSocketPath);
    });

    signet.defineDuckType(knexConnectionFileObject, knexConnectionFile);

    signet.alias(typeNames.knex.connectionType, typeBuilder.asVariant(typeNames.requiredString, knexConnectionFileObject, knexConnectionObject));

    return {
        isSubConnectionInfo: signet.isTypeOf(knexConnectionObject),
        isSubConnectionInfoFilePath: signet.isTypeOf(knexConnectionFileObject),
    };
})();

var knex = (function () {
    var knexConstructorParam = 'knexConstructorParam';

    var knexConstructor = {
        client: typeNames.knex.clients,
        connection: typeNames.knex.connectionType,
        searchPath: typeNames.requiredString,
        debug: typeBuilder.asOptionalProperty('boolean'),
        pool: typeBuilder.asOptionalProperty(typeNames.knex.connectionPool),
        acquireConnectionTimeout: typeBuilder.asOptionalProperty(typeBuilder.asBoundedInt(0)),
    };

    signet.defineDuckType(knexConstructorParam, knexConstructor);

    return {
        baseTypes: knexBaseTypes,
        connectionParts: connectionParts,
        isConnectionInfo: signet.isTypeOf(typeNames.knex.connectionType),
        isKnexConstructor: signet.isTypeOf(knexConstructorParam),
    };
})();

module.exports = {
    ip4: ip4,
    base: baseTypes,
    knex: knex,
    typeNames: typeNames,
};