'use strict';

const typeNames = require('./typeNames')();
const typeBuilder = require('../typeBuilder')();
const signet = typeBuilder.signet;
const allowedDatabases = ['postgres', 'mssql', 'mysql', 'mariadb', 'sqlite3', 'oracle'];
const connectionAfterCreate = 'connectionAfterCreate';
const connectionPoolMinMax = 'connectionPoolMinMax';
const connectionPoolTypeName = typeBuilder.asVariantDefString(connectionAfterCreate, connectionPoolMinMax);

signet.subtype(typeNames.requiredString)(typeNames.knex.clients, function (value) {
    return allowedDatabases.includes(value);
});

function getKnexBaseType() {

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

    return {
        getConnectionPoolDef: getConnectionPoolDef,
        getConnectionPoolErrors: getConnectionPoolErrors,
        allowedDatabases: allowedDatabases,
        isClient: signet.isTypeOf(typeNames.knex.clients),
    };
}

module.exports = getKnexBaseType;