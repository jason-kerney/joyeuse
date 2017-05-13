'use strict';

var typeBuilder = require('./typeBuilder');
var validator = require('./typesValidation');
var when = require('./when')();
var signet = typeBuilder.signet;

var typeNames = {
    ip4: {
        format: 'ip4String',
    },
    knex: {
        connectionType: 'knexConnectionType',
        connectionString: 'knexConnectionString',
        connectionObject: 'knexConnectionObject',
        connectionFileObject: 'knexConnectionFileObject',
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
        arrayHasDuplicates: hasDuplicates,
    };
}());

var ip4 = (function () {
    var ip4Format = 'ip4Format';
    var ip4Regex = '(localhost)|(([0-2]?\\d?\\d)\\.([0-2]?\\d?\\d)\\.(\\d?\\d?\\d)\\.([0-2]?\\d?\\d))';
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

    function getConnectionPoolDef() {
        return {
            minMax: { min: typeBuilder.asBoundedInt(0), max: typeBuilder.asBoundedInt(0) },
            afterCreate: { afterCreate: 'connectionMethodForConnectionPool' },
        };
    }

    function getConnectionPoolErrors(prefix) {
        return function (connectionPool) {
            if (typeBuilder.isUndefined(connectionPool)) {
                return [];
            }

            if (!typeBuilder.isUndefined(connectionPool.min) || !(typeBuilder.isUndefined(connectionPool.max))) {
                return validator.getErrors(prefix + "pool", getConnectionPoolDef().minMax, connectionPool);
            }
            
            return validator.getErrors(prefix + "pool", getConnectionPoolDef().minMax, connectionPool.afterCreate);

        };
    }

    const allowedDatabases = ['postgres', 'mssql', 'mysql', 'mariadb', 'sqlite3', 'oracle'];
    signet.subtype(typeNames.requiredString)(typeNames.knex.clients, function (value) {
        return allowedDatabases.includes(value);
    });

    signet.defineDuckType('connectionMethodForConnectionPool', { query: 'function' });

    var connectionPoolDef = getConnectionPoolDef();

    signet.defineDuckType(typeNames.knex.connectionPool + 'MinMax', connectionPoolDef.minMax);

    signet.defineDuckType(connectionAfterCreate, connectionPoolDef.afterCreate)

    signet.alias(typeNames.knex.connectionPool, typeBuilder.asVariant(typeNames.knex.connectionPool + 'MinMax', connectionAfterCreate));

    return {
        getConnectionPoolDef: getConnectionPoolDef,
        getConnectionPoolErrors: getConnectionPoolErrors,
        allowedDatabases: allowedDatabases,
        isClient: signet.isTypeOf(typeNames.knex.clients),
        isConnectionPool: signet.isTypeOf(typeNames.knex.connectionPool),
    };
}());

var connectionParts = (function () {
    var knexConnectionObject = typeNames.knex.connectionObject;
    var knexConnectionFileObject = typeNames.knex.connectionFileObject;

    function getKnexConnectionDef() {
        return {
            objectDef:
            {
                host: typeBuilder.asOptionalProperty(typeNames.ip4.format),
                socketPath: typeBuilder.asOptionalProperty(typeNames.path),
                user: typeNames.requiredString,
                password: typeBuilder.asOptionalProperty(typeNames.requiredString),
                database: typeNames.requiredString,
            },
            pathObjectDef: {
                filename: typeNames.path,
            },
            connectionStringDef: typeNames.requiredString,
        };
    }

    const connectionName = 'connection';

    function mightBeConnectionObject(value) {
        return signet.isTypeOf('object')(value)
            && (
                !typeBuilder.isUndefined(value.host)
                || !typeBuilder.isUndefined(value.socketPath)
            );
    }

    function mightBeConnectionPathObject(value) {
        return signet.isTypeOf('object')(value);
    }

    function defaultCondition() {
        return true;
    }

    function validateConnectionObject(prefix) {
        return function (value) {
            return validator.getErrors(prefix + connectionName, knexConnectionTypes.objectDef, value);
        };
    }

    function validateConnectionPathObject(prefix) {
        return function (value) {
            return validator.getErrors(prefix + connectionName, knexConnectionTypes.pathObjectDef, value);
        };
    }

    function getConnectionErrors(namePrefix) {
        return when()
            .cond(mightBeConnectionObject, validateConnectionObject(namePrefix))
            .cond(mightBeConnectionPathObject, validateConnectionPathObject(namePrefix))
            .cond(defaultCondition, function (value) {
                return validator.getErrors(namePrefix + connectionName, typeNames.requiredString, value);
            })
            .match;
    }

    return {
        getKnexConnectionDef: getKnexConnectionDef,
        getConnectionErrors: getConnectionErrors,
    };
}());

var knex = (function () {
    function getKnexConstructorDef() {
        return {
            client: typeNames.knex.clients,
            searchPath: typeBuilder.asOptionalProperty(typeNames.requiredString),
            debug: typeBuilder.asOptionalProperty('boolean'),
            pool: typeBuilder.asOptionalProperty(typeNames.knex.connectionPool),
            acquireConnectionTimeout: typeBuilder.asOptionalProperty(typeBuilder.asBoundedInt(0)),
        };
    }


    function getConstuctorParameterErrors(constructorParameter) {

        var constructorParameterName = 'constructorParameter';
        var connectionName = constructorParameterName + '.connection';

        var connectionErrors = connectionParts.getConnectionErrors(constructorParameterName + ".")(constructorParameter.connection);
        var connectionPoolErrors = knexBaseTypes.getConnectionPoolErrors(constructorParameterName + ".")(constructorParameter.pool);


        var errors = validator.getErrors(constructorParameterName, getKnexConstructorDef(), constructorParameter);

        return errors.concat(connectionPoolErrors).concat(connectionErrors);
    }

    function getConstructorParameterErrorMessage(constuctorInfo) {
        var header = [
            'constuctor was not the correct type',
            '',
            'object recieved from constuctor:',
            JSON.stringify(constuctorInfo, null, 4),
            '',
            'Knex is the underlying library. To understand what it is expecting read:',
            'http://knexjs.org/',
            '',
            'Below is a list of properties and whether or not they pass validation.',
            '',
        ].join('\r\n');

        var errors = getConstuctorParameterErrors(constuctorInfo);
        var isGood = errors.length === 0;

        function ErrorToString(error) {
            return error.property_name + ": " + String(error.value_given) + "\r\nExpected type: " + error.type;
        }

        return {
            valueString: isGood ? '' : '\r\n' + header + '\r\n' + errors.map(ErrorToString).join('\r\n') + '\r\n',
            errors: errors
        };
    }

    signet.extend(typeNames.knex.knexConstructorParam, function (constuctor) {
        return getConstructorParameterErrorMessage(constuctor).errors.length === 0;
    })


    var knexChecker = {
        baseTypes: knexBaseTypes,
        getKnexConnectionDef: connectionParts.getKnexConnectionDef,
        getKnexConstructorDef: getKnexConstructorDef,
        isKnexConstructor: signet.isTypeOf(typeNames.knex.knexConstructorParam),
        getConstuctorParameterErrors: getConstuctorParameterErrors,
        getConstructorParameterErrorMessage: getConstructorParameterErrorMessage,
    };

    return knexChecker;
}());

var joyeuseTypes = (function () {
    var dbFlags = ['readonly']
    var columnType = {
        name: typeNames.requiredString,
        flags: typeNames.joyeuse.columnFlags,
    };

    function isDbFlag(item) {
        return dbFlags.includes(item);
    }

    signet.alias('arrayString', typeBuilder.asArray('string'));
    signet.subtype('arrayString')(typeNames.joyeuse.columnFlags,
        function (params) {
            var allItemsAreValid = params.filter(isDbFlag).length === params.length;

            return (
                (params.length > 0)
                && (allItemsAreValid)
                && (!baseTypes.arrayHasDuplicates(params))
            );
        });

    return {
        dbFlags: dbFlags,
        isDbFlagType: signet.isTypeOf(typeNames.joyeuse.columnFlags),
    };
}());

module.exports = {
    ip4: ip4,
    base: baseTypes,
    knex: knex,
    joyeuse: joyeuseTypes,
    typeNames: typeNames,
};