# typesValidation.js

## Types Validation

A module used to validate custome types and get useful type errors.

example:
```javascript
    var typeValidation = require('joyeuse').typeValidation;
```

### costructTypeError

Used to return a type error structure.

signature:
```
    name:string, typeDef:string, value:* => typeError
```

returns:
```
{
    name: string,
    type: string,
    value: *
}
```

example:
```javascript
    var error = typeValidation.costructTypeError('age', 'int', true);

    /*
    returns:
    {
        name: 'age',
        type: 'int'
        value: true
    }
    */
```

### getErrors

Used to validate a type and returns a list of errors.

signature:
```
    [name:string], typedef:string, value:* => typeError
```

simple example (success):
```javascript
    var success = typeValidation.getErrors('int', 5);
    var success2 = typeValidation.getErrors('age', 'int', 5);

    // returns: []
```

simple example (failure):
```javascript
    var falures = typeValidation.getErrors('int', true);

    /*
    returns:
    [
        {
            name: '',
            type: 'int',
            value: true
        }
    ]
    */

    var falures2 = typeValidation.getErrors('age', 'int', true);

    /*
    returns:
    [
        {
            name: 'age',
            type: 'int',
            value: true
        }
    ]
    */
```

complex example (success):
```javascript
    var personTypeDef = {
        name: 'string',
        age: 'variant<int>',
        address: {
            street: 'string'
            number: 'int'
            state: 'string'
        },
    };

    var person = {
        name: 'jason',
        address: {
            street: 'Main St.',
            number: 123,
            state: 'CA'
        }
    }

    var successComplex = typeValidation('person', personTypeDef, person);

    // returns: []
```

complex example (failure):
```javascript
    var personTypeDef = {
        name: 'string',
        age: 'variant<int>',
        address: {
            street: 'string'
            number: 'int'
            state: 'string'
        },
    };

    var person = {
        name: 'jason',
        age: true,
        address: {
            number: '123',
            state: 'CA'
        }
    }

    var failureComplex = typeValidation('person', personTypeDef, person);

    /*
    returns:
    [
        {
            name: 'person',
            type: {
                name: 'string',
                age: 'variant<int>',
                address: {
                    street: 'string'
                    number: 'int'
                    state: 'string'
                },
            value: {
                name: 'jason',
                age: true,
                address: {
                    number: '123',
                    state: 'CA'
                }
        },
        {
            name: 'person.age',
            type: 'variant<int>',
            value: true
        },
        {
            name: 'person.address'
            type: {
                street: 'string'
                number: 'int'
                state: 'string'
            },
            value:{
                number: '123',
                state: 'CA'
            }
        },
        {
            name: 'person.address.number',
            type: 'int',
            value: '123'
        }
    ]
    */
```
