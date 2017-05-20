'use strict';

const typeBuilder = require('../typeBuilder');
const typeNames = require('./typeNames')();
const validator = require('../typesValidation');

const connectionObject = 'knexConnectionObject';
const connectionFileObject = 'knexConnectionFileObject';
const connectionString = 'knexConnectionString';
const connectionTypeDefs = typeBuilder.asVariantDefString(connectionObject, connectionFileObject, connectionString);
const when = require('../when')();

const connectionType = 'knexConnectionType';

const signet = typeBuilder.signet;

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


const knexConnectionTypes = getKnexConnectionDef();

const connectionName = 'connection';

signet.defineDuckType(connectionObject, knexConnectionTypes.objectDef);
signet.defineDuckType(connectionFileObject, knexConnectionTypes.pathObjectDef);
signet.alias(connectionString, typeNames.requiredString);
const isAConnectionObject = signet.isTypeOf(connectionTypeDefs);

function getConnectionParts() {
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
}

module.exports = getConnectionParts;