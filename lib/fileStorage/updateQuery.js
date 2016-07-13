var RGX_IS_OPERATOR = /^\$.+/;

    operators = {

        '$inc' : {
            Constr : function ( o ) {

                if ( typeof o.value !== 'number' ) throw(Error(
                    'operand of $inc must be an number'
                ));

                this.path  = o.path;
                this.value = o.value;
            },

            execute : function ( obj ) {
                var oldValue = getValue(obj, this.path);
                // TODO how to inform in runtime if typeof value is wrong?;

                setValue(obj, this.path, oldValue + this.value);

                return true;
            }
        },

        '$set' : {
            Constr : function ( o ) {

                this.path  = o.path;
                this.value = o.value;
            },

            execute : function ( obj ) {

                setValue(obj, this.path, this.value);

                return true;
            }
        },

        '$rename' : {
            Constr : function ( o ) {

                this.oldPath = o.path;
                this.newPath = o.value;
            },

            execute : function ( obj ) {

                const value = getValue(obj, this.oldPath);

                setValue(obj, this.newPath, value);
                rmParam(obj, this.oldPath);

                return true;
            }
        },
    };

function Operation ( o ) {

    this.operator = o.operator;

    operators[this.operator].Constr.call(this, o);
}

Operation.prototype.execute = function ( obj ) {
    return operators[this.operator].execute.call(this, obj);
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

function setValue ( obj, parsedPath, value ) {

    var current = obj,
        error;

    for ( var i = 0, l = parsedPath.length - 1; i < l; i++ ) {
        if (
            typeof current !== 'object' ||
            !current.hasOwnProperty( parsedPath[i] )
        ) {
            error = Error('object has no property ' + parsedPath.join('.'));
            break;
        }
        current = current[ parsedPath[i] ];
    }

    current[ parsedPath[i] ] = value;

    return error;
}

function rmParam ( obj, parsedPath ) {

    var current = obj,
        error;

    for ( var i = 0, l = parsedPath.length - 1; i < l; i++ ) {
        if (
            typeof current !== 'object' ||
            !current.hasOwnProperty( parsedPath[i] )
        ) {
            error = Error('object has no property ' + parsedPath.join('.'));
            break;
        }
        current = current[ parsedPath[i] ];
    }

    return error || delete current[parsedPath[i]];
}

function atLeastOneMatches ( arr, rgx ) {

    var hasMatch = false;

    for ( var i = 0, l = arr.length; i < l; i++ ) {
        if ( rgx.test(arr[i]) ) {
            hasMatch = true;
            break;
        }
    }

    return hasMatch;
}

function parseQuery ( query ) {

    var parsed      = parsed || [],
        isOperators = atLeastOneMatches(Object.keys(query), RGX_IS_OPERATOR);

        if ( !isOperators ) query = { '$set' : query };

        for ( var operator in query ) {

            var values = query[operator];

            if ( typeof values !== 'object' ) throw(
                'operand must be an object'
            );

            for ( var key in values ) {
                parsed.push(
                    new Operation({
                        operator : operator,
                        path     : parseParamPath(key),
                        value    : operator !== '$rename'
                                    ? values[key]
                                    : parseParamPath(values[key])
                    })
                );
            }
        }

    return parsed;
}

function Query ( query ) {
    this.parsed = parseQuery( query );
}

Query.prototype.execute = function ( obj ) {
    var parsed = this.parsed,
        failed = false;

    for ( var i = 0, l = parsed.length; i < l; i++ ) {
        var operator = parsed[i];

        if ( !operator.execute(obj) ) {
            failed = true;
            break;
        }
    }

    return !failed;
};

exports.Instance = Query;
