# typeBuilder.js

## Type Builder

**This module is used to build a custom type system for use with Joyeuse**

example:

    var typeBuilder = require('typeBuilder');

### Signet

[Signet](https://www.npmjs.com/package/signet) is the underlying type system used by Joyeuse

example:
<code>
    var signet = typeBuilder.signet;
</code>
### isUndefined

Returns whether or not an item is undefined. this is the same as:

    typeof item === 'undefined'

signature:
    * => boolean

example

    var result = questionableCall();
    if(typeBuilder.isUndefined(result)) {
    ...
    }

### asArrayDefString

Creates the type definition for either a typed or untyped array

signature:

    [string] => string

example:

    // untyped array
    var arrayDef = typeBuilder.asArrayDefString();
    // returns: 'array'
    
    var typedDef = typeBuilder.asArrayDefString('number');
    // returns: 'array<number>'

### asVariantDefString

Creates the type definition for a variant type

signature:

    ...string => string

example:

    var variant = typeBuilder.asVariantDefString('int', 'string');
    // returns 'variant<int; string>'

### asFormattedStringDefString

Creates the type definition for a string that must follow a defined format.

signature:

    regexString => string

example:

    var usPhoneDef = typeBuilder.asFormattedStringDefString('(\\d{3}\\-)?\d{3}\\-?\d{4}');
    // returns: 'formattedString<(\\d{3}\\-)?\d{3}\\-?\d{4}>'

### asOptionalParameterDefString

Creates the type definition for an optional parameter to a function.

signature:

    string => string

example:

    var optionalParam = typeBuilder.asOptionalParameterDefString('int');
    returns: '[int]'

### asOptionalPropertyDefString

Creates the type definition for an optional property of an object. This allows the property to not be present but guarantees the property is of the correct type if it exists.

signature:

    string => string

example:

    var optionalProp = typeBuilder.asOptionalPropertyDefString('boolean');
    // returns 'variant<undefined;boolean>'

### asBoundedIntDefString

Creates a type definition for an integer that is bounded by at least the min value.

signature:

    min:int, [max:int] => string

example:

	// left bounded, minimum only given int
	var lbounded = typeBuilder.asBoundedIntDefString(2);
	// returns 'boundedInt<2, Infinity>'

### asFunctionalDefString

Creates a type definition for a function.

signature:

    input:variant<string;array<string>>, output:string => string

example:

    //function with no parameters
    var noParams = typeBuilder.asFunctionalDefString('()', 'boolean');
    // returns: '() => boolean'
    
    // function with one parameter
    var oneParam = typeBuilder.asFunctionalDefString('int', 'string');
    // returns: 'int => string'
    
    // function with 2 parameters
    var twoParam = typeBuilder.asFunctionalDefString(['int', 'boolean'], 'number');
    // returns: 'int, boolean => number'
    
### asStringEnum

Creates a type for a constrained string array that must have only strings of given values.

signature:

    ...string => undefined

example:

    typeBuilder.asStringEnumDefString('jason', 'joe', 'bob');
