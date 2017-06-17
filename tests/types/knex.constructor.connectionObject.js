'use strict';
const assert = require('chai').assert;
const connectionTypes = require('../../bin/types/knex.constructor.connectionObject.js')();
// const signet = require('../../bin/types/loader.signet')();

describe('knex constructor connection object', function () {
    it('will be valid wih a host, user, password, and database are provided', function () {
        const connection = {
            host: '127.0.0.1',
            user: 'your_database_user',
            password: 'your_database_password',
            database: 'myapp_test'
        };

        assert.isTrue(connectionTypes.isValid(connection));
    });

    it('will be not be valid when a host is missing', function () {
        const connection = {
            user: 'your_database_user',
            password: 'your_database_password',
            database: 'myapp_test'
        };

        assert.isFalse(connectionTypes.isValid(connection));
    });

    it('will give a nice error message when  host is missing', function () {
        const connection = {
            user: 'your_database_user',
            password: 'your_database_password',
            database: 'myapp_test'
        };

        this.verify(connectionTypes.getError(connection));
    });
});