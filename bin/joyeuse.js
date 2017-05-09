'use strict';

var knexFactory = require('knex');
var typeBuilder = require('./typeBuilder');
var types = require('./types');
var signet = typeBuilder.signet;

function getFactory(constuctorInfo) {
    var expectedType = typeBuilder.asVariant('undefined', types.typeNames.knex.knexConstructorParam);

    if (!signet.isTypeOf(types.typeNames.knex.knexConstructorParam)(constuctorInfo)) {
        // var typeErrors = ['constuctor was not the correct type', ''];
        
        throw new Error(types.knex.getConstructorError(constuctorInfo).valueString);
    }


    var knex = knexFactory(constuctorInfo);

    return {
        knex: knex
    }
};

module.exports = {
    getFactory: getFactory
}