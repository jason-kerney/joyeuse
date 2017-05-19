'use strict';

var typeBuilder = require('./typeBuilder');
var validator = require('./typesValidation');
var when = require('./when')();
var signet = typeBuilder.signet;

const connectionString = 'knexConnectionString';
const connectionObject = 'knexConnectionObject';
const connectionFileObject = 'knexConnectionFileObject';
const connectionTypeDefs = typeBuilder.asVariantDefString(connectionObject, connectionFileObject, connectionString);

function getTypeNames() {
    return {
        ip4: {
            format: 'ip4String',
        },
        knex: {
            clients: 'knexClients',
            knexConstructorParam: 'knexConstructorParam',
        },
        joyeuse: {
            columnFlags: 'columnFlags',
            retlationsTypeDef: 'retlationsTypeDef',
        },
        requiredString: 'requiredString',
        path: 'path',
        distinctItemArray: 'distinctItemArray',
        validType: 'validType',
    };
}

var typeNames = getTypeNames();

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

    signet.alias(typeNames.path, typeBuilder.asFormattedStringDefString(fullPathRegex));

    signet.subtype('string')(typeNames.requiredString, function (value) {
        return value.trim().length > 0;
    });

    // thanks: http://stackoverflow.com/questions/30735465/how-can-i-check-if-the-array-of-objects-have-duplicate-property-values
    function hasDuplicates(values) {
        return (values.some(function (item, idx) {
            return values.indexOf(item) !== idx
        }));
    }

    signet.subtype(typeBuilder.asArrayDefString())(typeNames.distinctItemArray, function (values) {
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

    signet.alias(ip4Format, typeBuilder.asFormattedStringDefString(ip4Regex));

    signet.subtype('int')(octet, function (value) { return value >= 0 && value <= 255; })

    signet.subtype(ip4Format)(typeNames.ip4.format, function (value) {
        if (value === 'localhost') {
            return true;
        }
        var octets = value.split(['.']).map(function (v) { return parseInt(v); });
        return signet.isTypeOf(typeBuilder.asArrayDefString(octet))(octets);
    });

    return {
        isIp4String: signet.isTypeOf(typeNames.ip4.format),
        isOctet: signet.isTypeOf(octet)
    };
}());

var knexBaseTypes = (function () {
    const connectionAfterCreate = 'connectionAfterCreate';
    const connectionPoolMinMax = 'connectionPoolMinMax';
    var connectionPoolTypeName = typeBuilder.asVariantDefString(connectionAfterCreate, connectionPoolMinMax);

    function getConnectionPoolDef() {
        return {
            minMax: { min: typeBuilder.asBoundedIntDefString(0), max: typeBuilder.asBoundedIntDefString(0) },
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

    return {
        getConnectionPoolDef: getConnectionPoolDef,
        getConnectionPoolErrors: getConnectionPoolErrors,
        allowedDatabases: allowedDatabases,
        isClient: signet.isTypeOf(typeNames.knex.clients),
    };
}());

var connectionParts = (function () {
    const connectionType = 'knexConnectionType';

    function getKnexConnectionDef() {
        return {
            objectDef:
            {
                host: typeBuilder.asOptionalPropertyDefString(typeNames.ip4.format),
                socketPath: typeBuilder.asOptionalPropertyDefString(typeNames.path),
                user: typeNames.requiredString,
                password: typeBuilder.asOptionalPropertyDefString(typeNames.requiredString),
                database: typeNames.requiredString,
            },
            pathObjectDef: {
                filename: typeNames.path,
            },
            connectionStringDef: typeNames.requiredString,
        };
    }

    var knexConnectionTypes = getKnexConnectionDef();


    const connectionName = 'connection';

    signet.defineDuckType(connectionObject, knexConnectionTypes.objectDef);
    signet.defineDuckType(connectionFileObject, knexConnectionTypes.pathObjectDef);
    signet.alias(connectionString, typeNames.requiredString);
    var isAConnectionObject = signet.isTypeOf(connectionTypeDefs);

    function mightBeConnectionObject(value) {
        return signet.isTypeOf('object')(value)
            && (
                !typeBuilder.isUndefined(value.host)
                || !typeBuilder.isUndefined(value.socketPath)
                || !typeBuilder.isUndefined(value.user)
                || !typeBuilder.isUndefined(value.password)
                || !typeBuilder.isUndefined(value.database)
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
            var errors = validator.getErrors(prefix + connectionName, knexConnectionTypes.objectDef, value);

            if (typeBuilder.isUndefined(value.host) && typeBuilder.isUndefined(value.socketPath)) {
                errors.push(validator.constructTypeError(prefix + connectionName + ".host", knexConnectionTypes.objectDef.host));
                errors.push(validator.constructTypeError(prefix + connectionName + ".socketPath", knexConnectionTypes.objectDef.socketPath));
            }

            return errors;
        };
    }

    function validateConnectionPathObject(prefix) {
        return function (value) {
            return validator.getErrors(prefix + connectionName, knexConnectionTypes.pathObjectDef, value);
        };
    }

    function getConnectionErrors(namePrefix) {
        return function (connection) {
            if (isAConnectionObject(connection)) {
                return [];
            }

            return when()
                .cond(mightBeConnectionObject, validateConnectionObject(namePrefix))
                .cond(mightBeConnectionPathObject, validateConnectionPathObject(namePrefix))
                .cond(defaultCondition, validator.getErrors.bind(null, namePrefix + connectionName, connectionTypeDefs))
                .match(connection);
        };
    }

    return {
        getKnexConnectionDef: getKnexConnectionDef,
        getConnectionErrors: getConnectionErrors,
    };
}());

var knex = (function () {
    const knexConstructorTypeName = 'knexConstructorType';

    var constructorType = getKnexConstructorDef();
    constructorType.connection = connectionTypeDefs;

    signet.defineDuckType(knexConstructorTypeName, constructorType);

    function getKnexConstructorDef() {
        return {
            client: typeNames.knex.clients,
            searchPath: typeBuilder.asOptionalPropertyDefString(typeNames.requiredString),
            debug: typeBuilder.asOptionalPropertyDefString('boolean'),
            acquireConnectionTimeout: typeBuilder.asOptionalPropertyDefString(typeBuilder.asBoundedIntDefString(0)),
        };
    }


    function getConstructorParameterErrors(constructorParameter) {
        var constructorTypePartial = getKnexConstructorDef();
        if (signet.isTypeOf(knexConstructorTypeName)(constructorParameter)) {
            return [];
        }

        var constructorParameterName = 'constructorParameter';
        var connectionName = constructorParameterName + '.connection';

        var connectionErrors = connectionParts.getConnectionErrors(constructorParameterName + ".")(constructorParameter.connection);
        var connectionPoolErrors = knexBaseTypes.getConnectionPoolErrors(constructorParameterName + ".")(constructorParameter.pool);

        var errors = validator.getErrors(constructorParameterName, constructorTypePartial, constructorParameter);

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

        var errors = getConstructorParameterErrors(constuctorInfo);
        var isGood = errors.length === 0;

        function ErrorToString(error) {
            return error.property_name + ": " + String(error.value_given) + "\r\nExpected type: " + error.type;
        }

        return {
            valueString: isGood ? '' : '\r\n' + header + '\r\n' + errors.map(ErrorToString).join('\r\n') + '\r\n',
            errors: errors
        };
    }


    return {
        baseTypes: knexBaseTypes,
        getKnexConnectionDef: connectionParts.getKnexConnectionDef,
        getKnexConstructorDef: getKnexConstructorDef,
        isKnexConstructor: signet.isTypeOf(knexConstructorTypeName),
        getConstuctorParameterErrors: getConstructorParameterErrors,
        getConstructorParameterErrorMessage: getConstructorParameterErrorMessage,
    };
}());

var joyeuseTypes = (function () {
    const tableColumnExpression = '[\\w\\d]+\\.[\\w\\d]+';
    const arrowExpression = '\\s\\*?\\->\\*?\\s';
    const relationshipExpression = '^' + tableColumnExpression + arrowExpression + tableColumnExpression + '$';
    const isRelationShip = new RegExp(relationshipExpression);

    signet.subtype('string')(typeNames.joyeuse.retlationsTypeDef, function (value) {
        return isRelationShip.test(value);
    });

    function getColumnFlags() {
        return ['readonly', 'hidden'];
    }

    const joyeuseTableDef = 'joyeuseTableDef';
    const joyeuseColumnDef = 'joyeuseColumnDef';

    var columnFlags = getColumnFlags();
    signet.extend(typeNames.validType, signet.isTypeOf('type'));

    function getTableDef() {
        return {
            tableName: typeNames.requiredString,
            dbQueryColumns: typeBuilder.asOptionalPropertyDefString('boolean'),
            key: typeBuilder.asArrayDefString(typeNames.requiredString),
        };
    }

    function getColumnTypeDef() {
        return {
            type: typeNames.validType,
            flags: typeNames.joyeuse.columnFlags,
        };
    }

    const tableType = getTableDef();
    const columnType = getColumnTypeDef();

    function getTableDefinitinTypeErrors(possibleTableDefinition) {
        const hasRelations = Boolean(possibleTableDefinition.relations);
        const dbQueryColumns = Boolean(possibleTableDefinition.dbQueryColumns);
        const keyColumns = Boolean(possibleTableDefinition.key) ? possibleTableDefinition.key : [];
        const columns = (Object.keys(possibleTableDefinition).filter(function (key) {
            const value = possibleTableDefinition[key];
            return signet.isTypeOf(joyeuseColumnDef)(value)
                || signet.isTypeOf('type')(value);
        }));

        var baseErrors = validator.getErrors('joyeuseTableDefinition', tableType, possibleTableDefinition);

        if (!dbQueryColumns && columns.length === 0) {
            baseErrors.push(validator.constructTypeError('joyeuseTableDefinition.column', joyeuseColumnDef, undefined));
        }


        if (!dbQueryColumns && (keyColumns.length > 0)) {
            const keyErrors = keyColumns.filter(function (keyColumn) {
                return !columns.includes(keyColumn);
            }).map(function (keyColumn) {
                return validator.constructTypeError('joyeuseTableDefinition.column_key', joyeuseColumnDef, undefined);
            });

            baseErrors = baseErrors.concat(keyErrors);
        }

        const isStringArray = signet.isTypeOf(typeBuilder.asArrayDefString('string'));
        if (hasRelations) {
            if (isStringArray(possibleTableDefinition.relations)) {
                const relations = possibleTableDefinition.relations;
                const badRelations = relations.filter(function (value){
                    return !signet.isTypeOf(typeNames.joyeuse.retlationsTypeDef)(value);
                })

                if(badRelations.length > 0){
                    baseErrors = baseErrors.concat(badRelations.map(function (badRelation){
                        return validator.constructTypeError('joyeuseTableDefinition.relations[' + relations.indexOf(badRelation) + ']', typeNames.joyeuse.retlationsTypeDef, badRelation);
                    }));
                }
            }
            else
            {
                baseErrors = baseErrors.push(validator.constructTypeError('joyeuseTableDefinition.relations', typeBuilder.asArrayDefString(typeNames.joyeuse.retlationsTypeDef), possibleTableDefinition.relations));
            }
        }

        return baseErrors;
    }

    function isTableDefinition(possibleTableDefiniton) {
        return getTableDefinitinTypeErrors(possibleTableDefiniton).length === 0;
    }

    function isColumnFlag(item) {
        return columnFlags.includes(item);
    }

    function getColumnDefinitionBuilder() {
        return signet.enforce(typeBuilder.asFunctionalDefString(typeNames.validType, joyeuseColumnDef), function type(validTypeName) {
            var columnDefinition = {
                type: validTypeName,
                flags: []
            };

            function contains(flags) {
                return function (flagToFind) {
                    return flags.filter(function (flag) {
                        return flag === flagToFind;
                    }).length > 0;
                };
            }

            function containsHidden(flags) {
                return contains(columnDefinition.flags)('hidden');
            }

            function containsReadonly(flags) {
                return contains(columnDefinition.flags)('readonly');
            }

            function hidden() {
                if (containsHidden(columnDefinition.flags)) {
                    return columnDefinition;
                }
                columnDefinition.flags.push('hidden');

                return columnDefinition;
            }

            function readonly() {
                if (contains(columnDefinition.flags)('readonly')) {
                    return columnDefinition;
                }

                columnDefinition.flags.push('readonly');
                return columnDefinition;
            }

            function init(fn) {
                if (!typeBuilder.isUndefined(columnDefinition.initFn)) {
                    return columnDefinition;
                }

                var functionSignature = typeBuilder.asFunctionalDefString('()', validTypeName);
                // signet.sign(functionSignature, fn);

                // columnDefinition.initFn = signet.enforce(functionSignature, fn);
                columnDefinition.initFn = function () {
                    var result = fn();
                    if (!signet.isTypeOf(validTypeName)(result)) {
                        throw new Error("Expected to return type of " + validTypeName);
                    }

                    return result;
                };
                return columnDefinition;
            }

            columnDefinition.hidden = hidden;
            columnDefinition.readonly = readonly;
            columnDefinition.init = init;

            return columnDefinition;
        });
    }

    function getColumnDefinitionTypeErrors(columnInfo) {
        if (signet.isTypeOf(joyeuseColumnDef)(columnInfo)) {
            return [];
        }

        var deffErrors = validator.getErrors('joyeuseColumnDefinition', joyeuseColumnDef, columnInfo);
        (Object.keys(columnType)).forEach(function (element) {
            deffErrors = deffErrors.concat(validator.getErrors(element, columnType[element], columnInfo[element]))
        }, this);

        return deffErrors;
    }

    signet.alias('arrayString', typeBuilder.asArrayDefString('string'));
    signet.subtype('arrayString')(typeNames.joyeuse.columnFlags,
        function (flags) {
            var allItemsAreValid = flags.filter(isColumnFlag).length === flags.length;

            return (
                (flags.length > 0)
                && (allItemsAreValid)
                && (!baseTypes.arrayHasDuplicates(flags))
            ) || flags.length === 0;
        });

    signet.defineDuckType(joyeuseColumnDef, columnType);
    signet.extend(joyeuseTableDef, function (value) {
        return isTableDefinition(value);
    });

    const tableValidationErrorOptions = {
        inputErrorBuilder: function (_, arg, __) {
            return "Expected a valid table definition. The errors are: \n" + JSON.stringify(getTableDefinitinTypeErrors(arg), null, 4);
        }
    };

    var table = signet.enforce(joyeuseTableDef, function table(tableDefinition) {
        return tableDefinition;
    }, tableValidationErrorOptions);

    return {
        columnDefinitionType: getColumnTypeDef(),
        columnFlags: getColumnFlags(),
        getColumnDefinitionTypeErrors: getColumnDefinitionTypeErrors,
        isColumnFlag: signet.isTypeOf(typeNames.joyeuse.columnFlags),
        isJoyeuseColumnDefinition: signet.isTypeOf(joyeuseColumnDef),
        getColumnDefinitionBuilder: getColumnDefinitionBuilder,
        getTableDefinitinTypeErrors: getTableDefinitinTypeErrors,
        isTableDefinition: isTableDefinition,
        table: table,
    };
}());

module.exports = {
    ip4: ip4,
    base: baseTypes,
    knex: knex,
    joyeuse: joyeuseTypes,
    typeNames: getTypeNames(),
};