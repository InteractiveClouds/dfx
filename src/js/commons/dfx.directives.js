/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

'use strict';
angular.module('dfx.utils', [])
.directive('dfxScreen', ['$compile', function ($compile) {
    return function(scope, element, attrs) {
        scope.$watch(
            function(scope) {
                // watch the 'bindUnsafeHtml' expression for changes
                return scope.$eval(attrs.dfxScreen);
            },
            function(value) {
                if (value) {
                    // when the 'bindUnsafeHtml' expression changes
                    // assign it into the current DOM
                    element.html(value);

                    setup_widgets_web();

                    // compile the new DOM and link it to the current scope.
                    // NOTE: we only compile .childNodes so that
                    // we don't get into infinite loop compiling ourselves
                    $compile(element.contents())(scope);
                }
            }
        );
    };
}])
.directive('dfxIncludeReplace', ['$compile', function ($compile) {
    return {
        require: 'ngInclude',
        restrict: 'A', /* optional */
        link: function (scope, element, attrs) {
            // apply application configuration for GCs
            if (dfx_app_conf && $user) {
                for (var i = 0; i < dfx_app_conf.length; i++) {
                    if ($user.roles && $user.roles.list && $user.roles.list.indexOf(dfx_app_conf[i].role) > -1) {
                        // apply every attribute configuration of this GC
                        for (var j = 0; j < dfx_app_conf[i].attributes.length; j++) {
                            if ( dfx_app_conf[i].attributes[j].value && dfx_app_conf[i].screen == dfx_current_screen ) {
                                switch (dfx_app_conf[i].attributes[j].name) {
                                    case "display":
                                        // find GC container and change ng-show
                                        element.find('[id^=' + dfx_app_conf[i].id + ']').attr('ng-show', dfx_app_conf[i].attributes[j].value);
                                        $compile( element.find('[id^=' + dfx_app_conf[i].id + ']') )(scope);
                                        break;
                                    case "disabled":
                                        // find all GC container children with ng-disabled and change the value
                                        element.find('[id^=' + dfx_app_conf[i].id + ']').find('[ng-disabled]').attr('ng-disabled', dfx_app_conf[i].attributes[j].value);
                                        //$compile(element.find('[id^=' + dfx_app_conf[i].id + ']').find('[ng-disabled]'))(scope);
                                        break;
                                    case "labelVisible":
                                        // find only first element - label itself and change the value
                                        element.find('[for^=' + dfx_app_conf[i].id + ']').first().attr('ng-show', dfx_app_conf[i].attributes[j].value);
                                        $compile( element.find('[for^=' + dfx_app_conf[i].id + ']') )(scope);
                                        break;
                                }
                            }
                        }
                    }
                }
            }

            // compile the changed DOM and link it to the current scope
            //$compile(element.find('[ng-controller]').children().contents())(scope);
        }
    };
}])
.directive('dfxGrid', function () {
    return function (scope, element, attrs) {

        // apply DataTable options
        var options = {
            "bStateSave": true,
            "iCookieDuration": 2419200,
            /* 1 month */
            "bJQueryUI": false,
            "bPaginate": ((attrs.dfxGridPaging==null || attrs.dfxGridPaging=='true') ? true : false),
            "bLengthChange": ((attrs.dfxGridPaging==null || attrs.dfxGridPaging=='true') ? true : false),
            "bFilter": ((attrs.dfxGridFilter==null || attrs.dfxGridFilter=='true') ? true : false),
            "bInfo": ((attrs.dfxGridPaging==null || attrs.dfxGridPaging=='true') ? true : false),
            "bDestroy": true,
            "sDom": '<"toolbar"lfrtip>'
        }

        var columns_definition = [];
        var explicitColumns = [];

        element.find('th').each(function (index, elem) {
            explicitColumns.push($('span:first', elem).text());
            var column_object = $('column', elem);

            var type = $('type', column_object).text();
            var model = $('model', column_object).text();
            var classes = $('classes', column_object).text();
            var style = $('style', column_object).text();
            var scope_function = $('scope-function', column_object).text();
            var html_content = $('html-content', column_object).html();

            scope_function = scope_function.substring( 0, scope_function.indexOf('(') );

            var rendering_function;
            var rendering_function_src;
            if (type=='link') {

                //rendering_function_src = 'return \'<a href="#" onclick="dfGCGridCallScopeFct(\'' + scope_function + '\', this)" class="' + classes + '" style="' + style + '">\' + data + \'</a>\';';
                rendering_function_src = "return '<a href=\"javascript:void(0)\" onclick=\"dfGCGridCallScopeFct(\\'" + scope_function + "\\', this)\" class=\"" + classes + "\" style=\"" + style + "\">' + data + '</a>';";

            } else if (type=='image') {

                rendering_function_src = "return '<a href=\"javascript:void(0)\" onclick=\"dfGCGridCallScopeFct(\\'" + scope_function + "\\', this)\" class=\"" + classes + "\" style=\"" + style + "\">";
                rendering_function_src += "<img src=\"' + data + '\"/></a>';";

            } else if (type=='html') {

                if (html_content!=null) {

                    var data_start = html_content.indexOf('{{');
                    while (data_start > -1) {
                        var data_end = html_content.indexOf('}}', data_start);
                        html_content = html_content.substring(0, data_start) + '\' + ' + html_content.substring(data_start + 2, data_end) + ' + \'' + html_content.substr(data_end+2);
                        data_start = html_content.indexOf('{{');
                    }

                    rendering_function_src = 'return \'<div class="' + classes + '" style="' + style + '">' + html_content + '</div>\';';

                }

            } else {

                rendering_function_src = 'return \'<div class="' + classes + '" style="' + style + '">\' + data + \'</div>\';';

            }

            rendering_function = new Function( 'data', 'type', 'item', rendering_function_src );

            var column_definition = {
                "mDataProp": model,
                "aTargets": [index],
                "mRender": rendering_function
            }
            columns_definition.push( column_definition );
        });

        if (explicitColumns.length > 0) {
            //options["aoColumns"] = explicitColumns;
            options["aoColumnDefs"] = columns_definition;
        }

        if (attrs.fnRowCallback) {
            options["fnRowCallback"] = scope.$eval(attrs.fnRowCallback);
        }

        // apply the plugin
        var dataTable = element.dataTable(options);
        dataTable.fnSettings().oScope = scope;
        dataTable.bind('dataLoaded', { "dt": dataTable, "scope": scope, "data_loaded_function": attrs.dfxGridDataloaded}, function (e) {
            if (e.data.data_loaded_function && e.data.data_loaded_function!='') {
                var arg_pos = e.data.data_loaded_function.indexOf('(');
                var fct_name ;
                if (arg_pos>-1) {
                    fct_name = e.data.data_loaded_function.substring( 0, arg_pos );
                } else {
                    fct_name = e.data.data_loaded_function;
                }
                var dyn_source = 'return scope.' + fct_name + '({"data": data, "dt": dt});';
                var dyn_function = new Function( 'scope', 'data', 'dt', dyn_source );
                var data = e.data.dt.fnGetData();
                dyn_function( scope, data, e.data.dt );
            }
        });

        // watch for any changes to our data, rebuild the DataTable
        scope.$watch(attrs.aaData, function (value) {
            var val = value || null;
            if (val) {
                dataTable.fnClearTable();
                dataTable.fnAddData(scope.$eval(attrs.aaData));
                dataTable.trigger('dataLoaded');
            }
        });
    };
})
.directive('dfxWizard', function () {
    return function (scope, el, attr, ngModel) {
        var o = null;
        scope.currentStep = 1;
        $(el).wizard();
        o = $(el).wizard('getObject');
        scope.numSteps = o.numSteps;
        $(el).on('changed', function(e, data){
            scope.currentStep = data.currentStep;
            scope.$broadcast('selectedItem');
        });
    };
})
// ***********************************************************
//    Additional directives used by DFX
// ***********************************************************
.directive("inputMask", ['$parse', function ($parse) {
    return {
        restrict: 'A', // only as attribute
        require: "?ngModel", // get a hold of NgModelController
        link: function (scope, el, attr, ngModel) {
            if (!ngModel) {
                return; // do nothing if no ng-model
            }

            // to correct Number
            var toNum = function(val, decSep){
                if(!decSep){
                    decSep = '.';
                }
                var toNumberRegex = new RegExp('[^0-9-\\'+decSep+']', 'g'), res = val;
                if(typeof val == 'string'){
                    res = val.replace(toNumberRegex, '');
                    if(decSep == ','){
                        res = res.replace(',', '.');
                    }
                    res = parseFloat(res);
                }
                return res;
            }
            /*
             I made my validator,
             because if there is an initial value with ng-init,
             the validation does not work correctly with min, max length.
             Check If no mask and set: ng-init=22, ng-minlength=2, ng-maxlength=10 -
             ng-init value is not added to input field
             */
            // validator
            var validate = function (value) {
                if (!ngModel.$isEmpty(value)) {
                    var minLen = (attr.ngMinlength) ? parseInt(attr.ngMinlength, 10) : 0, // ngMinlength
                        maxLen = (attr.ngMaxlength) ? parseInt(attr.ngMaxlength, 10) : 0,  // ngMaxlength
                        pattern = attr.ngPattern, // ngPattern
                        match = (pattern) ? pattern.match(/^\/(.*)\/([gim]*)$/) : 0,
                        lenErr = false, cond1 =false, cond2 = false;

                    if (match) {
                        pattern = new RegExp(match[1], match[2]);
                    }

                    ngModel.$setValidity("pattern", true);

                    // remove comma when mask is decimal to true model value
                    if(attr.inputMask == "'decimal'" && attr.maskGroupsep && typeof value == 'string') {
                        value = toNum(value, attr.maskDecsep);
                    }

                    if(typeof value == 'number'){
                        value = value.toString();
                    }

                    cond1 = minLen && value.length < minLen; // if length of value < minLength
                    cond2 = maxLen && value.length > maxLen; // if length of value > minLength

                    // check length
                    if ( (cond1) || (cond2) ) {
                        //ngModel.$setValidity("length", false);
                        lenErr = true;
                        if ( cond1) {
                            ngModel.$setValidity('minlength', false); // length < minLength
                        }
                        if( cond2 ){
                            ngModel.$setValidity("maxlength", false); // length > maxLength
                        }
                    }
                    else {
                        //ngModel.$setValidity("length", true);
                        ngModel.$setValidity("minlength", true);
                        ngModel.$setValidity("maxlength", true);
                        lenErr = false;
                    }

                    // check pattern
                    if (!lenErr) {
                        if (match && !pattern.test(value)) {
                            ngModel.$setValidity("pattern", false);
                        }
                        else {
                            ngModel.$setValidity("pattern", true);
                        }
                    }
                } else {
                    ngModel.$setValidity("length", true);
                    ngModel.$setValidity("pattern", true);
                }
                return value;
            }

            if (attr.ngModel) {
                // add custom validator
                ngModel.$parsers.push(validate);
                ngModel.$formatters.push(validate);
                /*
                 In our directive we can add $formatters that do exactly what we need and
                 $parsers, that do the other way around (parse the value before it goes to the model).
                 */
                // we need to add init value

                ngModel.$formatters.unshift(function(value) {
                    // we add
                    // what you return will be passed to the text field
                    var val = value || ngModel.$modelValue;
                    if(val){
                        // init value for inputmask
                        $(el).val(val).blur();
                        // write data to ngModel
                        ngModel.$setViewValue(val);
                        // we can get value - ngModel.$viewValue
                    }
                    return val;
                });
                /*
                 ngModel.$parsers.push(function(valueFromInput) {
                 // put the inverse logic, to transform formatted data into model data
                 // what you return, will be stored in the $scope
                 // return ...;
                 });
                 */
            }
            var props = {};
            if(attr.maskGroupsep){
                props.groupSeparator = attr.maskGroupsep;
                props.autoGroup = true;
            }
            if(attr.maskDecsep){
                props.radixPoint = attr.maskDecsep;
            }
            if(attr.maskDigits){
                props.digits = attr.maskDigits;
            }

            $(el).inputmask(scope.$eval(attr.inputMask),props); // add jquery inputmask plugin
            // keyUp
            el.on('keyup', function (e) {
                var val = el.val();
                // when mask is decimal - remove ', .' as group separator to true model value as number
                if(attr.inputMask == "'decimal'" && attr.maskGroupsep && typeof val == 'string'){
                    val = toNum(val, attr.maskDecsep)
                }
                // apply scope
                scope.$apply(function(){
                    ngModel.$setViewValue(val);
                });
            });
        }
    };
}])
.directive('dfxDate', function() {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function ($scope, el, attr, ngModel) {
            var textfield = $('input', el),
                format = $(el).data('dateFormat'),
                startDate = $(el).data('dateStart'),
                endDate = $(el).data('dateEnd'),
                childInput = $(el).find('input');
            if (childInput.hasClass('input-sm')) {
                $(el).addClass('input-group-sm');
            } else if (childInput.hasClass('input-lg')) {
                $(el).addClass('input-group-lg');
            }

            setTimeout(function() {
                if(ngModel.$viewValue){
                    $(el).attr('data-date', ngModel.$viewValue);
                    textfield.val(ngModel.$viewValue)
                }
                // date picker
                $(el).datepicker({'autoclose':true, 'forceParse': false, 'startDate': startDate, 'endDate':endDate})
                    .on('changeDate', function(e) {
                        var nDate = textfield.val();
                        $(this).attr('data-date',nDate);
                        // set model value
                        ngModel.$setViewValue(nDate);
                        // for $watch
                        $scope.$digest();
                        ngModel.$setValidity('isdate', true);
                    });
            }, 10);

            function validate(value) {
                if(value){
                    var d = isValidDate(value, format, startDate, endDate);
                    // check if it is a date
                    if (!d) {
                        ngModel.$setValidity('isdate', false);
                        //console.log('bad')
                    } else {
                        ngModel.$setValidity('isdate', true);
                        //console.log('true')
                    }
                    //console.log(ngModel.$error)
                } else {
                    if($(el).find('input').attr('required')){
                        ngModel.$setValidity('isdate', false);
                        //console.log('empty data')
                    } else {
                        ngModel.$setValidity('isdate', true);
                    }
                }
                //console.log(ngModel.$error)
            }

            $scope.$watch(function () {
                return ngModel.$viewValue;
            }, validate);
        }
    };
})
.directive('dfxText', ['$timeout', function($timeout){
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, el, attr, ngModel) {
            var init = true;
            try{
                scope.$watch(
                    attr.dfxText,
                    function( newValue, oldValue ) {
                        if (init) {
                            $timeout(function() {
                                init = false;
                                if(!newValue){
                                    newValue = attr.textBind;
                                }
                                el.text(newValue);
                            });
                        } else {
                            if(newValue != oldValue){
                                el.text(newValue);
                            }
                        }
                    }
                );
            } catch (e){}
        }
    }
}])
.directive('dfxToolTip', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, el, attr, ngModel) {
            var init = true;
            try{
                scope.$watch(
                    attr.tooltipTitle,
                    function( newValue, oldValue ) {
                        if (init) {
                            $timeout(function() {
                                init = false;
                                if(!newValue){
                                    newValue = attr.tooltipTitle;
                                }
                                $(el).tooltip({'title':newValue});
                            });
                        } else {
                            if(newValue != oldValue){
                                $(el)
                                .attr('data-original-title', newValue)
                                .tooltip('fixTitle');
                                if($(el).next('div.tooltip:visible').length){
                                    $(el).tooltip('show');
                                } else {
                                    $(el).tooltip('hide');
                                }
                            }
                        }
                    }
                );
            } catch (e){
                $(el).tooltip({'title':attr.tooltipTitle});
            }
        }
    }
}])
.directive('dfxSpinner', ['$timeout', function($timeout){
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, el, attr, ngModel) {
            if(attr.class.indexOf('input-sm') > -1){
                $(el).closest('.input-group').addClass('input-group-sm');
            } else if(attr.class.indexOf('input-lg') > -1) {
                $(el).closest('.input-group').addClass('input-group-lg');
            }
            function isInt(n) {
                return n % 1 === 0;
            }
            var opts = {
                min: attr.min || -1000000000,
                max: attr.max || 1000000000,
                step: attr.step || 1,
                verticalbuttons: !!(attr.vertical == 'yes'),
                forcestepdivisibility: 'none'
            }
            if( !isInt(parseFloat(opts.step)) ){
                opts.decimals = 2;
            }
            $(el).TouchSpin(opts);
            el.on('change', function(e){
                var val = el.val();
                scope.$apply(function(){
                    ngModel.$setViewValue(val);
                });
            }).on('keydown', function (e) {  // only number
                // Allow: backspace, delete, tab, escape, enter and .
                if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                    // Allow: Ctrl+A
                    (e.keyCode == 65 && e.ctrlKey === true) ||
                    // Allow: home, end, left, right
                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                    // let it happen, don't do anything
                    return;
                }
                // Ensure that it is a number and stop the keypress
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }

            }).on('keyup', function (e) {
                $(this).trigger('change');
            })
        }
    }
}])
.directive('dfxRating', ['$timeout', function($timeout){
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, el, attr, ngModel) {
            $timeout(function() {
                var $i = scope.$index || null,
                    $p = ($i) ? $('[id^="' + attr.id + '"]')[$i] : $('[id^="' + attr.id + '"]');
                if(attr.dataFgcolor){
                    //$('.rating-stars', $p).css({'color': attr.fgcolor});
                    $p.prev().css({'color': attr.dataFgcolor});
                }
                if(attr.dataBgcolor){
                    //$('.rating-container', $p).css({'color': attr.bgcolor});
                    $p.parent().css({'color': attr.dataBgcolor});
                }
                var opts = {
                    showCaption: !!((attr.showCaption == "true")),
                    showClear: !!((attr.showClear == "true"))
                    //size: attr.size || 'md' //TODO: is not taken into account?
                };
                el.rating('refresh',opts);
                el.on('rating.clear', function(event) {
                    scope.$apply(function() {
                        if(ngModel){
                            ngModel.$setViewValue(el.val());
                        }
                    });
                });
            }, 0);

            var updateRating = function(value) {
                el.rating('update', value);
            };
            scope.$watch(function () {
                return (ngModel) ? ngModel.$modelValue : 0;
            }, updateRating);
        }
    }
}])
.directive('dfxKnob', ['$timeout', function($timeout){
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, el, attr, ngModel) {
            var _validate = function (v, step) {
                var val = (~~ (((v < 0) ? -0.5 : 0.5) + (v/step))) * step;
                return Math.round(val * 100) / 100;
            };
            $timeout(function() {
                el.knob({
                    "min": parseInt(attr.min),
                    "max": parseInt(attr.max),
                    "step": parseInt(attr.step),
                    "draw" : function () {
                        if (attr.symbolPosition && attr.symbol) {
                            var res = '';
                            if (attr.symbolPosition == 'left'){
                                res = attr.symbol + el.val();
                            } else if(attr.symbolPosition == 'right') {
                                res = el.val() + attr.symbol;
                            }

                            $(this.i).val(res);
                        }
                    },
                    "change" : function (v) {
                        scope.$apply(function() {
                            if(ngModel){
                                ngModel.$setViewValue(_validate(v, parseInt(attr.step)));
                            }
                        });
                        if (attr.change) {
                            var bracketsPos = attr.change.indexOf('(');
                            var changeFunc = (bracketsPos > -1) ? attr.change.substring(0, bracketsPos) : attr.change;
                            if (scope[changeFunc]) {
                                scope[changeFunc]();
                            }
                        }
                    }
                });
            }, 0);
            var updateKnob = function(value) {
                if (value) el.val(value).trigger('change');
            };
            scope.$watch(function () {
                return (ngModel) ? ngModel.$modelValue : 0;
            }, updateKnob);
        }
    }
}])
.directive('dfxSlider', ['$timeout', function($timeout){
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, el, attr, ngModel) {
            $timeout(function() {
                var newOpts = {
                    range: {
                        'min': Number(attr.min) || 0,
                        'max': Number(attr.max) || 100
                    }
                };
                // start
                newOpts.start = [0];
                if(ngModel && ngModel.$modelValue){
                    newOpts.start = ngModel.$modelValue;
                } else {
                    if(attr.startMin || attr.startMax){
                        if(attr.startMin && attr.startMax){
                            newOpts.start[0] = attr.startMin;
                            newOpts.start[1] = attr.startMax;
                        } else {
                            if(attr.startMin){
                                newOpts.start[0] = attr.startMin;
                            } else if(attr.startMax) {
                                newOpts.start[0] = attr.startMax;
                            }
                        }
                    }
                }
                // connect
                if(attr.connect){
                    if(newOpts.start.length == 1 || typeof newOpts.start == 'number'){
                        if(!(attr.connect == 'lower' || attr.connect == 'upper')){
                            newOpts.connect = 'lower';
                        } else {
                            newOpts.connect = attr.connect;
                        }
                    } else if(newOpts.start.length == 2){
                        if(attr.connect == 'true' || attr.connect == 'false'){
                            newOpts.connect = !!((attr.connect == 'true'));
                        } else {
                            newOpts.connect = false;
                        }
                    }
                }
                newOpts.step = Number(attr.step) || 1;
                newOpts.orientation = attr.orientation;
                newOpts.direction = attr.direction;
                newOpts.behaviour = attr.behaviour;
                el.noUiSlider(newOpts);
                if (attr.fgcolor) {
                    $( '.noUis-connect', '#' + attr.id + '_slider').css({'background-color': attr.fgcolor});
                }
                if (attr.bgcolor) {
                    $( '.noUis-background', '#' + attr.id + '_slider').css({'background-color': attr.bgcolor});
                }
                if (attr.handlecolor) {
                    $( '.noUis-handle', '#' + attr.id + '_slider').css({'background-color': attr.handlecolor});
                }
                el.on('change slide set', function(){
                    var el_val = (el.val()) ? parseInt(el.val()) : 0;
                    var view_val = (ngModel) ? ((ngModel.$viewValue) ? parseInt(ngModel.$viewValue) : 0) : 0;
                    if (el_val != view_val) {
                        scope.$apply(function () {
                            if (ngModel) {
                                var arr = el.val();
                                if (typeof arr == 'object') {
                                    arr[0] = parseInt(arr[0]);
                                    if (arr.length == 2) {
                                        arr[1] = parseInt(arr[1]);
                                    }
                                } else {
                                    arr = parseInt(arr);
                                }
                                ngModel.$setViewValue(arr);
                            }
                        });
                    }
                });
                if (attr.onslide) {
                    var bracketsPos = attr.onslide.indexOf('(');
                    var onslideFunc = (bracketsPos > -1) ? attr.onslide.substring(0, bracketsPos) : attr.onslide;
                    if (scope[onslideFunc]) {
                        el.on('slide', scope[onslideFunc]);
                    }
                }
                if (attr.onset) {
                    var bracketsPos = attr.onset.indexOf('(');
                    var onsetFunc = (bracketsPos > -1) ? attr.onset.substring(0, bracketsPos) : attr.onset;
                    if (scope[onsetFunc]) {
                        el.on('set', scope[onsetFunc]);
                    }
                }
            }, 0);
            var updateSlider = function(value) {
                el.val(value);
            };
            scope.$watch(function () {
                return (ngModel) ? ngModel.$modelValue : 0;
            }, updateSlider);
        }
    }
}])
.directive('dfxChart', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, el, attr) {
            angular.element(document).ready(function() {
                $timeout(function() {
                    scope.$apply(function() {
                        scope.config = {};
                        scope.config.legend = {};
                        scope.config.legend.position = attr.legendPosition || 'left';
                        scope.config.legend.display = (attr.legendVisible == "yes" ? true : false);
                        scope.config.title = (attr.labelVisible == "yes") ? attr.label : '';
                        scope.config.labels = (attr.labelsDataPoints == "yes" ? true : false);
                        scope.config.tooltips = (attr.tooltips == "yes" ? true : false);
                        if(attr.innerRadius){
                            scope.config.innerRadius = attr.innerRadius;
                        }
                        var assignHandler = function(fn_name, handler_name) {
                            if (fn_name) {
                                if (fn_name.indexOf('(') !== -1) {fn_name = fn_name.substring(0, fn_name.indexOf('('));}
                                scope.config[handler_name] = scope[fn_name];
                            }
                        }
                        if (attr.chartClick) {
                            assignHandler(attr.chartClick, 'click');
                        }
                        if (attr.chartMouseover) {
                            assignHandler(attr.chartMouseover, 'mouseover');
                        }
                        if (attr.chartMouseout) {
                            assignHandler(attr.chartMouseout, 'mouseout');
                        }
                    });
                }, 0);
            });
        }
    }
}])
.directive('dfxNgSrc', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, el, attr) {
            console.log('attr.ngSrc: ', attr.ngSrc);
            console.log("el.attr('ng-src'): ", el.attr('ng-src'));

            //TODO: get tenantId, appName, check normal URL, check why expression is moved to External URL...

            // watch the Image ng-src changes to transform resource URL
            var ngSrcInitial = el.attr('ng-src'),
                chunks = ngSrcInitial.match(/\{\{([^{}]*)\}\}/);

            if (chunks) {
                scope.$watch(
                    chunks[1],
                    function( newValue, oldValue ) {
                        console.log('oldValue: ', oldValue);
                        console.log('newValue: ', newValue);
                        var ngSrcVal = newValue,
                            tenantId = 'Examples',
                            applicationName = '';

                        //if (ngSrcVal && ngSrcVal.indexOf('./') == 0)
                        var resourceSrc = '/resources/' + tenantId + '/' + applicationName + ngSrcVal;
                        el.attr('ng-src', resourceSrc);
                        el.attr('src', resourceSrc);
                    }
                );
            }

            // transform resource URL from Image ng-src
            angular.element(document).ready(function() {
                $timeout(function () {
                    var ngSrcVal = el.attr('ng-src'),
                        tenantId = 'Examples',
                        applicationName = '';


                    //if (ngSrcVal && ngSrcVal.indexOf('./') == 0)
                    var resourceSrc = '/resources/' + tenantId + '/' + applicationName + ngSrcVal;
                    el.attr('ng-src', resourceSrc);
                    el.attr('src', resourceSrc);


                }, 0);
            });
        }
    }
}])
.directive('bsSwitch', ['$parse', '$timeout', function ($parse, $timeout) {
    return {
        restrict: 'A',
        require: '?ngModel',
        scope: {
            checklist: '=dfxCheckToggle',
            value: '@'
        },
        link: function link(scope, element, attrs, controller) {
            var isInit = false;
            var fnChange = attrs.onswitch || '';
            /**
             * Return the true value for this specific checkbox.
             * @returns {Object} representing the true view value; if undefined, returns true.
             */
            var getTrueValue = function() {
                var trueValue = attrs.ngTrueValue;
                /*
                 if (!angular.isString(trueValue)) {
                 trueValue = true;
                 }
                 */
                return trueValue;
            };
            /*
             var getBooleanFromString = function(value) {
             return (value === true || value === 'true' || !value);
             };
             */
            /**
             * If the directive has not been initialized yet, do so.
             */
            var initMaybe = function() {
                // if it's the first initialization
                if (!isInit) {
                    var viewValue = (controller.$modelValue == getTrueValue()),
                        dsbl = !!((attrs.ngDisabled == "true"));

                    isInit = !isInit;
                    // Bootstrap the switch plugin
                    element.bootstrapSwitch({
                        state: viewValue,
                        disabled: dsbl
                    });
                }
            };

            var setActive = function(active) {
                element.bootstrapSwitch('disabled', !active);
            };

            /**
             * Listen to model changes.
             */
            var listenToModel = function () {
                // When the model changes
                scope.$parent.$watch(attrs.ngModel, function(newValue, oldValue) {
                    initMaybe();
                    if (newValue !== undefined) {
                        $timeout(function() {
                            //console.log(newValue, getTrueValue(), newValue === getTrueValue() )
                            element.bootstrapSwitch('state', newValue === getTrueValue());
                        }, 0, false);
                    } else {
                        if(element.attr('type') == 'checkbox'){
                            element.bootstrapSwitch('state', false, true);
                        }

                    }
                });

                // on switch
                element.on('switchChange.bootstrapSwitch', function (e, data) {
                    $timeout(function() {
                        if(fnChange && scope.$parent[fnChange]) {
                            scope.$parent[fnChange]();
                        }
                    }, 0);
                });
                // observers attributes
                attrs.$observe('switchOnText', function (newValue) {
                    element.bootstrapSwitch('onText', getValueOrUndefined(newValue));
                });

                attrs.$observe('switchOffText', function (newValue) {
                    element.bootstrapSwitch('offText', getValueOrUndefined(newValue));
                });

                attrs.$observe('switchOnColor', function (newValue) {
                    attrs.dataOn = newValue;
                    element.bootstrapSwitch('onColor', getValueOrUndefined(newValue));
                });

                attrs.$observe('switchOffColor', function (newValue) {
                    attrs.dataOff = newValue;
                    element.bootstrapSwitch('offColor', getValueOrUndefined(newValue));
                });

                attrs.$observe('switchAnimate', function (newValue) {
                    element.bootstrapSwitch('animate', scope.$eval(newValue || 'true'));
                });

                attrs.$observe('switchSize', function (newValue) {
                    element.bootstrapSwitch('size', newValue);
                });

                attrs.$observe('switchLabel', function (newValue) {
                    element.bootstrapSwitch('labelText', newValue ? newValue : '&nbsp;');
                });

                attrs.$observe('switchIcon', function (newValue) {
                    if (newValue) {
                        // build and set the new span
                        var spanClass = '<span class=\'' + newValue + '\'></span>';
                        element.bootstrapSwitch('labelText', spanClass);
                    }
                });

                attrs.$observe('switchWrapper', function (newValue) {
                    // Make sure that newValue is not empty, otherwise default to null
                    if (!newValue) {
                        newValue = null;
                    }
                    element.bootstrapSwitch('wrapperClass', newValue);
                });

                attrs.$observe('switchHandleWidth', function (newValue) {
                    element.bootstrapSwitch('handleWidth', getValueOrUndefined(newValue));
                });

                attrs.$observe('switchLabelWidth', function (newValue) {
                    element.bootstrapSwitch('labelWidth', getValueOrUndefined(newValue));
                });

            };

            /**
             * Listen to view changes.
             */
            var listenToView = function () {
                // When the switch is clicked, set its value into the ngModel
                element.on('switchChange.bootstrapSwitch', function (e, data) {
                    var newValue = (data) ? attrs.ngTrueValue : data;
                    //console.log(newValue)
                    scope.$apply(function() {
                        controller.$setViewValue(newValue);
                    });
                });
            };

            /**
             * Returns the value if it is truthy, or undefined.
             *
             * @param value The value to check.
             * @returns the original value if it is truthy, {@link undefined} otherwise.
             */
            var getValueOrUndefined = function (value) {
                return (value ? value : undefined);
            };

            // Listen and respond to view changes
            listenToView();

            // Listen and respond to model changes
            listenToModel();

            // On destroy, collect ya garbage
            scope.$on('$destroy', function () {
                element.bootstrapSwitch('destroy');
            });
        }
    };
}])
.directive('dfxRequired', ['$parse', '$timeout', function ($parse, $timeout) {
    return {
        require: '?ngModel',
        link: function($scope, elem, attrs, controller) {
            //var isInit = false;
            var idd = attrs.id.split('_'),
                realid = idd.length>1 ? idd[1] : '',
                checkboxes = elem.closest('div').find('input[type!="hidden"]'),
                arrFalseValues = [],
                arrTrueValues = [],
                allValues = {};
            var getValues = function(){
                var res = {};
                angular.forEach(checkboxes, function(el, key){
                    arrTrueValues.push(angular.element(el).attr('ng-true-value'));
                    arrFalseValues.push(angular.element(el).attr('ng-false-value'));
                });
                res.trueValues = arrTrueValues;
                res.falseValues = arrFalseValues;
                return res;
            }
            var validate = function(arr){
                var index, allValues = getValues(), isFalse=true;
                if(typeof arr =='object'){
                    for(var i= 0, len=arr.length; i<len; i++){
                        if(arr[i] == allValues.trueValues[i]) {
                            isFalse = false;
                            break;
                        }
                    }
                } else {
                    if(arr == allValues.trueValues[0]){
                        isFalse = false;
                    }
                }
                if(!isFalse){
                    controller.$setValidity('required', true);
                } else {
                    controller.$setValidity('required', false);
                }
            }
            $scope.$watchCollection(attrs.ngModel, function (newValue) {
                $timeout(function() {
                    validate(newValue);
                }, 0);
            });
        }
    };
}])
.directive('dfxCheckList', ['$parse', '$timeout', function ($parse, $timeout) {
    return {
        scope: {
            list: '=dfxCheckList',
            value: '@'
        },
        link: function(scope, elem, attrs) {
            if(!scope.list){
                scope.list = [];
            }
            var fnChange = attrs.ngChange || '';
            var handler = function(setup) {
                var checked = elem.prop('checked');
                var index = scope.list.indexOf(scope.value);

                if (checked && index == -1) {
                    if (setup) {
                        elem.prop('checked', false);
                    } else {
                        scope.list.push(scope.value);
                    }
                } else if (!checked && index != -1) {
                    if (setup){
                        elem.prop('checked', true);
                    } else {
                        scope.list.splice(index, 1);
                    }
                }
            };

            var setupHandler = handler.bind(null, true);
            var changeHandler = handler.bind(null, false);

            elem.bind('change', function() {
                scope.$apply(changeHandler);
                $timeout(function() {
                    if(fnChange && scope.$parent[fnChange]) {
                        scope.$parent[fnChange]();
                    }
                }, 0);
            });
            /*
            scope.$parent.$watch(attrs.ngModel, function(newValue) {
                console.log(attrs.id,'=',newValue)
            })
            */
            scope.$watch('list', function(newValue, oldValue){
                //scope['checked_'+attrs.name] = false;
                setupHandler();
            });
        }
    };
}])
.directive('dfxCarouselChange', ['$parse', '$timeout', function ($parse, $timeout) {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, el, attr, ngModel) {
            // if 'variable' has a value, but it's not initialized in scope
            if (scope[attr.currindex] == undefined) {
                var items = el.find('div[ng-class]');
                if (items.length > 0) angular.element(items[0]).addClass('active');
            }

            var assignHandler = function(fn_name, handler_name) {
                if (fn_name) {
                    if (fn_name.indexOf('(') !== -1) {fn_name = fn_name.substring(0, fn_name.indexOf('('));}
                }
                el.on(handler_name, function(e){
                    var carouselData = $(this).data('bs.carousel');
                    e.carouselIndex = carouselData.getItemIndex(carouselData.$element.find('.item.active'));
                    if(ngModel){
                        scope.$apply(function(){
                            ngModel.$setViewValue(e.carouselIndex);
                        });
                    }
                    if (fn_name) {
                        scope[fn_name]( e );
                    }
                });
            }
            $timeout(function() {
                if(attr.onslide || attr.onslid) {
                    if(attr.onslide){
                        assignHandler(attr.onslide, 'slide.bs.carousel');
                    }
                    if(attr.onslid){
                        assignHandler(attr.onslid, 'slid.bs.carousel');
                    }
                } else {
                    assignHandler('', 'slid.bs.carousel')
                }
            }, 0);
        }
    }
}])
.directive('abnTree', [
    '$timeout', function($timeout) {
        return {
            restrict: 'E',
            template: "<ul class=\"nav nav-list nav-pills nav-stacked abn-tree\">\n  <li ng-repeat=\"row in tree_rows | filter:{visible:true} track by row.branch.uid\" ng-animate=\"'abn-tree-animate'\" ng-class=\"'level-' + {{ row.level }} + (row.branch.selected ? ' active':'')\" class=\"abn-tree-row\">\n    <a ng-click=\"user_clicks_branch(row.branch)\">\n      <i ng-class=\"row.tree_icon\" ng-click=\"row.branch.expanded = !row.branch.expanded\" class=\"indented tree-icon\"> </i>\n      <span class=\"indented tree-label\">{{ row.label }} </span>\n    </a>\n  </li>\n</ul>",
            replace: true,
            scope: {
                treeData: '=',
                onSelect: '&',
                initialSelection: '@',
                treeControl: '='
            },
            link: function(scope, element, attrs) {
                var error, expand_all_parents, expand_level, for_all_ancestors, for_each_branch, get_parent, n, on_treeData_change, select_branch, selected_branch, tree;
                error = function(s) {
                    console.log('ERROR:' + s);
                    debugger;
                    return void 0;
                };
                if (attrs.iconExpand == null) {
                    attrs.iconExpand = 'icon-plus  glyphicon glyphicon-plus  fa fa-plus';
                }
                if (attrs.iconCollapse == null) {
                    attrs.iconCollapse = 'icon-minus glyphicon glyphicon-minus fa fa-minus';
                }
                if (attrs.iconLeaf == null) {
                    attrs.iconLeaf = 'icon-file  glyphicon glyphicon-file  fa fa-file';
                }
                if (attrs.expandLevel == null) {
                    attrs.expandLevel = '3';
                }
                expand_level = parseInt(attrs.expandLevel, 10);
                if (!scope.treeData) {
                    alert('no treeData defined for the tree!');
                    return;
                }
                if (scope.treeData.length == null) {
                    if (treeData.label != null) {
                        scope.treeData = [treeData];
                    } else {
                        alert('treeData should be an array of root branches');
                        return;
                    }
                }
                for_each_branch = function(f) {
                    var do_f, root_branch, _i, _len, _ref, _results;
                    do_f = function(branch, level) {
                        var child, _i, _len, _ref, _results;
                        f(branch, level);
                        if (branch.children != null) {
                            _ref = branch.children;
                            _results = [];
                            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                child = _ref[_i];
                                _results.push(do_f(child, level + 1));
                            }
                            return _results;
                        }
                    };
                    _ref = scope.treeData;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        root_branch = _ref[_i];
                        _results.push(do_f(root_branch, 1));
                    }
                    return _results;
                };
                selected_branch = null;
                select_branch = function(branch) {
                    if (!branch) {
                        if (selected_branch != null) {
                            selected_branch.selected = false;
                        }
                        selected_branch = null;
                        return;
                    }
                    if (branch !== selected_branch) {
                        if (selected_branch != null) {
                            selected_branch.selected = false;
                        }
                        branch.selected = true;
                        selected_branch = branch;
                        expand_all_parents(branch);
                        if (branch.onSelect != null) {
                            return $timeout(function() {
                                return branch.onSelect(branch);
                            });
                        } else {
                            if (scope.onSelect != null) {
                                return $timeout(function() {
                                    return scope.onSelect({
                                        branch: branch
                                    });
                                });
                            }
                        }
                    }
                };
                scope.user_clicks_branch = function(branch) {
                    if (branch !== selected_branch) {
                        return select_branch(branch);
                    }
                };
                get_parent = function(child) {
                    var parent;
                    parent = void 0;
                    if (child.parent_uid) {
                        for_each_branch(function(b) {
                            if (b.uid === child.parent_uid) {
                                return parent = b;
                            }
                        });
                    }
                    return parent;
                };
                for_all_ancestors = function(child, fn) {
                    var parent;
                    parent = get_parent(child);
                    if (parent != null) {
                        fn(parent);
                        return for_all_ancestors(parent, fn);
                    }
                };
                expand_all_parents = function(child) {
                    return for_all_ancestors(child, function(b) {
                        return b.expanded = true;
                    });
                };
                scope.tree_rows = [];
                on_treeData_change = function() {
                    var add_branch_to_list, root_branch, _i, _len, _ref, _results;
                    for_each_branch(function(b, level) {
                        if (!b.uid) {
                            return b.uid = "" + Math.random();
                        }
                    });
                    //console.log('UIDs are set.');
                    for_each_branch(function(b) {
                        var child, _i, _len, _ref, _results;
                        if (angular.isArray(b.children)) {
                            _ref = b.children;
                            _results = [];
                            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                child = _ref[_i];
                                _results.push(child.parent_uid = b.uid);
                            }
                            return _results;
                        }
                    });
                    scope.tree_rows = [];
                    for_each_branch(function(branch) {
                        var child, f;
                        if (branch.children) {
                            if (branch.children.length > 0) {
                                f = function(e) {
                                    if (typeof e === 'string') {
                                        return {
                                            label: e,
                                            children: []
                                        };
                                    } else {
                                        return e;
                                    }
                                };
                                return branch.children = (function() {
                                    var _i, _len, _ref, _results;
                                    _ref = branch.children;
                                    _results = [];
                                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                        child = _ref[_i];
                                        _results.push(f(child));
                                    }
                                    return _results;
                                })();
                            }
                        } else {
                            return branch.children = [];
                        }
                    });
                    add_branch_to_list = function(level, branch, visible) {
                        var child, child_visible, tree_icon, _i, _len, _ref, _results;
                        if (branch.expanded == null) {
                            branch.expanded = false;
                        }
                        if (!branch.children || branch.children.length === 0) {
                            tree_icon = attrs.iconLeaf;
                        } else {
                            if (branch.expanded) {
                                tree_icon = attrs.iconCollapse;
                            } else {
                                tree_icon = attrs.iconExpand;
                            }
                        }
                        scope.tree_rows.push({
                            level: level,
                            branch: branch,
                            label: branch.label,
                            tree_icon: tree_icon,
                            visible: visible
                        });
                        if (branch.children != null) {
                            _ref = branch.children;
                            _results = [];
                            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                child = _ref[_i];
                                child_visible = visible && branch.expanded;
                                _results.push(add_branch_to_list(level + 1, child, child_visible));
                            }
                            return _results;
                        }
                    };
                    _ref = scope.treeData;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        root_branch = _ref[_i];
                        _results.push(add_branch_to_list(1, root_branch, true));
                    }
                    return _results;
                };
                scope.$watch('treeData', on_treeData_change, true);
                if (attrs.initialSelection != null) {
                    for_each_branch(function(b) {
                        if (b.label === attrs.initialSelection) {
                            return $timeout(function() {
                                return select_branch(b);
                            });
                        }
                    });
                }
                n = scope.treeData.length;
                //console.log('num root branches = ' + n);
                for_each_branch(function(b, level) {
                    b.level = level;
                    return b.expanded = b.level < expand_level;
                });
                if (scope.treeControl != null) {
                    if (angular.isObject(scope.treeControl)) {
                        tree = scope.treeControl;
                        tree.expand_all = function() {
                            return for_each_branch(function(b, level) {
                                return b.expanded = true;
                            });
                        };
                        tree.collapse_all = function() {
                            return for_each_branch(function(b, level) {
                                return b.expanded = false;
                            });
                        };
                        tree.get_first_branch = function() {
                            n = scope.treeData.length;
                            if (n > 0) {
                                return scope.treeData[0];
                            }
                        };
                        tree.select_first_branch = function() {
                            var b;
                            b = tree.get_first_branch();
                            return tree.select_branch(b);
                        };
                        tree.get_selected_branch = function() {
                            return selected_branch;
                        };
                        tree.get_parent_branch = function(b) {
                            return get_parent(b);
                        };
                        tree.select_branch = function(b) {
                            select_branch(b);
                            return b;
                        };
                        tree.get_children = function(b) {
                            return b.children;
                        };
                        tree.select_parent_branch = function(b) {
                            var p;
                            if (b == null) {
                                b = tree.get_selected_branch();
                            }
                            if (b != null) {
                                p = tree.get_parent_branch(b);
                                if (p != null) {
                                    tree.select_branch(p);
                                    return p;
                                }
                            }
                        };
                        tree.add_branch = function(parent, new_branch) {
                            if (parent != null) {
                                parent.children.push(new_branch);
                                parent.expanded = true;
                            } else {
                                scope.treeData.push(new_branch);
                            }
                            return new_branch;
                        };
                        tree.add_root_branch = function(new_branch) {
                            tree.add_branch(null, new_branch);
                            return new_branch;
                        };
                        tree.expand_branch = function(b) {
                            if (b == null) {
                                b = tree.get_selected_branch();
                            }
                            if (b != null) {
                                b.expanded = true;
                                return b;
                            }
                        };
                        tree.collapse_branch = function(b) {
                            if (b == null) {
                                b = selected_branch;
                            }
                            if (b != null) {
                                b.expanded = false;
                                return b;
                            }
                        };
                        tree.get_siblings = function(b) {
                            var p, siblings;
                            if (b == null) {
                                b = selected_branch;
                            }
                            if (b != null) {
                                p = tree.get_parent_branch(b);
                                if (p) {
                                    siblings = p.children;
                                } else {
                                    siblings = scope.treeData;
                                }
                                return siblings;
                            }
                        };
                        tree.get_next_sibling = function(b) {
                            var i, siblings;
                            if (b == null) {
                                b = selected_branch;
                            }
                            if (b != null) {
                                siblings = tree.get_siblings(b);
                                n = siblings.length;
                                i = siblings.indexOf(b);
                                if (i < n) {
                                    return siblings[i + 1];
                                }
                            }
                        };
                        tree.get_prev_sibling = function(b) {
                            var i, siblings;
                            if (b == null) {
                                b = selected_branch;
                            }
                            siblings = tree.get_siblings(b);
                            n = siblings.length;
                            i = siblings.indexOf(b);
                            if (i > 0) {
                                return siblings[i - 1];
                            }
                        };
                        tree.select_next_sibling = function(b) {
                            var next;
                            if (b == null) {
                                b = selected_branch;
                            }
                            if (b != null) {
                                next = tree.get_next_sibling(b);
                                if (next != null) {
                                    return tree.select_branch(next);
                                }
                            }
                        };
                        tree.select_prev_sibling = function(b) {
                            var prev;
                            if (b == null) {
                                b = selected_branch;
                            }
                            if (b != null) {
                                prev = tree.get_prev_sibling(b);
                                if (prev != null) {
                                    return tree.select_branch(prev);
                                }
                            }
                        };
                        tree.get_first_child = function(b) {
                            var _ref;
                            if (b == null) {
                                b = selected_branch;
                            }
                            if (b != null) {
                                if (((_ref = b.children) != null ? _ref.length : void 0) > 0) {
                                    return b.children[0];
                                }
                            }
                        };
                        tree.get_closest_ancestor_next_sibling = function(b) {
                            var next, parent;
                            next = tree.get_next_sibling(b);
                            if (next != null) {
                                return next;
                            } else {
                                parent = tree.get_parent_branch(b);
                                return tree.get_closest_ancestor_next_sibling(parent);
                            }
                        };
                        tree.get_next_branch = function(b) {
                            var next;
                            if (b == null) {
                                b = selected_branch;
                            }
                            if (b != null) {
                                next = tree.get_first_child(b);
                                if (next != null) {
                                    return next;
                                } else {
                                    next = tree.get_closest_ancestor_next_sibling(b);
                                    return next;
                                }
                            }
                        };
                        tree.select_next_branch = function(b) {
                            var next;
                            if (b == null) {
                                b = selected_branch;
                            }
                            if (b != null) {
                                next = tree.get_next_branch(b);
                                if (next != null) {
                                    tree.select_branch(next);
                                    return next;
                                }
                            }
                        };
                        tree.last_descendant = function(b) {
                            var last_child;
                            if (b == null) {
                                debugger;
                            }
                            n = b.children.length;
                            if (n === 0) {
                                return b;
                            } else {
                                last_child = b.children[n - 1];
                                return tree.last_descendant(last_child);
                            }
                        };
                        tree.get_prev_branch = function(b) {
                            var parent, prev_sibling;
                            if (b == null) {
                                b = selected_branch;
                            }
                            if (b != null) {
                                prev_sibling = tree.get_prev_sibling(b);
                                if (prev_sibling != null) {
                                    return tree.last_descendant(prev_sibling);
                                } else {
                                    parent = tree.get_parent_branch(b);
                                    return parent;
                                }
                            }
                        };
                        return tree.select_prev_branch = function(b) {
                            var prev;
                            if (b == null) {
                                b = selected_branch;
                            }
                            if (b != null) {
                                prev = tree.get_prev_branch(b);
                                if (prev != null) {
                                    tree.select_branch(prev);
                                    return prev;
                                }
                            }
                        };
                    }
                }
            }
        };
    }
])
.factory('DFXMobile', function () {
    var is_preview = sessionStorage.dfx_appname == '_preview';

    var openWidget = function (widget_name) {
        if (! is_preview) {
            var currentUrl = document.location.href;
            var baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
            var newUrl = baseUrl + '/' + widget_name + '.html';
            window.location.href = newUrl;
        } else {
            if (widget_name) {
                var currentWidget = $('[dfx-renderrer]').attr('name');
                var newPath = window.location.pathname.replace(currentWidget, widget_name);
                var newUrl =  window.location.href.replace(window.location.pathname, newPath);
                window.location.href = newUrl;
            }
        }
    };
    return {
        openWidget: openWidget
    };
})
.factory('DFXWeb', ['$rootScope', '$compile', function ($rootScope, $compile) {
    /**
     * Service function to be called by developer to open a dialog box in application run time.
     * Choose only one between options.html and options.widgetName parameters.
     *
     * IMPORTANT: if you open a widget in popup, it must be deployed first!
     *
     * Options top/left/width/height can take values in pixels or percentages.
     *
     * Possible options.headerColor values are: [white, green,  greenDark,  greenLight,  purple, magenta, pink, pinkDark,
     *                                  teal, blue, blueLight, blueDark, darken, yellow, orange, orangeDark, red, redLight].
     * Default options.headerColor is blueDark.
     *
     * To center dialog window, do not assign any values to options.top and options.left.
     *
     * Examples:
     * 1) Show widget wForm in the dialog window and center it in the screen:
     DFXWeb.openDialog({
        'title': 'My Dialog Form',
        'width': '50%',
        'height': '50%',
        'widgetName': 'wForm',
        'buttons': 'YES_NO_CANCEL',
        'callback': dialogCallback
     });
     2) Show HTML content in the dialog window:
     DFXWeb.openDialog({
        'title': 'My Html Content',
        'headerColor': 'orange',
        'top': '100px',
        'left': '25%',
        'width': '400px',
        'height': '200px',
        'html': '<p>Open dialog HTML content, paragraph 1</p><p>Open dialog HTML content, paragraph 2</p>',
        'buttons': 'OK_CANCEL'
     });
     *
     * @param options object, with structure
     *      {title, headerColor, top, left, width, height, html, widgetName, buttons, callback}
     *       where buttons can have values: YES_NO, YES_NO_CANCEL, OK_CANCEL, YES, NO, OK, CANCEL
     *       and where callback is a function that takes clicked button as parameter (yes, no, ok, cancel)
     */
    var openDialog = function (options) {
        var calcPosition = function () {
            var result = '';
            if ((!options.top) && (!options.left)) {// center dialog horizontally and vertically
                var getCss = function (propValue, propName) {
                    if (propValue.indexOf('px') > -1) {
                        var value = parseInt(propValue.substring(0, propValue.indexOf('px'))) / 2;
                        return propName + ': 50%; margin-' + propName + ': -' + value + 'px;';
                    } else if (propValue.indexOf('%') > -1) {
                        var value = parseInt(propValue.substring(0, propValue.indexOf('%'))) / 2;
                        return propName + ': ' + (50 - value) + '%;';
                    }
                };
                result += getCss(options.width, 'left');// 'left: 50%; margin-left: -100px;' or 'left: 25%;'
                result += getCss(options.height, 'top');// 'top: 50%; margin-top: -100px;' or 'top: 25%;'
            } else {
                result += 'top: ' + options.top + ';' + 'left: ' + options.left + ';';
            }
            return result;
        };

        var createDialogHtml = function (buttonNames, dialogBodyContent) {
            var dialogStyle =
                '<style>' +
                '.dfx_dialog_black_overlay {' +
                'display: block;' +
                'position: absolute;' +
                'top: 0%;' +
                'left: 0%;' +
                'width: 100%;' +
                'height: 100%;' +
                'z-index:1001;' +
                '}' +
                '.dfx_dialog_white_content {' +
                'display: block;' +
                'position: absolute;' +
                calcPosition() +
                'width: ' + options.width + ';' +
                'height: ' + options.height + ';' +
                'padding: 0px;' +
                'border: 1px solid black;' +
                'background-color: white;' +
                'z-index:1002;' +
                'overflow: hidden;' +
                '}' +
                '</style>';

            var closeAction =
                'document.getElementById(\'dfx_dialog_light\').style.display=\'none\';' +
                'document.getElementById(\'dfx_dialog_fade\').style.display=\'none\';' +
                '$(\'#dfx_dialog_container\').remove();';

            var buttonsHtml = '';
            for (var i = (buttonNames.length - 1); i >= 0; i--) {
                var buttonTitle = buttonNames[i].charAt(0).toUpperCase() + buttonNames[i].toLowerCase().slice(1);
                buttonsHtml += '<button id="dfx_dialog_' + buttonNames[i].toLowerCase() + '" type="button" class="btn btn-default btn-sm botTempo">' + buttonTitle + '</button>';
            }

            var dialogHeaderColor = (options.headerColor) ? 'jarviswidget-color-' + options.headerColor : 'jarviswidget-color-blueDark';
            var dialogBodyBottom = (buttonsHtml) ? '44px;' : '0px;';//buttons bar height is 45px, and we have to put 45-1=44 to hide horizontal grey line coming from bg
            var dialogHtml =
                '<div id="dfx_dialog_light" class="dfx_dialog_white_content divMessageBox animated fadeIn fast jarviswidget jarviswidget-sortable ' + dialogHeaderColor + '">' +
                '<header style="display:block; position: absolute; top: 0px; left: 0px; right: 0px; height: 34px; margin: 0px;">' +
                '<div class="row jarviswidget-ctrls" style="width:100%;">' +
                '<h2 class="pull-left" style="margin-left: 14px;">' + (options.title || '') + '</h2>' +
                '<a href = "javascript:void(0)" onclick = "' + closeAction + '" class="button-icon jarviswidget-delete-btn pull-right">' +
                '<i class="fa fa-times"></i>' +
                '</a>' +
                '</div>' +
                '</header>' +
                '<div class="row" style="position: absolute; top: 34px; bottom: ' + dialogBodyBottom + 'left: 0px; right: 0px; overflow-y: auto;">' +
                dialogBodyContent +
                '</div>';
            dialogHtml += (!buttonsHtml) ? '' :
            '<div class="row" style="position: absolute; bottom: 0px; left: 0px; right: 0px; padding:5px; margin: 0px;">' +
            '<div class="MessageBoxButtonSection">' +
            buttonsHtml +
            '</div>' +
            '</div>';
            dialogHtml +=
                '</div>' +
                '<div id="dfx_dialog_fade" class="dfx_dialog_black_overlay divMessageBox animated fadeIn fast"></div>';

            return '<div id="dfx_dialog_container">' + dialogStyle + dialogHtml + '</div>';
        };

        var createDialogButtonsHandlers = function (buttonNames) {
            for (var i = 0; i < buttonNames.length; i++) {
                var createButtonHandler = function (buttonName) {
                    $('#dfx_dialog_' + buttonName.toLowerCase()).on('click', function () {
                        document.getElementById('dfx_dialog_light').style.display = 'none';
                        document.getElementById('dfx_dialog_fade').style.display = 'none';
                        $('#dfx_dialog_container').remove();

                        if (options.callback) options.callback(buttonName.toLowerCase());
                    });
                };
                createButtonHandler(buttonNames[i]);
            }
        };

        var runDialog = function () {
            var buttonNames = (options.buttons) ? options.buttons.split('_') : [];

            // if this is preview, construct the variable to include widget template and assign it to the scope
            if ($rootScope) {
                $rootScope['widget_template_' + options.widgetName] = '/widgets/' + sessionStorage.dfx_tenantid + '/' + options.widgetName + '.html';
            }

            var dialogBodyContent = (options.widgetName)
                ? '<div ng-include="widget_template_' + options.widgetName + '" dfx-include-replace></div>'
                : options.html;

            var openDialogHtml = createDialogHtml(buttonNames, dialogBodyContent);

            var element = angular.element(openDialogHtml);
            if (options.widgetName) {
                $compile(element.contents())($rootScope);
            }
            if ($('#dfx_dialog_container').length == 0) {
                element.appendTo("body");
            }

            createDialogButtonsHandlers(buttonNames);
        };

        runDialog();
    };
    return {
        openDialog: openDialog
    };
}]);