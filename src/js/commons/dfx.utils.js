/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/*
 Generic application controller
 */
var dfScreenControllerDispatcher = function ($scope) {
    $scope.screenContent = '';
    $scope.screenUrl = '#';

    $("#dfxScreenUrl").on('change', function () {
        var pageName = ($(this).val().indexOf('/') > -1) ? $(this).val() : '/' + $(this).val();
        $scope.$apply(function () {
            $scope.screenUrl = pageName;
        });
    });

    $scope.$watch('screenUrl', function (value) {
        if (value != '#') {
            // screen URL should not stgart with '/', it must be relative
            value = (value.indexOf('/') == 0) ? value.substring(1, value.length) : value;

            // adding global variable to store the current screen name, based on the fact that screen URL is always its name + '.html'
            dfx_current_screen = (value.indexOf('.') > -1) ? value.substring(0, value.indexOf('.')) : value;

            $.ajax({
                type:       "GET",
                url:        value,
                dataType:   'html',
                cache:      true, // (warning: setting it to false will cause a timestamp and will call the request twice)
                beforeSend: function () {
                    // destroy all datatable instances
                    var tables = $.fn.dataTable.fnTables(true);
                    $(tables).each(function () {
                        $(this).dataTable().fnDestroy();
                    });
                    // end destroy

                    // place cog
                    $("#content").html('<h1 class="ajax-loading-animation"><i class="fa fa-cog fa-spin"></i> Loading...</h1>');

                    drawBreadCrumb();
                    // scroll up
                    $("html").animate({
                        scrollTop: 0
                    }, "fast");
                },
                success:    function (data) {
                    var regExtractSection = /((?=<section)((.|\n)*)(?=\/section)(\/section\>))/gi;
                    var m;
                    while ((m = regExtractSection.exec(data)) != null) {
                        if (m.index === regExtractSection.lastIndex) {
                            regExtractSection.lastIndex++;
                        }
                        // View your result using the m-variable.
                        // eg m[0] etc.
                        $scope.$apply(function () {
                            $scope.screenContent = m[0];
                        })
                    }

                    //return scope.$eval(data);
                },
                error:      function (xhr, ajaxOptions, thrownError) {
                    $scope.screenContent = '<h4 class="ajax-loading-error"><i class="fa fa-warning txt-color-orangeDark"></i> Error 404! Page not found.</h4>';
                },
                async:      true
            });
        } else {
            if (window.location.hash != '') {
                checkURL();
            }
        }
    });
};

/**
 * @Deprecated Use DFXWeb.openDialog() service instead of this function.
 *
 * Function to be called by developer to open a dialog box in application run time.
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
 dfxOpenDialog({
	        'title': 'My Dialog Form',
	        'width': '50%',
	        'height': '50%',
	        'widgetName': 'wForm',
	        'buttons': 'YES_NO_CANCEL',
	        'callback': dialogCallback
	    }, $scope, $compile);
 2) Show HTML content in the dialog window:
 dfxOpenDialog({
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
 * @param $scope scope of the widget controller, mandatory to open the widget in popup
 * @param $compile compile object of the widget controller, mandatory to open the widget in popup
 */
var dfxOpenDialog = function (options, $scope, $compile) {
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
        if ($scope) {
            $scope['widget_template_' + options.widgetName] = '/widgets/' + sessionStorage.dfx_tenantid + '/' + options.widgetName + '.html';
        }

        var dialogBodyContent = (options.widgetName)
            ? '<div ng-include="widget_template_' + options.widgetName + '" dfx-include-replace></div>'
            : options.html;

        var openDialogHtml = createDialogHtml(buttonNames, dialogBodyContent);

        var element = angular.element(openDialogHtml);
        if (options.widgetName) {
            $compile(element.contents())($scope);
        }
        if ($('#dfx_dialog_container').length == 0) {
            element.appendTo("body");
        }

        createDialogButtonsHandlers(buttonNames);
    };

    runDialog();
};

/*
 DataTable utility functions
 */

var dfCallScopeFunction = function (name, element) {
    var dt = $(element).closest('tr')[0].dataTable({"bRetrieve": true});
    var scope = dt.fnGetScope();
    var dyn_source = 'return scope.' + name + '({"data": data, "dt": dt});';
    var dyn_function = new Function('scope', 'data', 'dt', dyn_source);
    var position = dt.fnGetPosition($(element).closest('tr')[0]);
    var row_data = dt.fnGetData(position);
    dyn_function(scope, row_data, dt);
};
$.fn.dataTableExt = {};
$.fn.dataTableExt.oApi = {};
$.fn.dataTableExt.oApi.fnGetScope = function (oSettings) {
    return oSettings.oScope;
}

/*
 Wizard utility functions
 */

var Wizard = function (element, options) {
    var kids;
    this.$element = $(element);
    this.options = $.extend({}, $.fn.wizard.defaults, options);
    this.options.disablePreviousStep = !!(( this.$element.data().restrict === "previous" ));
    this.currentStep = this.options.selectedItem.step;
    this.numSteps = this.$element.find('.steps a').length;
    this.$prevBtn = this.$element.find('.btn-prev');
    this.$nextBtn = this.$element.find('.btn-next');

    // handle events
    this.$prevBtn.on('click', $.proxy(this.previous, this));
    this.$nextBtn.on('click', $.proxy(this.next, this));
    this.$element.on('click', 'a.complete', $.proxy(this.stepClicked, this));

    if (this.currentStep > 1) {
        this.selectedItem(this.options.selectedItem);
    }

};

Wizard.prototype = {
    constructor: Wizard,
    setState:    function () {
        var firstStep = (this.currentStep === 1);
        var lastStep = (this.currentStep === this.numSteps);

        // disable buttons based on current step
        this.$prevBtn.attr('disabled', firstStep === true);
        if (this.$nextBtn.length > 1) {
            if (lastStep === true) {
                $(this.$nextBtn[this.numSteps - 1]).attr('disabled', true);
            }
        } else {
            this.$nextBtn.attr('disabled', lastStep === true);
        }

        // reset classes for all steps
        var $steps = this.$element.find('.steps a');
        $steps.removeClass('active').removeClass('complete');
        $steps.find('span.badge').removeClass('badge-info').removeClass('badge-success');

        // set class for all previous steps
        var prevSelector = '.steps a:lt(' + (this.currentStep - 1) + ')';
        var $prevSteps = this.$element.find(prevSelector);
        $prevSteps.addClass('complete');
        $prevSteps.find('span.badge').addClass('badge-success');

        // set class for current step
        var currentSelector = '.steps a:eq(' + (this.currentStep - 1) + ')';
        var $currentStep = this.$element.find(currentSelector);
        $currentStep.addClass('active');
        $currentStep.find('span.badge').addClass('badge-info');

        // set display of target element
        var target = $currentStep.data().target;
        this.$element.find('.step-pane').removeClass('active');
        $(target).addClass('active');
        // reset the wizard position to the left
        this.$element.find('.steps').first().attr('style', 'margin-left: 0');
        this.$element.trigger('changed', {currentStep: this.currentStep});
    },

    stepClicked: function (e) {
        var step = $(e.currentTarget);
        var index = this.$element.find('.steps a').index(step);
        var canMovePrev = true;

        if (this.options.disablePreviousStep) {
            if (index < this.currentStep) {
                canMovePrev = false;
            }
        }

        if (canMovePrev) {
            var evt = $.Event('stepclick');
            this.$element.trigger(evt, {step: index + 1});
            if (evt.isDefaultPrevented()) return;

            this.currentStep = (index + 1);
            this.setState();
        }
    },

    reloadProps: function () {
        this.currentStep = 1;
        this.numSteps = this.$element.find('.steps a').length;
        this.$prevBtn.attr('disabled', true);
        this.$nextBtn.attr('disabled', false);
    },

    previous: function () {
        var canMovePrev = (this.currentStep > 1);
        if (this.options.disablePreviousStep) {
            canMovePrev = false;
        }
        if (canMovePrev) {
            var e = $.Event('change');
            this.$element.trigger(e, {step: this.currentStep, direction: 'previous'});
            if (e.isDefaultPrevented()) return;
            this.currentStep -= 1;
            this.setState();
        }
    },

    next: function () {
        var canMoveNext = (this.currentStep + 1 <= this.numSteps);
        var lastStep = (this.currentStep === this.numSteps);

        if (canMoveNext) {
            var e = $.Event('change');
            this.$element.trigger(e, {step: this.currentStep, direction: 'next'});

            if (e.isDefaultPrevented()) return;
            this.currentStep += 1;
            this.setState();
        } else if (lastStep) {
            this.$element.trigger('finished');
        }
    },

    selectedItem: function (selectedItem) {
        var retVal, step;

        if (selectedItem) {

            step = selectedItem.step || -1;

            if (step >= 1 && step <= this.numSteps) {
                this.currentStep = step;
                this.setState();
            }

            retVal = this;
        } else {
            retVal = {step: this.currentStep};
        }

        return retVal;
    },
    getObject:    function () {
        return this;

    }
};

// WIZARD PLUGIN DEFINITION

$.fn.wizard = function (option) {
    var args = Array.prototype.slice.call(arguments, 1);
    var methodReturn;

    var $set = this.each(function () {
        var $this = $(this);
        var data = $this.data('wizard');
        var options = typeof option === 'object' && option;

        if (!data) $this.data('wizard', (data = new Wizard(this, options) ));
        if (typeof option === 'string') methodReturn = data[option].apply(data, args);
    });

    return ( methodReturn === undefined ) ? $set : methodReturn;
};

$.fn.wizard.defaults = {
    selectedItem: {step: 1}
};

$.fn.wizard.Constructor = Wizard;

/* =========================================================
 * bootstrap-datepicker.js
 * Repo: https://github.com/eternicode/bootstrap-datepicker/
 * Demo: http://eternicode.github.io/bootstrap-datepicker/
 * Docs: http://bootstrap-datepicker.readthedocs.org/
 * Forked from http://www.eyecon.ro/bootstrap-datepicker
 * =========================================================
 * Started by Stefan Petre; improvements by Andrew Rowls + contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

(function ($, undefined) {

    var $window = $(window);

    function UTCDate() {
        return new Date(Date.UTC.apply(Date, arguments));
    }

    function UTCToday() {
        var today = new Date();
        return UTCDate(today.getFullYear(), today.getMonth(), today.getDate());
    }

    function alias(method) {
        return function () {
            return this[method].apply(this, arguments);
        };
    }

    var DateArray = (function () {
        var extras = {
            get:      function (i) {
                return this.slice(i)[0];
            },
            contains: function (d) {
                // Array.indexOf is not cross-browser;
                // $.inArray doesn't work with Dates
                var val = d && d.valueOf();
                for (var i = 0, l = this.length; i < l; i++)
                    if (this[i].valueOf() === val)
                        return i;
                return -1;
            },
            remove:   function (i) {
                this.splice(i, 1);
            },
            replace:  function (new_array) {
                if (!new_array)
                    return;
                if (!$.isArray(new_array))
                    new_array = [new_array];
                this.clear();
                this.push.apply(this, new_array);
            },
            clear:    function () {
                this.splice(0);
            },
            copy:     function () {
                var a = new DateArray();
                a.replace(this);
                return a;
            }
        };

        return function () {
            var a = [];
            a.push.apply(a, arguments);
            $.extend(a, extras);
            return a;
        };
    })();

    // Picker object

    var Datepicker = function (element, options) {
        this.dates = new DateArray();
        this.viewDate = UTCToday();
        this.focusDate = null;

        this._process_options(options);

        this.element = $(element);
        this.isInline = false;
        this.isInput = this.element.is('input');
        this.component = this.element.is('.date') ? this.element.find('.add-on, .input-group-addon, .btn') : false;
        this.hasInput = this.component && this.element.find('input').length;
        if (this.component && this.component.length === 0)
            this.component = false;

        this.picker = $(DPGlobal.template);
        this._buildEvents();
        this._attachEvents();

        if (this.isInline) {
            this.picker.addClass('datepicker-inline').appendTo(this.element);
        }
        else {
            this.picker.addClass('datepicker-dropdown dropdown-menu');
        }

        if (this.o.rtl) {
            this.picker.addClass('datepicker-rtl');
        }

        this.viewMode = this.o.startView;

        if (this.o.calendarWeeks)
            this.picker.find('tfoot th.today')
                .attr('colspan', function (i, val) {
                    return parseInt(val) + 1;
                });

        this._allow_update = false;

        this.setStartDate(this._o.startDate);
        this.setEndDate(this._o.endDate);
        this.setDaysOfWeekDisabled(this.o.daysOfWeekDisabled);

        this.fillDow();
        this.fillMonths();

        this._allow_update = true;

        this.update();
        this.showMode();

        if (this.isInline) {
            this.show();
        }
    };

    Datepicker.prototype = {
        constructor: Datepicker,

        _process_options:       function (opts) {
            // Store raw options for reference
            this._o = $.extend({}, this._o, opts);
            // Processed options
            var o = this.o = $.extend({}, this._o);

            // Check if "de-DE" style date is available, if not language should
            // fallback to 2 letter code eg "de"
            var lang = o.language;
            if (!dates[lang]) {
                lang = lang.split('-')[0];
                if (!dates[lang])
                    lang = defaults.language;
            }
            o.language = lang;

            switch (o.startView) {
                case 2:
                case 'decade':
                    o.startView = 2;
                    break;
                case 1:
                case 'year':
                    o.startView = 1;
                    break;
                default:
                    o.startView = 0;
            }

            switch (o.minViewMode) {
                case 1:
                case 'months':
                    o.minViewMode = 1;
                    break;
                case 2:
                case 'years':
                    o.minViewMode = 2;
                    break;
                default:
                    o.minViewMode = 0;
            }

            o.startView = Math.max(o.startView, o.minViewMode);

            // true, false, or Number > 0
            if (o.multidate !== true) {
                o.multidate = Number(o.multidate) || false;
                if (o.multidate !== false)
                    o.multidate = Math.max(0, o.multidate);
                else
                    o.multidate = 1;
            }
            o.multidateSeparator = String(o.multidateSeparator);

            o.weekStart %= 7;
            o.weekEnd = ((o.weekStart + 6) % 7);

            var format = DPGlobal.parseFormat(o.format);
            if (o.startDate !== -Infinity) {
                if (!!o.startDate) {
                    if (o.startDate instanceof Date)
                        o.startDate = this._local_to_utc(this._zero_time(o.startDate));
                    else
                        o.startDate = DPGlobal.parseDate(o.startDate, format, o.language);
                }
                else {
                    o.startDate = -Infinity;
                }
            }
            if (o.endDate !== Infinity) {
                if (!!o.endDate) {
                    if (o.endDate instanceof Date)
                        o.endDate = this._local_to_utc(this._zero_time(o.endDate));
                    else
                        o.endDate = DPGlobal.parseDate(o.endDate, format, o.language);
                }
                else {
                    o.endDate = Infinity;
                }
            }

            o.daysOfWeekDisabled = o.daysOfWeekDisabled || [];
            if (!$.isArray(o.daysOfWeekDisabled))
                o.daysOfWeekDisabled = o.daysOfWeekDisabled.split(/[,\s]*/);
            o.daysOfWeekDisabled = $.map(o.daysOfWeekDisabled, function (d) {
                return parseInt(d, 10);
            });

            var plc = String(o.orientation).toLowerCase().split(/\s+/g),
                _plc = o.orientation.toLowerCase();
            plc = $.grep(plc, function (word) {
                return (/^auto|left|right|top|bottom$/).test(word);
            });
            o.orientation = {x: 'auto', y: 'auto'};
            if (!_plc || _plc === 'auto')
                ; // no action
            else if (plc.length === 1) {
                switch (plc[0]) {
                    case 'top':
                    case 'bottom':
                        o.orientation.y = plc[0];
                        break;
                    case 'left':
                    case 'right':
                        o.orientation.x = plc[0];
                        break;
                }
            }
            else {
                _plc = $.grep(plc, function (word) {
                    return (/^left|right$/).test(word);
                });
                o.orientation.x = _plc[0] || 'auto';

                _plc = $.grep(plc, function (word) {
                    return (/^top|bottom$/).test(word);
                });
                o.orientation.y = _plc[0] || 'auto';
            }
        },
        _events:                [],
        _secondaryEvents:       [],
        _applyEvents:           function (evs) {
            for (var i = 0, el, ch, ev; i < evs.length; i++) {
                el = evs[i][0];
                if (evs[i].length === 2) {
                    ch = undefined;
                    ev = evs[i][1];
                }
                else if (evs[i].length === 3) {
                    ch = evs[i][1];
                    ev = evs[i][2];
                }
                el.on(ev, ch);
            }
        },
        _unapplyEvents:         function (evs) {
            for (var i = 0, el, ev, ch; i < evs.length; i++) {
                el = evs[i][0];
                if (evs[i].length === 2) {
                    ch = undefined;
                    ev = evs[i][1];
                }
                else if (evs[i].length === 3) {
                    ch = evs[i][1];
                    ev = evs[i][2];
                }
                el.off(ev, ch);
            }
        },
        _buildEvents:           function () {
            if (this.isInput) { // single input
                this._events = [
                    [this.element, {
                        focus:   $.proxy(this.show, this),
                        keyup:   $.proxy(function (e) {
                            if ($.inArray(e.keyCode, [27, 37, 39, 38, 40, 32, 13, 9]) === -1)
                                this.update();
                        }, this),
                        keydown: $.proxy(this.keydown, this)
                    }]
                ];
            }
            else if (this.component && this.hasInput) { // component: input + button
                this._events = [
                    // For components that are not readonly, allow keyboard nav
                    [this.element.find('input'), {
                        focus:   $.proxy(this.show, this),
                        keyup:   $.proxy(function (e) {
                            if ($.inArray(e.keyCode, [27, 37, 39, 38, 40, 32, 13, 9]) === -1)
                                this.update();
                        }, this),
                        keydown: $.proxy(this.keydown, this)
                    }],
                    [this.component, {
                        click: $.proxy(this.show, this)
                    }]
                ];
            }
            else if (this.element.is('div')) {  // inline datepicker
                this.isInline = true;
            }
            else {
                this._events = [
                    [this.element, {
                        click: $.proxy(this.show, this)
                    }]
                ];
            }
            this._events.push(
                // Component: listen for blur on element descendants
                [this.element, '*', {
                    blur: $.proxy(function (e) {
                        this._focused_from = e.target;
                    }, this)
                }],
                // Input: listen for blur on element
                [this.element, {
                    blur: $.proxy(function (e) {
                        this._focused_from = e.target;
                    }, this)
                }]
            );

            this._secondaryEvents = [
                [this.picker, {
                    click: $.proxy(this.click, this)
                }],
                [$(window), {
                    resize: $.proxy(this.place, this)
                }],
                [$(document), {
                    'mousedown touchstart': $.proxy(function (e) {
                        // Clicked outside the datepicker, hide it
                        if (!(
                            this.element.is(e.target) ||
                            this.element.find(e.target).length ||
                            this.picker.is(e.target) ||
                            this.picker.find(e.target).length
                            )) {
                            this.hide();
                        }
                    }, this)
                }]
            ];
        },
        _attachEvents:          function () {
            this._detachEvents();
            this._applyEvents(this._events);
        },
        _detachEvents:          function () {
            this._unapplyEvents(this._events);
        },
        _attachSecondaryEvents: function () {
            this._detachSecondaryEvents();
            this._applyEvents(this._secondaryEvents);
        },
        _detachSecondaryEvents: function () {
            this._unapplyEvents(this._secondaryEvents);
        },
        _trigger:               function (event, altdate) {
            var date = altdate || this.dates.get(-1),
                local_date = this._utc_to_local(date);

            this.element.trigger({
                type:   event,
                date:   local_date,
                dates:  $.map(this.dates, this._utc_to_local),
                format: $.proxy(function (ix, format) {
                    if (arguments.length === 0) {
                        ix = this.dates.length - 1;
                        format = this.o.format;
                    }
                    else if (typeof ix === 'string') {
                        format = ix;
                        ix = this.dates.length - 1;
                    }
                    format = format || this.o.format;
                    var date = this.dates.get(ix);
                    return DPGlobal.formatDate(date, format, this.o.language);
                }, this)
            });
        },

        show: function () {
            if (!this.isInline)
                this.picker.appendTo('body');
            this.picker.show();
            this.place();
            this._attachSecondaryEvents();
            this._trigger('show');
        },

        hide: function () {
            if (this.isInline)
                return;
            if (!this.picker.is(':visible'))
                return;
            this.focusDate = null;
            this.picker.hide().detach();
            this._detachSecondaryEvents();
            this.viewMode = this.o.startView;
            this.showMode();

            if (
                this.o.forceParse &&
                (
                this.isInput && this.element.val() ||
                this.hasInput && this.element.find('input').val()
                )
            )
                this.setValue();
            this._trigger('hide');
        },

        remove: function () {
            this.hide();
            this._detachEvents();
            this._detachSecondaryEvents();
            this.picker.remove();
            delete this.element.data().datepicker;
            if (!this.isInput) {
                delete this.element.data().date;
            }
        },

        _utc_to_local:  function (utc) {
            return utc && new Date(utc.getTime() + (utc.getTimezoneOffset() * 60000));
        },
        _local_to_utc:  function (local) {
            return local && new Date(local.getTime() - (local.getTimezoneOffset() * 60000));
        },
        _zero_time:     function (local) {
            return local && new Date(local.getFullYear(), local.getMonth(), local.getDate());
        },
        _zero_utc_time: function (utc) {
            return utc && new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate()));
        },

        getDates: function () {
            return $.map(this.dates, this._utc_to_local);
        },

        getUTCDates: function () {
            return $.map(this.dates, function (d) {
                return new Date(d);
            });
        },

        getDate: function () {
            return this._utc_to_local(this.getUTCDate());
        },

        getUTCDate: function () {
            return new Date(this.dates.get(-1));
        },

        setDates: function () {
            var args = $.isArray(arguments[0]) ? arguments[0] : arguments;
            this.update.apply(this, args);
            this._trigger('changeDate');
            this.setValue();
        },

        setUTCDates: function () {
            var args = $.isArray(arguments[0]) ? arguments[0] : arguments;
            this.update.apply(this, $.map(args, this._utc_to_local));
            this._trigger('changeDate');
            this.setValue();
        },

        setDate:    alias('setDates'),
        setUTCDate: alias('setUTCDates'),

        setValue: function () {
            var formatted = this.getFormattedDate();
            if (!this.isInput) {
                if (this.component) {
                    this.element.find('input').val(formatted).change();
                }
            }
            else {
                this.element.val(formatted).change();
            }
        },

        getFormattedDate: function (format) {
            if (format === undefined)
                format = this.o.format;

            var lang = this.o.language;
            return $.map(this.dates, function (d) {
                return DPGlobal.formatDate(d, format, lang);
            }).join(this.o.multidateSeparator);
        },

        setStartDate: function (startDate) {
            this._process_options({startDate: startDate});
            this.update();
            this.updateNavArrows();
        },

        setEndDate: function (endDate) {
            this._process_options({endDate: endDate});
            this.update();
            this.updateNavArrows();
        },

        setDaysOfWeekDisabled: function (daysOfWeekDisabled) {
            this._process_options({daysOfWeekDisabled: daysOfWeekDisabled});
            this.update();
            this.updateNavArrows();
        },

        place: function () {
            if (this.isInline)
                return;
            var calendarWidth = this.picker.outerWidth(),
                calendarHeight = this.picker.outerHeight(),
                visualPadding = 10,
                windowWidth = $window.width(),
                windowHeight = $window.height(),
                scrollTop = $window.scrollTop();

            var zIndex = parseInt(this.element.parents().filter(function () {
                    return $(this).css('z-index') !== 'auto';
                }).first().css('z-index')) + 10;
            var offset = this.component ? this.component.parent().offset() : this.element.offset();
            var height = this.component ? this.component.outerHeight(true) : this.element.outerHeight(false);
            var width = this.component ? this.component.outerWidth(true) : this.element.outerWidth(false);
            var left = offset.left,
                top = offset.top;

            this.picker.removeClass(
                'datepicker-orient-top datepicker-orient-bottom ' +
                'datepicker-orient-right datepicker-orient-left'
            );

            if (this.o.orientation.x !== 'auto') {
                this.picker.addClass('datepicker-orient-' + this.o.orientation.x);
                if (this.o.orientation.x === 'right')
                    left -= calendarWidth - width;
            }
            // auto x orientation is best-placement: if it crosses a window
            // edge, fudge it sideways
            else {
                // Default to left
                this.picker.addClass('datepicker-orient-left');
                if (offset.left < 0)
                    left -= offset.left - visualPadding;
                else if (offset.left + calendarWidth > windowWidth)
                    left = windowWidth - calendarWidth - visualPadding;
            }

            // auto y orientation is best-situation: top or bottom, no fudging,
            // decision based on which shows more of the calendar
            var yorient = this.o.orientation.y,
                top_overflow, bottom_overflow;
            if (yorient === 'auto') {
                top_overflow = -scrollTop + offset.top - calendarHeight;
                bottom_overflow = scrollTop + windowHeight - (offset.top + height + calendarHeight);
                if (Math.max(top_overflow, bottom_overflow) === bottom_overflow)
                    yorient = 'top';
                else
                    yorient = 'bottom';
            }
            this.picker.addClass('datepicker-orient-' + yorient);
            if (yorient === 'top')
                top += height;
            else
                top -= calendarHeight + parseInt(this.picker.css('padding-top'));

            this.picker.css({
                top:    top,
                left:   left,
                zIndex: zIndex
            });
        },

        _allow_update: true,
        update:        function () {
            if (!this._allow_update)
                return;

            var oldDates = this.dates.copy(),
                dates = [],
                fromArgs = false;
            if (arguments.length) {
                $.each(arguments, $.proxy(function (i, date) {
                    if (date instanceof Date)
                        date = this._local_to_utc(date);
                    dates.push(date);
                }, this));
                fromArgs = true;
            }
            else {
                dates = this.isInput
                    ? this.element.val()
                    : this.element.data('date') || this.element.find('input').val();
                if (dates && this.o.multidate)
                    dates = dates.split(this.o.multidateSeparator);
                else
                    dates = [dates];
                delete this.element.data().date;
            }

            dates = $.map(dates, $.proxy(function (date) {
                return DPGlobal.parseDate(date, this.o.format, this.o.language);
            }, this));
            dates = $.grep(dates, $.proxy(function (date) {
                return (
                date < this.o.startDate ||
                date > this.o.endDate || !date
                );
            }, this), true);
            this.dates.replace(dates);

            if (this.dates.length)
                this.viewDate = new Date(this.dates.get(-1));
            else if (this.viewDate < this.o.startDate)
                this.viewDate = new Date(this.o.startDate);
            else if (this.viewDate > this.o.endDate)
                this.viewDate = new Date(this.o.endDate);

            if (fromArgs) {
                // setting date by clicking
                this.setValue();
            }
            else if (dates.length) {
                // setting date by typing
                if (String(oldDates) !== String(this.dates))
                    this._trigger('changeDate');
            }
            if (!this.dates.length && oldDates.length)
                this._trigger('clearDate');

            this.fill();
        },

        fillDow: function () {
            var dowCnt = this.o.weekStart,
                html = '<tr>';
            if (this.o.calendarWeeks) {
                var cell = '<th class="cw">&nbsp;</th>';
                html += cell;
                this.picker.find('.datepicker-days thead tr:first-child').prepend(cell);
            }
            while (dowCnt < this.o.weekStart + 7) {
                html += '<th class="dow">' + dates[this.o.language].daysMin[(dowCnt++) % 7] + '</th>';
            }
            html += '</tr>';
            this.picker.find('.datepicker-days thead').append(html);
        },

        fillMonths: function () {
            var html = '',
                i = 0;
            while (i < 12) {
                html += '<span class="month">' + dates[this.o.language].monthsShort[i++] + '</span>';
            }
            this.picker.find('.datepicker-months td').html(html);
        },

        setRange: function (range) {
            if (!range || !range.length)
                delete this.range;
            else
                this.range = $.map(range, function (d) {
                    return d.valueOf();
                });
            this.fill();
        },

        getClassNames: function (date) {
            var cls = [],
                year = this.viewDate.getUTCFullYear(),
                month = this.viewDate.getUTCMonth(),
                today = new Date();
            if (date.getUTCFullYear() < year || (date.getUTCFullYear() === year && date.getUTCMonth() < month)) {
                cls.push('old');
            }
            else if (date.getUTCFullYear() > year || (date.getUTCFullYear() === year && date.getUTCMonth() > month)) {
                cls.push('new');
            }
            if (this.focusDate && date.valueOf() === this.focusDate.valueOf())
                cls.push('focused');
            // Compare internal UTC date with local today, not UTC today
            if (this.o.todayHighlight &&
                date.getUTCFullYear() === today.getFullYear() &&
                date.getUTCMonth() === today.getMonth() &&
                date.getUTCDate() === today.getDate()) {
                cls.push('today');
            }
            if (this.dates.contains(date) !== -1)
                cls.push('active');
            if (date.valueOf() < this.o.startDate || date.valueOf() > this.o.endDate ||
                $.inArray(date.getUTCDay(), this.o.daysOfWeekDisabled) !== -1) {
                cls.push('disabled');
            }
            if (this.range) {
                if (date > this.range[0] && date < this.range[this.range.length - 1]) {
                    cls.push('range');
                }
                if ($.inArray(date.valueOf(), this.range) !== -1) {
                    cls.push('selected');
                }
            }
            return cls;
        },

        fill: function () {
            var d = new Date(this.viewDate),
                year = d.getUTCFullYear(),
                month = d.getUTCMonth(),
                startYear = this.o.startDate !== -Infinity ? this.o.startDate.getUTCFullYear() : -Infinity,
                startMonth = this.o.startDate !== -Infinity ? this.o.startDate.getUTCMonth() : -Infinity,
                endYear = this.o.endDate !== Infinity ? this.o.endDate.getUTCFullYear() : Infinity,
                endMonth = this.o.endDate !== Infinity ? this.o.endDate.getUTCMonth() : Infinity,
                todaytxt = dates[this.o.language].today || dates['en'].today || '',
                cleartxt = dates[this.o.language].clear || dates['en'].clear || '',
                tooltip;
            this.picker.find('.datepicker-days thead th.datepicker-switch')
                .text(dates[this.o.language].months[month] + ' ' + year);
            this.picker.find('tfoot th.today')
                .text(todaytxt)
                .toggle(this.o.todayBtn !== false);
            this.picker.find('tfoot th.clear')
                .text(cleartxt)
                .toggle(this.o.clearBtn !== false);
            this.updateNavArrows();
            this.fillMonths();
            var prevMonth = UTCDate(year, month - 1, 28),
                day = DPGlobal.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
            prevMonth.setUTCDate(day);
            prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.o.weekStart + 7) % 7);
            var nextMonth = new Date(prevMonth);
            nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
            nextMonth = nextMonth.valueOf();
            var html = [];
            var clsName;
            while (prevMonth.valueOf() < nextMonth) {
                if (prevMonth.getUTCDay() === this.o.weekStart) {
                    html.push('<tr>');
                    if (this.o.calendarWeeks) {
                        // ISO 8601: First week contains first thursday.
                        // ISO also states week starts on Monday, but we can be more abstract here.
                        var
                        // Start of current week: based on weekstart/current date
                        ws = new Date(+prevMonth + (this.o.weekStart - prevMonth.getUTCDay() - 7) % 7 * 864e5),
                        // Thursday of this week
                        th = new Date(Number(ws) + (7 + 4 - ws.getUTCDay()) % 7 * 864e5),
                        // First Thursday of year, year from thursday
                        yth = new Date(Number(yth = UTCDate(th.getUTCFullYear(), 0, 1)) + (7 + 4 - yth.getUTCDay()) % 7 * 864e5),
                        // Calendar week: ms between thursdays, div ms per day, div 7 days
                        calWeek = (th - yth) / 864e5 / 7 + 1;
                        html.push('<td class="cw">' + calWeek + '</td>');

                    }
                }
                clsName = this.getClassNames(prevMonth);
                clsName.push('day');

                if (this.o.beforeShowDay !== $.noop) {
                    var before = this.o.beforeShowDay(this._utc_to_local(prevMonth));
                    if (before === undefined)
                        before = {};
                    else if (typeof(before) === 'boolean')
                        before = {enabled: before};
                    else if (typeof(before) === 'string')
                        before = {classes: before};
                    if (before.enabled === false)
                        clsName.push('disabled');
                    if (before.classes)
                        clsName = clsName.concat(before.classes.split(/\s+/));
                    if (before.tooltip)
                        tooltip = before.tooltip;
                }

                clsName = $.unique(clsName);
                html.push('<td class="' + clsName.join(' ') + '"' + (tooltip ? ' title="' + tooltip + '"' : '') + '>' + prevMonth.getUTCDate() + '</td>');
                if (prevMonth.getUTCDay() === this.o.weekEnd) {
                    html.push('</tr>');
                }
                prevMonth.setUTCDate(prevMonth.getUTCDate() + 1);
            }
            this.picker.find('.datepicker-days tbody').empty().append(html.join(''));

            var months = this.picker.find('.datepicker-months')
                .find('th:eq(1)')
                .text(year)
                .end()
                .find('span').removeClass('active');

            $.each(this.dates, function (i, d) {
                if (d.getUTCFullYear() === year)
                    months.eq(d.getUTCMonth()).addClass('active');
            });

            if (year < startYear || year > endYear) {
                months.addClass('disabled');
            }
            if (year === startYear) {
                months.slice(0, startMonth).addClass('disabled');
            }
            if (year === endYear) {
                months.slice(endMonth + 1).addClass('disabled');
            }

            html = '';
            year = parseInt(year / 10, 10) * 10;
            var yearCont = this.picker.find('.datepicker-years')
                .find('th:eq(1)')
                .text(year + '-' + (year + 9))
                .end()
                .find('td');
            year -= 1;
            var years = $.map(this.dates, function (d) {
                    return d.getUTCFullYear();
                }),
                classes;
            for (var i = -1; i < 11; i++) {
                classes = ['year'];
                if (i === -1)
                    classes.push('old');
                else if (i === 10)
                    classes.push('new');
                if ($.inArray(year, years) !== -1)
                    classes.push('active');
                if (year < startYear || year > endYear)
                    classes.push('disabled');
                html += '<span class="' + classes.join(' ') + '">' + year + '</span>';
                year += 1;
            }
            yearCont.html(html);
        },

        updateNavArrows: function () {
            if (!this._allow_update)
                return;

            var d = new Date(this.viewDate),
                year = d.getUTCFullYear(),
                month = d.getUTCMonth();
            switch (this.viewMode) {
                case 0:
                    if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear() && month <= this.o.startDate.getUTCMonth()) {
                        this.picker.find('.prev').css({visibility: 'hidden'});
                    }
                    else {
                        this.picker.find('.prev').css({visibility: 'visible'});
                    }
                    if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear() && month >= this.o.endDate.getUTCMonth()) {
                        this.picker.find('.next').css({visibility: 'hidden'});
                    }
                    else {
                        this.picker.find('.next').css({visibility: 'visible'});
                    }
                    break;
                case 1:
                case 2:
                    if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear()) {
                        this.picker.find('.prev').css({visibility: 'hidden'});
                    }
                    else {
                        this.picker.find('.prev').css({visibility: 'visible'});
                    }
                    if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear()) {
                        this.picker.find('.next').css({visibility: 'hidden'});
                    }
                    else {
                        this.picker.find('.next').css({visibility: 'visible'});
                    }
                    break;
            }
        },

        click: function (e) {
            e.preventDefault();
            var target = $(e.target).closest('span, td, th'),
                year, month, day;
            if (target.length === 1) {
                switch (target[0].nodeName.toLowerCase()) {
                    case 'th':
                        switch (target[0].className) {
                            case 'datepicker-switch':
                                this.showMode(1);
                                break;
                            case 'prev':
                            case 'next':
                                var dir = DPGlobal.modes[this.viewMode].navStep * (target[0].className === 'prev' ? -1 : 1);
                                switch (this.viewMode) {
                                    case 0:
                                        this.viewDate = this.moveMonth(this.viewDate, dir);
                                        this._trigger('changeMonth', this.viewDate);
                                        break;
                                    case 1:
                                    case 2:
                                        this.viewDate = this.moveYear(this.viewDate, dir);
                                        if (this.viewMode === 1)
                                            this._trigger('changeYear', this.viewDate);
                                        break;
                                }
                                this.fill();
                                break;
                            case 'today':
                                var date = new Date();
                                date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);

                                this.showMode(-2);
                                var which = this.o.todayBtn === 'linked' ? null : 'view';
                                this._setDate(date, which);
                                break;
                            case 'clear':
                                var element;
                                if (this.isInput)
                                    element = this.element;
                                else if (this.component)
                                    element = this.element.find('input');
                                if (element)
                                    element.val("").change();
                                this.update();
                                this._trigger('changeDate');
                                if (this.o.autoclose)
                                    this.hide();
                                break;
                        }
                        break;
                    case 'span':
                        if (!target.is('.disabled')) {
                            this.viewDate.setUTCDate(1);
                            if (target.is('.month')) {
                                day = 1;
                                month = target.parent().find('span').index(target);
                                year = this.viewDate.getUTCFullYear();
                                this.viewDate.setUTCMonth(month);
                                this._trigger('changeMonth', this.viewDate);
                                if (this.o.minViewMode === 1) {
                                    this._setDate(UTCDate(year, month, day));
                                }
                            }
                            else {
                                day = 1;
                                month = 0;
                                year = parseInt(target.text(), 10) || 0;
                                this.viewDate.setUTCFullYear(year);
                                this._trigger('changeYear', this.viewDate);
                                if (this.o.minViewMode === 2) {
                                    this._setDate(UTCDate(year, month, day));
                                }
                            }
                            this.showMode(-1);
                            this.fill();
                        }
                        break;
                    case 'td':
                        if (target.is('.day') && !target.is('.disabled')) {
                            day = parseInt(target.text(), 10) || 1;
                            year = this.viewDate.getUTCFullYear();
                            month = this.viewDate.getUTCMonth();
                            if (target.is('.old')) {
                                if (month === 0) {
                                    month = 11;
                                    year -= 1;
                                }
                                else {
                                    month -= 1;
                                }
                            }
                            else if (target.is('.new')) {
                                if (month === 11) {
                                    month = 0;
                                    year += 1;
                                }
                                else {
                                    month += 1;
                                }
                            }
                            this._setDate(UTCDate(year, month, day));
                        }
                        break;
                }
            }
            if (this.picker.is(':visible') && this._focused_from) {
                $(this._focused_from).focus();
            }
            delete this._focused_from;
        },

        _toggle_multidate: function (date) {
            var ix = this.dates.contains(date);
            if (!date) {
                this.dates.clear();
            }
            else if (ix !== -1) {
                this.dates.remove(ix);
            }
            else {
                this.dates.push(date);
            }
            if (typeof this.o.multidate === 'number')
                while (this.dates.length > this.o.multidate)
                    this.dates.remove(0);
        },

        _setDate: function (date, which) {
            if (!which || which === 'date')
                this._toggle_multidate(date && new Date(date));
            if (!which || which === 'view')
                this.viewDate = date && new Date(date);

            this.fill();
            this.setValue();
            this._trigger('changeDate');
            var element;
            if (this.isInput) {
                element = this.element;
            }
            else if (this.component) {
                element = this.element.find('input');
            }
            if (element) {
                element.change();
            }
            if (this.o.autoclose && (!which || which === 'date')) {
                this.hide();
            }
        },

        moveMonth: function (date, dir) {
            if (!date)
                return undefined;
            if (!dir)
                return date;
            var new_date = new Date(date.valueOf()),
                day = new_date.getUTCDate(),
                month = new_date.getUTCMonth(),
                mag = Math.abs(dir),
                new_month, test;
            dir = dir > 0 ? 1 : -1;
            if (mag === 1) {
                test = dir === -1
                    // If going back one month, make sure month is not current month
                    // (eg, Mar 31 -> Feb 31 == Feb 28, not Mar 02)
                    ? function () {
                    return new_date.getUTCMonth() === month;
                }
                    // If going forward one month, make sure month is as expected
                    // (eg, Jan 31 -> Feb 31 == Feb 28, not Mar 02)
                    : function () {
                    return new_date.getUTCMonth() !== new_month;
                };
                new_month = month + dir;
                new_date.setUTCMonth(new_month);
                // Dec -> Jan (12) or Jan -> Dec (-1) -- limit expected date to 0-11
                if (new_month < 0 || new_month > 11)
                    new_month = (new_month + 12) % 12;
            }
            else {
                // For magnitudes >1, move one month at a time...
                for (var i = 0; i < mag; i++)
                    // ...which might decrease the day (eg, Jan 31 to Feb 28, etc)...
                    new_date = this.moveMonth(new_date, dir);
                // ...then reset the day, keeping it in the new month
                new_month = new_date.getUTCMonth();
                new_date.setUTCDate(day);
                test = function () {
                    return new_month !== new_date.getUTCMonth();
                };
            }
            // Common date-resetting loop -- if date is beyond end of month, make it
            // end of month
            while (test()) {
                new_date.setUTCDate(--day);
                new_date.setUTCMonth(new_month);
            }
            return new_date;
        },

        moveYear: function (date, dir) {
            return this.moveMonth(date, dir * 12);
        },

        dateWithinRange: function (date) {
            return date >= this.o.startDate && date <= this.o.endDate;
        },

        keydown: function (e) {
            if (this.picker.is(':not(:visible)')) {
                if (e.keyCode === 27) // allow escape to hide and re-show picker
                    this.show();
                return;
            }
            var dateChanged = false,
                dir, newDate, newViewDate,
                focusDate = this.focusDate || this.viewDate;
            switch (e.keyCode) {
                case 27: // escape
                    if (this.focusDate) {
                        this.focusDate = null;
                        this.viewDate = this.dates.get(-1) || this.viewDate;
                        this.fill();
                    }
                    else
                        this.hide();
                    e.preventDefault();
                    break;
                case 37: // left
                case 39: // right
                    if (!this.o.keyboardNavigation)
                        break;
                    dir = e.keyCode === 37 ? -1 : 1;
                    if (e.ctrlKey) {
                        newDate = this.moveYear(this.dates.get(-1) || UTCToday(), dir);
                        newViewDate = this.moveYear(focusDate, dir);
                        this._trigger('changeYear', this.viewDate);
                    }
                    else if (e.shiftKey) {
                        newDate = this.moveMonth(this.dates.get(-1) || UTCToday(), dir);
                        newViewDate = this.moveMonth(focusDate, dir);
                        this._trigger('changeMonth', this.viewDate);
                    }
                    else {
                        newDate = new Date(this.dates.get(-1) || UTCToday());
                        newDate.setUTCDate(newDate.getUTCDate() + dir);
                        newViewDate = new Date(focusDate);
                        newViewDate.setUTCDate(focusDate.getUTCDate() + dir);
                    }
                    if (this.dateWithinRange(newDate)) {
                        this.focusDate = this.viewDate = newViewDate;
                        this.setValue();
                        this.fill();
                        e.preventDefault();
                    }
                    break;
                case 38: // up
                case 40: // down
                    if (!this.o.keyboardNavigation)
                        break;
                    dir = e.keyCode === 38 ? -1 : 1;
                    if (e.ctrlKey) {
                        newDate = this.moveYear(this.dates.get(-1) || UTCToday(), dir);
                        newViewDate = this.moveYear(focusDate, dir);
                        this._trigger('changeYear', this.viewDate);
                    }
                    else if (e.shiftKey) {
                        newDate = this.moveMonth(this.dates.get(-1) || UTCToday(), dir);
                        newViewDate = this.moveMonth(focusDate, dir);
                        this._trigger('changeMonth', this.viewDate);
                    }
                    else {
                        newDate = new Date(this.dates.get(-1) || UTCToday());
                        newDate.setUTCDate(newDate.getUTCDate() + dir * 7);
                        newViewDate = new Date(focusDate);
                        newViewDate.setUTCDate(focusDate.getUTCDate() + dir * 7);
                    }
                    if (this.dateWithinRange(newDate)) {
                        this.focusDate = this.viewDate = newViewDate;
                        this.setValue();
                        this.fill();
                        e.preventDefault();
                    }
                    break;
                case 32: // spacebar
                    // Spacebar is used in manually typing dates in some formats.
                    // As such, its behavior should not be hijacked.
                    break;
                case 13: // enter
                    focusDate = this.focusDate || this.dates.get(-1) || this.viewDate;
                    this._toggle_multidate(focusDate);
                    dateChanged = true;
                    this.focusDate = null;
                    this.viewDate = this.dates.get(-1) || this.viewDate;
                    this.setValue();
                    this.fill();
                    if (this.picker.is(':visible')) {
                        e.preventDefault();
                        if (this.o.autoclose)
                            this.hide();
                    }
                    break;
                case 9: // tab
                    this.focusDate = null;
                    this.viewDate = this.dates.get(-1) || this.viewDate;
                    this.fill();
                    this.hide();
                    break;
            }
            if (dateChanged) {
                if (this.dates.length)
                    this._trigger('changeDate');
                else
                    this._trigger('clearDate');
                var element;
                if (this.isInput) {
                    element = this.element;
                }
                else if (this.component) {
                    element = this.element.find('input');
                }
                if (element) {
                    element.change();
                }
            }
        },

        showMode: function (dir) {
            if (dir) {
                this.viewMode = Math.max(this.o.minViewMode, Math.min(2, this.viewMode + dir));
            }
            this.picker
                .find('>div')
                .hide()
                .filter('.datepicker-' + DPGlobal.modes[this.viewMode].clsName)
                .css('display', 'block');
            this.updateNavArrows();
        }
    };

    var DateRangePicker = function (element, options) {
        this.element = $(element);
        this.inputs = $.map(options.inputs, function (i) {
            return i.jquery ? i[0] : i;
        });
        delete options.inputs;

        $(this.inputs)
            .datepicker(options)
            .bind('changeDate', $.proxy(this.dateUpdated, this));

        this.pickers = $.map(this.inputs, function (i) {
            return $(i).data('datepicker');
        });
        this.updateDates();
    };
    DateRangePicker.prototype = {
        updateDates:  function () {
            this.dates = $.map(this.pickers, function (i) {
                return i.getUTCDate();
            });
            this.updateRanges();
        },
        updateRanges: function () {
            var range = $.map(this.dates, function (d) {
                return d.valueOf();
            });
            $.each(this.pickers, function (i, p) {
                p.setRange(range);
            });
        },
        dateUpdated:  function (e) {
            // `this.updating` is a workaround for preventing infinite recursion
            // between `changeDate` triggering and `setUTCDate` calling.  Until
            // there is a better mechanism.
            if (this.updating)
                return;
            this.updating = true;

            var dp = $(e.target).data('datepicker'),
                new_date = dp.getUTCDate(),
                i = $.inArray(e.target, this.inputs),
                l = this.inputs.length;
            if (i === -1)
                return;

            $.each(this.pickers, function (i, p) {
                if (!p.getUTCDate())
                    p.setUTCDate(new_date);
            });

            if (new_date < this.dates[i]) {
                // Date being moved earlier/left
                while (i >= 0 && new_date < this.dates[i]) {
                    this.pickers[i--].setUTCDate(new_date);
                }
            }
            else if (new_date > this.dates[i]) {
                // Date being moved later/right
                while (i < l && new_date > this.dates[i]) {
                    this.pickers[i++].setUTCDate(new_date);
                }
            }
            this.updateDates();

            delete this.updating;
        },
        remove:       function () {
            $.map(this.pickers, function (p) {
                p.remove();
            });
            delete this.element.data().datepicker;
        }
    };

    function opts_from_el(el, prefix) {
        // Derive options from element data-attrs
        var data = $(el).data(),
            out = {}, inkey,
            replace = new RegExp('^' + prefix.toLowerCase() + '([A-Z])');
        prefix = new RegExp('^' + prefix.toLowerCase());
        function re_lower(_, a) {
            return a.toLowerCase();
        }

        for (var key in data)
            if (prefix.test(key)) {
                inkey = key.replace(replace, re_lower);
                out[inkey] = data[key];
            }
        return out;
    }

    function opts_from_locale(lang) {
        // Derive options from locale plugins
        var out = {};
        // Check if "de-DE" style date is available, if not language should
        // fallback to 2 letter code eg "de"
        if (!dates[lang]) {
            lang = lang.split('-')[0];
            if (!dates[lang])
                return;
        }
        var d = dates[lang];
        $.each(locale_opts, function (i, k) {
            if (k in d)
                out[k] = d[k];
        });
        return out;
    }

    var old = $.fn.datepicker;
    $.fn.datepicker = function (option) {
        var args = Array.apply(null, arguments);
        args.shift();
        var internal_return;
        this.each(function () {
            var $this = $(this),
                data = $this.data('datepicker'),
                options = typeof option === 'object' && option;
            if (!data) {
                var elopts = opts_from_el(this, 'date'),
                    // Preliminary otions
                    xopts = $.extend({}, defaults, elopts, options),
                    locopts = opts_from_locale(xopts.language),
                    // Options priority: js args, data-attrs, locales, defaults
                    opts = $.extend({}, defaults, locopts, elopts, options);
                if ($this.is('.input-daterange') || opts.inputs) {
                    var ropts = {
                        inputs: opts.inputs || $this.find('input').toArray()
                    };
                    $this.data('datepicker', (data = new DateRangePicker(this, $.extend(opts, ropts))));
                }
                else {
                    $this.data('datepicker', (data = new Datepicker(this, opts)));
                }
            }
            if (typeof option === 'string' && typeof data[option] === 'function') {
                internal_return = data[option].apply(data, args);
                if (internal_return !== undefined)
                    return false;
            }
        });
        if (internal_return !== undefined)
            return internal_return;
        else
            return this;
    };

    var defaults = $.fn.datepicker.defaults = {
        autoclose:          false,
        beforeShowDay:      $.noop,
        calendarWeeks:      false,
        clearBtn:           false,
        daysOfWeekDisabled: [],
        endDate:            Infinity,
        forceParse:         true,
        format:             'mm/dd/yyyy',
        keyboardNavigation: true,
        language:           'en',
        minViewMode:        0,
        multidate:          false,
        multidateSeparator: ',',
        orientation:        "auto",
        rtl:                false,
        startDate:          -Infinity,
        startView:          0,
        todayBtn:           false,
        todayHighlight:     false,
        weekStart:          0
    };
    var locale_opts = $.fn.datepicker.locale_opts = [
        'format',
        'rtl',
        'weekStart'
    ];
    $.fn.datepicker.Constructor = Datepicker;
    var dates = $.fn.datepicker.dates = {
        en: {
            days:        ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            daysShort:   ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            daysMin:     ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
            months:      ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            today:       "Today",
            clear:       "Clear"
        }
    };

    var DPGlobal = {
        modes:          [
            {
                clsName: 'days',
                navFnc:  'Month',
                navStep: 1
            },
            {
                clsName: 'months',
                navFnc:  'FullYear',
                navStep: 1
            },
            {
                clsName: 'years',
                navFnc:  'FullYear',
                navStep: 10
            }],
        isLeapYear:     function (year) {
            return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
        },
        getDaysInMonth: function (year, month) {
            return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        },
        validParts:     /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
        nonpunctuation: /[^ -\/:-@\[\u3400-\u9fff-`{-~\t\n\r]+/g,
        parseFormat:    function (format) {
            // IE treats \0 as a string end in inputs (truncating the value),
            // so it's a bad format delimiter, anyway
            var separators = format.replace(this.validParts, '\0').split('\0'),
                parts = format.match(this.validParts);
            if (!separators || !separators.length || !parts || parts.length === 0) {
                throw new Error("Invalid date format.");
            }
            return {separators: separators, parts: parts};
        },
        parseDate:      function (date, format, language) {
            if (!date)
                return undefined;
            if (date instanceof Date)
                return date;
            if (typeof format === 'string')
                format = DPGlobal.parseFormat(format);
            var part_re = /([\-+]\d+)([dmwy])/,
                parts = date.match(/([\-+]\d+)([dmwy])/g),
                part, dir, i;
            if (/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(date)) {
                date = new Date();
                for (i = 0; i < parts.length; i++) {
                    part = part_re.exec(parts[i]);
                    dir = parseInt(part[1]);
                    switch (part[2]) {
                        case 'd':
                            date.setUTCDate(date.getUTCDate() + dir);
                            break;
                        case 'm':
                            date = Datepicker.prototype.moveMonth.call(Datepicker.prototype, date, dir);
                            break;
                        case 'w':
                            date.setUTCDate(date.getUTCDate() + dir * 7);
                            break;
                        case 'y':
                            date = Datepicker.prototype.moveYear.call(Datepicker.prototype, date, dir);
                            break;
                    }
                }
                return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
            }
            parts = date && date.match(this.nonpunctuation) || [];
            date = new Date();
            var parsed = {},
                setters_order = ['yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'd', 'dd'],
                setters_map = {
                    yyyy: function (d, v) {
                        return d.setUTCFullYear(v);
                    },
                    yy:   function (d, v) {
                        return d.setUTCFullYear(2000 + v);
                    },
                    m:    function (d, v) {
                        if (isNaN(d))
                            return d;
                        v -= 1;
                        while (v < 0) v += 12;
                        v %= 12;
                        d.setUTCMonth(v);
                        while (d.getUTCMonth() !== v)
                            d.setUTCDate(d.getUTCDate() - 1);
                        return d;
                    },
                    d:    function (d, v) {
                        return d.setUTCDate(v);
                    }
                },
                val, filtered;
            setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
            setters_map['dd'] = setters_map['d'];
            date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
            var fparts = format.parts.slice();
            // Remove noop parts
            if (parts.length !== fparts.length) {
                fparts = $(fparts).filter(function (i, p) {
                    return $.inArray(p, setters_order) !== -1;
                }).toArray();
            }
            // Process remainder
            function match_part() {
                var m = this.slice(0, parts[i].length),
                    p = parts[i].slice(0, m.length);
                return m === p;
            }

            if (parts.length === fparts.length) {
                var cnt;
                for (i = 0, cnt = fparts.length; i < cnt; i++) {
                    val = parseInt(parts[i], 10);
                    part = fparts[i];
                    if (isNaN(val)) {
                        switch (part) {
                            case 'MM':
                                filtered = $(dates[language].months).filter(match_part);
                                val = $.inArray(filtered[0], dates[language].months) + 1;
                                break;
                            case 'M':
                                filtered = $(dates[language].monthsShort).filter(match_part);
                                val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
                                break;
                        }
                    }
                    parsed[part] = val;
                }
                var _date, s;
                for (i = 0; i < setters_order.length; i++) {
                    s = setters_order[i];
                    if (s in parsed && !isNaN(parsed[s])) {
                        _date = new Date(date);
                        setters_map[s](_date, parsed[s]);
                        if (!isNaN(_date))
                            date = _date;
                    }
                }
            }
            return date;
        },
        formatDate:     function (date, format, language) {
            if (!date)
                return '';
            if (typeof format === 'string')
                format = DPGlobal.parseFormat(format);
            var val = {
                d:    date.getUTCDate(),
                D:    dates[language].daysShort[date.getUTCDay()],
                DD:   dates[language].days[date.getUTCDay()],
                m:    date.getUTCMonth() + 1,
                M:    dates[language].monthsShort[date.getUTCMonth()],
                MM:   dates[language].months[date.getUTCMonth()],
                yy:   date.getUTCFullYear().toString().substring(2),
                yyyy: date.getUTCFullYear()
            };
            val.dd = (val.d < 10 ? '0' : '') + val.d;
            val.mm = (val.m < 10 ? '0' : '') + val.m;
            date = [];
            var seps = $.extend([], format.separators);
            for (var i = 0, cnt = format.parts.length; i <= cnt; i++) {
                if (seps.length)
                    date.push(seps.shift());
                date.push(val[format.parts[i]]);
            }
            return date.join('');
        },
        headTemplate:   '<thead>' +
                        '<tr>' +
                        '<th class="prev">&laquo;</th>' +
                        '<th colspan="5" class="datepicker-switch"></th>' +
                        '<th class="next">&raquo;</th>' +
                        '</tr>' +
        '</thead>',
        contTemplate:   '<tbody><tr><td colspan="7"></td></tr></tbody>',
        footTemplate:   '<tfoot>' +
                        '<tr>' +
                        '<th colspan="7" class="today"></th>' +
                        '</tr>' +
                        '<tr>' +
                        '<th colspan="7" class="clear"></th>' +
                        '</tr>' +
        '</tfoot>'
    };
    DPGlobal.template = '<div class="datepicker">' +
    '<div class="datepicker-days">' +
    '<table class=" table-condensed">' +
    DPGlobal.headTemplate +
    '<tbody></tbody>' +
    DPGlobal.footTemplate +
    '</table>' +
    '</div>' +
    '<div class="datepicker-months">' +
    '<table class="table-condensed">' +
    DPGlobal.headTemplate +
    DPGlobal.contTemplate +
    DPGlobal.footTemplate +
    '</table>' +
    '</div>' +
    '<div class="datepicker-years">' +
    '<table class="table-condensed">' +
    DPGlobal.headTemplate +
    DPGlobal.contTemplate +
    DPGlobal.footTemplate +
    '</table>' +
    '</div>' +
    '</div>';

    $.fn.datepicker.DPGlobal = DPGlobal;

    /* DATEPICKER NO CONFLICT
     * =================== */

    $.fn.datepicker.noConflict = function () {
        $.fn.datepicker = old;
        return this;
    };

    /* DATEPICKER DATA-API
     * ================== */

    $(document).on(
        'focus.datepicker.data-api click.datepicker.data-api',
        '[data-provide="datepicker"]',
        function (e) {
            var $this = $(this);
            if ($this.data('datepicker'))
                return;
            e.preventDefault();
            // component click requires us to explicitly show it
            $this.datepicker('show');
        }
    );
    $(function () {
        $('[data-provide="datepicker-inline"]').datepicker();
    });

}(window.jQuery));

// is valid date
function isValidDate(s, format, startDate, endDate) {
    var dateFormat = /^\d{1,4}[\.|\/|-]\d{1,2}[\.|\/|-]\d{1,4}$/,
        validParts = /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
        separators = format.replace(validParts, '\0').split('\0'),
        month = 0, day = 0, year = 0, sMonth, sDay, sYear, eMonth, eDay, eYear,
        dateArray = [], startDateArray = [], endDateArray = [], testDate, nTestDate, startTestDate, endTestDate,
        parts = format.match(validParts);
    if (!separators || !separators.length || !parts || parts.length === 0) {
        return false;
    }
    if (dateFormat.test(s)) {
        // remove any leading zeros from date values
        s = s.replace(/0*(\d*)/gi, "$1");
        dateArray = s.split(/[\.|\/|-]/);
        if (startDate) {
            startDateArray = startDate.split(/[\.|\/|-]/);
        }
        if (endDate) {
            endDateArray = endDate.split(/[\.|\/|-]/);
        }
        for (i = 0; i < parts.length; i++) {
            if (parts[i].match(/dd?|DD?/)) {
                day = dateArray[i];
                sDay = (startDateArray.length && startDateArray[i]) ? startDateArray[i] : 0;
                eDay = (endDateArray.length && endDateArray[i]) ? endDateArray[i] : 0;
            }
            if (parts[i].match(/mm?|MM?/)) {
                // correct month value
                month = dateArray[i] - 1;
                sMonth = (startDateArray.length && startDateArray[i]) ? startDateArray[i] - 1 : 0;
                eMonth = (endDateArray.length && endDateArray[i]) ? endDateArray[i] - 1 : 0;
            }
            if (parts[i].match(/yy(?:yy)?/)) {
                year = dateArray[i];
                sYear = (startDateArray.length && startDateArray[i]) ? startDateArray[i] : 0;
                eYear = (endDateArray.length && endDateArray[i]) ? endDateArray[i] : 0;
                if (dateArray[i].length < 4) {
                    year = (parseInt(dateArray[i]) < 50) ? 2000 + parseInt(dateArray[i]) : 1900 + parseInt(dateArray[i]);
                }
            }
        }
        testDate = new Date(year, month, day);
        nTestDate = testDate.valueOf();
        if (startDate) {
            startTestDate = new Date(sYear, sMonth, sDay).valueOf();
            if (nTestDate < startTestDate) {
                return false;
            }
        }
        if (endDate) {
            endTestDate = new Date(eYear, eMonth, eDay).valueOf();
            if (endTestDate < nTestDate) {
                return false;
            }
        }
        if (testDate.getDate() != day || testDate.getMonth() != month || testDate.getFullYear() != year) {
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
}
/*
 Input Mask plugin for jquery
 http://github.com/RobinHerbots/jquery.inputmask
 Copyright (c) 2010 - 2014 Robin Herbots
 Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
 Version: 3.0.29
 */
(function (e) {
    if (void 0 === e.fn.inputmask) {
        var a = function (a) {
                var e = document.createElement("input");
                a = "on" + a;
                var b = a in e;
                b || (e.setAttribute(a, "return;"), b = "function" == typeof e[a]);
                return b
            }, d = function (a, b, c) {
                return (a = c.aliases[a]) ? (a.alias && d(a.alias, void 0, c), e.extend(!0, c, a), e.extend(!0, c, b), !0) : !1
            }, c = function (a) {
                function b(e) {
                    function z(a, e, b, d) {
                        this.matches = [];
                        this.isGroup = a || !1;
                        this.isOptional = e || !1;
                        this.isQuantifier = b || !1;
                        this.isAlternator = d || !1;
                        this.quantifier = {min: 1, max: 1}
                    }

                    function d(e, b, z) {
                        var c =
                                a.definitions[b], l = 0 == e.matches.length;
                        z = void 0 != z ? z : e.matches.length;
                        if (c && !f) {
                            for (var g = c.prevalidator, p = g ? g.length : 0, m = 1; m < c.cardinality; m++) {
                                var h = p >= m ? g[m - 1] : [], x = h.validator, h = h.cardinality;
                                e.matches.splice(z++, 0, {
                                    fn:             x ? "string" == typeof x ? RegExp(x) : new function () {
                                        this.test = x
                                    } : /./,
                                    cardinality:    h ? h : 1,
                                    optionality:    e.isOptional,
                                    newBlockMarker: l,
                                    casing:         c.casing,
                                    def:            c.definitionSymbol || b
                                })
                            }
                            e.matches.splice(z++, 0, {
                                fn:             c.validator ? "string" == typeof c.validator ? RegExp(c.validator) : new function () {
                                    this.test =
                                        c.validator
                                } : /./,
                                cardinality:    c.cardinality,
                                optionality:    e.isOptional,
                                newBlockMarker: l,
                                casing:         c.casing,
                                def:            c.definitionSymbol || b
                            })
                        } else e.matches.splice(z++, 0, {
                            fn:             null,
                            cardinality:    0,
                            optionality:    e.isOptional,
                            newBlockMarker: l,
                            casing:         null,
                            def:            b
                        }), f = !1
                    }

                    for (var c = /(?:[?*+]|\{[0-9\+\*]+(?:,[0-9\+\*]*)?\})\??|[^.?*+^${[]()|\\]+|./g, f = !1, g = new z, l, p = [], m = []; l = c.exec(e);)switch (l = l[0], l.charAt(0)) {
                        case a.optionalmarker.end:
                        case a.groupmarker.end:
                            var h = p.pop();
                            0 < p.length ? p[p.length - 1].matches.push(h) : g.matches.push(h);
                            break;
                        case a.optionalmarker.start:
                            p.push(new z(!1, !0));
                            break;
                        case a.groupmarker.start:
                            p.push(new z(!0));
                            break;
                        case a.quantifiermarker.start:
                            h = new z(!1, !1, !0);
                            l = l.replace(/[{}]/g, "");
                            var n = l.split(",");
                            l = isNaN(n[0]) ? n[0] : parseInt(n[0]);
                            n = 1 == n.length ? l : isNaN(n[1]) ? n[1] : parseInt(n[1]);
                            if ("*" == n || "+" == n)l = "*" == l ? 0 : 1, a.greedy = !1;
                            h.quantifier = {min: l, max: n};
                            if (0 < p.length) {
                                n = p[p.length - 1].matches;
                                l = n.pop();
                                if (!l.isGroup) {
                                    var k = new z(!0);
                                    k.matches.push(l);
                                    l = k
                                }
                                n.push(l);
                                n.push(h)
                            } else l = g.matches.pop(), l.isGroup ||
                            (k = new z(!0), k.matches.push(l), l = k), g.matches.push(l), g.matches.push(h);
                            break;
                        case a.escapeChar:
                            f = !0;
                            break;
                        case a.alternatormarker:
                            break;
                        default:
                            0 < p.length ? d(p[p.length - 1], l) : (0 < g.matches.length && (h = g.matches[g.matches.length - 1], h.isGroup && (h.isGroup = !1, d(h, a.groupmarker.start, 0), d(h, a.groupmarker.end))), d(g, l))
                    }
                    0 < g.matches.length && m.push(g);
                    return m
                }

                function d(c, g) {
                    if (a.numericInput) {
                        c = c.split("").reverse();
                        for (var f in c)c[f] == a.optionalmarker.start ? c[f] = a.optionalmarker.end : c[f] == a.optionalmarker.end ?
                            c[f] = a.optionalmarker.start : c[f] == a.groupmarker.start ? c[f] = a.groupmarker.end : c[f] == a.groupmarker.end && (c[f] = a.groupmarker.start);
                        c = c.join("")
                    }
                    if (void 0 != c && "" != c) {
                        if (0 < a.repeat || "*" == a.repeat || "+" == a.repeat)c = a.groupmarker.start + c + a.groupmarker.end + a.quantifiermarker.start + ("*" == a.repeat ? 0 : "+" == a.repeat ? 1 : a.repeat) + "," + a.repeat + a.quantifiermarker.end;
                        void 0 == e.inputmask.masksCache[c] && (e.inputmask.masksCache[c] = {
                            mask:           c,
                            maskToken:      b(c),
                            validPositions: {},
                            _buffer:        void 0,
                            buffer:         void 0,
                            tests:          {},
                            metadata:       g
                        });
                        return e.extend(!0, {}, e.inputmask.masksCache[c])
                    }
                }

                var c = [];
                e.isFunction(a.mask) && (a.mask = a.mask.call(this, a));
                e.isArray(a.mask) ? e.each(a.mask, function (a, e) {
                    void 0 != e.mask ? c.push(d(e.mask.toString(), e)) : c.push(d(e.toString()))
                }) : (1 == a.mask.length && !1 == a.greedy && 0 != a.repeat && (a.placeholder = ""), c = void 0 != a.mask.mask ? d(a.mask.mask.toString(), a.mask) : d(a.mask.toString()));
                return c
            }, g = "function" === typeof ScriptEngineMajorVersion ? ScriptEngineMajorVersion() : 10 <= (new Function("/*@cc_on return @_jscript_version; @*/"))(),
            b = navigator.userAgent, f = null !== b.match(/iphone/i), k = null !== b.match(/android.*safari.*/i), v = null !== b.match(/android.*chrome.*/i), q = null !== b.match(/android.*firefox.*/i), N = /Kindle/i.test(b) || /Silk/i.test(b) || /KFTT/i.test(b) || /KFOT/i.test(b) || /KFJWA/i.test(b) || /KFJWI/i.test(b) || /KFSOWI/i.test(b) || /KFTHWA/i.test(b) || /KFTHWI/i.test(b) || /KFAPWA/i.test(b) || /KFAPWI/i.test(b), I = a("paste") ? "paste" : a("input") ? "input" : "propertychange", C = function (a, c, b) {
                function d(u, t, e) {
                    t = t || 0;
                    var b = [], f, s = 0, g;
                    do {
                        if (!0 === u &&
                            a.validPositions[s]) {
                            var m = a.validPositions[s];
                            g = m.match;
                            f = m.locator.slice();
                            b.push(null == g.fn ? g.def : !0 === e ? m.input : c.placeholder.charAt(s % c.placeholder.length))
                        } else f = t > s ? l(s, f, s - 1)[0] : C(s, f, s - 1), g = f.match, f = f.locator.slice(), b.push(null == g.fn ? g.def : c.placeholder.charAt(s % c.placeholder.length));
                        s++
                    } while ((void 0 == G || s - 1 < G) && null != g.fn || null == g.fn && "" != g.def || t >= s);
                    b.pop();
                    return b
                }

                function x(c) {
                    var t = a;
                    t.buffer = void 0;
                    t.tests = {};
                    !0 !== c && (t._buffer = void 0, t.validPositions = {}, t.p = -1)
                }

                function n(u) {
                    var t =
                            a, b = -1, d = t.validPositions;
                    if (e.isFunction(c.getLastValidPosition))b = c.getLastValidPosition.call(r, t, u, c); else {
                        void 0 == u && (u = -1);
                        var t = b, f;
                        for (f in d) {
                            var s = parseInt(f);
                            if (-1 == u || null != d[s].match.fn)s < u && (t = s), s >= u && (b = s)
                        }
                        b = 1 < u - t || b < u ? t : b
                    }
                    return b
                }

                function U(u, b, d) {
                    if (c.insertMode && void 0 != a.validPositions[u] && void 0 == d) {
                        d = e.extend(!0, {}, a.validPositions);
                        var f = n(), g;
                        for (g = u; g <= f; g++)delete a.validPositions[g];
                        a.validPositions[u] = b;
                        b = !0;
                        for (g = u; g <= f; g++) {
                            u = d[g];
                            if (void 0 != u) {
                                var s = null == u.match.fn ?
                                g + 1 : B(g);
                                b = aa(s, u.match.def) ? b && !1 !== V(s, u.input, !0, !0) : !1
                            }
                            if (!b)break
                        }
                        if (!b)return a.validPositions = e.extend(!0, {}, d), !1
                    } else a.validPositions[u] = b;
                    return !0
                }

                function C(a, b, e) {
                    a = l(a, b, e);
                    var d, g;
                    for (g in a)if (d = a[g], c.greedy || (!1 === d.match.optionality || !1 === d.match.newBlockMarker) && !0 !== d.match.optionalQuantifier)break;
                    return d
                }

                function O(c) {
                    return a.validPositions[c] ? a.validPositions[c].match : l(c)[0].match
                }

                function aa(a, c) {
                    var b = !1, e = l(a), d;
                    for (d in e)if (e[d].match.def == c) {
                        b = !0;
                        break
                    }
                    return b
                }

                function l(c,
                           b, e) {
                    function d(a, b, e, t) {
                        function g(e, t, p) {
                            if (f == c && void 0 == e.matches)return l.push({match: e, locator: t.reverse()}), !0;
                            if (void 0 != e.matches)if (e.isGroup && !0 !== p) {
                                if (e = g(a.matches[E + 1], t))return !0
                            } else if (e.isOptional) {
                                var h = e;
                                if (e = d(e, b, t, p))e = l[l.length - 1].match, (e = 0 == h.matches.indexOf(e)) && (m = !0), f = c
                            } else {
                                if (!e.isAlternator)if (e.isQuantifier && !0 !== p)for (h = e, p = 0 < b.length && !0 !== p ? b.shift() : 0; p < (isNaN(h.quantifier.max) ? p + 1 : h.quantifier.max) && f <= c; p++) {
                                    var Z = a.matches[a.matches.indexOf(h) - 1];
                                    if (e = g(Z,
                                            [p].concat(t), !0))if (e = l[l.length - 1].match, e.optionalQuantifier = p > h.quantifier.min - 1, e = 0 == Z.matches.indexOf(e))if (p > h.quantifier.min - 1) {
                                        m = !0;
                                        f = c;
                                        break
                                    } else return !0; else return !0
                                } else if (e = d(e, b, t, p))return !0
                            } else f++
                        }

                        for (var E = 0 < b.length ? b.shift() : 0; E < a.matches.length; E++)if (!0 !== a.matches[E].isQuantifier) {
                            var p = g(a.matches[E], [E].concat(e), t);
                            if (p && f == c)return p;
                            if (f > c)break
                        }
                    }

                    var g = a.maskToken, f = b ? e : 0;
                    e = b || [0];
                    var l = [], m = !1;
                    if (void 0 == b) {
                        b = c - 1;
                        for (var p; void 0 == (p = a.validPositions[b]) && -1 < b;)b--;
                        if (void 0 != p && -1 < b)f = b, e = p.locator.slice(); else {
                            for (b = c - 1; void 0 == (p = a.tests[b]) && -1 < b;)b--;
                            void 0 != p && -1 < b && (f = b, e = p[0].locator.slice())
                        }
                    }
                    for (b = e.shift(); b < g.length && !(d(g[b], e, [b]) && f == c || f > c); b++);
                    (0 == l.length || m) && l.push({
                        match:      {
                            fn:          null,
                            cardinality: 0,
                            optionality: !0,
                            casing:      null,
                            def:         ""
                        }, locator: []
                    });
                    return a.tests[c] = l
                }

                function A() {
                    void 0 == a._buffer && (a._buffer = d(!1, 1));
                    return a._buffer
                }

                function m() {
                    void 0 == a.buffer && (a.buffer = d(!0, n(), !0));
                    return a.buffer
                }

                function F(a, b) {
                    for (var e = m().slice(),
                             d = a; d < b; d++)e[d] != P(d) && e[d] != c.skipOptionalPartCharacter && V(d, e[d], !0, !0)
                }

                function ga(a, c) {
                    switch (c.casing) {
                        case "upper":
                            a = a.toUpperCase();
                            break;
                        case "lower":
                            a = a.toLowerCase()
                    }
                    return a
                }

                function V(b, d, g, f) {
                    function p(b, u, d, t) {
                        var g = !1;
                        e.each(l(b), function (f, E) {
                            for (var s = E.match, p = u ? 1 : 0, h = "", ha = m(), Q = s.cardinality; Q > p; Q--)h += void 0 == a.validPositions[b - (Q - 1)] ? P(b - (Q - 1)) : a.validPositions[b - (Q - 1)].input;
                            u && (h += u);
                            g = null != s.fn ? s.fn.test(h, ha, b, d, c) : u != s.def && u != c.skipOptionalPartCharacter || "" == s.def ? !1 :
                            {c: s.def, pos: b};
                            if (!1 !== g) {
                                p = void 0 != g.c ? g.c : u;
                                p = p == c.skipOptionalPartCharacter && null === s.fn ? s.def : p;
                                h = b;
                                if (g.refreshFromBuffer) {
                                    h = g.refreshFromBuffer;
                                    d = !0;
                                    !0 === h ? (a.validPositions = {}, a.tests = {}, F(0, m().length)) : F(h.start, h.end);
                                    if (void 0 == g.pos && void 0 == g.c)return g.pos = n(), !1;
                                    h = void 0 != g.pos ? g.pos : b;
                                    E = l(h)[0]
                                } else!0 !== g && g.pos != b && (h = g.pos, F(b, h), E = l(h)[0]);
                                0 < f && x(!0);
                                U(h, e.extend({}, E, {input: ga(p, s)}), t) || (g = !1);
                                return !1
                            }
                        });
                        return g
                    }

                    g = !0 === g;
                    var s = p(b, d, g, f);
                    if (!g && !1 === s) {
                        var h = a.validPositions[b];
                        if (h && null == h.match.fn && (h.match.def == d || d == c.skipOptionalPartCharacter))s = {caret: B(b)}; else if ((c.insertMode || void 0 == a.validPositions[B(b)]) && !K(b))for (var h = b + 1, A = B(b); h <= A; h++)if (s = p(h, d, g, f), !1 !== s) {
                            b = h;
                            break
                        }
                    }
                    !0 === s && (s = {pos: b});
                    return s
                }

                function K(a) {
                    a = O(a);
                    return null != a.fn ? a.fn : !1
                }

                function L() {
                    var b;
                    G = r.prop("maxLength");
                    -1 == G && (G = void 0);
                    if (!1 == c.greedy) {
                        var e;
                        e = n();
                        b = a.validPositions[e];
                        var d = void 0 != b ? b.locator.slice() : void 0;
                        for (e += 1; void 0 == b || null != b.match.fn || null == b.match.fn && "" !=
                        b.match.def; e++)b = C(e, d, e - 1), d = b.locator.slice();
                        b = e
                    } else b = m().length;
                    return void 0 == G || b < G ? b : G
                }

                function B(a) {
                    var b = L();
                    if (a >= b)return b;
                    for (; ++a < b && !K(a) && (!0 !== c.nojumps || c.nojumpsThreshold > a););
                    return a
                }

                function T(a) {
                    if (0 >= a)return 0;
                    for (; 0 < --a && !K(a););
                    return a
                }

                function D(a, c, b) {
                    a._valueSet(c.join(""));
                    void 0 != b && w(a, b)
                }

                function P(a, b) {
                    b = b || O(a);
                    return null == b.fn ? b.def : c.placeholder.charAt(a % c.placeholder.length)
                }

                function M(c, b, d, g, f) {
                    g = void 0 != g ? g.slice() : fa(c._valueGet()).split("");
                    x();
                    b &&
                    c._valueSet("");
                    e.each(g, function (b, g) {
                        if (!0 === f) {
                            var t = a.p, t = -1 == t ? t : T(t), l = -1 == t ? b : B(t);
                            -1 == e.inArray(g, A().slice(t + 1, l)) && X.call(c, void 0, !0, g.charCodeAt(0), !1, d, b)
                        } else X.call(c, void 0, !0, g.charCodeAt(0), !1, d, b), d = d || 0 < b && b > a.p
                    });
                    b && D(c, m(), B(n(0)))
                }

                function $(a) {
                    return e.inputmask.escapeRegex.call(this, a)
                }

                function fa(a) {
                    return a.replace(RegExp("(" + $(A().join("")) + ")*$"), "")
                }

                function W(c) {
                    var b = m().slice(), e, d = n(), g = {}, f = a.validPositions[d].locator.slice(), l;
                    for (e = d + 1; e < b.length; e++)l = C(e, f, e -
                    1), f = l.locator.slice(), g[e] = l;
                    for (e = b.length - 1; e > d; e--)if (l = g[e].match, l.optionality && b[e] == P(e, l))b.pop(); else break;
                    D(c, b)
                }

                function ia(b, d) {
                    if (!b.data("_inputmask") || !0 !== d && b.hasClass("hasDatepicker"))return b[0]._valueGet();
                    var g = [], f = a.validPositions, l;
                    for (l in f)null != f[l].match.fn && g.push(f[l].input);
                    g = (y ? g.reverse() : g).join("");
                    f = (y ? m().reverse() : m()).join("");
                    return e.isFunction(c.onUnMask) ? c.onUnMask.call(b, f, g, c) : g
                }

                function J(a) {
                    !y || "number" != typeof a || c.greedy && "" == c.placeholder || (a = m().length -
                    a);
                    return a
                }

                function w(a, b, d) {
                    a = a.jquery && 0 < a.length ? a[0] : a;
                    if ("number" == typeof b) {
                        b = J(b);
                        d = J(d);
                        d = "number" == typeof d ? d : b;
                        var g = e(a).data("_inputmask") || {};
                        g.caret = {begin: b, end: d};
                        e(a).data("_inputmask", g);
                        e(a).is(":visible") && (a.scrollLeft = a.scrollWidth, !1 == c.insertMode && b == d && d++, a.setSelectionRange ? (a.selectionStart = b, a.selectionEnd = d) : a.createTextRange && (a = a.createTextRange(), a.collapse(!0), a.moveEnd("character", d), a.moveStart("character", b), a.select()))
                    } else return g = e(a).data("_inputmask"),
                        !e(a).is(":visible") && g && void 0 != g.caret ? (b = g.caret.begin, d = g.caret.end) : a.setSelectionRange ? (b = a.selectionStart, d = a.selectionEnd) : document.selection && document.selection.createRange && (a = document.selection.createRange(), b = 0 - a.duplicate().moveStart("character", -1E5), d = b + a.text.length), b = J(b), d = J(d), {
                        begin: b,
                        end: d
                    }
                }

                function R(a) {
                    if (e.isFunction(c.isComplete))return c.isComplete.call(r, a, c);
                    if ("*" != c.repeat) {
                        var b = !1, d = T(L());
                        if (n() == d)for (var b = !0, g = 0; g <= d; g++) {
                            var f = K(g);
                            if (f && (void 0 == a[g] || a[g] ==
                                P(g)) || !f && a[g] != P(g)) {
                                b = !1;
                                break
                            }
                        }
                        return b
                    }
                }

                function ja(a) {
                    a = e._data(a).events;
                    e.each(a, function (a, b) {
                        e.each(b, function (a, b) {
                            if ("inputmask" == b.namespace && "setvalue" != b.type) {
                                var c = b.handler;
                                b.handler = function (a) {
                                    if (this.readOnly || this.disabled)a.preventDefault; else return c.apply(this, arguments)
                                }
                            }
                        })
                    })
                }

                function ka(a) {
                    function b(a) {
                        if (void 0 == e.valHooks[a] || !0 != e.valHooks[a].inputmaskpatch) {
                            var c = e.valHooks[a] && e.valHooks[a].get ? e.valHooks[a].get : function (a) {
                                return a.value
                            }, d = e.valHooks[a] && e.valHooks[a].set ?
                                e.valHooks[a].set : function (a, b) {
                                a.value = b;
                                return a
                            };
                            e.valHooks[a] = {
                                get:               function (a) {
                                    var b = e(a);
                                    if (b.data("_inputmask")) {
                                        if (b.data("_inputmask").opts.autoUnmask)return b.inputmask("unmaskedvalue");
                                        a = c(a);
                                        b = (b = b.data("_inputmask").maskset._buffer) ? b.join("") : "";
                                        return a != b ? a : ""
                                    }
                                    return c(a)
                                }, set:            function (a, b) {
                                    var c = e(a), g = d(a, b);
                                    c.data("_inputmask") && c.triggerHandler("setvalue.inputmask");
                                    return g
                                }, inputmaskpatch: !0
                            }
                        }
                    }

                    var c;
                    Object.getOwnPropertyDescriptor && (c = Object.getOwnPropertyDescriptor(a, "value"));
                    if (c && c.get) {
                        if (!a._valueGet) {
                            var d = c.get, g = c.set;
                            a._valueGet = function () {
                                return y ? d.call(this).split("").reverse().join("") : d.call(this)
                            };
                            a._valueSet = function (a) {
                                g.call(this, y ? a.split("").reverse().join("") : a)
                            };
                            Object.defineProperty(a, "value", {
                                get:    function () {
                                    var a = e(this), b = e(this).data("_inputmask"), c = b.maskset;
                                    return b && b.opts.autoUnmask ? a.inputmask("unmaskedvalue") : d.call(this) != c._buffer.join("") ? d.call(this) : ""
                                }, set: function (a) {
                                    g.call(this, a);
                                    e(this).triggerHandler("setvalue.inputmask")
                                }
                            })
                        }
                    } else document.__lookupGetter__ &&
                    a.__lookupGetter__("value") ? a._valueGet || (d = a.__lookupGetter__("value"), g = a.__lookupSetter__("value"), a._valueGet = function () {
                        return y ? d.call(this).split("").reverse().join("") : d.call(this)
                    }, a._valueSet = function (a) {
                        g.call(this, y ? a.split("").reverse().join("") : a)
                    }, a.__defineGetter__("value", function () {
                        var a = e(this), b = e(this).data("_inputmask"), c = b.maskset;
                        return b && b.opts.autoUnmask ? a.inputmask("unmaskedvalue") : d.call(this) != c._buffer.join("") ? d.call(this) : ""
                    }), a.__defineSetter__("value", function (a) {
                        g.call(this,
                            a);
                        e(this).triggerHandler("setvalue.inputmask")
                    })) : (a._valueGet || (a._valueGet = function () {
                        return y ? this.value.split("").reverse().join("") : this.value
                    }, a._valueSet = function (a) {
                        this.value = y ? a.split("").reverse().join("") : a
                    }), b(a.type))
                }

                function ba(b, e, d) {
                    if (c.numericInput || y) {
                        switch (e) {
                            case c.keyCode.BACKSPACE:
                                e = c.keyCode.DELETE;
                                break;
                            case c.keyCode.DELETE:
                                e = c.keyCode.BACKSPACE
                        }
                        y && (b = d.end, d.end = d.begin, d.begin = b)
                    }
                    d.begin == d.end ? e == c.keyCode.BACKSPACE ? d.begin = T(d.begin) : e == c.keyCode.DELETE && d.end++ :
                    1 != d.end - d.begin || c.insertMode || e == c.keyCode.BACKSPACE && d.begin--;
                    b = d.begin;
                    var g = d.end;
                    for (e = b; b < g; b++)delete a.validPositions[b];
                    for (b = g; b <= n();) {
                        var g = a.validPositions[b], f = a.validPositions[e];
                        void 0 != g && void 0 == f ? (aa(e, g.match.def) && !1 !== V(e, g.input, !0) && (delete a.validPositions[b], b++), e++) : b++
                    }
                    for (e = n(); 0 < e && (void 0 == a.validPositions[e] || null == a.validPositions[e].match.fn);)delete a.validPositions[e], e--;
                    x(!0);
                    e = B(-1);
                    n() < e ? a.p = e : a.p = d.begin
                }

                function ca(b) {
                    Y = !1;
                    var d = this, g = e(d), l = b.keyCode,
                        h = w(d);
                    l == c.keyCode.BACKSPACE || l == c.keyCode.DELETE || f && 127 == l || b.ctrlKey && 88 == l ? (b.preventDefault(), 88 == l && (H = m().join("")), ba(d, l, h), D(d, m(), a.p), d._valueGet() == A().join("") && g.trigger("cleared"), c.showTooltip && g.prop("title", a.mask)) : l == c.keyCode.END || l == c.keyCode.PAGE_DOWN ? setTimeout(function () {
                        var a = B(n());
                        c.insertMode || a != L() || b.shiftKey || a--;
                        w(d, b.shiftKey ? h.begin : a, a)
                    }, 0) : l == c.keyCode.HOME && !b.shiftKey || l == c.keyCode.PAGE_UP ? w(d, 0, b.shiftKey ? h.begin : 0) : l == c.keyCode.ESCAPE || 90 == l && b.ctrlKey ?
                        (M(d, !0, !1, H.split("")), g.click()) : l != c.keyCode.INSERT || b.shiftKey || b.ctrlKey ? !1 != c.insertMode || b.shiftKey || (l == c.keyCode.RIGHT ? setTimeout(function () {
                        var a = w(d);
                        w(d, a.begin)
                    }, 0) : l == c.keyCode.LEFT && setTimeout(function () {
                        var a = w(d);
                        w(d, a.begin - 1)
                    }, 0)) : (c.insertMode = !c.insertMode, w(d, c.insertMode || h.begin != L() ? h.begin : h.begin - 1));
                    var g = w(d), p = c.onKeyDown.call(this, b, m(), c);
                    p && !0 === p.refreshFromBuffer && (a.validPositions = {}, a.tests = {}, F(0, m().length), x(!0), D(d, m()), w(d, g.begin, g.end));
                    da = -1 != e.inArray(l,
                        c.ignorables)
                }

                function X(b, d, g, f, l, h) {
                    if (void 0 == g && Y)return !1;
                    Y = !0;
                    var p = e(this);
                    b = b || window.event;
                    g = d ? g : b.which || b.charCode || b.keyCode;
                    if (!(!0 === d || b.ctrlKey && b.altKey) && (b.ctrlKey || b.metaKey || da))return !0;
                    if (g) {
                        !0 !== d && 46 == g && !1 == b.shiftKey && "," == c.radixPoint && (g = 44);
                        var A;
                        g = String.fromCharCode(g);
                        d ? (h = l ? h : n() + 1, h = {begin: h, end: h}) : h = w(this);
                        var F = y ? 1 < h.begin - h.end || 1 == h.begin - h.end && c.insertMode : 1 < h.end - h.begin || 1 == h.end - h.begin && c.insertMode;
                        F && (a.undoPositions = e.extend(!0, {}, a.validPositions),
                            ba(this, c.keyCode.DELETE, h), c.insertMode || (c.insertMode = !c.insertMode, U(h.begin, l), c.insertMode = !c.insertMode), F = !c.multi);
                        a.writeOutBuffer = !0;
                        var k = h.begin, r = V(k, g, l);
                        !1 !== r && (!0 !== r && (k = void 0 != r.pos ? r.pos : k, g = void 0 != r.c ? r.c : g), x(!0), void 0 != r.caret ? A = r.caret : (l = a.validPositions, A = void 0 != l[k + 1] && C(h + 1, l[k].locator.slice(), k).match.def != l[k + 1].match.def ? k + 1 : B(k)), a.p = A);
                        if (!1 !== f) {
                            var q = this;
                            setTimeout(function () {
                                c.onKeyValidation.call(q, r, c)
                            }, 0);
                            if (a.writeOutBuffer && !1 !== r) {
                                var O = m();
                                D(this, O,
                                    d ? void 0 : c.numericInput ? T(A) : A);
                                !0 !== d && setTimeout(function () {
                                    !0 === R(O) && p.trigger("complete");
                                    S = !0;
                                    p.trigger("input")
                                }, 0)
                            } else F && (a.buffer = void 0, a.validPositions = a.undoPositions)
                        } else F && (a.buffer = void 0, a.validPositions = a.undoPositions);
                        c.showTooltip && p.prop("title", a.mask);
                        b && !0 != d && (b.preventDefault ? b.preventDefault() : b.returnValue = !1)
                    }
                }

                function la(b) {
                    var d = e(this), g = b.keyCode, f = m();
                    (b = c.onKeyUp.call(this, b, f, c)) && !0 === b.refreshFromBuffer && (a.validPositions = {}, a.tests = {}, F(0, m().length), x(!0),
                        D(this, m()));
                    g == c.keyCode.TAB && c.showMaskOnFocus && (d.hasClass("focus.inputmask") && 0 == this._valueGet().length ? (x(), f = m(), D(this, f), w(this, 0), H = m().join("")) : (D(this, f), w(this, J(0), J(L()))))
                }

                function ea(a) {
                    if (!0 === S && "input" == a.type)return S = !1, !0;
                    var b = this, d = e(b);
                    if ("propertychange" == a.type && b._valueGet().length <= L())return !0;
                    setTimeout(function () {
                        var a = e.isFunction(c.onBeforePaste) ? c.onBeforePaste.call(b, b._valueGet(), c) : b._valueGet();
                        M(b, !0, !1, a.split(""), !0);
                        !0 === R(m()) && d.trigger("complete");
                        d.click()
                    }, 0)
                }

                function ma(a) {
                    if (!0 === S && "input" == a.type)return S = !1, !0;
                    var b = w(this), d = this._valueGet(), d = d.replace(RegExp("(" + $(A().join("")) + ")*"), "");
                    b.begin > d.length && (w(this, d.length), b = w(this));
                    1 != m().length - d.length || d.charAt(b.begin) == m()[b.begin] || d.charAt(b.begin + 1) == m()[b.begin] || K(b.begin) || (a.keyCode = c.keyCode.BACKSPACE, ca.call(this, a));
                    a.preventDefault()
                }

                function na(b) {
                    r = e(b);
                    if (r.is(":input")) {
                        r.data("_inputmask", {maskset: a, opts: c, isRTL: !1});
                        c.showTooltip && r.prop("title", a.mask);
                        ka(b);
                        ("rtl" == b.dir || c.rightAlign) && r.css("text-align", "right");
                        if ("rtl" == b.dir || c.numericInput) {
                            b.dir = "ltr";
                            r.removeAttr("dir");
                            var d = r.data("_inputmask");
                            d.isRTL = !0;
                            r.data("_inputmask", d);
                            y = !0
                        }
                        r.unbind(".inputmask");
                        r.removeClass("focus.inputmask");
                        r.closest("form").bind("submit", function () {
                            H != m().join("") && r.change()
                        }).bind("reset", function () {
                            setTimeout(function () {
                                r.trigger("setvalue")
                            }, 0)
                        });
                        r.bind("mouseenter.inputmask", function () {
                            !e(this).hasClass("focus.inputmask") && c.showMaskOnHover && this._valueGet() !=
                            m().join("") && D(this, m())
                        }).bind("blur.inputmask", function () {
                            var a = e(this);
                            if (a.data("_inputmask")) {
                                var b = this._valueGet(), d = m();
                                a.removeClass("focus.inputmask");
                                H != m().join("") && a.change();
                                c.clearMaskOnLostFocus && "" != b && (b == A().join("") ? this._valueSet("") : W(this));
                                !1 === R(d) && (a.trigger("incomplete"), c.clearIncomplete && (x(), c.clearMaskOnLostFocus ? this._valueSet("") : (d = A().slice(), D(this, d))))
                            }
                        }).bind("focus.inputmask", function () {
                            var a = e(this), b = this._valueGet();
                            c.showMaskOnFocus && !a.hasClass("focus.inputmask") &&
                            (!c.showMaskOnHover || c.showMaskOnHover && "" == b) && this._valueGet() != m().join("") && D(this, m(), B(n()));
                            a.addClass("focus.inputmask");
                            H = m().join("")
                        }).bind("mouseleave.inputmask", function () {
                            var a = e(this);
                            c.clearMaskOnLostFocus && (a.hasClass("focus.inputmask") || this._valueGet() == a.attr("placeholder") || (this._valueGet() == A().join("") || "" == this._valueGet() ? this._valueSet("") : W(this)))
                        }).bind("click.inputmask", function () {
                            var a = this;
                            setTimeout(function () {
                                var b = w(a);
                                m();
                                if (b.begin == b.end) {
                                    var b = y ? J(b.begin) :
                                        b.begin, c = n(b), c = B(c);
                                    b < c ? K(b) ? w(a, b) : w(a, B(b)) : w(a, c)
                                }
                            }, 0)
                        }).bind("dblclick.inputmask", function () {
                            var a = this;
                            setTimeout(function () {
                                w(a, 0, B(n()))
                            }, 0)
                        }).bind(I + ".inputmask dragdrop.inputmask drop.inputmask", ea).bind("setvalue.inputmask", function () {
                            M(this, !0);
                            H = m().join("");
                            this._valueGet() == A().join("") && this._valueSet("")
                        }).bind("complete.inputmask", c.oncomplete).bind("incomplete.inputmask", c.onincomplete).bind("cleared.inputmask", c.oncleared);
                        r.bind("keydown.inputmask", ca).bind("keypress.inputmask",
                            X).bind("keyup.inputmask", la);
                        if (k || q || v || N)"input" == I && r.unbind(I + ".inputmask"), r.bind("input.inputmask", ma);
                        g && r.bind("input.inputmask", ea);
                        d = e.isFunction(c.onBeforeMask) ? c.onBeforeMask.call(b, b._valueGet(), c) : b._valueGet();
                        M(b, !1, !1, d.split(""), !0);
                        D(b, m());
                        H = m().join("");
                        var f;
                        try {
                            f = document.activeElement
                        } catch (l) {
                        }
                        f === b ? (r.addClass("focus.inputmask"), w(b, B(n()))) : c.clearMaskOnLostFocus ? m().join("") == A().join("") ? b._valueSet("") : W(b) : D(b, m());
                        ja(b)
                    }
                }

                var y = !1, H = m().join(""), r, Y = !1, S = !1, da = !1, G;
                if (void 0 != b)switch (b.action) {
                    case "isComplete":
                        return r = e(b.el), R(b.buffer);
                    case "unmaskedvalue":
                        return r = b.$input, y = b.$input.data("_inputmask").isRTL, ia(b.$input, b.skipDatepickerCheck);
                    case "mask":
                        na(b.el);
                        break;
                    case "format":
                        return r = e({}), r.data("_inputmask", {
                            maskset: a,
                            opts:    c,
                            isRTL:   c.numericInput
                        }), c.numericInput && (y = !0), b = b.value.split(""), M(r, !1, !1, y ? b.reverse() : b, !0), y ? m().reverse().join("") : m().join("");
                    case "isValid":
                        return r = e({}), r.data("_inputmask", {maskset: a, opts: c, isRTL: c.numericInput}),
                        c.numericInput && (y = !0), b = b.value.split(""), M(r, !1, !0, y ? b.reverse() : b), R(m())
                }
            }, n = function (a, b, c) {
                function d(b, f, h) {
                    b = b.jquery && 0 < b.length ? b[0] : b;
                    if ("number" == typeof f) {
                        f = g(f);
                        h = g(h);
                        h = "number" == typeof h ? h : f;
                        if (b != a) {
                            var n = e(b).data("_inputmask") || {};
                            n.caret = {begin: f, end: h};
                            e(b).data("_inputmask", n)
                        }
                        e(b).is(":visible") && (b.scrollLeft = b.scrollWidth, !1 == c.insertMode && f == h && h++, b.setSelectionRange ? (b.selectionStart = f, b.selectionEnd = h) : b.createTextRange && (b = b.createTextRange(), b.collapse(!0), b.moveEnd("character",
                            h), b.moveStart("character", f), b.select()))
                    } else return n = e(b).data("_inputmask"), !e(b).is(":visible") && n && void 0 != n.caret ? (f = n.caret.begin, h = n.caret.end) : b.setSelectionRange ? (f = b.selectionStart, h = b.selectionEnd) : document.selection && document.selection.createRange && (b = document.selection.createRange(), f = 0 - b.duplicate().moveStart("character", -1E5), h = f + b.text.length), f = g(f), h = g(h), {
                        begin: f,
                        end: h
                    }
                }

                function g(b) {
                    !k || "number" != typeof b || c.greedy && "" == c.placeholder || (b = a.value.length - b);
                    return b
                }

                function f(b,
                           g) {
                    if ("multiMaskScope" != b) {
                        if (e.isFunction(c.determineActiveMasksetIndex))q = c.determineActiveMasksetIndex.call(n, b, g); else {
                            var m = -1, k = -1, z = -1;
                            e.each(g, function (a, b) {
                                var c = e(b).data("_inputmask").maskset, g = -1, f = 0, l = d(b).begin, p;
                                for (p in c.validPositions)c = parseInt(p), c > g && (g = c), f++;
                                if (f > m || f == m && k > l && z > g || f == m && k == l && z < g)m = f, k = l, q = a, z = g
                            })
                        }
                        var x = n.data("_inputmask-multi") || {activeMasksetIndex: 0, elmasks: g};
                        x.activeMasksetIndex = q;
                        n.data("_inputmask-multi", x)
                    }
                    -1 == ["focus"].indexOf(b) && a.value != g[q]._valueGet() &&
                    (x = "" == e(g[q]).val() ? g[q]._valueGet() : e(g[q]).val(), a.value = x);
                    -1 == ["blur", "focus"].indexOf(b) && e(g[q]).hasClass("focus.inputmask") && (x = d(g[q]), d(a, x.begin, x.end))
                }

                c.multi = !0;
                var n = e(a), k = "rtl" == a.dir || c.numericInput, q = 0, v = e.map(b, function (a, b) {
                    var d = '<input type="text" ';
                    n.attr("value") && (d += 'value="' + n.attr("value") + '" ');
                    n.attr("dir") && (d += 'dir="' + n.attr("dir") + '" ');
                    d = e(d + "/>")[0];
                    C(e.extend(!0, {}, a), c, {action: "mask", el: d});
                    return d
                });
                n.data("_inputmask-multi", {activeMasksetIndex: 0, elmasks: v});
                ("rtl" == a.dir || c.rightAlign) && n.css("text-align", "right");
                a.dir = "ltr";
                n.removeAttr("dir");
                "" != n.attr("value") && f("init", v);
                n.bind("mouseenter blur focus mouseleave click dblclick keydown keypress keypress", function (b) {
                    var n = d(a), m, k = !0;
                    if ("keydown" == b.type) {
                        m = b.keyCode;
                        if (m == c.keyCode.DOWN && q < v.length - 1)return q++, f("multiMaskScope", v), !1;
                        if (m == c.keyCode.UP && 0 < q)return q--, f("multiMaskScope", v), !1;
                        if (b.ctrlKey || b.shiftKey || b.altKey)return !0
                    } else if ("keypress" == b.type && (b.ctrlKey || b.shiftKey || b.altKey))return !0;
                    e.each(v, function (a, f) {
                        if ("keydown" == b.type) {
                            m = b.keyCode;
                            if (m == c.keyCode.BACKSPACE && f._valueGet().length < n.begin)return;
                            if (m == c.keyCode.TAB)k = !1; else {
                                if (m == c.keyCode.RIGHT) {
                                    d(f, n.begin + 1, n.end + 1);
                                    k = !1;
                                    return
                                }
                                if (m == c.keyCode.LEFT) {
                                    d(f, n.begin - 1, n.end - 1);
                                    k = !1;
                                    return
                                }
                            }
                        }
                        if (-1 != ["click"].indexOf(b.type) && (d(f, g(n.begin), g(n.end)), n.begin != n.end)) {
                            k = !1;
                            return
                        }
                        -1 != ["keydown"].indexOf(b.type) && n.begin != n.end && d(f, n.begin, n.end);
                        e(f).triggerHandler(b)
                    });
                    k && setTimeout(function () {
                        f(b.type, v)
                    }, 0)
                });
                n.bind(I +
                " dragdrop drop setvalue", function (b) {
                    d(a);
                    setTimeout(function () {
                        e.each(v, function (c, d) {
                            d._valueSet(a.value);
                            e(d).triggerHandler(b)
                        });
                        setTimeout(function () {
                            f(b.type, v)
                        }, 0)
                    }, 0)
                });
                (function (a) {
                    if (void 0 == e.valHooks[a] || !0 != e.valHooks[a].inputmaskmultipatch) {
                        var b = e.valHooks[a] && e.valHooks[a].get ? e.valHooks[a].get : function (a) {
                            return a.value
                        }, c = e.valHooks[a] && e.valHooks[a].set ? e.valHooks[a].set : function (a, b) {
                            a.value = b;
                            return a
                        };
                        e.valHooks[a] = {
                            get:                    function (a) {
                                var c = e(a);
                                return c.data("_inputmask-multi") ?
                                    (a = c.data("_inputmask-multi"), b(a.elmasks[a.activeMasksetIndex])) : b(a)
                            }, set:                 function (a, b) {
                                var d = e(a), g = c(a, b);
                                d.data("_inputmask-multi") && d.triggerHandler("setvalue");
                                return g
                            }, inputmaskmultipatch: !0
                        }
                    }
                })(a.type)
            };
        e.inputmask = {
            defaults:      {
                placeholder:                 "_",
                optionalmarker:              {start: "[", end: "]"},
                quantifiermarker:            {start: "{", end: "}"},
                groupmarker:                 {start: "(", end: ")"},
                alternatormarker:            "|",
                escapeChar:                  "\\",
                mask:                        null,
                oncomplete:                  e.noop,
                onincomplete:                e.noop,
                oncleared:                   e.noop,
                repeat:                      0,
                greedy:                      !0,
                autoUnmask:                  !1,
                clearMaskOnLostFocus:        !0,
                insertMode:                  !0,
                clearIncomplete:             !1,
                aliases:                     {},
                onKeyUp:                     e.noop,
                onKeyDown:                   e.noop,
                onBeforeMask:                void 0,
                onBeforePaste:               void 0,
                onUnMask:                    void 0,
                showMaskOnFocus:             !0,
                showMaskOnHover:             !0,
                onKeyValidation:             e.noop,
                skipOptionalPartCharacter:   " ",
                showTooltip:                 !1,
                numericInput:                !1,
                getLastValidPosition:        void 0,
                rightAlign:                  !1,
                radixPoint:                  "",
                definitions:                 {
                    9:   {validator: "[0-9]", cardinality: 1, definitionSymbol: "*"},
                    a:   {validator: "[A-Za-z\u0410-\u044f\u0401\u0451]", cardinality: 1, definitionSymbol: "*"},
                    "*": {
                        validator:   "[A-Za-z\u0410-\u044f\u0401\u04510-9]",
                        cardinality: 1
                    }
                },
                keyCode:                     {
                    ALT:             18,
                    BACKSPACE:       8,
                    CAPS_LOCK:       20,
                    COMMA:           188,
                    COMMAND:         91,
                    COMMAND_LEFT:    91,
                    COMMAND_RIGHT:   93,
                    CONTROL:         17,
                    DELETE:          46,
                    DOWN:            40,
                    END:             35,
                    ENTER:           13,
                    ESCAPE:          27,
                    HOME:            36,
                    INSERT:          45,
                    LEFT:            37,
                    MENU:            93,
                    NUMPAD_ADD:      107,
                    NUMPAD_DECIMAL:  110,
                    NUMPAD_DIVIDE:   111,
                    NUMPAD_ENTER:    108,
                    NUMPAD_MULTIPLY: 106,
                    NUMPAD_SUBTRACT: 109,
                    PAGE_DOWN:       34,
                    PAGE_UP:         33,
                    PERIOD:          190,
                    RIGHT:           39,
                    SHIFT:           16,
                    SPACE:           32,
                    TAB:             9,
                    UP:              38,
                    WINDOWS:         91
                },
                ignorables:                  [8, 9, 13, 19, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 93, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123],
                isComplete:                  void 0,
                multi:                       !1,
                nojumps:                     !1,
                nojumpsThreshold:            0,
                determineActiveMasksetIndex: void 0
            }, masksCache: {}, escapeRegex: function (a) {
                return a.replace(RegExp("(\\/|\\.|\\*|\\+|\\?|\\||\\(|\\)|\\[|\\]|\\{|\\}|\\\\)", "gim"), "\\$1")
            }, format:     function (a, b) {
                var g = e.extend(!0, {}, e.inputmask.defaults, b);
                d(g.alias, b, g);
                return C(c(g), g, {action: "format", value: a})
            }, isValid:    function (a, b) {
                var g = e.extend(!0, {}, e.inputmask.defaults, b);
                d(g.alias, b, g);
                return C(c(g), g, {action: "isValid", value: a})
            }
        };
        e.fn.inputmask = function (a,
                                   b) {
            function g(a, b) {
                var c = e(a), d;
                for (d in b) {
                    var f = c.data("inputmask-" + d.toLowerCase());
                    void 0 != f && (b[d] = f)
                }
                return b
            }

            var f = e.extend(!0, {}, e.inputmask.defaults, b), k;
            if ("string" === typeof a)switch (a) {
                case "mask":
                    return d(f.alias, b, f), k = c(f), 0 == k.length ? this : this.each(function () {
                        e.isArray(k) ? n(this, k, g(this, f)) : C(e.extend(!0, {}, k), g(this, f), {
                            action: "mask",
                            el:     this
                        })
                    });
                case "unmaskedvalue":
                    var q = e(this);
                    return q.data("_inputmask") ? (k = q.data("_inputmask").maskset, f = q.data("_inputmask").opts, C(k, f, {
                        action: "unmaskedvalue",
                        $input: q
                    })) : q.val();
                case "remove":
                    return this.each(function () {
                        var a = e(this);
                        if (a.data("_inputmask")) {
                            k = a.data("_inputmask").maskset;
                            f = a.data("_inputmask").opts;
                            this._valueSet(C(k, f, {action: "unmaskedvalue", $input: a, skipDatepickerCheck: !0}));
                            a.unbind(".inputmask");
                            a.removeClass("focus.inputmask");
                            a.removeData("_inputmask");
                            var b;
                            Object.getOwnPropertyDescriptor && (b = Object.getOwnPropertyDescriptor(this, "value"));
                            b && b.get ? this._valueGet && Object.defineProperty(this, "value", {
                                get: this._valueGet,
                                set: this._valueSet
                            }) :
                            document.__lookupGetter__ && this.__lookupGetter__("value") && this._valueGet && (this.__defineGetter__("value", this._valueGet), this.__defineSetter__("value", this._valueSet));
                            try {
                                delete this._valueGet, delete this._valueSet
                            } catch (c) {
                                this._valueSet = this._valueGet = void 0
                            }
                        }
                    });
                case "getemptymask":
                    return this.data("_inputmask") ? (k = this.data("_inputmask").maskset, k._buffer.join("")) : "";
                case "hasMaskedValue":
                    return this.data("_inputmask") ? !this.data("_inputmask").opts.autoUnmask : !1;
                case "isComplete":
                    return this.data("_inputmask") ?
                        (k = this.data("_inputmask").maskset, f = this.data("_inputmask").opts, C(k, f, {
                            action: "isComplete",
                            buffer: this[0]._valueGet().split(""),
                            el:     this
                        })) : !0;
                case "getmetadata":
                    if (this.data("_inputmask"))return k = this.data("_inputmask").maskset, k.metadata;
                    break;
                default:
                    return d(a, b, f) || (f.mask = a), k = c(f), void 0 == k ? this : this.each(function () {
                        e.isArray(k) ? n(this, k, g(this, f)) : C(e.extend(!0, {}, k), g(this, f), {
                            action: "mask",
                            el:     this
                        })
                    })
            } else {
                if ("object" == typeof a)return f = e.extend(!0, {}, e.inputmask.defaults, a), d(f.alias,
                    a, f), k = c(f), void 0 == k ? this : this.each(function () {
                    e.isArray(k) ? n(this, k, g(this, f)) : C(e.extend(!0, {}, k), g(this, f), {
                        action: "mask",
                        el:     this
                    })
                });
                if (void 0 == a)return this.each(function () {
                    var a = e(this).attr("data-inputmask");
                    if (a && "" != a)try {
                        var a = a.replace(RegExp("'", "g"), '"'), c = e.parseJSON("{" + a + "}");
                        e.extend(!0, c, b);
                        f = e.extend(!0, {}, e.inputmask.defaults, c);
                        d(f.alias, c, f);
                        f.alias = void 0;
                        e(this).inputmask(f)
                    } catch (g) {
                    }
                })
            }
        }
    }
})(jQuery);
(function (e) {
    e.extend(e.inputmask.defaults.definitions, {
        A:   {validator: "[A-Za-z]", cardinality: 1, casing: "upper"},
        "#": {
            validator:   "[A-Za-z\u0410-\u044f\u0401\u04510-9]",
            cardinality: 1,
            casing:      "upper"
        }
    });
    e.extend(e.inputmask.defaults.aliases, {
        url:      {
            mask:           "ir", placeholder: "", separator: "", defaultPrefix: "http://", regex: {
                urlpre1: /[fh]/,
                urlpre2: /(ft|ht)/,
                urlpre3: /(ftp|htt)/,
                urlpre4: /(ftp:|http|ftps)/,
                urlpre5: /(ftp:\/|ftps:|http:|https)/,
                urlpre6: /(ftp:\/\/|ftps:\/|http:\/|https:)/,
                urlpre7: /(ftp:\/\/|ftps:\/\/|http:\/\/|https:\/)/,
                urlpre8: /(ftp:\/\/|ftps:\/\/|http:\/\/|https:\/\/)/
            }, definitions: {
                i:    {
                    validator:      function (a, d, c, g, b) {
                        return !0
                    }, cardinality: 8, prevalidator: function () {
                        for (var a = [], d = 0; 8 > d; d++)a[d] = function () {
                            var a = d;
                            return {
                                validator:   function (d, b, e, k, v) {
                                    if (v.regex["urlpre" + (a + 1)]) {
                                        var q = d;
                                        0 < a + 1 - d.length && (q = b.join("").substring(0, a + 1 - d.length) + "" + q);
                                        d = v.regex["urlpre" + (a + 1)].test(q);
                                        if (!k && !d) {
                                            e -= a;
                                            for (k = 0; k < v.defaultPrefix.length; k++)b[e] = v.defaultPrefix[k], e++;
                                            for (k = 0; k < q.length - 1; k++)b[e] = q[k], e++;
                                            return {pos: e}
                                        }
                                        return d
                                    }
                                    return !1
                                },
                                cardinality: a
                            }
                        }();
                        return a
                    }()
                }, r: {validator: ".", cardinality: 50}
            }, insertMode:  !1, autoUnmask: !1
        }, ip:    {
            mask: "i[i[i]].i[i[i]].i[i[i]].i[i[i]]", definitions: {
                i: {
                    validator:      function (a, d, c, e, b) {
                        -1 < c - 1 && "." != d[c - 1] ? (a = d[c - 1] + a, a = -1 < c - 2 && "." != d[c - 2] ? d[c - 2] + a : "0" + a) : a = "00" + a;
                        return /25[0-5]|2[0-4][0-9]|[01][0-9][0-9]/.test(a)
                    }, cardinality: 1
                }
            }
        }, email: {mask: "*{1,20}[.*{1,20}][.*{1,20}][.*{1,20}]@*{1,20}.*{2,6}[.*{1,2}]", greedy: !1}
    })
})(jQuery);
(function (e) {
    e.extend(e.inputmask.defaults.definitions, {
        h: {validator: "[01][0-9]|2[0-3]", cardinality: 2, prevalidator: [{validator: "[0-2]", cardinality: 1}]},
        s: {validator: "[0-5][0-9]", cardinality: 2, prevalidator: [{validator: "[0-5]", cardinality: 1}]},
        d: {validator: "0[1-9]|[12][0-9]|3[01]", cardinality: 2, prevalidator: [{validator: "[0-3]", cardinality: 1}]},
        m: {validator: "0[1-9]|1[012]", cardinality: 2, prevalidator: [{validator: "[01]", cardinality: 1}]},
        y: {
            validator: "(19|20)\\d{2}", cardinality: 4, prevalidator: [{
                validator:   "[12]",
                cardinality: 1
            }, {validator: "(19|20)", cardinality: 2}, {validator: "(19|20)\\d", cardinality: 3}]
        }
    });
    e.extend(e.inputmask.defaults.aliases, {
        "dd/mm/yyyy": {
            mask:              "1/2/y",
            placeholder:       "dd/mm/yyyy",
            regex:             {
                val1pre: /[0-3]/, val1: /0[1-9]|[12][0-9]|3[01]/, val2pre: function (a) {
                    a = e.inputmask.escapeRegex.call(this, a);
                    return RegExp("((0[1-9]|[12][0-9]|3[01])" + a + "[01])")
                }, val2: function (a) {
                    a = e.inputmask.escapeRegex.call(this, a);
                    return RegExp("((0[1-9]|[12][0-9])" + a + "(0[1-9]|1[012]))|(30" + a + "(0[13-9]|1[012]))|(31" + a + "(0[13578]|1[02]))")
                }
            },
            leapday:           "29/02/",
            separator:         "/",
            yearrange:         {minyear: 1900, maxyear: 2099},
            isInYearRange:     function (a, d, c) {
                if (isNaN(a))return !1;
                var e = parseInt(a.concat(d.toString().slice(a.length)));
                a = parseInt(a.concat(c.toString().slice(a.length)));
                return (isNaN(e) ? !1 : d <= e && e <= c) || (isNaN(a) ? !1 : d <= a && a <= c)
            },
            determinebaseyear: function (a, d, c) {
                var e = (new Date).getFullYear();
                if (a > e)return a;
                if (d < e) {
                    for (var e = d.toString().slice(0, 2), b = d.toString().slice(2, 4); d < e + c;)e--;
                    d = e + b;
                    return a > d ? a : d
                }
                return e
            },
            onKeyUp:           function (a, d, c) {
                d =
                    e(this);
                a.ctrlKey && a.keyCode == c.keyCode.RIGHT && (a = new Date, d.val(a.getDate().toString() + (a.getMonth() + 1).toString() + a.getFullYear().toString()))
            },
            definitions:       {
                1:    {
                    validator:      function (a, d, c, e, b) {
                        var f = b.regex.val1.test(a);
                        return e || f || a.charAt(1) != b.separator && -1 == "-./".indexOf(a.charAt(1)) || !(f = b.regex.val1.test("0" + a.charAt(0))) ? f : (d[c - 1] = "0", {
                            refreshFromBuffer: {
                                start: c - 1,
                                end: c
                            },
                            pos: c,
                            c: a.charAt(0)
                        })
                    }, cardinality: 2, prevalidator: [{
                        validator:      function (a, d, c, e, b) {
                            isNaN(d[c + 1]) || (a += d[c + 1]);
                            var f = 1 == a.length ?
                                b.regex.val1pre.test(a) : b.regex.val1.test(a);
                            return e || f || !(f = b.regex.val1.test("0" + a)) ? f : (d[c] = "0", c++, {pos: c})
                        }, cardinality: 1
                    }]
                }, 2: {
                    validator:      function (a, d, c, e, b) {
                        var f = b.mask.indexOf("2") == b.mask.length - 1 ? d.join("").substr(5, 3) : d.join("").substr(0, 3);
                        -1 != f.indexOf(b.placeholder[0]) && (f = "01" + b.separator);
                        var k = b.regex.val2(b.separator).test(f + a);
                        if (!(e || k || a.charAt(1) != b.separator && -1 == "-./".indexOf(a.charAt(1))) && (k = b.regex.val2(b.separator).test(f + "0" + a.charAt(0))))return d[c - 1] = "0", {
                            refreshFromBuffer: {
                                start:  c -
                                1, end: c
                            }, pos:            c, c: a.charAt(0)
                        };
                        if (b.mask.indexOf("2") == b.mask.length - 1 && k) {
                            if (d.join("").substr(4, 4) + a != b.leapday)return !0;
                            a = parseInt(d.join("").substr(0, 4), 10);
                            return 0 === a % 4 ? 0 === a % 100 ? 0 === a % 400 ? !0 : !1 : !0 : !1
                        }
                        return k
                    }, cardinality: 2, prevalidator: [{
                        validator:      function (a, d, c, e, b) {
                            isNaN(d[c + 1]) || (a += d[c + 1]);
                            var f = b.mask.indexOf("2") == b.mask.length - 1 ? d.join("").substr(5, 3) : d.join("").substr(0, 3);
                            -1 != f.indexOf(b.placeholder[0]) && (f = "01" + b.separator);
                            var k = 1 == a.length ? b.regex.val2pre(b.separator).test(f + a) :
                                b.regex.val2(b.separator).test(f + a);
                            return e || k || !(k = b.regex.val2(b.separator).test(f + "0" + a)) ? k : (d[c] = "0", c++, {pos: c})
                        }, cardinality: 1
                    }]
                }, y: {
                    validator:      function (a, d, c, e, b) {
                        if (b.isInYearRange(a, b.yearrange.minyear, b.yearrange.maxyear)) {
                            if (d.join("").substr(0, 6) != b.leapday)return !0;
                            a = parseInt(a, 10);
                            return 0 === a % 4 ? 0 === a % 100 ? 0 === a % 400 ? !0 : !1 : !0 : !1
                        }
                        return !1
                    }, cardinality: 4, prevalidator: [{
                        validator:      function (a, d, c, e, b) {
                            var f = b.isInYearRange(a, b.yearrange.minyear, b.yearrange.maxyear);
                            if (!e && !f) {
                                e = b.determinebaseyear(b.yearrange.minyear,
                                    b.yearrange.maxyear, a + "0").toString().slice(0, 1);
                                if (f = b.isInYearRange(e + a, b.yearrange.minyear, b.yearrange.maxyear))return d[c++] = e[0], {pos: c};
                                e = b.determinebaseyear(b.yearrange.minyear, b.yearrange.maxyear, a + "0").toString().slice(0, 2);
                                if (f = b.isInYearRange(e + a, b.yearrange.minyear, b.yearrange.maxyear))return d[c++] = e[0], d[c++] = e[1], {pos: c}
                            }
                            return f
                        }, cardinality: 1
                    }, {
                        validator:   function (a, d, c, e, b) {
                            var f = b.isInYearRange(a, b.yearrange.minyear, b.yearrange.maxyear);
                            if (!e && !f) {
                                e = b.determinebaseyear(b.yearrange.minyear,
                                    b.yearrange.maxyear, a).toString().slice(0, 2);
                                if (f = b.isInYearRange(a[0] + e[1] + a[1], b.yearrange.minyear, b.yearrange.maxyear))return d[c++] = e[1], {pos: c};
                                e = b.determinebaseyear(b.yearrange.minyear, b.yearrange.maxyear, a).toString().slice(0, 2);
                                b.isInYearRange(e + a, b.yearrange.minyear, b.yearrange.maxyear) ? d.join("").substr(0, 6) != b.leapday ? f = !0 : (b = parseInt(a, 10), f = 0 === b % 4 ? 0 === b % 100 ? 0 === b % 400 ? !0 : !1 : !0 : !1) : f = !1;
                                if (f)return d[c - 1] = e[0], d[c++] = e[1], d[c++] = a[0], {
                                    refreshFromBuffer: {
                                        start: c - 3,
                                        end:   c
                                    }, pos:            c
                                }
                            }
                            return f
                        },
                        cardinality: 2
                    }, {
                        validator:      function (a, d, c, e, b) {
                            return b.isInYearRange(a, b.yearrange.minyear, b.yearrange.maxyear)
                        }, cardinality: 3
                    }]
                }
            },
            insertMode:        !1,
            autoUnmask:        !1
        },
        "mm/dd/yyyy": {
            placeholder: "mm/dd/yyyy", alias: "dd/mm/yyyy", regex: {
                val2pre: function (a) {
                    a = e.inputmask.escapeRegex.call(this, a);
                    return RegExp("((0[13-9]|1[012])" + a + "[0-3])|(02" + a + "[0-2])")
                }, val2: function (a) {
                    a = e.inputmask.escapeRegex.call(this, a);
                    return RegExp("((0[1-9]|1[012])" + a + "(0[1-9]|[12][0-9]))|((0[13-9]|1[012])" + a + "30)|((0[13578]|1[02])" +
                    a + "31)")
                }, val1pre: /[01]/, val1: /0[1-9]|1[012]/
            }, leapday:  "02/29/", onKeyUp: function (a, d, c) {
                d = e(this);
                a.ctrlKey && a.keyCode == c.keyCode.RIGHT && (a = new Date, d.val((a.getMonth() + 1).toString() + a.getDate().toString() + a.getFullYear().toString()))
            }
        },
        "yyyy/mm/dd": {
            mask:        "y/1/2",
            placeholder: "yyyy/mm/dd",
            alias:       "mm/dd/yyyy",
            leapday:     "/02/29",
            onKeyUp:     function (a, d, c) {
                d = e(this);
                a.ctrlKey && a.keyCode == c.keyCode.RIGHT && (a = new Date, d.val(a.getFullYear().toString() + (a.getMonth() + 1).toString() + a.getDate().toString()))
            }
        },
        "dd.mm.yyyy": {
            mask:        "1.2.y",
            placeholder: "dd.mm.yyyy", leapday: "29.02.", separator: ".", alias: "dd/mm/yyyy"
        },
        "dd-mm-yyyy": {
            mask:        "1-2-y",
            placeholder: "dd-mm-yyyy",
            leapday:     "29-02-",
            separator:   "-",
            alias:       "dd/mm/yyyy"
        },
        "mm.dd.yyyy": {
            mask:        "1.2.y",
            placeholder: "mm.dd.yyyy",
            leapday:     "02.29.",
            separator:   ".",
            alias:       "mm/dd/yyyy"
        },
        "mm-dd-yyyy": {
            mask:        "1-2-y",
            placeholder: "mm-dd-yyyy",
            leapday:     "02-29-",
            separator:   "-",
            alias:       "mm/dd/yyyy"
        },
        "yyyy.mm.dd": {
            mask:        "y.1.2",
            placeholder: "yyyy.mm.dd",
            leapday:     ".02.29",
            separator:   ".",
            alias:       "yyyy/mm/dd"
        },
        "yyyy-mm-dd": {
            mask:        "y-1-2",
            placeholder: "yyyy-mm-dd", leapday: "-02-29", separator: "-", alias: "yyyy/mm/dd"
        },
        datetime:     {
            mask:          "1/2/y h:s",
            placeholder:   "dd/mm/yyyy hh:mm",
            alias:         "dd/mm/yyyy",
            regex:         {hrspre: /[012]/, hrs24: /2[0-4]|1[3-9]/, hrs: /[01][0-9]|2[0-4]/, ampm: /^[a|p|A|P][m|M]/},
            timeseparator: ":",
            hourFormat:    "24",
            definitions:   {
                h:    {
                    validator:      function (a, d, c, e, b) {
                        if ("24" == b.hourFormat && 24 == parseInt(a, 10))return d[c - 1] = "0", d[c] = "0", {
                            refreshFromBuffer: {
                                start: c - 1,
                                end:   c
                            }, c:              "0"
                        };
                        var f = b.regex.hrs.test(a);
                        return e || f || a.charAt(1) != b.timeseparator &&
                        -1 == "-.:".indexOf(a.charAt(1)) || !(f = b.regex.hrs.test("0" + a.charAt(0))) ? f && "24" !== b.hourFormat && b.regex.hrs24.test(a) ? (a = parseInt(a, 10), d[c + 5] = 24 == a ? "a" : "p", d[c + 6] = "m", a -= 12, 10 > a ? (d[c] = a.toString(), d[c - 1] = "0") : (d[c] = a.toString().charAt(1), d[c - 1] = a.toString().charAt(0)), {
                            refreshFromBuffer: {
                                start: c - 1,
                                end: c + 6
                            },
                            c: d[c]
                        }) : f : (d[c - 1] = "0", d[c] = a.charAt(0), c++, {
                            refreshFromBuffer: {start: c - 2, end: c},
                            pos:               c,
                            c:                 b.timeseparator
                        })
                    }, cardinality: 2, prevalidator: [{
                        validator:      function (a, d, c, e, b) {
                            var f = b.regex.hrspre.test(a);
                            return e || f || !(f = b.regex.hrs.test("0" + a)) ? f : (d[c] = "0", c++, {pos: c})
                        }, cardinality: 1
                    }]
                }, t: {
                    validator: function (a, d, c, e, b) {
                        return b.regex.ampm.test(a + "m")
                    }, casing: "lower", cardinality: 1
                }
            },
            insertMode:    !1,
            autoUnmask:    !1
        },
        datetime12:   {
            mask:        "1/2/y h:s t\\m",
            placeholder: "dd/mm/yyyy hh:mm xm",
            alias:       "datetime",
            hourFormat:  "12"
        },
        "hh:mm t":    {mask: "h:s t\\m", placeholder: "hh:mm xm", alias: "datetime", hourFormat: "12"},
        "h:s t":      {mask: "h:s t\\m", placeholder: "hh:mm xm", alias: "datetime", hourFormat: "12"},
        "hh:mm:ss":   {
            mask:       "h:s:s",
            autoUnmask: !1
        },
        "hh:mm":      {mask: "h:s", autoUnmask: !1},
        date:         {alias: "dd/mm/yyyy"},
        "mm/yyyy":    {mask: "1/y", placeholder: "mm/yyyy", leapday: "donotuse", separator: "/", alias: "mm/dd/yyyy"}
    })
})(jQuery);
(function (e) {
    e.extend(e.inputmask.defaults.aliases, {
        numeric:    {
            mask:                 function (a) {
                0 !== a.repeat && isNaN(a.integerDigits) && (a.integerDigits = a.repeat);
                a.repeat = 0;
                var d = a.prefix, d = d + "[+]" + ("~{1," + a.integerDigits + "}");
                void 0 != a.digits && (isNaN(a.digits) || 0 < parseInt(a.digits)) && (d = a.digitsOptional ? d + ("[" + a.radixPoint + "~{" + a.digits + "}]") : d + (a.radixPoint + "~{" + a.digits + "}"));
                return d += a.suffix
            },
            placeholder:          "",
            greedy:               !1,
            digits:               "*",
            digitsOptional:       !0,
            groupSeparator:       "",
            radixPoint:           ".",
            groupSize:            3,
            autoGroup:            !1,
            allowPlus:            !0,
            allowMinus:           !0,
            integerDigits:        "*",
            defaultValue:         "",
            prefix:               "",
            suffix:               "",
            skipRadixDance:       !1,
            getLastValidPosition: function (a, d, c) {
                var g = -1, b = a.validPositions, f;
                for (f in b)b = parseInt(f), b > g && (g = b);
                void 0 != d && (a = a.buffer, !1 === c.skipRadixDance && "" != c.radixPoint && -1 != e.inArray(c.radixPoint, a) && (g = e.inArray(c.radixPoint, a)));
                return g
            },
            rightAlign:           !0,
            postFormat:           function (a, d, c, g) {
                var b = !1;
                if ("" == g.groupSeparator)return {pos: d};
                var f = a.slice();
                c || f.splice(d, 0, "?");
                f = f.join("");
                if (g.autoGroup || c && -1 != f.indexOf(g.groupSeparator)) {
                    var k =
                            e.inputmask.escapeRegex.call(this, g.groupSeparator), f = f.replace(RegExp(k, "g"), ""), k = f.split(g.radixPoint), f = k[0];
                    if (f != g.prefix + "?0")for (var b = !0, v = RegExp("([-+]?[\\d?]+)([\\d?]{" + g.groupSize + "})"); v.test(f);)f = f.replace(v, "$1" + g.groupSeparator + "$2"), f = f.replace(g.groupSeparator + g.groupSeparator, g.groupSeparator);
                    1 < k.length && (f += g.radixPoint + k[1])
                }
                a.length = f.length;
                g = 0;
                for (k = f.length; g < k; g++)a[g] = f.charAt(g);
                f = e.inArray("?", a);
                c || a.splice(f, 1);
                return {pos: c ? d : f, refreshFromBuffer: b}
            },
            onKeyDown:            function (a,
                                            d, c) {
                e(this);
                if (c.autoGroup && a.keyCode == c.keyCode.DELETE || a.keyCode == c.keyCode.BACKSPACE)return c.postFormat(d, 0, !0, c)
            },
            regex:                {
                integerPart: function (a) {
                    return /[-+]?\d+/
                }
            },
            definitions:          {
                "~":    {
                    validator:      function (a, d, c, g, b) {
                        if (!g && "-" === a) {
                            var f = d.join("").match(b.regex.integerPart(b));
                            if (0 < f.length)return "+" == d[f.index] ? (d.splice(f.index, 1), {
                                pos:               f.index,
                                c:                 "-",
                                refreshFromBuffer: !0,
                                caret:             c
                            }) : "-" == d[f.index] ? (d.splice(f.index, 1), {
                                refreshFromBuffer: !0,
                                caret:             c - 1
                            }) : {pos: f.index, c: "-", caret: c + 1}
                        }
                        f = g ? RegExp("[0-9" +
                        e.inputmask.escapeRegex.call(this, b.groupSeparator) + "]").test(a) : /[0-9]/.test(a);
                        return !1 == f || g || a == b.radixPoint || !0 !== b.autoGroup ? f : b.postFormat(d, c, "-" == a || "+" == a ? !0 : !1, b)
                    }, cardinality: 1, prevalidator: null
                }, "+": {
                    validator:      function (a, d, c, e, b) {
                        d = "[";
                        !0 === b.allowMinus && (d += "-");
                        !0 === b.allowPlus && (d += "+");
                        return RegExp(d + "]").test(a)
                    }, cardinality: 1, prevalidator: null
                }
            },
            insertMode:           !0,
            autoUnmask:           !1
        }, decimal: {alias: "numeric"}, integer: {alias: "numeric", digits: "0"}
    })
})(jQuery);
(function (e) {
    e.extend(e.inputmask.defaults.aliases, {
        Regex: {
            mask:             "r",
            greedy:           !1,
            repeat:           "*",
            regex:            null,
            regexTokens:      null,
            tokenizer:        /\[\^?]?(?:[^\\\]]+|\\[\S\s]?)*]?|\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9][0-9]*|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)|\((?:\?[:=!]?)?|(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??|[^.?*+^${[()|\\]+|./g,
            quantifierFilter: /[0-9]+[^,]/,
            isComplete:       function (a, d) {
                return RegExp(d.regex).test(a.join(""))
            },
            definitions:      {
                r: {
                    validator:      function (a, d, c, e, b) {
                        function f(a, b) {
                            this.matches =
                                [];
                            this.isGroup = a || !1;
                            this.isQuantifier = b || !1;
                            this.quantifier = {min: 1, max: 1};
                            this.repeaterPart = void 0
                        }

                        function k() {
                            var a = new f, c, d = [];
                            for (b.regexTokens = []; c = b.tokenizer.exec(b.regex);)switch (c = c[0], c.charAt(0)) {
                                case "(":
                                    d.push(new f(!0));
                                    break;
                                case ")":
                                    var e = d.pop();
                                    0 < d.length ? d[d.length - 1].matches.push(e) : a.matches.push(e);
                                    break;
                                case "{":
                                case "+":
                                case "*":
                                    var g = new f(!1, !0);
                                    c = c.replace(/[{}]/g, "");
                                    e = c.split(",");
                                    c = isNaN(e[0]) ? e[0] : parseInt(e[0]);
                                    e = 1 == e.length ? c : isNaN(e[1]) ? e[1] : parseInt(e[1]);
                                    g.quantifier =
                                    {min: c, max: e};
                                    if (0 < d.length) {
                                        var h = d[d.length - 1].matches;
                                        c = h.pop();
                                        c.isGroup || (e = new f(!0), e.matches.push(c), c = e);
                                        h.push(c);
                                        h.push(g)
                                    } else c = a.matches.pop(), c.isGroup || (e = new f(!0), e.matches.push(c), c = e), a.matches.push(c), a.matches.push(g);
                                    break;
                                default:
                                    0 < d.length ? d[d.length - 1].matches.push(c) : a.matches.push(c)
                            }
                            0 < a.matches.length && b.regexTokens.push(a)
                        }

                        function v(a, b) {
                            var c = !1;
                            b && (q += "(", N++);
                            for (var e = 0; e < a.matches.length; e++) {
                                var d = a.matches[e];
                                if (!0 == d.isGroup)c = v(d, !0); else if (!0 == d.isQuantifier) {
                                    var f =
                                            a.matches.indexOf(d), f = a.matches[f - 1], g = q;
                                    if (isNaN(d.quantifier.max)) {
                                        for (; d.repeaterPart && d.repeaterPart != q && d.repeaterPart.length > q.length && !(c = v(f, !0)););
                                        (c = c || v(f, !0)) && (d.repeaterPart = q);
                                        q = g + d.quantifier.max
                                    } else {
                                        for (var k = 0, U = d.quantifier.max - 1; k < U && !(c = v(f, !0)); k++);
                                        q = g + "{" + d.quantifier.min + "," + d.quantifier.max + "}"
                                    }
                                } else if (void 0 != d.matches)for (f = 0; f < d.length && !(c = v(d[f], b)); f++); else {
                                    if ("[" == d[0]) {
                                        c = q;
                                        c += d;
                                        for (k = 0; k < N; k++)c += ")";
                                        c = RegExp("^(" + c + ")$");
                                        c = c.test(I)
                                    } else for (f = 0, g = d.length; f <
                                    g; f++)if ("\\" != d[f]) {
                                        c = q;
                                        c += d.substr(0, f + 1);
                                        c = c.replace(/\|$/, "");
                                        for (k = 0; k < N; k++)c += ")";
                                        c = RegExp("^(" + c + ")$");
                                        if (c = c.test(I))break
                                    }
                                    q += d
                                }
                                if (c)break
                            }
                            b && (q += ")", N--);
                            return c
                        }

                        null == b.regexTokens && k();
                        e = d.slice();
                        var q = "";
                        d = !1;
                        var N = 0;
                        e.splice(c, 0, a);
                        var I = e.join("");
                        for (a = 0; a < b.regexTokens.length && !(f = b.regexTokens[a], d = v(f, f.isGroup)); a++);
                        return d
                    }, cardinality: 1
                }
            }
        }
    })
})(jQuery);
(function (e) {
    e.extend(e.inputmask.defaults.aliases, {
        phone:      {
            url:        "phone-codes/phone-codes.json", mask: function (a) {
                a.definitions = {
                    p:      {
                        validator:      function () {
                            return !1
                        }, cardinality: 1
                    }, "#": {validator: "[0-9]", cardinality: 1}
                };
                var d = [];
                e.ajax({
                    url: a.url, async: !1, dataType: "json", success: function (a) {
                        d = a
                    }
                });
                d.splice(0, 0, "+p(ppp)ppp-pppp");
                return d
            }, nojumps: !0, nojumpsThreshold: 1
        }, phonebe: {
            url:        "phone-codes/phone-be.json", mask: function (a) {
                a.definitions = {
                    p:      {
                        validator:      function () {
                            return !1
                        }, cardinality: 1
                    }, "#": {
                        validator:   "[0-9]",
                        cardinality: 1
                    }
                };
                var d = [];
                e.ajax({
                    url: a.url, async: !1, dataType: "json", success: function (a) {
                        d = a
                    }
                });
                d.splice(0, 0, "+32(ppp)ppp-pppp");
                return d
            }, nojumps: !0, nojumpsThreshold: 4
        }
    })
})(jQuery);
// my extend
$.extend($.inputmask.defaults.aliases, {
    'currency': {
        alias:          "decimal",
        radixPoint:     ".",
        groupSeparator: ",",
        digits:         2,
        autoGroup:      true,
        rightAlign:     false
    }
});
// Bootstrap TouchSpin
!function (t) {
    "use strict";
    function n(t, n) {
        return t + ".touchspin_" + n
    }

    function o(o, s) {
        return t.map(o, function (t) {
            return n(t, s)
        })
    }

    var s = 0;
    t.fn.TouchSpin = function (n) {
        if ("destroy" === n)return void this.each(function () {
            var n = t(this), s = n.data();
            t(document).off(o(["mouseup", "touchend", "touchcancel", "mousemove", "touchmove", "scroll", "scrollstart"], s.spinnerid).join(" "))
        });
        var a = {
            min:                   0,
            max:                   100,
            initval:               "",
            replacementval:        "",
            step:                  1,
            decimals:              0,
            stepinterval:          100,
            forcestepdivisibility: "round",
            stepintervaldelay:     500,
            verticalbuttons:       !1,
            verticalupclass:       "fa fa-chevron-up",
            verticaldownclass:     "fa fa-chevron-down",
            prefix:                "",
            postfix:               "",
            prefix_extraclass:     "",
            postfix_extraclass:    "",
            booster:               !0,
            boostat:               10,
            maxboostedstep:        !1,
            mousewheel:            !0,
            buttondown_class:      "btn btn-default",
            buttonup_class:        "btn btn-default",
            buttondown_txt:        '<i class="fa fa-minus"></i>',
            buttonup_txt:          '<i class="fa fa-plus"></i>'
        }, e = {
            min:                   "min",
            max:                   "max",
            initval:               "init-val",
            replacementval:        "replacement-val",
            step:                  "step",
            decimals:              "decimals",
            stepinterval:          "step-interval",
            verticalbuttons:       "vertical-buttons",
            verticalupclass:       "vertical-up-class",
            verticaldownclass:     "vertical-down-class",
            forcestepdivisibility: "force-step-divisibility",
            stepintervaldelay:     "step-interval-delay",
            prefix:                "prefix",
            postfix:               "postfix",
            prefix_extraclass:     "prefix-extra-class",
            postfix_extraclass:    "postfix-extra-class",
            booster:               "booster",
            boostat:               "boostat",
            maxboostedstep:        "max-boosted-step",
            mousewheel:            "mouse-wheel",
            buttondown_class:      "button-down-class",
            buttonup_class:        "button-up-class",
            buttondown_txt:        "button-down-txt",
            buttonup_txt:          "button-up-txt"
        };
        return this.each(function () {
            function i() {
                if (!E.data("alreadyinitialized")) {
                    if (E.data("alreadyinitialized", !0), s += 1, E.data("spinnerid", s), !E.is("input"))return void console.log("Must be an input.");
                    r(), u(), w(), d(), v(), h(), m(), x(), P.input.css("display", "block")
                }
            }

            function u() {
                "" !== F.initval && "" === E.val() && E.val(F.initval)
            }

            function p(t) {
                l(t), w();
                var n = P.input.val();
                "" !== n && (n = Number(P.input.val()), P.input.val(n.toFixed(F.decimals)))
            }

            function r() {
                F = t.extend({}, a, z, c(), n)
            }

            function c() {
                var n = {};
                return t.each(e, function (t, o) {
                    var s = "bts-" + o;
                    E.is("[data-" + s + "]") && (n[t] = E.data(s))
                }), n
            }

            function l(n) {
                F = t.extend({}, F, n)
            }

            function d() {
                var t = E.val(), n = E.parent();
                "" !== t && (t = Number(t).toFixed(F.decimals)), E.data("initvalue", t).val(t), E.addClass("form-control"), n.hasClass("input-group") ? f(n) : b()
            }

            function f(n) {
                n.addClass("bootstrap-touchspin");
                var o, s, a = E.prev(), e = E.next(), i = '<span class="input-group-addon bootstrap-touchspin-prefix">' + F.prefix + "</span>", u = '<span class="input-group-addon bootstrap-touchspin-postfix">' + F.postfix + "</span>";
                a.hasClass("input-group-btn") ? (o = '<button class="' + F.buttondown_class + ' bootstrap-touchspin-down" type="button">' + F.buttondown_txt + "</button>", a.append(o)) : (o = '<span class="input-group-btn"><button class="' + F.buttondown_class + ' bootstrap-touchspin-down" type="button">' + F.buttondown_txt + "</button></span>", t(o).insertBefore(E)), e.hasClass("input-group-btn") ? (s = '<button class="' + F.buttonup_class + ' bootstrap-touchspin-up" type="button">' + F.buttonup_txt + "</button>", e.prepend(s)) : (s = '<span class="input-group-btn"><button class="' + F.buttonup_class + ' bootstrap-touchspin-up" type="button">' + F.buttonup_txt + "</button></span>", t(s).insertAfter(E)), t(i).insertBefore(E), t(u).insertAfter(E), M = n
            }

            function b() {
                var n;
                n = F.verticalbuttons ? '<div class="input-group bootstrap-touchspin"><span class="input-group-addon bootstrap-touchspin-prefix">' + F.prefix + '</span><span class="input-group-addon bootstrap-touchspin-postfix">' + F.postfix + '</span><span class="input-group-btn-vertical"><button class="' + F.buttondown_class + ' bootstrap-touchspin-up" type="button"><i class="' + F.verticalupclass + '"></i></button><button class="' + F.buttonup_class + ' bootstrap-touchspin-down" type="button"><i class="' + F.verticaldownclass + '"></i></button></span></div>' : '<div class="input-group bootstrap-touchspin"><span class="input-group-btn"><button class="' + F.buttondown_class + ' bootstrap-touchspin-down" type="button">' + F.buttondown_txt + '</button></span><span class="input-group-addon bootstrap-touchspin-prefix">' + F.prefix + '</span><span class="input-group-addon bootstrap-touchspin-postfix">' + F.postfix + '</span><span class="input-group-btn"><button class="' + F.buttonup_class + ' bootstrap-touchspin-up" type="button">' + F.buttonup_txt + "</button></span></div>", M = t(n).insertBefore(E), t(".bootstrap-touchspin-prefix", M).after(E), E.hasClass("input-sm") ? M.addClass("input-group-sm") : E.hasClass("input-lg") && M.addClass("input-group-lg")
            }

            function v() {
                P = {
                    down:    t(".bootstrap-touchspin-down", M),
                    up:      t(".bootstrap-touchspin-up", M),
                    input:   t("input", M),
                    prefix:  t(".bootstrap-touchspin-prefix", M).addClass(F.prefix_extraclass),
                    postfix: t(".bootstrap-touchspin-postfix", M).addClass(F.postfix_extraclass)
                }
            }

            function h() {
                "" === F.prefix && P.prefix.hide(), "" === F.postfix && P.postfix.hide()
            }

            function m() {
                E.on("keydown", function (t) {
                    var n = t.keyCode || t.which;
                    38 === n ? ("up" !== O && (_(), k()), t.preventDefault()) : 40 === n && ("down" !== O && (C(), D()), t.preventDefault())
                }), E.on("keyup", function (t) {
                    var n = t.keyCode || t.which;
                    38 === n ? N() : 40 === n && N()
                }), E.on("blur", function () {
                    w()
                }), P.down.on("keydown", function (t) {
                    var n = t.keyCode || t.which;
                    (32 === n || 13 === n) && ("down" !== O && (C(), D()), t.preventDefault())
                }), P.down.on("keyup", function (t) {
                    var n = t.keyCode || t.which;
                    (32 === n || 13 === n) && N()
                }), P.up.on("keydown", function (t) {
                    var n = t.keyCode || t.which;
                    (32 === n || 13 === n) && ("up" !== O && (_(), k()), t.preventDefault())
                }), P.up.on("keyup", function (t) {
                    var n = t.keyCode || t.which;
                    (32 === n || 13 === n) && N()
                }), P.down.on("mousedown.touchspin", function (t) {
                    P.down.off("touchstart.touchspin"), E.is(":disabled") || (C(), D(), t.preventDefault(), t.stopPropagation())
                }), P.down.on("touchstart.touchspin", function (t) {
                    P.down.off("mousedown.touchspin"), E.is(":disabled") || (C(), D(), t.preventDefault(), t.stopPropagation())
                }), P.up.on("mousedown.touchspin", function (t) {
                    P.up.off("touchstart.touchspin"), E.is(":disabled") || (_(), k(), t.preventDefault(), t.stopPropagation())
                }), P.up.on("touchstart.touchspin", function (t) {
                    P.up.off("mousedown.touchspin"), E.is(":disabled") || (_(), k(), t.preventDefault(), t.stopPropagation())
                }), P.up.on("mouseout touchleave touchend touchcancel", function (t) {
                    O && (t.stopPropagation(), N())
                }), P.down.on("mouseout touchleave touchend touchcancel", function (t) {
                    O && (t.stopPropagation(), N())
                }), P.down.on("mousemove touchmove", function (t) {
                    O && (t.stopPropagation(), t.preventDefault())
                }), P.up.on("mousemove touchmove", function (t) {
                    O && (t.stopPropagation(), t.preventDefault())
                }), t(document).on(o(["mouseup", "touchend", "touchcancel"], s).join(" "), function (t) {
                    O && (t.preventDefault(), N())
                }), t(document).on(o(["mousemove", "touchmove", "scroll", "scrollstart"], s).join(" "), function (t) {
                    O && (t.preventDefault(), N())
                }), E.on("mousewheel DOMMouseScroll", function (t) {
                    if (F.mousewheel && E.is(":focus")) {
                        var n = t.originalEvent.wheelDelta || -t.originalEvent.deltaY || -t.originalEvent.detail;
                        t.stopPropagation(), t.preventDefault(), 0 > n ? C() : _()
                    }
                })
            }

            function x() {
                E.on("touchspin.uponce", function () {
                    N(), _()
                }), E.on("touchspin.downonce", function () {
                    N(), C()
                }), E.on("touchspin.startupspin", function () {
                    k()
                }), E.on("touchspin.startdownspin", function () {
                    D()
                }), E.on("touchspin.stopspin", function () {
                    N()
                }), E.on("touchspin.updatesettings", function (t, n) {
                    p(n)
                })
            }

            function g(t) {
                switch (F.forcestepdivisibility) {
                    case"round":
                        return (Math.round(t / F.step) * F.step).toFixed(F.decimals);
                    case"floor":
                        return (Math.floor(t / F.step) * F.step).toFixed(F.decimals);
                    case"ceil":
                        return (Math.ceil(t / F.step) * F.step).toFixed(F.decimals);
                    default:
                        return t
                }
            }

            function w() {
                var t, n, o;
                return t = E.val(), "" === t ? void("" !== F.replacementval && (E.val(F.replacementval), E.trigger("change"))) : void(F.decimals > 0 && "." === t || (n = parseFloat(t), isNaN(n) && (n = "" !== F.replacementval ? F.replacementval : 0), o = n, n.toString() !== t && (o = n), n < F.min && (o = F.min), n > F.max && (o = F.max), o = g(o), Number(t).toString() !== o.toString() && (E.val(o), E.trigger("change"))))
            }

            function y() {
                if (F.booster) {
                    var t = Math.pow(2, Math.floor(A / F.boostat)) * F.step;
                    return F.maxboostedstep && t > F.maxboostedstep && (t = F.maxboostedstep, S = Math.round(S / t) * t), Math.max(F.step, t)
                }
                return F.step
            }

            function _() {
                w(), S = parseFloat(P.input.val()), isNaN(S) && (S = 0);
                var t = S, n = y();
                S += n, S > F.max && (S = F.max, E.trigger("touchspin.on.max"), N()), P.input.val(Number(S).toFixed(F.decimals)), t !== S && E.trigger("change")
            }

            function C() {
                w(), S = parseFloat(P.input.val()), isNaN(S) && (S = 0);
                var t = S, n = y();
                S -= n, S < F.min && (S = F.min, E.trigger("touchspin.on.min"), N()), P.input.val(Number(S).toFixed(F.decimals)), t !== S && E.trigger("change")
            }

            function D() {
                N(), A = 0, O = "down", E.trigger("touchspin.on.startspin"), E.trigger("touchspin.on.startdownspin"), I = setTimeout(function () {
                    T = setInterval(function () {
                        A++, C()
                    }, F.stepinterval)
                }, F.stepintervaldelay)
            }

            function k() {
                N(), A = 0, O = "up", E.trigger("touchspin.on.startspin"), E.trigger("touchspin.on.startupspin"), B = setTimeout(function () {
                    j = setInterval(function () {
                        A++, _()
                    }, F.stepinterval)
                }, F.stepintervaldelay)
            }

            function N() {
                switch (clearTimeout(I), clearTimeout(B), clearInterval(T), clearInterval(j), O) {
                    case"up":
                        E.trigger("touchspin.on.stopupspin"), E.trigger("touchspin.on.stopspin");
                        break;
                    case"down":
                        E.trigger("touchspin.on.stopdownspin"), E.trigger("touchspin.on.stopspin")
                }
                A = 0, O = !1
            }

            var F, M, P, S, T, j, I, B, E = t(this), z = E.data(), A = 0, O = !1;
            i()
        })
    }
}(jQuery);
/*! JQuery star rating | @version 3.1.0 | @copyright &copy; Kartik Visweswaran, Krajee.com, 2014 | For more JQuery plugins visit http://plugins.krajee.com*/
!function (e) {
    var t = 0, a = 5, n = .5, r = "ontouchstart"in window || window.DocumentTouch && document instanceof window.DocumentTouch, l = function (t, a) {
        return "undefined" == typeof t || null === t || void 0 === t || t == [] || "" === t || a && "" === e.trim(t)
    }, i = function (e, t, a) {
        var n = l(e.data(t)) ? e.attr(t) : e.data(t);
        return n ? n : a[t]
    }, s = function (e) {
        var t = ("" + e).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        return t ? Math.max(0, (t[1] ? t[1].length : 0) - (t[2] ? +t[2] : 0)) : 0
    }, o = function (e, t) {
        return parseFloat(e.toFixed(t))
    }, c = function (t, a) {
        this.$element = e(t), this.init(a)
    };
    c.prototype = {
        constructor:             c, _parseAttr: function (e, r) {
            var s = this, o = s.$element;
            if ("range" === o.attr("type") || "number" === o.attr("type")) {
                var c = i(o, e, r), u = n;
                "min" === e ? u = t : "max" === e ? u = a : "step" === e && (u = n);
                var p = l(c) ? u : c;
                return parseFloat(p)
            }
            return parseFloat(r[e])
        }, listen:               function () {
            var t = this;
            t.initTouch(), t.$rating.on("click", function (e) {
                if (!t.inactive) {
                    var a = e.pageX - t.$rating.offset().left;
                    t.setStars(a), t.$element.trigger("change"), t.$element.trigger("rating.change", [t.$element.val(), t.$caption.html()]), t.starClicked = !0
                }
            }), t.$rating.on("mousemove", function (e) {
                if (t.hoverEnabled && !t.inactive) {
                    t.starClicked = !1;
                    var a = e.pageX - t.$rating.offset().left, n = t.calculate(a);
                    t.toggleHover(n), t.$element.trigger("rating.hover", [n.val, n.caption, "stars"])
                }
            }), t.$rating.on("mouseleave", function () {
                if (t.hoverEnabled && !t.inactive && !t.starClicked) {
                    var e = t.cache;
                    t.toggleHover(e), t.$element.trigger("rating.hoverleave", ["stars"])
                }
            }), t.$clear.on("mousemove", function () {
                if (t.hoverEnabled && !t.inactive && t.hoverOnClear) {
                    t.clearClicked = !1;
                    var e, a = '<span class="' + t.clearCaptionClass + '">' + t.clearCaption + "</span>", n = t.clearValue, r = t.getWidthFromValue(n);
                    e = {
                        caption: a,
                        width:   r,
                        val:     n
                    }, t.toggleHover(e), t.$element.trigger("rating.hover", [n, a, "clear"])
                }
            }), t.$clear.on("mouseleave", function () {
                if (t.hoverEnabled && !t.inactive && !t.clearClicked && t.hoverOnClear) {
                    var e = t.cache;
                    t.toggleHover(e), t.$element.trigger("rating.hoverleave", ["clear"])
                }
            }), t.$clear.on("click", function () {
                t.inactive || (t.clear(), t.clearClicked = !0)
            }), e(t.$element[0].form).on("reset", function () {
                t.inactive || t.reset()
            })
        }, setTouch:             function (e, t) {
            var a = this;
            if (r && !a.inactive) {
                var n = e.originalEvent.touches[0].pageX - a.$rating.offset().left;
                if (t === !0)a.setStars(n), a.$element.trigger("change"), a.$element.trigger("rating.change", [a.$element.val(), a.$caption.html()]), a.starClicked = !0; else {
                    var l = a.calculate(n), i = l.val <= a.clearValue ? a.fetchCaption(a.clearValue) : l.caption, s = a.getWidthFromValue(a.clearValue), o = l.val <= a.clearValue ? a.rtl ? 100 - s + "%" : s + "%" : l.width;
                    a.$caption.html(i), a.$stars.css("width", o)
                }
            }
        }, initTouch:            function () {
            var e = this;
            e.$rating.on("touchstart", function (t) {
                e.setTouch(t, !1)
            }), e.$rating.on("touchmove", function (t) {
                e.setTouch(t, !1)
            }), e.$rating.on("touchend", function (t) {
                e.setTouch(t, !0)
            })
        }, initSlider:           function (e) {
            var r = this;
            l(r.$element.val()) && r.$element.val(0), r.initialValue = r.$element.val(), r.min = "undefined" != typeof e.min ? e.min : r._parseAttr("min", e), r.max = "undefined" != typeof e.max ? e.max : r._parseAttr("max", e), r.step = "undefined" != typeof e.step ? e.step : r._parseAttr("step", e), (isNaN(r.min) || l(r.min)) && (r.min = t), (isNaN(r.max) || l(r.max)) && (r.max = a), (isNaN(r.step) || l(r.step) || 0 == r.step) && (r.step = n), r.diff = r.max - r.min
        }, init:                 function (t) {
            var a = this;
            a.options = t, a.hoverEnabled = t.hoverEnabled, a.hoverChangeCaption = t.hoverChangeCaption, a.hoverChangeStars = t.hoverChangeStars, a.hoverOnClear = t.hoverOnClear, a.starClicked = !1, a.clearClicked = !1, a.initSlider(t), a.checkDisabled(), $element = a.$element, a.containerClass = t.containerClass, a.glyphicon = t.glyphicon;
            var n = a.glyphicon ? "" : "★";
            a.symbol = l(t.symbol) ? n : t.symbol, a.rtl = t.rtl || a.$element.attr("dir"), a.rtl && a.$element.attr("dir", "rtl"), a.showClear = t.showClear, a.showCaption = t.showCaption, a.size = t.size, a.stars = t.stars, a.defaultCaption = t.defaultCaption, a.starCaptions = t.starCaptions, a.starCaptionClasses = t.starCaptionClasses, a.clearButton = t.clearButton, a.clearButtonTitle = t.clearButtonTitle, a.clearButtonBaseClass = l(t.clearButtonBaseClass) ? "clear-rating" : t.clearButtonBaseClass, a.clearButtonActiveClass = l(t.clearButtonActiveClass) ? "clear-rating-active" : t.clearButtonActiveClass, a.clearCaption = t.clearCaption, a.clearCaptionClass = t.clearCaptionClass, a.clearValue = l(t.clearValue) ? a.min : t.clearValue, a.$element.removeClass("form-control").addClass("form-control"), a.$clearElement = l(t.clearElement) ? null : e(t.clearElement), a.$captionElement = l(t.captionElement) ? null : e(t.captionElement), "undefined" == typeof a.$rating && "undefined" == typeof a.$container && (a.$rating = e(document.createElement("div")).html('<div class="rating-stars"></div>'), a.$container = e(document.createElement("div")), a.$container.before(a.$rating), a.$container.append(a.$rating), a.$element.before(a.$container).appendTo(a.$rating)), a.$stars = a.$rating.find(".rating-stars"), a.generateRating(), a.$clear = l(a.$clearElement) ? a.$container.find("." + a.clearButtonBaseClass) : a.$clearElement, a.$caption = l(a.$captionElement) ? a.$container.find(".caption") : a.$captionElement, a.setStars(), a.$element.hide(), a.listen(), a.showClear && a.$clear.attr({"class": a.getClearClass()}), a.cache = {
                caption: a.$caption.html(),
                width: a.$stars.width(),
                val: a.$element.val()
            }, a.$element.removeClass("rating-loading")
        }, checkDisabled:        function () {
            var e = this;
            e.disabled = i(e.$element, "disabled", e.options), e.readonly = i(e.$element, "readonly", e.options), e.inactive = e.disabled || e.readonly
        }, getClearClass:        function () {
            return this.clearButtonBaseClass + " " + (this.inactive ? "" : this.clearButtonActiveClass)
        }, generateRating:       function () {
            var e = this, t = e.renderClear(), a = e.renderCaption(), n = e.rtl ? "rating-container-rtl" : "rating-container", r = e.getStars();
            n += e.glyphicon ? "" == e.symbol ? " rating-gly-star" : " rating-gly" : " rating-uni", e.$rating.attr("class", n), e.$rating.attr("data-content", r), e.$stars.attr("data-content", r);
            var n = e.rtl ? "star-rating-rtl" : "star-rating";
            e.$container.attr("class", n + " rating-" + e.size), e.inactive ? e.$container.removeClass("rating-active").addClass("rating-disabled") : e.$container.removeClass("rating-disabled").addClass("rating-active"), "undefined" == typeof e.$caption && "undefined" == typeof e.$clear && (e.rtl ? e.$container.prepend(a).append(t) : e.$container.prepend(t).append(a)), l(e.containerClass) || e.$container.removeClass(e.containerClass).addClass(e.containerClass)
        }, getStars:             function () {
            for (var e = this, t = e.stars, a = "", n = 1; t >= n; n++)a += e.symbol;
            return a
        }, renderClear:          function () {
            var e = this;
            if (!e.showClear)return "";
            var t = e.getClearClass();
            return l(e.$clearElement) ? '<div class="' + t + '" title="' + e.clearButtonTitle + '">' + e.clearButton + "</div>" : (e.$clearElement.removeClass(t).addClass(t).attr({title: e.clearButtonTitle}), e.$clearElement.html(e.clearButton), "")
        }, renderCaption:        function () {
            var e = this, t = e.$element.val();
            if (!e.showCaption)return "";
            var a = e.fetchCaption(t);
            return l(e.$captionElement) ? '<div class="caption">' + a + "</div>" : (e.$captionElement.removeClass("caption").addClass("caption").attr({title: e.clearCaption}), e.$captionElement.html(a), "")
        }, fetchCaption:         function (e) {
            var t, a, n = this, r = parseFloat(e);
            if (t = "function" == typeof n.starCaptionClasses ? l(n.starCaptionClasses(r)) ? n.clearCaptionClass : n.starCaptionClasses(r) : l(n.starCaptionClasses[r]) ? n.clearCaptionClass : n.starCaptionClasses[r], "function" == typeof n.starCaptions)var a = l(n.starCaptions(r)) ? n.defaultCaption.replace(/\{rating\}/g, r) : n.starCaptions(r); else var a = l(n.starCaptions[r]) ? n.defaultCaption.replace(/\{rating\}/g, r) : n.starCaptions[r];
            var i = r == n.clearValue ? n.clearCaption : a;
            return '<span class="' + t + '">' + i + "</span>"
        }, getWidthFromValue:    function (e) {
            {
                var t = this, a = t.min, n = t.max;
                t.step
            }
            return a >= e || a == n ? 0 : e >= n ? 100 : 100 * (e - a) / (n - a)
        }, getValueFromPosition: function (e) {
            var t, a, n = this, r = s(n.step), l = n.$rating.width();
            return t = e / l, a = n.rtl ? n.min + Math.floor(n.diff * t / n.step) * n.step : n.min + Math.ceil(n.diff * t / n.step) * n.step, a < n.min ? a = n.min : a > n.max && (a = n.max), a = o(parseFloat(a), r), n.rtl && (a = n.max - a), a
        }, toggleHover:          function (e) {
            var t = this;
            if (t.hoverChangeCaption) {
                var a = e.val <= t.clearValue ? t.fetchCaption(t.clearValue) : e.caption;
                t.$caption.html(a)
            }
            if (t.hoverChangeStars) {
                var n = t.getWidthFromValue(t.clearValue), r = e.val <= t.clearValue ? t.rtl ? 100 - n + "%" : n + "%" : e.width;
                t.$stars.css("width", r)
            }
        }, calculate:            function (e) {
            var t = this, a = l(t.$element.val()) ? 0 : t.$element.val(), n = arguments.length ? t.getValueFromPosition(e) : a, r = t.fetchCaption(n), i = t.getWidthFromValue(n);
            return t.rtl && (i = 100 - i), i += "%", {caption: r, width: i, val: n}
        }, setStars:             function (e) {
            var t = this, a = arguments.length ? t.calculate(e) : t.calculate();
            t.$element.val(a.val), t.$stars.css("width", a.width), t.$caption.html(a.caption), t.cache = a
        }, clear:                function () {
            var e = this, t = '<span class="' + e.clearCaptionClass + '">' + e.clearCaption + "</span>";
            e.$stars.removeClass("rated"), e.inactive || e.$caption.html(t), e.$element.val(e.clearValue), e.setStars(), e.$element.trigger("rating.clear")
        }, reset:                function () {
            var e = this;
            e.$element.val(e.initialValue), e.setStars(), e.$element.trigger("rating.reset")
        }, update:               function (e) {
            if (arguments.length > 0) {
                var t = this;
                t.$element.val(e), t.setStars()
            }
        }, refresh:              function (t) {
            var a = this;
            if (arguments.length) {
                a.init(e.extend(a.options, t)), a.showClear ? a.$clear.show() : a.$clear.hide(), a.showCaption ? a.$caption.show() : a.$caption.hide()
            }
        }
    }, e.fn.rating = function (t) {
        var a = Array.apply(null, arguments);
        return a.shift(), this.each(function () {
            var n = e(this), r = n.data("rating"), l = "object" == typeof t && t;
            r || n.data("rating", r = new c(this, e.extend({}, e.fn.rating.defaults, l, e(this).data()))), "string" == typeof t && r[t].apply(r, a)
        })
    }, e.fn.rating.defaults = {
        stars:                  5,
        glyphicon:              !0,
        symbol:                 null,
        disabled:               !1,
        readonly:               !1,
        rtl:                    !1,
        size:                   "md",
        showClear:              !0,
        showCaption:            !0,
        defaultCaption:         "{rating} Stars",
        starCaptions:           {
            .5:  "Half Star",
            1:   "One Star",
            1.5: "One & Half Star",
            2:   "Two Stars",
            2.5: "Two & Half Stars",
            3:   "Three Stars",
            3.5: "Three & Half Stars",
            4:   "Four Stars",
            4.5: "Four & Half Stars",
            5:   "Five Stars"
        },
        starCaptionClasses:     {
            .5:  "label label-danger",
            1:   "label label-danger",
            1.5: "label label-warning",
            2:   "label label-warning",
            2.5: "label label-info",
            3:   "label label-info",
            3.5: "label label-primary",
            4:   "label label-primary",
            4.5: "label label-success",
            5:   "label label-success"
        },
        clearButton:            '<i class="glyphicon glyphicon-minus-sign"></i>',
        clearButtonTitle:       "Clear",
        clearButtonBaseClass:   "clear-rating",
        clearButtonActiveClass: "clear-rating-active",
        clearCaption:           "Not Rated",
        clearCaptionClass:      "label label-default",
        clearValue:             null,
        captionElement:         null,
        clearElement:           null,
        containerClass:         null,
        hoverEnabled:           !0,
        hoverChangeCaption:     !0,
        hoverChangeStars:       !0,
        hoverOnClear:           !0
    }, e("input.rating").addClass("rating-loading"), e(document).ready(function () {
        var t = e("input.rating"), a = Object.keys(t).length;
        a > 0 && t.rating()
    })
}(jQuery);

/*! noUiSlider - 7.0.9 - 2014-10-08 16:49:45 */
!function (t) {
    "use strict";
    function n(t, n) {
        return Math.round(t / n) * n
    }

    function e(t) {
        return "number" == typeof t && !isNaN(t) && isFinite(t)
    }

    function i(t) {
        var n = Math.pow(10, 7);
        return Number((Math.round(t * n) / n).toFixed(7))
    }

    function r(t, n, e) {
        t.addClass(n), setTimeout(function () {
            t.removeClass(n)
        }, e)
    }

    function o(t) {
        return Math.max(Math.min(t, 100), 0)
    }

    function a(n) {
        return t.isArray(n) ? n : [n]
    }

    function s(t, n) {
        return 100 / (n - t)
    }

    function l(t, n) {
        return 100 * n / (t[1] - t[0])
    }

    function u(t, n) {
        return l(t, t[0] < 0 ? n + Math.abs(t[0]) : n - t[0])
    }

    function c(t, n) {
        return n * (t[1] - t[0]) / 100 + t[0]
    }

    function d(t, n) {
        for (var e = 1; t >= n[e];)e += 1;
        return e
    }

    function f(t, n, e) {
        if (e >= t.slice(-1)[0])return 100;
        var i, r, o, a, l = d(e, t);
        return i = t[l - 1], r = t[l], o = n[l - 1], a = n[l], o + u([i, r], e) / s(o, a)
    }

    function h(t, n, e) {
        if (e >= 100)return t.slice(-1)[0];
        var i, r, o, a, l = d(e, n);
        return i = t[l - 1], r = t[l], o = n[l - 1], a = n[l], c([i, r], (e - o) * s(o, a))
    }

    function p(t, e, i, r) {
        if (100 === r)return r;
        var o, a, s = d(r, t);
        return i ? (o = t[s - 1], a = t[s], r - o > (a - o) / 2 ? a : o) : e[s - 1] ? t[s - 1] + n(r - t[s - 1], e[s - 1]) : r
    }

    function m(t, n, i) {
        var r;
        if ("number" == typeof n && (n = [n]), "[object Array]" !== Object.prototype.toString.call(n))throw new Error("noUiSlider: 'range' contains invalid value.");
        if (r = "min" === t ? 0 : "max" === t ? 100 : parseFloat(t), !e(r) || !e(n[0]))throw new Error("noUiSlider: 'range' value isn't numeric.");
        i.xPct.push(r), i.xVal.push(n[0]), r ? i.xSteps.push(isNaN(n[1]) ? !1 : n[1]) : isNaN(n[1]) || (i.xSteps[0] = n[1])
    }

    function g(t, n, e) {
        return n ? void(e.xSteps[t] = l([e.xVal[t], e.xVal[t + 1]], n) / s(e.xPct[t], e.xPct[t + 1])) : !0
    }

    function v(t, n, e, i) {
        this.xPct = [], this.xVal = [], this.xSteps = [i || !1], this.xNumSteps = [!1], this.snap = n, this.direction = e;
        var r, o = this;
        for (r in t)t.hasOwnProperty(r) && m(r, t[r], o);
        o.xNumSteps = o.xSteps.slice(0);
        for (r in o.xNumSteps)o.xNumSteps.hasOwnProperty(r) && g(Number(r), o.xNumSteps[r], o)
    }

    function w(t, n) {
        if (!e(n))throw new Error("noUiSlider: 'step' is not numeric.");
        t.singleStep = n
    }

    function S(n, e) {
        if ("object" != typeof e || t.isArray(e))throw new Error("noUiSlider: 'range' is not an object.");
        if (void 0 === e.min || void 0 === e.max)throw new Error("noUiSlider: Missing 'min' or 'max' in 'range'.");
        n.spectrum = new v(e, n.snap, n.dir, n.singleStep)
    }

    function x(n, e) {
        if (e = a(e), !t.isArray(e) || !e.length || e.length > 2)throw new Error("noUiSlider: 'start' option is incorrect.");
        n.handles = e.length, n.start = e
    }

    function y(t, n) {
        if (t.snap = n, "boolean" != typeof n)throw new Error("noUiSlider: 'snap' option must be a boolean.")
    }

    function b(t, n) {
        if (t.animate = n, "boolean" != typeof n)throw new Error("noUiSlider: 'animate' option must be a boolean.")
    }

    function U(t, n) {
        if ("lower" === n && 1 === t.handles)t.connect = 1; else if ("upper" === n && 1 === t.handles)t.connect = 2; else if (n === !0 && 2 === t.handles)t.connect = 3; else {
            if (n !== !1)throw new Error("noUiSlider: 'connect' option doesn't match handle count.");
            t.connect = 0
        }
    }

    function P(t, n) {
        switch (n) {
            case"horizontal":
                t.ort = 0;
                break;
            case"vertical":
                t.ort = 1;
                break;
            default:
                throw new Error("noUiSlider: 'orientation' option is invalid.")
        }
    }

    function C(t, n) {
        if (!e(n))throw new Error("noUiSlider: 'margin' option must be numeric.");
        if (t.margin = t.spectrum.getMargin(n), !t.margin)throw new Error("noUiSlider: 'margin' option is only supported on linear sliders.")
    }

    function E(t, n) {
        if (!e(n))throw new Error("noUiSlider: 'limit' option must be numeric.");
        if (t.limit = t.spectrum.getMargin(n), !t.limit)throw new Error("noUiSlider: 'limit' option is only supported on linear sliders.")
    }

    function k(t, n) {
        switch (n) {
            case"ltr":
                t.dir = 0;
                break;
            case"rtl":
                t.dir = 1, t.connect = [0, 2, 1, 3][t.connect];
                break;
            default:
                throw new Error("noUiSlider: 'direction' option was not recognized.")
        }
    }

    function M(t, n) {
        if ("string" != typeof n)throw new Error("noUiSlider: 'behaviour' must be a string containing options.");
        var e = n.indexOf("tap") >= 0, i = n.indexOf("drag") >= 0, r = n.indexOf("fixed") >= 0, o = n.indexOf("snap") >= 0;
        t.events = {tap: e || o, drag: i, fixed: r, snap: o}
    }

    function O(t, n) {
        if (t.format = n, "function" == typeof n.to && "function" == typeof n.from)return !0;
        throw new Error("noUiSlider: 'format' requires 'to' and 'from' methods.")
    }

    function N(n) {
        var e, i = {margin: 0, limit: 0, animate: !0, format: B};
        return e = {
            step:        {r: !1, t: w},
            start:       {r: !0, t: x},
            connect:     {r: !0, t: U},
            direction:   {r: !0, t: k},
            snap:        {r: !1, t: y},
            animate:     {r: !1, t: b},
            range:       {r: !0, t: S},
            orientation: {r: !1, t: P},
            margin:      {r: !1, t: C},
            limit:       {r: !1, t: E},
            behaviour:   {r: !0, t: M},
            format:      {r: !1, t: O}
        }, n = t.extend({
            connect:     !1,
            direction:   "ltr",
            behaviour:   "tap",
            orientation: "horizontal"
        }, n), t.each(e, function (t, e) {
            if (void 0 === n[t]) {
                if (e.r)throw new Error("noUiSlider: '" + t + "' is required.");
                return !0
            }
            e.t(i, n[t])
        }), i.style = i.ort ? "top" : "left", i
    }

    function A(t, n, e) {
        var i = t + n[0], r = t + n[1];
        return e ? (0 > i && (r += Math.abs(i)), r > 100 && (i -= r - 100), [o(i), o(r)]) : [i, r]
    }

    function F(t) {
        t.preventDefault();
        var n, e, i = 0 === t.type.indexOf("touch"), r = 0 === t.type.indexOf("mouse"), o = 0 === t.type.indexOf("pointer"), a = t;
        return 0 === t.type.indexOf("MSPointer") && (o = !0), t.originalEvent && (t = t.originalEvent), i && (n = t.changedTouches[0].pageX, e = t.changedTouches[0].pageY), (r || o) && (o || void 0 !== window.pageXOffset || (window.pageXOffset = document.documentElement.scrollLeft, window.pageYOffset = document.documentElement.scrollTop), n = t.clientX + window.pageXOffset, e = t.clientY + window.pageYOffset), a.points = [n, e], a.cursor = r, a
    }

    function L(n, e) {
        var i = t("<div><div/></div>").addClass(Z[2]), r = ["-lower", "-upper"];
        return n && r.reverse(), i.children().addClass(Z[3] + " " + Z[3] + r[e]), i
    }

    function I(t, n, e) {
        switch (t) {
            case 1:
                n.addClass(Z[7]), e[0].addClass(Z[6]);
                break;
            case 3:
                e[1].addClass(Z[6]);
            case 2:
                e[0].addClass(Z[7]);
            case 0:
                n.addClass(Z[6])
        }
    }

    function V(t, n, e) {
        var i, r = [];
        for (i = 0; t > i; i += 1)r.push(L(n, i).appendTo(e));
        return r
    }

    function j(n, e, i) {
        return i.addClass([Z[0], Z[8 + n], Z[4 + e]].join(" ")), t("<div/>").appendTo(i).addClass(Z[1])
    }

    function T(n, e, i) {
        function s() {
            return k[["width", "height"][e.ort]]()
        }

        function l(t) {
            var n, e = [O.val()];
            for (n = 0; n < t.length; n += 1)O.trigger(t[n], e)
        }

        function u(t) {
            return 1 === t.length ? t[0] : e.dir ? t.reverse() : t
        }

        function c(t) {
            return function (n, e) {
                O.val([t ? null : e, t ? e : null], !0)
            }
        }

        function d(n) {
            var e = t.inArray(n, z);
            O[0].linkAPI && O[0].linkAPI[n] && O[0].linkAPI[n].change(T[e], M[e].children(), O)
        }

        function f(n, i) {
            var r = t.inArray(n, z);
            return i && i.appendTo(M[r].children()), e.dir && e.handles > 1 && (r = 1 === r ? 0 : 1), c(r)
        }

        function h() {
            var t, n;
            for (t = 0; t < z.length; t += 1)this.linkAPI && this.linkAPI[n = z[t]] && this.linkAPI[n].reconfirm(n)
        }

        function p(t, n, i, r) {
            return t = t.replace(/\s/g, q + " ") + q, n.on(t, function (t) {
                return O.attr("disabled") ? !1 : O.hasClass(Z[14]) ? !1 : (t = F(t), t.calcPoint = t.points[e.ort], void i(t, r))
            })
        }

        function m(t, n) {
            var e, i = n.handles || M, r = !1, o = 100 * (t.calcPoint - n.start) / s(), a = i[0][0] !== M[0][0] ? 1 : 0;
            e = A(o, n.positions, i.length > 1), r = x(i[0], e[a], 1 === i.length), i.length > 1 && (r = x(i[1], e[a ? 0 : 1], !1) || r), r && l(["slide"])
        }

        function g(n) {
            t("." + Z[15]).removeClass(Z[15]), n.cursor && t("body").css("cursor", "").off(q), Y.off(q), O.removeClass(Z[12]), l(["set", "change"])
        }

        function v(n, e) {
            1 === e.handles.length && e.handles[0].children().addClass(Z[15]), n.stopPropagation(), p(Q.move, Y, m, {
                start:     n.calcPoint,
                handles:   e.handles,
                positions: [N[0], N[M.length - 1]]
            }), p(Q.end, Y, g, null), n.cursor && (t("body").css("cursor", t(n.target).css("cursor")), M.length > 1 && O.addClass(Z[12]), t("body").on("selectstart" + q, !1))
        }

        function w(n) {
            var i, o = n.calcPoint, a = 0;
            n.stopPropagation(), t.each(M, function () {
                a += this.offset()[e.style]
            }), a = a / 2 > o || 1 === M.length ? 0 : 1, o -= k.offset()[e.style], i = 100 * o / s(), e.events.snap || r(O, Z[14], 300), x(M[a], i), l(["slide", "set", "change"]), e.events.snap && v(n, {handles: [M[a]]})
        }

        function S(t) {
            var n, e;
            if (!t.fixed)for (n = 0; n < M.length; n += 1)p(Q.start, M[n].children(), v, {handles: [M[n]]});
            t.tap && p(Q.start, k, w, {handles: M}), t.drag && (e = k.find("." + Z[7]).addClass(Z[10]), t.fixed && (e = e.add(k.children().not(e).children())), p(Q.start, e, v, {handles: M}))
        }

        function x(t, n, i) {
            var r = t[0] !== M[0][0] ? 1 : 0, a = N[0] + e.margin, s = N[1] - e.margin, l = N[0] + e.limit, u = N[1] - e.limit;
            return M.length > 1 && (n = r ? Math.max(n, a) : Math.min(n, s)), i !== !1 && e.limit && M.length > 1 && (n = r ? Math.min(n, l) : Math.max(n, u)), n = L.getStep(n), n = o(parseFloat(n.toFixed(7))), n === N[r] ? !1 : (t.css(e.style, n + "%"), t.is(":first-child") && t.toggleClass(Z[17], n > 50), N[r] = n, T[r] = L.fromStepping(n), d(z[r]), !0)
        }

        function y(t, n) {
            var i, r, o;
            for (e.limit && (t += 1), i = 0; t > i; i += 1)r = i % 2, o = n[r], null !== o && o !== !1 && ("number" == typeof o && (o = String(o)), o = e.format.from(o), (o === !1 || isNaN(o) || x(M[r], L.toStepping(o), i === 3 - e.dir) === !1) && d(z[r]))
        }

        function b(t) {
            if (O[0].LinkIsEmitting)return this;
            var n, i = a(t);
            return e.dir && e.handles > 1 && i.reverse(), e.animate && -1 !== N[0] && r(O, Z[14], 300), n = M.length > 1 ? 3 : 1, 1 === i.length && (n = 1), y(n, i), l(["set"]), this
        }

        function U() {
            var t, n = [];
            for (t = 0; t < e.handles; t += 1)n[t] = e.format.to(T[t]);
            return u(n)
        }

        function P() {
            return t(this).off(q).removeClass(Z.join(" ")).empty(), delete this.LinkUpdate, delete this.LinkConfirm, delete this.LinkDefaultFormatter, delete this.LinkDefaultFlag, delete this.reappend, delete this.vGet, delete this.vSet, delete this.getCurrentStep, delete this.getInfo, delete this.destroy, i
        }

        function C() {
            var n = t.map(N, function (t, n) {
                var e = L.getApplicableStep(t), i = T[n], r = e[2], o = i - e[2] >= e[1] ? e[2] : e[0];
                return [[o, r]]
            });
            return u(n)
        }

        function E() {
            return i
        }

        var k, M, O = t(n), N = [-1, -1], L = e.spectrum, T = [], z = ["lower", "upper"].slice(0, e.handles);
        if (e.dir && z.reverse(), n.LinkUpdate = d, n.LinkConfirm = f, n.LinkDefaultFormatter = e.format, n.LinkDefaultFlag = "lower", n.reappend = h, O.hasClass(Z[0]))throw new Error("Slider was already initialized.");
        k = j(e.dir, e.ort, O), M = V(e.handles, e.dir, k), I(e.connect, O, M), S(e.events), n.vSet = b, n.vGet = U, n.destroy = P, n.getCurrentStep = C, n.getOriginalOptions = E, n.getInfo = function () {
            return [L, e.style, e.ort]
        }, O.val(e.start)
    }

    function z(t) {
        if (!this.length)throw new Error("noUiSlider: Can't initialize slider on empty selection.");
        var n = N(t, this);
        return this.each(function () {
            T(this, n, t)
        })
    }

    function D(n) {
        return this.each(function () {
            if (!this.destroy)return void t(this).noUiSlider(n);
            var e = t(this).val(), i = this.destroy(), r = t.extend({}, i, n);
            t(this).noUiSlider(r), this.reappend(), i.start === r.start && t(this).val(e)
        })
    }

    function X() {
        return this[0][arguments.length ? "vSet" : "vGet"].apply(this[0], arguments)
    }

    var Y = t(document), G = t.fn.val, q = ".nui", Q = window.navigator.pointerEnabled ? {
        start: "pointerdown",
        move:  "pointermove",
        end:   "pointerup"
    } : window.navigator.msPointerEnabled ? {
        start: "MSPointerDown",
        move:  "MSPointerMove",
        end:   "MSPointerUp"
    } : {
        start: "mousedown touchstart",
        move:  "mousemove touchmove",
        end:   "mouseup touchend"
    }, Z = ["noUis-target", "noUis-base", "noUis-origin", "noUis-handle", "noUis-horizontal", "noUis-vertical", "noUis-background", "noUis-connect", "noUis-ltr", "noUis-rtl", "noUis-dragable", "", "noUis-state-drag", "", "noUis-state-tap", "noUis-active", "", "noUis-stacking"];
    v.prototype.getMargin = function (t) {
        return 2 === this.xPct.length ? l(this.xVal, t) : !1
    }, v.prototype.toStepping = function (t) {
        return t = f(this.xVal, this.xPct, t), this.direction && (t = 100 - t), t
    }, v.prototype.fromStepping = function (t) {
        return this.direction && (t = 100 - t), i(h(this.xVal, this.xPct, t))
    }, v.prototype.getStep = function (t) {
        return this.direction && (t = 100 - t), t = p(this.xPct, this.xSteps, this.snap, t), this.direction && (t = 100 - t), t
    }, v.prototype.getApplicableStep = function (t) {
        var n = d(t, this.xPct), e = 100 === t ? 2 : 1;
        return [this.xNumSteps[n - 2], this.xVal[n - e], this.xNumSteps[n - e]]
    }, v.prototype.convert = function (t) {
        return this.getStep(this.toStepping(t))
    };
    var B = {
        to:      function (t) {
            return t.toFixed(2)
        }, from: Number
    };
    t.fn.val = function (n) {
        function e(t) {
            return t.hasClass(Z[0]) ? X : G
        }

        if (void 0 === n) {
            var i = t(this[0]);
            return e(i).call(i)
        }
        var r = t.isFunction(n);
        return this.each(function (i) {
            var o = n, a = t(this);
            r && (o = n.call(this, i, a.val())), e(a).call(a, o)
        })
    }, t.fn.noUiSlider = function (t, n) {
        switch (t) {
            case"step":
                return this[0].getCurrentStep();
            case"options":
                return this[0].getOriginalOptions()
        }
        return (n ? D : z).call(this, t)
    }
}(window.jQuery || window.Zepto);
/*! Bootstrap Colorpicker | Originally written by (c) 2012 Stefan Petre | Licensed under the Apache License v2.0 http://www.apache.org/licenses/LICENSE-2.0.txt | http://mjolnic.github.io/bootstrap-colorpicker/*/
!function (e) {
    "use strict";
    e(window.jQuery)
}(function (e) {
    "use strict";
    var t = function (e) {
        this.value = {
            h: 0,
            s: 0,
            b: 0,
            a: 1
        }, this.origFormat = null, e && (void 0 !== e.toLowerCase ? this.setColor(e) : void 0 !== e.h && (this.value = e))
    };
    t.prototype = {
        constructor:     t,
        colors:          {
            aliceblue:            "#f0f8ff",
            antiquewhite:         "#faebd7",
            aqua:                 "#00ffff",
            aquamarine:           "#7fffd4",
            azure:                "#f0ffff",
            beige:                "#f5f5dc",
            bisque:               "#ffe4c4",
            black:                "#000000",
            blanchedalmond:       "#ffebcd",
            blue:                 "#0000ff",
            blueviolet:           "#8a2be2",
            brown:                "#a52a2a",
            burlywood:            "#deb887",
            cadetblue:            "#5f9ea0",
            chartreuse:           "#7fff00",
            chocolate:            "#d2691e",
            coral:                "#ff7f50",
            cornflowerblue:       "#6495ed",
            cornsilk:             "#fff8dc",
            crimson:              "#dc143c",
            cyan:                 "#00ffff",
            darkblue:             "#00008b",
            darkcyan:             "#008b8b",
            darkgoldenrod:        "#b8860b",
            darkgray:             "#a9a9a9",
            darkgreen:            "#006400",
            darkkhaki:            "#bdb76b",
            darkmagenta:          "#8b008b",
            darkolivegreen:       "#556b2f",
            darkorange:           "#ff8c00",
            darkorchid:           "#9932cc",
            darkred:              "#8b0000",
            darksalmon:           "#e9967a",
            darkseagreen:         "#8fbc8f",
            darkslateblue:        "#483d8b",
            darkslategray:        "#2f4f4f",
            darkturquoise:        "#00ced1",
            darkviolet:           "#9400d3",
            deeppink:             "#ff1493",
            deepskyblue:          "#00bfff",
            dimgray:              "#696969",
            dodgerblue:           "#1e90ff",
            firebrick:            "#b22222",
            floralwhite:          "#fffaf0",
            forestgreen:          "#228b22",
            fuchsia:              "#ff00ff",
            gainsboro:            "#dcdcdc",
            ghostwhite:           "#f8f8ff",
            gold:                 "#ffd700",
            goldenrod:            "#daa520",
            gray:                 "#808080",
            green:                "#008000",
            greenyellow:          "#adff2f",
            honeydew:             "#f0fff0",
            hotpink:              "#ff69b4",
            "indianred ":         "#cd5c5c",
            "indigo ":            "#4b0082",
            ivory:                "#fffff0",
            khaki:                "#f0e68c",
            lavender:             "#e6e6fa",
            lavenderblush:        "#fff0f5",
            lawngreen:            "#7cfc00",
            lemonchiffon:         "#fffacd",
            lightblue:            "#add8e6",
            lightcoral:           "#f08080",
            lightcyan:            "#e0ffff",
            lightgoldenrodyellow: "#fafad2",
            lightgrey:            "#d3d3d3",
            lightgreen:           "#90ee90",
            lightpink:            "#ffb6c1",
            lightsalmon:          "#ffa07a",
            lightseagreen:        "#20b2aa",
            lightskyblue:         "#87cefa",
            lightslategray:       "#778899",
            lightsteelblue:       "#b0c4de",
            lightyellow:          "#ffffe0",
            lime:                 "#00ff00",
            limegreen:            "#32cd32",
            linen:                "#faf0e6",
            magenta:              "#ff00ff",
            maroon:               "#800000",
            mediumaquamarine:     "#66cdaa",
            mediumblue:           "#0000cd",
            mediumorchid:         "#ba55d3",
            mediumpurple:         "#9370d8",
            mediumseagreen:       "#3cb371",
            mediumslateblue:      "#7b68ee",
            mediumspringgreen:    "#00fa9a",
            mediumturquoise:      "#48d1cc",
            mediumvioletred:      "#c71585",
            midnightblue:         "#191970",
            mintcream:            "#f5fffa",
            mistyrose:            "#ffe4e1",
            moccasin:             "#ffe4b5",
            navajowhite:          "#ffdead",
            navy:                 "#000080",
            oldlace:              "#fdf5e6",
            olive:                "#808000",
            olivedrab:            "#6b8e23",
            orange:               "#ffa500",
            orangered:            "#ff4500",
            orchid:               "#da70d6",
            palegoldenrod:        "#eee8aa",
            palegreen:            "#98fb98",
            paleturquoise:        "#afeeee",
            palevioletred:        "#d87093",
            papayawhip:           "#ffefd5",
            peachpuff:            "#ffdab9",
            peru:                 "#cd853f",
            pink:                 "#ffc0cb",
            plum:                 "#dda0dd",
            powderblue:           "#b0e0e6",
            purple:               "#800080",
            red:                  "#ff0000",
            rosybrown:            "#bc8f8f",
            royalblue:            "#4169e1",
            saddlebrown:          "#8b4513",
            salmon:               "#fa8072",
            sandybrown:           "#f4a460",
            seagreen:             "#2e8b57",
            seashell:             "#fff5ee",
            sienna:               "#a0522d",
            silver:               "#c0c0c0",
            skyblue:              "#87ceeb",
            slateblue:            "#6a5acd",
            slategray:            "#708090",
            snow:                 "#fffafa",
            springgreen:          "#00ff7f",
            steelblue:            "#4682b4",
            tan:                  "#d2b48c",
            teal:                 "#008080",
            thistle:              "#d8bfd8",
            tomato:               "#ff6347",
            turquoise:            "#40e0d0",
            violet:               "#ee82ee",
            wheat:                "#f5deb3",
            white:                "#ffffff",
            whitesmoke:           "#f5f5f5",
            yellow:               "#ffff00",
            yellowgreen:          "#9acd32"
        },
        _sanitizeNumber: function (e) {
            return "number" == typeof e ? e : isNaN(e) || null === e || "" === e || void 0 === e ? 1 : void 0 !== e.toLowerCase ? parseFloat(e) : 1
        },
        setColor:        function (e) {
            e = e.toLowerCase(), this.value = this.stringToHSB(e) || {h: 0, s: 0, b: 0, a: 1}
        },
        stringToHSB:     function (t) {
            t = t.toLowerCase();
            var o = this, i = !1;
            return e.each(this.stringParsers, function (e, r) {
                var s = r.re.exec(t), a = s && r.parse.apply(o, [s]), n = r.format || "rgba";
                return a ? (i = n.match(/hsla?/) ? o.RGBtoHSB.apply(o, o.HSLtoRGB.apply(o, a)) : o.RGBtoHSB.apply(o, a), o.origFormat = n, !1) : !0
            }), i
        },
        setHue:          function (e) {
            this.value.h = 1 - e
        },
        setSaturation:   function (e) {
            this.value.s = e
        },
        setBrightness:   function (e) {
            this.value.b = 1 - e
        },
        setAlpha:        function (e) {
            this.value.a = parseInt(100 * (1 - e), 10) / 100
        },
        toRGB:           function (e, t, o, i) {
            e || (e = this.value.h, t = this.value.s, o = this.value.b), e *= 360;
            var r, s, a, n, l;
            return e = e % 360 / 60, l = o * t, n = l * (1 - Math.abs(e % 2 - 1)), r = s = a = o - l, e = ~~e, r += [l, n, 0, 0, n, l][e], s += [n, l, l, n, 0, 0][e], a += [0, 0, n, l, l, n][e], {
                r: Math.round(255 * r),
                g: Math.round(255 * s),
                b: Math.round(255 * a),
                a: i || this.value.a
            }
        },
        toHex:           function (e, t, o, i) {
            var r = this.toRGB(e, t, o, i);
            return "#" + (1 << 24 | parseInt(r.r) << 16 | parseInt(r.g) << 8 | parseInt(r.b)).toString(16).substr(1)
        },
        toHSL:           function (e, t, o, i) {
            e = e || this.value.h, t = t || this.value.s, o = o || this.value.b, i = i || this.value.a;
            var r = e, s = (2 - t) * o, a = t * o;
            return a /= s > 0 && 1 >= s ? s : 2 - s, s /= 2, a > 1 && (a = 1), {
                h: isNaN(r) ? 0 : r,
                s: isNaN(a) ? 0 : a,
                l: isNaN(s) ? 0 : s,
                a: isNaN(i) ? 0 : i
            }
        },
        toAlias:         function (e, t, o, i) {
            var r = this.toHex(e, t, o, i);
            for (var s in this.colors)if (this.colors[s] == r)return s;
            return !1
        },
        RGBtoHSB:        function (e, t, o, i) {
            e /= 255, t /= 255, o /= 255;
            var r, s, a, n;
            return a = Math.max(e, t, o), n = a - Math.min(e, t, o), r = 0 === n ? null : a === e ? (t - o) / n : a === t ? (o - e) / n + 2 : (e - t) / n + 4, r = (r + 360) % 6 * 60 / 360, s = 0 === n ? 0 : n / a, {
                h: this._sanitizeNumber(r),
                s: s,
                b: a,
                a: this._sanitizeNumber(i)
            }
        },
        HueToRGB:        function (e, t, o) {
            return 0 > o ? o += 1 : o > 1 && (o -= 1), 1 > 6 * o ? e + (t - e) * o * 6 : 1 > 2 * o ? t : 2 > 3 * o ? e + (t - e) * (2 / 3 - o) * 6 : e
        },
        HSLtoRGB:        function (e, t, o, i) {
            0 > t && (t = 0);
            var r;
            r = .5 >= o ? o * (1 + t) : o + t - o * t;
            var s = 2 * o - r, a = e + 1 / 3, n = e, l = e - 1 / 3, c = Math.round(255 * this.HueToRGB(s, r, a)), h = Math.round(255 * this.HueToRGB(s, r, n)), u = Math.round(255 * this.HueToRGB(s, r, l));
            return [c, h, u, this._sanitizeNumber(i)]
        },
        toString:        function (e) {
            switch (e = e || "rgba") {
                case"rgb":
                    var t = this.toRGB();
                    return "rgb(" + t.r + "," + t.g + "," + t.b + ")";
                case"rgba":
                    var t = this.toRGB();
                    return "rgba(" + t.r + "," + t.g + "," + t.b + "," + t.a + ")";
                case"hsl":
                    var o = this.toHSL();
                    return "hsl(" + Math.round(360 * o.h) + "," + Math.round(100 * o.s) + "%," + Math.round(100 * o.l) + "%)";
                case"hsla":
                    var o = this.toHSL();
                    return "hsla(" + Math.round(360 * o.h) + "," + Math.round(100 * o.s) + "%," + Math.round(100 * o.l) + "%," + o.a + ")";
                case"hex":
                    return this.toHex();
                case"alias":
                    return this.toAlias() || this.toHex();
                default:
                    return !1
            }
        },
        stringParsers:   [{
            re:     /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
            format: "hex",
            parse:  function (e) {
                return [parseInt(e[1], 16), parseInt(e[2], 16), parseInt(e[3], 16), 1]
            }
        }, {
            re: /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/, format: "hex", parse: function (e) {
                return [parseInt(e[1] + e[1], 16), parseInt(e[2] + e[2], 16), parseInt(e[3] + e[3], 16), 1]
            }
        }, {
            re: /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*?\)/, format: "rgb", parse: function (e) {
                return [e[1], e[2], e[3], 1]
            }
        }, {
            re:     /rgb\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*?\)/,
            format: "rgb",
            parse:  function (e) {
                return [2.55 * e[1], 2.55 * e[2], 2.55 * e[3], 1]
            }
        }, {
            re:     /rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
            format: "rgba",
            parse:  function (e) {
                return [e[1], e[2], e[3], e[4]]
            }
        }, {
            re:     /rgba\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
            format: "rgba",
            parse:  function (e) {
                return [2.55 * e[1], 2.55 * e[2], 2.55 * e[3], e[4]]
            }
        }, {
            re:     /hsl\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*?\)/,
            format: "hsl",
            parse:  function (e) {
                return [e[1] / 360, e[2] / 100, e[3] / 100, e[4]]
            }
        }, {
            re:     /hsla\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
            format: "hsla",
            parse:  function (e) {
                return [e[1] / 360, e[2] / 100, e[3] / 100, e[4]]
            }
        }, {
            re: /^([a-z]{3,})$/, format: "alias", parse: function (e) {
                var t = this.colorNameToHex(e[0]) || "#000000", o = this.stringParsers[0].re.exec(t), i = o && this.stringParsers[0].parse.apply(this, [o]);
                return i
            }
        }],
        colorNameToHex:  function (e) {
            return "undefined" != typeof this.colors[e.toLowerCase()] ? this.colors[e.toLowerCase()] : !1
        }
    };
    var o = {
        horizontal:  !1,
        inline:      !1,
        color:       !1,
        format:      !1,
        input:       "input",
        container:   !1,
        component:   ".add-on, .input-group-addon",
        sliders:     {
            saturation: {maxLeft: 100, maxTop: 100, callLeft: "setSaturation", callTop: "setBrightness"},
            hue:        {maxLeft: 0, maxTop: 100, callLeft: !1, callTop: "setHue"},
            alpha:      {maxLeft: 0, maxTop: 100, callLeft: !1, callTop: "setAlpha"}
        },
        slidersHorz: {
            saturation: {maxLeft: 100, maxTop: 100, callLeft: "setSaturation", callTop: "setBrightness"},
            hue:        {maxLeft: 100, maxTop: 0, callLeft: "setHue", callTop: !1},
            alpha:      {maxLeft: 100, maxTop: 0, callLeft: "setAlpha", callTop: !1}
        },
        template:    '<div class="colorpicker dropdown-menu"><div class="colorpicker-saturation"><i><b></b></i></div><div class="colorpicker-hue"><i></i></div><div class="colorpicker-alpha"><i></i></div><div class="colorpicker-color"><div /></div></div>'
    }, i = function (i, r) {
        this.element = e(i).addClass("colorpicker-element"), this.options = e.extend({}, o, this.element.data(), r), this.component = this.options.component, this.component = this.component !== !1 ? this.element.find(this.component) : !1, this.component && 0 === this.component.length && (this.component = !1), this.container = this.options.container === !0 ? this.element : this.options.container, this.container = this.container !== !1 ? e(this.container) : !1, this.input = this.element.is("input") ? this.element : this.options.input ? this.element.find(this.options.input) : !1, this.input && 0 === this.input.length && (this.input = !1), this.color = new t(this.options.color !== !1 ? this.options.color : this.getValue()), this.format = this.options.format !== !1 ? this.options.format : this.color.origFormat, this.picker = e(this.options.template), this.picker.addClass(this.options.inline ? "colorpicker-inline colorpicker-visible" : "colorpicker-hidden"), this.options.horizontal && this.picker.addClass("colorpicker-horizontal"), ("rgba" === this.format || "hsla" === this.format) && this.picker.addClass("colorpicker-with-alpha"), this.picker.on("mousedown.colorpicker", e.proxy(this.mousedown, this)), this.picker.appendTo(this.container ? this.container : e("body")), this.input !== !1 && (this.input.on({"keyup.colorpicker": e.proxy(this.keyup, this)}), this.component === !1 && this.element.on({"focus.colorpicker": e.proxy(this.show, this)}), this.options.inline === !1 && this.element.on({"focusout.colorpicker": e.proxy(this.hide, this)})), this.component !== !1 && this.component.on({"click.colorpicker": e.proxy(this.show, this)}), this.input === !1 && this.component === !1 && this.element.on({"click.colorpicker": e.proxy(this.show, this)}), this.update(), e(e.proxy(function () {
            this.element.trigger("create")
        }, this))
    };
    i.version = "2.0.0-beta", i.Color = t, i.prototype = {
        constructor:     i,
        destroy:         function () {
            this.picker.remove(), this.element.removeData("colorpicker").off(".colorpicker"), this.input !== !1 && this.input.off(".colorpicker"), this.component !== !1 && this.component.off(".colorpicker"), this.element.removeClass("colorpicker-element"), this.element.trigger({type: "destroy"})
        },
        reposition:      function () {
            if (this.options.inline !== !1)return !1;
            var e = this.container && this.container[0] !== document.body ? "position" : "offset", t = this.component ? this.component[e]() : this.element[e]();
            this.picker.css({
                top:  t.top + (this.component ? this.component.outerHeight() : this.element.outerHeight()),
                left: t.left
            })
        },
        show:            function (t) {
            return this.isDisabled() ? !1 : (this.picker.addClass("colorpicker-visible").removeClass("colorpicker-hidden"), this.reposition(), e(window).on("resize.colorpicker", e.proxy(this.reposition, this)), !this.hasInput() && t && t.stopPropagation && t.preventDefault && (t.stopPropagation(), t.preventDefault()), this.options.inline === !1 && e(window.document).on({"mousedown.colorpicker": e.proxy(this.hide, this)}), void this.element.trigger({
                type: "showPicker",
                color: this.color
            }))
        },
        hide:            function () {
            this.picker.addClass("colorpicker-hidden").removeClass("colorpicker-visible"), e(window).off("resize.colorpicker", this.reposition), e(document).off({"mousedown.colorpicker": this.hide}), this.update(), this.element.trigger({
                type: "hidePicker",
                color: this.color
            })
        },
        updateData:      function (e) {
            return e = e || this.color.toString(this.format), this.element.data("color", e), e
        },
        updateInput:     function (e) {
            return e = e || this.color.toString(this.format), this.input !== !1 && this.input.prop("value", e), e
        },
        updatePicker:    function (e) {
            void 0 !== e && (this.color = new t(e));
            var o = this.options.horizontal === !1 ? this.options.sliders : this.options.slidersHorz, i = this.picker.find("i");
            return 0 !== i.length ? (this.options.horizontal === !1 ? (o = this.options.sliders, i.eq(1).css("top", o.hue.maxTop * (1 - this.color.value.h)).end().eq(2).css("top", o.alpha.maxTop * (1 - this.color.value.a))) : (o = this.options.slidersHorz, i.eq(1).css("left", o.hue.maxLeft * (1 - this.color.value.h)).end().eq(2).css("left", o.alpha.maxLeft * (1 - this.color.value.a))), i.eq(0).css({
                top: o.saturation.maxTop - this.color.value.b * o.saturation.maxTop,
                left: this.color.value.s * o.saturation.maxLeft
            }), this.picker.find(".colorpicker-saturation").css("backgroundColor", this.color.toHex(this.color.value.h, 1, 1, 1)), this.picker.find(".colorpicker-alpha").css("backgroundColor", this.color.toHex()), this.picker.find(".colorpicker-color, .colorpicker-color div").css("backgroundColor", this.color.toString(this.format)), e) : void 0
        },
        updateComponent: function (e) {
            if (e = e || this.color.toString(this.format), this.component !== !1) {
                var t = this.component.find("i").eq(0);
                t.length > 0 ? t.css({backgroundColor: e}) : this.component.css({backgroundColor: e})
            }
            return e
        },
        update:          function (e) {
            var t = this.updateComponent();
            return (this.getValue(!1) !== !1 || e === !0) && (this.updateInput(t), this.updateData(t)), this.updatePicker(), t
        },
        setValue:        function (e) {
            this.color = new t(e), this.update(), this.element.trigger({
                type:  "changeColor",
                color: this.color,
                value: e
            })
        },
        getValue:        function (e) {
            e = void 0 === e ? "#000000" : e;
            var t;
            return t = this.hasInput() ? this.input.val() : this.element.data("color"), (void 0 === t || "" === t || null === t) && (t = e), t
        },
        hasInput:        function () {
            return this.input !== !1
        },
        isDisabled:      function () {
            return this.hasInput() ? this.input.prop("disabled") === !0 : !1
        },
        disable:         function () {
            return this.hasInput() ? (this.input.prop("disabled", !0), !0) : !1
        },
        enable:          function () {
            return this.hasInput() ? (this.input.prop("disabled", !1), !0) : !1
        },
        currentSlider:   null,
        mousePointer:    {left: 0, top: 0},
        mousedown:       function (t) {
            t.stopPropagation(), t.preventDefault();
            var o = e(t.target), i = o.closest("div"), r = this.options.horizontal ? this.options.slidersHorz : this.options.sliders;
            if (!i.is(".colorpicker")) {
                if (i.is(".colorpicker-saturation"))this.currentSlider = e.extend({}, r.saturation); else if (i.is(".colorpicker-hue"))this.currentSlider = e.extend({}, r.hue); else {
                    if (!i.is(".colorpicker-alpha"))return !1;
                    this.currentSlider = e.extend({}, r.alpha)
                }
                var s = i.offset();
                this.currentSlider.guide = i.find("i")[0].style, this.currentSlider.left = t.pageX - s.left, this.currentSlider.top = t.pageY - s.top, this.mousePointer = {
                    left: t.pageX,
                    top: t.pageY
                }, e(document).on({
                    "mousemove.colorpicker": e.proxy(this.mousemove, this),
                    "mouseup.colorpicker":   e.proxy(this.mouseup, this)
                }).trigger("mousemove")
            }
            return !1
        },
        mousemove:       function (e) {
            e.stopPropagation(), e.preventDefault();
            var t = Math.max(0, Math.min(this.currentSlider.maxLeft, this.currentSlider.left + ((e.pageX || this.mousePointer.left) - this.mousePointer.left))), o = Math.max(0, Math.min(this.currentSlider.maxTop, this.currentSlider.top + ((e.pageY || this.mousePointer.top) - this.mousePointer.top)));
            return this.currentSlider.guide.left = t + "px", this.currentSlider.guide.top = o + "px", this.currentSlider.callLeft && this.color[this.currentSlider.callLeft].call(this.color, t / 100), this.currentSlider.callTop && this.color[this.currentSlider.callTop].call(this.color, o / 100), this.update(!0), this.element.trigger({
                type: "changeColor",
                color: this.color
            }), !1
        },
        mouseup:         function (t) {
            return t.stopPropagation(), t.preventDefault(), e(document).off({
                "mousemove.colorpicker": this.mousemove,
                "mouseup.colorpicker":   this.mouseup
            }), !1
        },
        keyup:           function (e) {
            if (38 === e.keyCode)this.color.value.a < 1 && (this.color.value.a = Math.round(100 * (this.color.value.a + .01)) / 100), this.update(!0); else if (40 === e.keyCode)this.color.value.a > 0 && (this.color.value.a = Math.round(100 * (this.color.value.a - .01)) / 100), this.update(!0); else {
                var o = this.input.val();
                this.color = new t(o), this.getValue(!1) !== !1 && (this.updateData(), this.updateComponent(), this.updatePicker())
            }
            this.element.trigger({type: "changeColor", color: this.color, value: o})
        }
    }, e.colorpicker = i, e.fn.colorpicker = function (t) {
        var o = arguments;
        return this.each(function () {
            var r = e(this), s = r.data("colorpicker"), a = "object" == typeof t ? t : {};
            s || "string" == typeof t ? "string" == typeof t && s[t].apply(s, Array.prototype.slice.call(o, 1)) : r.data("colorpicker", new i(this, a))
        })
    }, e.fn.colorpicker.constructor = i
});
/*! bootstrap-switch - v3.2.1 http://www.bootstrap-switch.org Copyright 2012-2013 Mattia Larentis */
(function () {
    var __slice = [].slice;

    (function ($, window) {
        "use strict";
        var BootstrapSwitch;
        BootstrapSwitch = (function () {
            function BootstrapSwitch(element, options) {
                if (options == null) {
                    options = {};
                }
                this.$element = $(element);
                this.options = $.extend({}, $.fn.bootstrapSwitch.defaults, {
                    state:         this.$element.is(":checked"),
                    size:          this.$element.data("size"),
                    animate:       this.$element.data("animate"),
                    disabled:      this.$element.is(":disabled"),
                    readonly:      this.$element.is("[readonly]"),
                    indeterminate: this.$element.data("indeterminate"),
                    inverse:       this.$element.data("inverse"),
                    radioAllOff:   this.$element.data("radio-all-off"),
                    onColor:       this.$element.data("on-color"),
                    offColor:      this.$element.data("off-color"),
                    onText:        this.$element.data("on-text"),
                    offText:       this.$element.data("off-text"),
                    labelText:     this.$element.data("label-text"),
                    handleWidth:   this.$element.data("handle-width"),
                    labelWidth:    this.$element.data("label-width"),
                    baseClass:     this.$element.data("base-class"),
                    wrapperClass:  this.$element.data("wrapper-class")
                }, options);
                this.$wrapper = $("<div>", {
                    "class": (function (_this) {
                        return function () {
                            var classes;
                            classes = ["" + _this.options.baseClass].concat(_this._getClasses(_this.options.wrapperClass));
                            classes.push(_this.options.state ? "" + _this.options.baseClass + "-on" : "" + _this.options.baseClass + "-off");
                            if (_this.options.size != null) {
                                classes.push("" + _this.options.baseClass + "-" + _this.options.size);
                            }
                            if (_this.options.disabled) {
                                classes.push("" + _this.options.baseClass + "-disabled");
                            }
                            if (_this.options.readonly) {
                                classes.push("" + _this.options.baseClass + "-readonly");
                            }
                            if (_this.options.indeterminate) {
                                classes.push("" + _this.options.baseClass + "-indeterminate");
                            }
                            if (_this.options.inverse) {
                                classes.push("" + _this.options.baseClass + "-inverse");
                            }
                            if (_this.$element.attr("id")) {
                                classes.push("" + _this.options.baseClass + "-id-" + (_this.$element.attr("id")));
                            }
                            return classes.join(" ");
                        };
                    })(this)()
                });
                this.$container = $("<div>", {
                    "class": "" + this.options.baseClass + "-container"
                });
                this.$on = $("<span>", {
                    html:    this.options.onText,
                    "class": "" + this.options.baseClass + "-handle-on " + this.options.baseClass + "-" + this.options.onColor
                });
                this.$off = $("<span>", {
                    html:    this.options.offText,
                    "class": "" + this.options.baseClass + "-handle-off " + this.options.baseClass + "-" + this.options.offColor
                });
                this.$label = $("<span>", {
                    html:    this.options.labelText,
                    "class": "" + this.options.baseClass + "-label"
                });
                this.$element.on("init.bootstrapSwitch", (function (_this) {
                    return function () {
                        return _this.options.onInit.apply(element, arguments);
                    };
                })(this));
                this.$element.on("switchChange.bootstrapSwitch", (function (_this) {
                    return function () {
                        return _this.options.onSwitchChange.apply(element, arguments);
                    };
                })(this));
                this.$container = this.$element.wrap(this.$container).parent();
                this.$wrapper = this.$container.wrap(this.$wrapper).parent();
                this.$element.before(this.options.inverse ? this.$off : this.$on).before(this.$label).before(this.options.inverse ? this.$on : this.$off);
                if (this.options.indeterminate) {
                    this.$element.prop("indeterminate", true);
                }
                this._width();
                this._containerPosition(this.options.state, (function (_this) {
                    return function () {
                        if (_this.options.animate) {
                            return _this.$wrapper.addClass("" + _this.options.baseClass + "-animate");
                        }
                    };
                })(this));
                this._elementHandlers();
                this._handleHandlers();
                this._labelHandlers();
                this._formHandler();
                this._externalLabelHandler();
                this.$element.trigger("init.bootstrapSwitch");
            }

            BootstrapSwitch.prototype._constructor = BootstrapSwitch;

            BootstrapSwitch.prototype.state = function (value, skip) {
                if (typeof value === "undefined") {
                    return this.options.state;
                }
                if (this.options.disabled || this.options.readonly) {
                    return this.$element;
                }
                if (this.options.state && !this.options.radioAllOff && this.$element.is(':radio')) {
                    return this.$element;
                }
                if (this.options.indeterminate) {
                    this.indeterminate(false);
                    value = true;
                } else {
                    value = !!value;
                }
                this.$element.prop("checked", value).trigger("change.bootstrapSwitch", skip);
                return this.$element;
            };

            BootstrapSwitch.prototype.toggleState = function (skip) {
                if (this.options.disabled || this.options.readonly) {
                    return this.$element;
                }
                if (this.options.indeterminate) {
                    this.indeterminate(false);
                    return this.state(true);
                } else {
                    return this.$element.prop("checked", !this.options.state).trigger("change.bootstrapSwitch", skip);
                }
            };

            BootstrapSwitch.prototype.size = function (value) {
                if (typeof value === "undefined") {
                    return this.options.size;
                }
                if (this.options.size != null) {
                    this.$wrapper.removeClass("" + this.options.baseClass + "-" + this.options.size);
                }
                if (value) {
                    this.$wrapper.addClass("" + this.options.baseClass + "-" + value);
                }
                this._width();
                this.options.size = value;
                return this.$element;
            };

            BootstrapSwitch.prototype.animate = function (value) {
                if (typeof value === "undefined") {
                    return this.options.animate;
                }
                value = !!value;
                this.options.animate = value;
                this.$wrapper[value ? "addClass" : "removeClass"]("" + this.options.baseClass + "-animate");
                return this.$element;
            };

            BootstrapSwitch.prototype.toggleAnimate = function () {
                this.options.animate = !this.options.animate;
                this.$wrapper.toggleClass("" + this.options.baseClass + "-animate");
                return this.$element;
            };

            BootstrapSwitch.prototype.disabled = function (value) {
                if (typeof value === "undefined") {
                    return this.options.disabled;
                }
                value = !!value;
                this.options.disabled = value;
                this.$element.prop("disabled", value);
                this.$wrapper[value ? "addClass" : "removeClass"]("" + this.options.baseClass + "-disabled");
                return this.$element;
            };

            BootstrapSwitch.prototype.toggleDisabled = function () {
                this.options.disabled = !this.options.disabled;
                this.$element.prop("disabled", this.options.disabled);
                this.$wrapper.toggleClass("" + this.options.baseClass + "-disabled");
                return this.$element;
            };

            BootstrapSwitch.prototype.readonly = function (value) {
                if (typeof value === "undefined") {
                    return this.options.readonly;
                }
                value = !!value;
                this.options.readonly = value;
                this.$element.prop("readonly", value);
                this.$wrapper[value ? "addClass" : "removeClass"]("" + this.options.baseClass + "-readonly");
                return this.$element;
            };

            BootstrapSwitch.prototype.toggleReadonly = function () {
                this.options.readonly = !this.options.readonly;
                this.$element.prop("readonly", this.options.readonly);
                this.$wrapper.toggleClass("" + this.options.baseClass + "-readonly");
                return this.$element;
            };

            BootstrapSwitch.prototype.indeterminate = function (value) {
                if (typeof value === "undefined") {
                    return this.options.indeterminate;
                }
                value = !!value;
                this.options.indeterminate = value;
                this.$element.prop("indeterminate", value);
                this.$wrapper[value ? "addClass" : "removeClass"]("" + this.options.baseClass + "-indeterminate");
                this._containerPosition();
                return this.$element;
            };

            BootstrapSwitch.prototype.toggleIndeterminate = function () {
                this.options.indeterminate = !this.options.indeterminate;
                this.$element.prop("indeterminate", !this.options.indeterminate);
                this.$wrapper.toggleClass("" + this.options.baseClass + "-indeterminate");
                this._containerPosition();
                return this.$element;
            };

            BootstrapSwitch.prototype.inverse = function (value) {
                var $off, $on;
                if (typeof value === "undefined") {
                    return this.options.inverse;
                }
                value = !!value;
                this.$wrapper[value ? "addClass" : "removeClass"]("" + this.options.baseClass + "-inverse");
                $on = this.$on.clone(true);
                $off = this.$off.clone(true);
                this.$on.replaceWith($off);
                this.$off.replaceWith($on);
                this.$on = $off;
                this.$off = $on;
                this.options.inverse = value;
                return this.$element;
            };

            BootstrapSwitch.prototype.toggleInverse = function () {
                var $off, $on;
                this.$wrapper.toggleClass("" + this.options.baseClass + "-inverse");
                $on = this.$on.clone(true);
                $off = this.$off.clone(true);
                this.$on.replaceWith($off);
                this.$off.replaceWith($on);
                this.$on = $off;
                this.$off = $on;
                this.options.inverse = !this.options.inverse;
                return this.$element;
            };

            BootstrapSwitch.prototype.onColor = function (value) {
                var color;
                color = this.options.onColor;
                if (typeof value === "undefined") {
                    return color;
                }
                if (color != null) {
                    this.$on.removeClass("" + this.options.baseClass + "-" + color);
                }
                this.$on.addClass("" + this.options.baseClass + "-" + value);
                this.options.onColor = value;
                return this.$element;
            };

            BootstrapSwitch.prototype.offColor = function (value) {
                var color;
                color = this.options.offColor;
                if (typeof value === "undefined") {
                    return color;
                }
                if (color != null) {
                    this.$off.removeClass("" + this.options.baseClass + "-" + color);
                }
                this.$off.addClass("" + this.options.baseClass + "-" + value);
                this.options.offColor = value;
                return this.$element;
            };

            BootstrapSwitch.prototype.onText = function (value) {
                if (typeof value === "undefined") {
                    return this.options.onText;
                }
                this.$on.html(value);
                this._width();
                this._containerPosition();
                this.options.onText = value;
                return this.$element;
            };

            BootstrapSwitch.prototype.offText = function (value) {
                if (typeof value === "undefined") {
                    return this.options.offText;
                }
                this.$off.html(value);
                this._width();
                this._containerPosition();
                this.options.offText = value;
                return this.$element;
            };

            BootstrapSwitch.prototype.labelText = function (value) {
                if (typeof value === "undefined") {
                    return this.options.labelText;
                }
                this.$label.html(value);
                this._width();
                this.options.labelText = value;
                return this.$element;
            };

            BootstrapSwitch.prototype.handleWidth = function (value) {
                if (typeof value === "undefined") {
                    return this.options.handleWidth;
                }
                this.options.handleWidth = value;
                this._width();
                this._containerPosition();
                return this.$element;
            };

            BootstrapSwitch.prototype.labelWidth = function (value) {
                if (typeof value === "undefined") {
                    return this.options.labelWidth;
                }
                this.options.labelWidth = value;
                this._width();
                this._containerPosition();
                return this.$element;
            };

            BootstrapSwitch.prototype.baseClass = function (value) {
                return this.options.baseClass;
            };

            BootstrapSwitch.prototype.wrapperClass = function (value) {
                if (typeof value === "undefined") {
                    return this.options.wrapperClass;
                }
                if (!value) {
                    value = $.fn.bootstrapSwitch.defaults.wrapperClass;
                }
                this.$wrapper.removeClass(this._getClasses(this.options.wrapperClass).join(" "));
                this.$wrapper.addClass(this._getClasses(value).join(" "));
                this.options.wrapperClass = value;
                return this.$element;
            };

            BootstrapSwitch.prototype.radioAllOff = function (value) {
                if (typeof value === "undefined") {
                    return this.options.radioAllOff;
                }
                this.options.radioAllOff = value;
                return this.$element;
            };

            BootstrapSwitch.prototype.onInit = function (value) {
                if (typeof value === "undefined") {
                    return this.options.onInit;
                }
                if (!value) {
                    value = $.fn.bootstrapSwitch.defaults.onInit;
                }
                this.options.onInit = value;
                return this.$element;
            };

            BootstrapSwitch.prototype.onSwitchChange = function (value) {
                if (typeof value === "undefined") {
                    return this.options.onSwitchChange;
                }
                if (!value) {
                    value = $.fn.bootstrapSwitch.defaults.onSwitchChange;
                }
                this.options.onSwitchChange = value;
                return this.$element;
            };

            BootstrapSwitch.prototype.destroy = function () {
                var $form;
                $form = this.$element.closest("form");
                if ($form.length) {
                    $form.off("reset.bootstrapSwitch").removeData("bootstrap-switch");
                }
                this.$container.children().not(this.$element).remove();
                this.$element.unwrap().unwrap().off(".bootstrapSwitch").removeData("bootstrap-switch");
                return this.$element;
            };

            BootstrapSwitch.prototype._width = function () {
                var $handles, handleWidth;
                $handles = this.$on.add(this.$off);
                $handles.add(this.$label).css("width", "");
                handleWidth = this.options.handleWidth === "auto" ? Math.max(this.$on.width(), this.$off.width()) : this.options.handleWidth;
                $handles.width(handleWidth);
                this.$label.width((function (_this) {
                    return function (index, width) {
                        if (_this.options.labelWidth !== "auto") {
                            return _this.options.labelWidth;
                        }
                        if (width < handleWidth) {
                            return handleWidth;
                        } else {
                            return width;
                        }
                    };
                })(this));
                this._handleWidth = this.$on.outerWidth();
                this._labelWidth = this.$label.outerWidth();
                this.$container.width((this._handleWidth * 2) + this._labelWidth);
                return this.$wrapper.width(this._handleWidth + this._labelWidth);
            };

            BootstrapSwitch.prototype._containerPosition = function (state, callback) {
                if (state == null) {
                    state = this.options.state;
                }
                this.$container.css("margin-left", (function (_this) {
                    return function () {
                        var values;
                        values = [0, "-" + _this._handleWidth + "px"];
                        if (_this.options.indeterminate) {
                            return "-" + (_this._handleWidth / 2) + "px";
                        }
                        if (state) {
                            if (_this.options.inverse) {
                                return values[1];
                            } else {
                                return values[0];
                            }
                        } else {
                            if (_this.options.inverse) {
                                return values[0];
                            } else {
                                return values[1];
                            }
                        }
                    };
                })(this));
                if (!callback) {
                    return;
                }
                if ($.support.transition) {
                    return this.$container.one("bsTransitionEnd", callback).emulateTransitionEnd(500);
                } else {
                    return callback();
                }
            };

            BootstrapSwitch.prototype._elementHandlers = function () {
                return this.$element.on({
                    "change.bootstrapSwitch":  (function (_this) {
                        return function (e, skip) {
                            var state;
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            state = _this.$element.is(":checked");
                            _this._containerPosition(state);
                            if (state === _this.options.state) {
                                return;
                            }
                            _this.options.state = state;
                            _this.$wrapper.toggleClass("" + _this.options.baseClass + "-off").toggleClass("" + _this.options.baseClass + "-on");
                            if (!skip) {
                                if (_this.$element.is(":radio")) {
                                    $("[name='" + (_this.$element.attr('name')) + "']").not(_this.$element).prop("checked", false).trigger("change.bootstrapSwitch", true);
                                }
                                return _this.$element.trigger("switchChange.bootstrapSwitch", [state]);
                            }
                        };
                    })(this),
                    "focus.bootstrapSwitch":   (function (_this) {
                        return function (e) {
                            e.preventDefault();
                            return _this.$wrapper.addClass("" + _this.options.baseClass + "-focused");
                        };
                    })(this),
                    "blur.bootstrapSwitch":    (function (_this) {
                        return function (e) {
                            e.preventDefault();
                            return _this.$wrapper.removeClass("" + _this.options.baseClass + "-focused");
                        };
                    })(this),
                    "keydown.bootstrapSwitch": (function (_this) {
                        return function (e) {
                            if (!e.which || _this.options.disabled || _this.options.readonly) {
                                return;
                            }
                            switch (e.which) {
                                case 37:
                                    e.preventDefault();
                                    e.stopImmediatePropagation();
                                    return _this.state(false);
                                case 39:
                                    e.preventDefault();
                                    e.stopImmediatePropagation();
                                    return _this.state(true);
                            }
                        };
                    })(this)
                });
            };

            BootstrapSwitch.prototype._handleHandlers = function () {
                this.$on.on("click.bootstrapSwitch", (function (_this) {
                    return function (e) {
                        _this.state(false);
                        return _this.$element.trigger("focus.bootstrapSwitch");
                    };
                })(this));
                return this.$off.on("click.bootstrapSwitch", (function (_this) {
                    return function (e) {
                        _this.state(true);
                        return _this.$element.trigger("focus.bootstrapSwitch");
                    };
                })(this));
            };

            BootstrapSwitch.prototype._labelHandlers = function () {
                return this.$label.on({
                    "mousedown.bootstrapSwitch touchstart.bootstrapSwitch": (function (_this) {
                        return function (e) {
                            if (_this._dragStart || _this.options.disabled || _this.options.readonly) {
                                return;
                            }
                            e.preventDefault();
                            _this._dragStart = (e.pageX || e.originalEvent.touches[0].pageX) - parseInt(_this.$container.css("margin-left"), 10);
                            if (_this.options.animate) {
                                _this.$wrapper.removeClass("" + _this.options.baseClass + "-animate");
                            }
                            return _this.$element.trigger("focus.bootstrapSwitch");
                        };
                    })(this),
                    "mousemove.bootstrapSwitch touchmove.bootstrapSwitch":  (function (_this) {
                        return function (e) {
                            var difference;
                            if (_this._dragStart == null) {
                                return;
                            }
                            e.preventDefault();
                            difference = (e.pageX || e.originalEvent.touches[0].pageX) - _this._dragStart;
                            if (difference < -_this._handleWidth || difference > 0) {
                                return;
                            }
                            _this._dragEnd = difference;
                            return _this.$container.css("margin-left", "" + _this._dragEnd + "px");
                        };
                    })(this),
                    "mouseup.bootstrapSwitch touchend.bootstrapSwitch":     (function (_this) {
                        return function (e) {
                            var state;
                            if (!_this._dragStart) {
                                return;
                            }
                            e.preventDefault();
                            if (_this.options.animate) {
                                _this.$wrapper.addClass("" + _this.options.baseClass + "-animate");
                            }
                            if (_this._dragEnd) {
                                state = _this._dragEnd > -(_this._handleWidth / 2);
                                _this._dragEnd = false;
                                _this.state(_this.options.inverse ? !state : state);
                            } else {
                                _this.state(!_this.options.state);
                            }
                            return _this._dragStart = false;
                        };
                    })(this),
                    "mouseleave.bootstrapSwitch":                           (function (_this) {
                        return function (e) {
                            return _this.$label.trigger("mouseup.bootstrapSwitch");
                        };
                    })(this)
                });
            };

            BootstrapSwitch.prototype._externalLabelHandler = function () {
                var $externalLabel;
                $externalLabel = this.$element.closest("label");
                return $externalLabel.on("click", (function (_this) {
                    return function (event) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        if (event.target === $externalLabel[0]) {
                            return _this.toggleState();
                        }
                    };
                })(this));
            };

            BootstrapSwitch.prototype._formHandler = function () {
                var $form;
                $form = this.$element.closest("form");
                if ($form.data("bootstrap-switch")) {
                    return;
                }
                return $form.on("reset.bootstrapSwitch", function () {
                    return window.setTimeout(function () {
                        return $form.find("input").filter(function () {
                            return $(this).data("bootstrap-switch");
                        }).each(function () {
                            return $(this).bootstrapSwitch("state", this.checked);
                        });
                    }, 1);
                }).data("bootstrap-switch", true);
            };

            BootstrapSwitch.prototype._getClasses = function (classes) {
                var c, cls, _i, _len;
                if (!$.isArray(classes)) {
                    return ["" + this.options.baseClass + "-" + classes];
                }
                cls = [];
                for (_i = 0, _len = classes.length; _i < _len; _i++) {
                    c = classes[_i];
                    cls.push("" + this.options.baseClass + "-" + c);
                }
                return cls;
            };

            return BootstrapSwitch;

        })();
        $.fn.bootstrapSwitch = function () {
            var args, option, ret;
            option = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
            ret = this;
            this.each(function () {
                var $this, data;
                $this = $(this);
                data = $this.data("bootstrap-switch");
                if (!data) {
                    $this.data("bootstrap-switch", data = new BootstrapSwitch(this, option));
                }
                if (typeof option === "string") {
                    return ret = data[option].apply(data, args);
                }
            });
            return ret;
        };
        $.fn.bootstrapSwitch.Constructor = BootstrapSwitch;
        return $.fn.bootstrapSwitch.defaults = {
            state:          true,
            size:           null,
            animate:        true,
            disabled:       false,
            readonly:       false,
            indeterminate:  false,
            inverse:        false,
            radioAllOff:    false,
            onColor:        "primary",
            offColor:       "default",
            onText:         "ON",
            offText:        "OFF",
            labelText:      "&nbsp;",
            handleWidth:    "auto",
            labelWidth:     "auto",
            baseClass:      "bootstrap-switch",
            wrapperClass:   "wrapper",
            onInit:         function () {
            },
            onSwitchChange: function () {
            }
        };
    })(window.jQuery, window);

}).call(this);

var dfxGetJsonFromUrl = function(hashBased) {
    var query;
    if(hashBased) {
        var pos = location.href.indexOf("?");
        if(pos==-1) return [];
        query = location.href.substr(pos+1);
    } else {
        query = location.search.substr(1);
    }
    var result = {};
    query.split("&").forEach(function(part) {
        if(!part) return;
        var item = part.split("=");
        var key = item[0];
        var from = key.indexOf("[");
        if(from==-1) result[key] = decodeURIComponent(item[1]);
        else {
            var to = key.indexOf("]");
            var index = key.substring(from+1,to);
            key = key.substring(0,from);
            if(!result[key]) result[key] = [];
            if(!index) result[key].push(item[1]);
            else result[key][index] = item[1];
        }
    });
    return result;
};