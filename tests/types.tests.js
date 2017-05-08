'use strict';

var approvalsConfig = require('./test-utils/approvalsConfig');
var approvals = require('approvals').configure(approvalsConfig).mocha('./tests/approvals');

var assert = require('chai').assert;

function ipGenerator(max) {
    var values = [];

    function part() {
        return Math.floor(Math.random() * max);
    }

    for (var i = 0; i <= 1000; i++) {
        var part1 = part();
        var part2 = part();
        var part3 = part();
        var part4 = part();
        var isValid =
            part1 <= 255
            && part2 <= 255
            && part3 <= 255
            && part4 <= 255;

        values.push({
            ip: part1 + '.' + part2 + '.' + part3 + '.' + part4,
            isValid: isValid
        });
    }

    return values;
}

describe('joyeuse', function () {
    describe('type definitions', function () {

        var types = require('../bin/types');
        var ip4Types = types.ip4;

        it('should correctly validate ip4 strings', function () {
            var ips = ipGenerator(255 * 2);

            ips.forEach(function (element) {
                var check = ip4Types.isIp4String(element.ip);
                var message = check ? element.ip + " is recorded as valid" : element.ip + " is recorded as invalid";

                assert.equal(element.isValid, check, message);
            }, this);
        });

        it('should validate required strings', function () {
            var validString = "a";
            var spaceOnly = " ";
            var tabOnly = "\t";
            var undifinedString = undefined;
            var nullString = null;
            var emptyString = '';

            assert.isTrue(types.base.isRequiredString(validString), "a valid string should be valid");
            assert.isFalse(types.base.isRequiredString(spaceOnly), "a space is not a valid string");
            assert.isFalse(types.base.isRequiredString(tabOnly), "a tab is not a valid string");
            assert.isFalse(types.base.isRequiredString(undifinedString), "undifined is not a valid string");
            assert.isFalse(types.base.isRequiredString(nullString), "null is not a valid string");
            assert.isFalse(types.base.isRequiredString(emptyString), "an empty string is not a valid string");
        });

        it('should validate knex example file path as a file path', function () {
            assert.isTrue(types.base.isPath("./mydb.sqlite"));
        });

        it('should validate a unique array', function () {
            assert.isTrue(types.base.isDistinctItemArray([]), 'empty array');
            assert.isTrue(types.base.isDistinctItemArray(['hello', 'bob', 3, 2]), 'mixed array');
            assert.isFalse(types.base.isDistinctItemArray([1, 2, 1]), 'number array with duplicates');
            assert.isFalse(types.base.isDistinctItemArray(['world', 'hello', 'world']), 'string array with duplicates');
        });

        describe('knex connection object', function () {
            it('should validate a knex connection path object', function () {
                assert.isTrue(types.knex.connectionParts.isSubConnectionInfoFilePath({ filename: "./mydb.sqlite" }));
                assert.isFalse(types.knex.connectionParts.isSubConnectionInfoFilePath({ filename: 'hello?' }));
            });

            it('should validate an exceptable sql client', function () {
                var isClient = types.knex.baseTypes.isClient;
                assert.isTrue(isClient('postgres'), 'Postgres');
                assert.isTrue(isClient('mssql'), 'MSSQL');
                assert.isTrue(isClient('mariadb'), 'MariaDB');
                assert.isTrue(isClient('sqlite3'), 'SQLite3');
                assert.isTrue(isClient('oracle'), 'Oracle');

                assert.isFalse(isClient('access'), 'Access');
            });

            it('should validate a valid connection pool object', function () {
                assert.isTrue(types.knex.baseTypes.isConnectionPool({ min: 0, max: 1000 }));
            });

            it('should recognize a valid connection object with IP', function () {
                var connection = {
                    host: '192.168.1.1',
                    user: 'your.user.name',
                    password: 'your.password',
                    database: 'your.database.name'
                };

                assert.isTrue(types.knex.connectionParts.isSubConnectionInfo(connection), 'a valid connection refused')
            });

            it('should recognize a valid connection object with socet path', function () {
                var connection = {
                    socketPath: '/path/to/socket.sock',
                    user: 'your.user.name',
                    password: 'your.password',
                    database: 'your.database.name'
                };

                assert.isTrue(types.knex.connectionParts.isSubConnectionInfo(connection), 'a valid connection refused')
            });

            it('should fail with invalid path', function () {
                var connection = {
                    socketPath: '/bad/path?/to/socket.sock',
                    user: 'your.user.name',
                    password: 'your.password',
                    database: 'your.database.name'
                };

                assert.isFalse(types.knex.connectionParts.isSubConnectionInfo(connection), 'socet path needs to be valid')
            });

            it('should not allow connection to have both a socket path and a host', function () {
                var connection = {
                    host: '192.168.1.1',
                    socketPath: '/path/to/socket.sock',
                    user: 'your.user.name',
                    password: 'your.password',
                    database: 'your.database.name'
                };

                assert.isFalse(types.knex.connectionParts.isSubConnectionInfo(connection), 'a connection excepted with both socket path and host')
            });

            it('should fail if missing both a valid host and a valid socet path', function () {
                var connection = {
                    user: 'your.user.name',
                    password: 'your.password',
                    database: 'your.database.name'
                };

                assert.isFalse(types.knex.connectionParts.isSubConnectionInfo(connection), 'must have a valid host or socet path')
            });

            it('should fail if host is an invalid IP', function () {
                var connection = {
                    host: '192.168.1.300',
                    user: 'your.user.name',
                    password: 'your.password',
                    database: 'your.database.name'
                };

                assert.isFalse(types.knex.connectionParts.isSubConnectionInfo(connection), 'an invalid host was accepted')
            });

            it('should fail if user name is empty', function () {
                var connection = {
                    host: '192.168.1.300',
                    user: '',
                    password: 'your.password',
                    database: 'your.database.name'
                };

                assert.isFalse(types.knex.connectionParts.isSubConnectionInfo(connection), 'an invalid user name was accepted')
            });

            it('should fail if user name is missing', function () {
                var connection = {
                    host: '192.168.1.300',
                    password: 'your.password',
                    database: 'your.database.name'
                };

                assert.isFalse(types.knex.connectionParts.isSubConnectionInfo(connection), 'an invalid user name was accepted')
            });

            it('should fail if password is empty', function () {
                var connection = {
                    host: '192.168.1.300',
                    user: 'your.user.name',
                    password: '',
                    database: 'your.database.name'
                };

                assert.isFalse(types.knex.connectionParts.isSubConnectionInfo(connection), 'an invalid password was accepted')
            });

            it('should fail if password is missing', function () {
                var connection = {
                    host: '192.168.1.300',
                    user: 'your.user.name',
                    database: 'your.database.name'
                };

                assert.isFalse(types.knex.connectionParts.isSubConnectionInfo(connection), 'an invalid password was accepted')
            });

            it('should fail if database is empty', function () {
                var connection = {
                    host: '192.168.1.300',
                    user: 'your.user.name',
                    password: 'your.password',
                    database: ''
                };

                assert.isFalse(types.knex.connectionParts.isSubConnectionInfo(connection), 'an invalid database was accepted')
            });

            it('should fail if database is missing', function () {
                var connection = {
                    host: '192.168.1.300',
                    user: 'your.user.name',
                    password: 'your.password',
                };

                assert.isFalse(types.knex.connectionParts.isSubConnectionInfo(connection), 'an invalid database was accepted')
            });
        });

        describe('knex constructor parameter', function () {
            var isKnexConstructor = types.knex.isKnexConstructor;
            it('should validate a correct object with connection string, debug, connection pool and acquireConnectionTimeout', function () {
                var param = {
                    client: 'mysql',
                    connection: "some connection string",
                    searchPath: "some,path",
                    debug: false,
                    pool: { min: 0, max: 1000 },
                    acquireConnectionTimeout: 100,
                };

                assert.isTrue(isKnexConstructor(param))
            });

            it('should validate a correct object wit connection string and without debug, connection pool and acquireConnectionTimeout', function () {
                var param = {
                    client: 'mysql',
                    connection: "some connection string",
                    searchPath: "some,path",
                };

                assert.isTrue(isKnexConstructor(param))
            });

            it('should require a correct client', function () {
                var param = {
                    client: 'access',
                    connection: "some connection string",
                    searchPath: "some,path",
                };

                assert.isFalse(isKnexConstructor(param));
            });
        });

        describe('connect to real db', function () {
            it.only('should connect to a real db', function () {
                var joy = require('../bin/joyeuse');

                var factory = joy.getFactory({
                    client: 'mysql',
                    connection: {
                        host: 'localhost',
                        user: 'root',
                        database: 'Local instance MySQL'
                    }
                });
            });
        })
    });
});