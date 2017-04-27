//Joyeuse js
var joy = require('joyeuse').getBuilder();
var signet = joy.signet;

signet.subtype('string')('char', function (value) { return value.length === 1 });
signet.subtype('string')('shortState', function (value) { return value.length === 2 && value === value.toUpperCase() });

var baseSchema = 
    {
//////// Device to User Example ////////
        SchemaName: null,
        RestrictColumns: false,
        MyDevice : Joy.table('MyDevice', {
            tableName: 'device',
            restrictColumns: true,
            key: ['id'],
            id: joy.type('int').readOnly(),
            serialNumber: 
                joy
                .type('GUID')
                .hidden()
                .readonly()
                .init(guid.new),
            active: 'boolean',
            users: 'MyUserDevice.Users'}),

        MyUser: Joy.table('MyUser', {
            tableName: 'user',
            key: ['ssoUserId'],
            ssoUserId: joy.readOnly('int'),
            name: 'string',
            devices: 'MyUserDevice.Devices'}),

        MyUserDevice: Joy.table('MyUserDevice', {
            tableName: 'userDevice',
            key: ['deviceId', 'ssoUserId'],
            deviceId: 'int',
            ssoUserId: 'int',
            devices: 'MyDevice[]',
            users: 'MyUser[]',
            relations: [
                `MyUserDevice.SsoUserId *-> MyUser.SsoUserId`,
                `MyUserDevice.DeviceId *-> MyDevice.Id`
            ],
        }),

//////// Cartesian Join Example ////////
        MyState: Joy.table('MyState',{
            tableName: 'state',
            key: ['id'],
            id: 'int',
            state: 'shortState'
        }),

        MyLetters: Joy.table('MyLetters', {
            tableName: 'letters',
            key: ['letter'],
            letter: 'char',
        }),

        MyCartesian: Joy.table('MyCartesian',{
            state: 'MyState.state',
            letter: 'MyLetters.letter',
            relations: [
                'MyState * MyLetters'
            ]
        })
    }

module.exports = joy.Build(baseSchema);


























var db = require("joyeuse").HandleReturnChecks(model => {
    console.log(modle.table + " has bad data at " + model.key + " violates: " + model.error);
});

var deviceTable = db.MyDevice;
var userTable = db.MyUser;

var devices = 
    deviceTable
    .include(deviceTable.users)
    .select(
        db.or(
            userTable.id.equals(5),
            deviceTable.id.equals(13),
            db.equals('serialNumber', '120938')
        ).and
        (
            deviceTable.active
        )
    );

var users = 
    userTable.select(db.all());

var userNames = 
    userTable.select(db.all(), userTable.name);

var usersForDevice = 
    userTable
    .select(db.MyDevice.id.equals(42));

var pagedUsersForDevice = 
    userTable
    .select(
        db.MyDevice.id.equals(42), 
        db.page({size: 5, pageNumber: 1})
    );

var success = 
    deviceTable
    .delete(devices.first());

var success =
    deviceTable.delete(db.all());

// fails wont work
var success = 
    deviceTable
    .delete();

// fails wont work
var users = 
    userTable.select();





























///-------------------------------------------

var def = 
  system.handleTypes
        .cond('columnDef', (column) => { return column; })
        .cond('string', (typeString) => { return joy.type(typeString); })
        .match(input); // throws exception if input is not string or columnDef type

var columns = [];
var filters =[];
var pagination = null;

function setPageConfig(page) {
    if (pagination === null){
        pagination = page;
    }
    else
    {
        throw "cannot have more then one pagination configuration";
    }
};

function ignore(_) {
    // intentionally left blank
};

var handler = 
  system.handleTypes
        .cond('columnSelector', (column) => { columns.push(column); })
        .cond('filter', (filter) => { filters.push(filter); })
        .cond('pagination', setPageConfig)
        .cond('*', ignore)
        .match;

parameters.forEach(function(element) {
    handler(element);
}, this);

if (filters.length === 0) {
    throw "must have a filter";
}






















// jfp need this functionality.
j.when(map) // defaults to indentity
 .cond(value1, handle_Input_When_Map_Returns_Value1) 
 .cond(value2, handle_Input_When_Map_Returns_Value2)
 .cond(value3, handle_Input_When_Map_Returns_Value3)
 .match(input);
