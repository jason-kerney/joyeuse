'use strict';

var knexFactory = require('knex');
var typeBuilder = require('./typeBuilder');
var types = require('./types');
var signet = typeBuilder.signet;

function getFactory(constuctorInfo) {
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