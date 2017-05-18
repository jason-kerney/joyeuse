# when.js

## When

used to programmatically define branches and call them at a later time.

example:
```javascript
    var when = require('joyeuse').when;
```

signature:
```
    [transformer:function] -> simplifiedCondType
```

_transformer_ is a function that takes a single item ant returns something else.

example:
```javascript
    var simpleCond = when(function (item) {
        return item.property;
    });
```

returns:
```
simplifiedCondType = {
    cond: predicate:(* => boolean), action:(* => *) => condType
}
```

### Simple Cond

signature:
```
    (predicate:variant<validType; * => boolean> => boolean), (action:* => *) => complexCond
```

sample:
```javascript
    var simpleCond = when(function (item) {
        return item.property;
    });

    var complexCond = simpleCond.cond('int', function(item){
        return JSON.stringify(item);
    });

    var complexCond2 = simpleCond.cond(function(xformed){
            return xformed.property === 'something';
        }, 
        function(item){
            return JSON.stringify(item);
    });
```

returns:
```
    complexCond = {
        cond: (predicate:variant<validType; * => boolean> => boolean), (action:* => *) => complexCond
        match: (item:*) => *
    }
```

**Note:** Predicate is a truthy check.

### Match

Match is the function used to execute the predefined branches. When it is called, _transformer_ is called and its result is passed to each _cond_ in turn until **one** returns true.

Then it calls the action with the original non-transformed value.

signature:
```
    (item:*) => *
```

example:
```javascript
    var checkPerson = 
        when(function (person) { return person.tag; })
            .cond('guid', function (person){
                return fetchRecord(person.tag);
            })
            .cond('string', function(person){
                return person.name + ' Notes:\r\n' + person.notes + '\r\n' + person.tag;
            })
            .cond(
                function (tag){
                    if(tag.fire){
                        return tag.fire === 'error';
                    } else {
                        return false;
                    }
                },
                function (person) {
                    return "Error"
                }
            )
            .cond(function(_){ return true; }, function(_){
                return null;
            })
            .match;

    var result = checkPerson(fetchPerson('Tom','Wendle'));
```

returns:
    Match returns whatever the _cond_ action returns.