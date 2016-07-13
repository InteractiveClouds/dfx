var RGX_IS_OPERATOR = /^\$.+/,
    RGX_PLAIN_TYPE  = /^(?:string|number)$/,

    operators = {
        '$eq' : {
            Constr : function ( o ) {
                this.path     = parseParamPath(o.parentKey || o.key);
                this.expected = o.query[o.key];
            },

            eval : function ( obj ) {
                return getValue(obj, this.path) === this.expected;
            }
        },

        '$lt' : {
            Constr : function ( o ) {
                this.path     = parseParamPath(o.parentKey || o.key);
                this.expected = o.query[o.key];
            },

            eval : function ( obj ) {
                return getValue(obj, this.path) < this.expected;
            }
        },

        '$gt' : {
            Constr : function ( o ) {
                this.path     = parseParamPath(o.parentKey || o.key);
                this.expected = o.query[o.key];
            },

            eval : function ( obj ) {
                return getValue(obj, this.path) > this.expected;
            }
        },

        '$or' : {
            Constr : function ( o ) {

                var value = o.query[o.key];

                if ( !(value instanceof Array) ) throw(Error(
                    'operand of $or must be an array'
                ));

                this.conditions = value.map(function(query){
                    return new Query(query);
                });
            },

            eval : function ( obj ) {
                var queries = this.conditions;
                
                for ( var i = 0, l = queries.length; i < l; i++ ) {
                    var c = queries[i].test(obj);
                    if ( c ) return true;
                }

                return false;
            }
        },

        '$exists' : {
            Constr : function ( o ) {
                this.path = parseParamPath(o.parentKey || o.key);
                this.expected = o.query[o.key];
            },

            eval : function ( obj ) {
                var exists = !(getValue(obj, this.path) instanceof Error);
                return exists === this.expected;
            }
        }
    };

function Operation ( o ) {

    this.operator = o.isKeyOperator
        ? o.key
        : o.isValueTypeSimple
            ? '$eq'
            : Error('WTF'); // TODO

    if ( this.operator instanceof Error ) throw(this.operator);

    operators[this.operator].Constr.call(this, o);
}

Operation.prototype.eval = function ( obj ) {
    return operators[this.operator].eval.call(this, obj);
}

function parseParamPath ( str ) {
    return str.split('.');
}

function getValue ( obj, parsedPath ) {

    var current = obj,
        error;

    for ( var i = 0, l = parsedPath.length; i < l; i++ ) {
        if (
            typeof current !== 'object' ||
            !current.hasOwnProperty( parsedPath[i] )
        ) {
            error = Error('object has no property ' + parsedPath.join('.'));
            break;
        }
        current = current[ parsedPath[i] ];
    }

    return error || current;
}

function parseQuery ( query, parsed, parentKey ) {

    var parsed = parsed || [];

    for ( var key in query ) {
        var isKeyOperator = RGX_IS_OPERATOR.test(key),
            isValueTypeSimple = RGX_PLAIN_TYPE.test( typeof query[key] );

        if ( !isKeyOperator ) {
            if ( parentKey ) return Error('wrong syntax at ' + parentKey); // TODO explain
            if ( !isValueTypeSimple ) {
                parseQuery(
                    query[key],
                    parsed,
                    key
                );
                continue;
            }
            
        }

        parsed.push(
            new Operation({
                key : key,
                parentKey : parentKey,
                isKeyOperator : isKeyOperator,
                isValueTypeSimple : isValueTypeSimple,
                query : query
            })
        );
    }

    return parsed;
}

function Query ( query ) {
    this.parsed = parseQuery( query || {} );
}

Query.prototype.test = function ( obj ) {
    var parsed = this.parsed,
        failed = false;

    for ( var i = 0, l = parsed.length; i < l; i++ ) {
        var operator = parsed[i];

        if ( !operator.eval(obj) ) {
            failed = true;
            break;
        }
    }

    return parsed.length
        ? !failed
        : true;
};

exports.Instance = Query;
