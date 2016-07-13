/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

function setup_widgets_web() {

    if ($.fn.jarvisWidgets && $.enableJarvisWidgets) {

        $('#widget-grid').jarvisWidgets({

            grid : 'article',
            widgets : '.jarviswidget',
            localStorage : true,
            deleteSettingsKey : '#deletesettingskey-options',
            settingsKeyLabel : 'Reset settings?',
            deletePositionKey : '#deletepositionkey-options',
            positionKeyLabel : 'Reset position?',
            sortable : true,
            buttonsHidden : false,
            // toggle button
            toggleButton : true,
            toggleClass : 'fa fa-minus | fa fa-plus',
            toggleSpeed : 200,
            onToggle : function() {
            },
            // delete btn
            deleteButton : true,
            deleteClass : 'fa fa-times',
            deleteSpeed : 200,
            onDelete : function() {
            },
            // edit btn
            editButton : true,
            editPlaceholder : '.jarviswidget-editbox',
            editClass : 'fa fa-cog | fa fa-save',
            editSpeed : 200,
            onEdit : function() {
            },
            // color button
            colorButton : true,
            // full screen
            fullscreenButton : true,
            fullscreenClass : 'fa fa-expand | fa fa-compress',
            fullscreenDiff : 3,
            onFullscreen : function() {
            },
            // custom btn
            customButton : false,
            customClass : 'folder-10 | next-10',
            customStart : function() {
                alert('Hello you, this is a custom button...');
            },
            customEnd : function() {
                alert('bye, till next time...');
            },
            // order
            buttonOrder : '%refresh% %custom% %edit% %toggle% %fullscreen% %delete%',
            opacity : 1.0,
            dragHandle : '> header',
            placeholderClass : 'jarviswidget-placeholder',
            indicator : true,
            indicatorTime : 600,
            ajax : true,
            timestampPlaceholder : '.jarviswidget-timestamp',
            timestampFormat : 'Last update: %m%/%d%/%y% %h%:%i%:%s%',
            refreshButton : true,
            refreshButtonClass : 'fa fa-refresh',
            labelError : 'Sorry but there was a error:',
            labelUpdated : 'Last Update:',
            labelRefresh : 'Refresh',
            labelDelete : 'Delete widget:',
            afterLoad : function() {
            },
            rtl : false, // best not to toggle this!
            onChange : function() {

            },
            onSave : function() {

            },
            ajaxnav : $.navAsAjax // declears how the localstorage should be saved (HTML or AJAX page)

        });

    }

}

/*
 DataTable utility functions
 */

var dfGCGridCallScopeFct = function( name, element ) {
    var dt = $(element).parents('table').eq(0).dataTable( {"bRetrieve": true} );
    var scope = dt.fnGetScope();
    var dyn_source = 'return scope.' + name + '({"rowdata": rowdata, "rowid": rowid, "dt": dt});';
    var dyn_function = new Function( 'scope', 'rowdata', 'rowid', 'dt', dyn_source );
    var row_id = dt.fnGetPosition($(element).closest('tr')[0]);
    var row_data = dt.fnGetData(row_id);
    dyn_function( scope, row_data, row_id, dt );
};

$.fn.dataTableExt.oApi.fnGetScope = function (oSettings) {
    return oSettings.oScope;
};