'use strict';

const knexFactory = require('knex');
const typeBuilderFactory = require('./typeBuilder');
const typesFactory = require('./types');

function getFactory(constuctorInfo) {
    const typeBuilder = typeBuilderFactory();
    const signet = typeBuilder.signet;
    const types = typesFactory();

    if (!types.knex.isKnexConstructor(constuctorInfo) && !typeBuilder.isUndefined(constuctorInfo)) {
        throw new Error(types.knex.getConstructorParameterErrorMessage(constuctorInfo).valueString);
    }


    var knex = knexFactory(constuctorInfo);

    return {
        knex: knex,
        type: types.joyeuse.getColumnDefinitionBuilder(),
        types: types,
        typeBuilder: typeBuilder,
        signet: signet
    }
};

module.exports = {
    getFactory: getFactory
}