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
        knexConstructorParam: 'knexConstructorParam',
    },
    joyeuse: {
        columnFlags: 'columnFlags',
    },
    requiredString: 'requiredString',
    path: 'path',
    distinctItemArray: 'distinctItemArray',
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

    // thanks: http://stackoverflow.com/questions/30735465/how-can-i-check-if-the-array-of-objects-have-duplicate-property-values
    function hasDuplicates(values) {
        return (values.some(function (item, idx) {
            return values.indexOf(item) !== idx
        }));
    }

    signet.subtype(typeBuilder.asArray())(typeNames.distinctItemArray, function (values) {
        return !hasDuplicates(values);
    });

    return {
        isRequiredString: signet.isTypeOf(typeNames.requiredString),
        isPath: signet.isTypeOf(typeNames.path),
        isDistinctItemArray: signet.isTypeOf(typeNames.distinctItemArray),
    };
}());

var joyeuseTypes = (function () {
    // const columnFlags = [];
    // signet.subtype(names.distinctItemArray)(names.joyeuse.columnFlags, function(values){
    //     if(signet.isTypeOf(typeBuilder.))
    // });
}());

var ip4 = (function () {
    var ip4Format = 'ip4Format';
    var ip4Regex = '(localhost)|(([0-2]?\\d?\\d)\\.([0-2]?\\d?\\d)\\.(\\d?\\d?\\d)\\.([0-2]?\\d?\\d))';
    // var ip4Regex = '(localhost)';
    var octet = 'octet';

    signet.alias(ip4Format, typeBuilder.asFormattedString(ip4Regex));

    signet.subtype('int')(octet, function (value) { return value >= 0 && value <= 255; })

    signet.subtype(ip4Format)(typeNames.ip4.format, function (value) {
        if (value === 'localhost') {
            return true;
        }
        var octets = value.split(['.']).map(function (v) { return parseInt(v); });
        return signet.isTypeOf(typeBuilder.asArray(octet))(octets);
    });

    return {
        isIp4String: signet.isTypeOf(typeNames.ip4.format),
        isOctet: signet.isTypeOf(octet)
    };
}());

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
}());

var connectionParts = (function () {
    var knexConnectionObject = 'knexConnectionObject';
    var knexConnectionFileObject = 'knexConnectionFileObject';

    var knexConnection = {
        host: typeBuilder.asOptionalProperty(typeNames.ip4.format),
        socketPath: typeBuilder.asOptionalProperty(typeNames.path),
        user: typeNames.requiredString,
        password: typeBuilder.asOptionalProperty(typeNames.requiredString),
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
        knexConnectionObjectValidation: {
            isHost: signet.isTypeOf(knexConnection.host),
            isSocketPath: signet.isTypeOf(knexConnection.socketPath),
            isUser: signet.isTypeOf(knexConnection.user),
            isPassword: signet.isTypeOf(knexConnection.password),
            isDatabase: signet.isTypeOf(knexConnection.database),
        },
        knexConnectionFileValidation: {
            isFileNameObject: signet.isTypeOf(knexConnectionFileObject),
            isFileName: signet.isTypeOf(knexConnectionFile.filename),
        }
    };
}());

var knex = (function () {
    var knexConstructor = {
        client: typeNames.knex.clients,
        connection: typeNames.knex.connectionType,
        searchPath: typeBuilder.asOptionalProperty(typeNames.requiredString),
        debug: typeBuilder.asOptionalProperty('boolean'),
        pool: typeBuilder.asOptionalProperty(typeNames.knex.connectionPool),
        acquireConnectionTimeout: typeBuilder.asOptionalProperty(typeBuilder.asBoundedInt(0)),
    };

    function getConstructorError(constuctorInfo) {
        var typeErrors = [];
        var knexChecker = types.knex;

        var validState = {
            client: knexChecker.knexConstructorValidator.isClient(constuctorInfo.client),
            searchPath: knexChecker.knexConstructorValidator.isSearchPath(constuctorInfo.searchPath),
            debug: knexChecker.knexConstructorValidator.isDebug(constuctorInfo.debug),
            pool: knexChecker.knexConstructorValidator.isPool(constuctorInfo.debug),
        }

        validState.isGood = 
            validState.client
            && validState.searchPath
            && validState.debug
            && validState.pool;

        typeErrors.push('constuctor was not the correct type');
        typeError.push('');
        typeErrors.push(JSON.stringify(constuctorInfo, null, 4));
        typeErrors.push('');
        typeErrors.push('http://knexjs.org/');
        typeErrors.push('constuctorInfo: ' + String(validState.isGood));
        typeErrors.push('constuctorInfo.client: ' + String(validState.client));
        typeErrors.push('constuctorInfo.searchPath: ' + String(validState.searchPath));
        typeErrors.push('constuctorInfo.debug: ' + String(validState.debug));
        typeErrors.push('constuctorInfo.pool: ' + String(pool));
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

        return typeErrors;
    }

    signet.defineDuckType(typeNames.knex.knexConstructorParam, knexConstructor);

    return {
        baseTypes: knexBaseTypes,
        connectionParts: connectionParts,
        isConnectionInfo: signet.isTypeOf(typeNames.knex.connectionType),
        isKnexConstructor: signet.isTypeOf(typeNames.knex.knexConstructorParam),
        knexConstructorValidator: {
            isClient: signet.isTypeOf(knexConstructor.client),
            Connection: {
                isConnection: signet.isTypeOf(knexConstructor.connection),
                ConnectionObject: connectionParts.knexConnectionObjectValidation,
                knexConnectionFile: connectionParts.knexConnectionFileValidation,
            },
            isSearchPath: signet.isTypeOf(knexConstructor.searchPath),
            isDebug: signet.isTypeOf(knexConstructor.debug),
            isPool: signet.isTypeOf(knexConstructor.pool),
            isAcquireConnectionTimeout: signet.isTypeOf(knexConstructor.acquireConnectionTimeout),

        },
    };
}());

module.exports = {
    ip4: ip4,
    base: baseTypes,
    knex: knex,
    typeNames: typeNames,
};