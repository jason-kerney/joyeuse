'use strict';
function getFunctionName(value) {
    if (value.name === '') {
        return 'annonymous_function';
    }

    return 'function ' + value.name;
}

function functionToName(key, value) {
    return ( typeof value === 'function' ? getFunctionName(value) : value );
}

module.exports = function (item) {
    return JSON.stringify(item, functionToName, 4) + '\r\n';
}