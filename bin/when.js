'use strinct';

const typeBuilder = require('./typeBuilder')();
const signet = typeBuilder.signet;

const initialCond = 'initialCond';
const initialCondDuck = { cond: 'function' };
const conditionalBuilder = 'conditionalBuilder';

signet.defineDuckType(initialCond, initialCondDuck);
signet.defineDuckType(conditionalBuilder, { cond:'function', match:'function' });

module.exports = function () {

    const when = signet.sign(typeBuilder.asFunctionalDefString(typeBuilder.asOptionalParameterDefString('function'), conditionalBuilder), function (transformer) {
        var conditions = [];

        const trueXformer = typeBuilder.isUndefined(transformer) ? function (item) { return item; } : transformer;

        const match = signet.sign('* => *', function (value) {
            const xformed = trueXformer(value);
            const found = conditions.find(function (condition) {
                return condition.condition(xformed);
            });

            if(typeBuilder.isUndefined(found))
            {
                return { warning: 'no condition was successful' };
            }

            return found.action(value);
        });

        const cond = signet.sign('function, function => conditionalBuilder', function (condition, action){
            var trueCondition;
            if(signet.isTypeOf('string')(condition)) {
                trueCondition = signet.isTypeOf(condition);
            } else
                if (signet.isTypeOf('function')) {
                trueCondition = function(v) { return Boolean(condition(v)); }
            } else {
                throw new Error("expect a predicate or type");
            }

            conditions.push({ condition: trueCondition, action: action});
            return {
                cond: cond,
                match: match
            };
        });

        return {
            cond: cond
        }
    });

    return when;
};