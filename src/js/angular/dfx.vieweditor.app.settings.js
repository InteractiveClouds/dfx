var DfxViewEditorSettings = (function() {
    var api = {};

    var view_settings_path = null;

    var getViewSettings = function() {
        var view_settings = window.localStorage.getItem(view_settings_path);
        return view_settings ? JSON.parse(view_settings) : { 'width': '', 'height': '' };
    };
    var setViewSettings = function(view_settings) {
        window.localStorage.setItem(view_settings_path, JSON.stringify(view_settings));
    };

    var getDocHeight = function() {
        return parseInt(Math.max(
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        ));
    }

    var setFloatingPanelHeight = function(panel_id) {
        var panel = $('#' + panel_id);

        if (panel.hasClass('dfx-ve-floating-panel') && panel.hasClass('dfx-ve-floating-collapsed-panel')) {
            // if detached and minimized
            panel.css('height', 'auto');
        } else if (panel.hasClass('dfx-ve-floating-panel')  && !panel.hasClass('dfx-ve-floating-collapsed-panel')) {
            // if detached change panel height
            var floating_panel_height = getDocHeight() - 105;
            panel.css('height', floating_panel_height);
        } else if (!panel.hasClass('dfx-ve-floating-panel')) {
            // if not detached
            panel.css('height', 'auto');
        }
    };

    var makePanelsDraggable = function(panel_id) {
        var handleDragStop = function(event, ui) {
            var offsetXPos = parseInt( ui.offset.left );
            var offsetYPos = parseInt( ui.offset.top );
            console.log( "Drag stopped! Offset: (" + offsetXPos + ", " + offsetYPos + ")");
        };

        $('#' + panel_id).draggable({
            cursor: "move",
            stop: handleDragStop
        });
    };

    api.setWorkspaceSize = function($scope, workspace) {
        view_settings_path = view_settings_path ? view_settings_path : 'DFX_' + $scope.tenant_id + '_' + $scope.view_name + '_view_settings';

        var view_settings = getViewSettings();
        var width = workspace ? workspace.width : view_settings.width;
        var height = workspace ? workspace.height : view_settings.height;
        view_settings.width = width;
        view_settings.height = height;
        setViewSettings(view_settings);

        var workspace_container = angular.element(document.querySelectorAll('[md-selected="view_card_select_index"]'));

        if (!width || width == "0") {
            workspace_container.css('overflow', 'initial');
            workspace_container.css('width', '');
        } else {
            var workspace_width = width.indexOf('px') > 0 ? width : width + 'px';
            workspace_container.css('overflow', 'auto');
            workspace_container.css('width', workspace_width);
        }
        if (!height || height == "0") {
            workspace_container.css('height', '');
        } else {
            var workspace_height = height.indexOf('px') > 0 ? height : height + 'px';
            workspace_container.css('height', workspace_height);
        }
    };

    api.loadViewSettingsMenu = function($scope, $compile, $event) {
        $event.stopImmediatePropagation();

        if ( $('#dfx-ve-settings-menu').length ) {
            api.openViewSettingsMenu();
        } else {
            var snippet = '<div id="dfx-ve-settings-menu" class="_md md-open-menu-container md-whiteframe-z2 md-altTheme-theme md-active md-clickable" style="left:'+($event.x-20)+'px;top:'+($event.y+15)+'px;" ng-mouseleave="closeViewSettingsMenu()" aria-hidden="false">';
            snippet += '<md-menu-content width="4" class="md-altTheme-theme">';
            snippet += '<md-menu-item><md-button ng-click="changeCanvasSize()"><md-icon class="fa fa-square-o"></md-icon>Change Canvas Size</md-button></md-menu-item>';
            snippet += '<md-menu-item><md-button ng-click="toggleRuler()"><md-icon id="dfx-ve-settings-menu-show-ruler-icon" class="fa fa-bars"></md-icon><span id="dfx-ve-settings-menu-show-ruler-label">Show Ruler</span></md-button></md-menu-item>';
            snippet += '<md-menu-item><md-button ng-click="togglePanels()"><md-icon id="dfx-ve-settings-menu-hide-panels-icon" class="fa fa-compress"></md-icon><span id="dfx-ve-settings-menu-hide-panels-label">Hide Panels</span></md-button></md-menu-item>';
            snippet += '<md-menu-item><md-button ng-click="detachPanels()"><md-icon id="dfx-ve-settings-menu-detach-panels-icon" class="fa fa-external-link"></md-icon><span id="dfx-ve-settings-menu-detach-panels-label">Detach Panels</span></md-button></md-menu-item>';
            snippet += '</md-menu-content>';
            snippet += '</div>';
            angular.element(document.getElementById('dfx-view-editor-body')).append($compile(snippet)($scope));
        }
    };
    api.openViewSettingsMenu = function() {
        $('#dfx-ve-settings-menu').show();
    };
    api.closeViewSettingsMenu = function() {
        $('#dfx-ve-settings-menu').hide();
    };

    api.changeCanvasSize = function($scope, $mdDialog, $event) {
        api.closeViewSettingsMenu();
        $mdDialog.show({
            controller: DialogController,
            templateUrl: '/gcontrols/web/workspace_change.html',
            parent: angular.element(document.body),
            targetEvent: $event
        })
        .then(function(workspace) {
            api.setWorkspaceSize($scope, workspace);
        }, function() {
            // do nothing
        });

        function DialogController(scope, $mdDialog) {
            var width = getViewSettings().width;
            var height = getViewSettings().height;
            scope.workspace = width || height ? {'width': width, 'height': height} : {'width': '', 'height': ''};

            scope.changeWorkspaceConfirm = function(answer) {
                $mdDialog.hide(scope.workspace);
            };

            scope.changeWorkspaceCancel = function() {
                $mdDialog.cancel();
            };
        }
    };

    api.fitRulerPosition = function() {
        var dfx_ruler = $('.dfx-ve-ruler');

        if ( dfx_ruler.hasClass('dfx-ve-hidden-element') ) {
            $('.dfx-ve-main-content-tab-content').css('padding', '10px ');
            $('#dfx-ve-main-content').css('padding', '10px');
        } else {
            $('.dfx-ve-main-content-tab-content').css('padding', '20px 10px 10px 0');
            $('#dfx-ve-main-content').css('padding', '10px 10px 10px 20px');
        }
    };

    api.toggleRuler = function() {
        api.closeViewSettingsMenu();

        var dfx_ruler = $('.dfx-ve-ruler');
        //var menu_icon = $('#dfx-ve-settings-menu-show-ruler-icon');
        var menu_label = $('#dfx-ve-settings-menu-show-ruler-label');

        dfx_ruler.toggleClass('dfx-ve-hidden-element');
        api.fitRulerPosition();

        // change icons and title in editor settings menu
        if ( dfx_ruler.hasClass('dfx-ve-hidden-element') ) {
            //menu_icon.removeClass('fa-bars');
            //menu_icon.addClass('fa-bars');
            menu_label.text('Show Ruler');
        } else {
            //menu_icon.removeClass('fa-bars');
            //menu_icon.addClass('fa-bars');
            menu_label.text('Hide Ruler');
        }
    };

    api.togglePanels = function() {
        api.closeViewSettingsMenu();

        var panel_left = $('#dfx-ve-sidenav-left');
        var panel_right = $('#dfx-ve-sidenav-right');
        var menu_icon = $('#dfx-ve-settings-menu-hide-panels-icon');
        var menu_label = $('#dfx-ve-settings-menu-hide-panels-label');

        if (menu_icon.hasClass('fa-compress')) {
            // show or hide all panels
            panel_left.addClass('dfx-ve-hidden-element');
            panel_right.addClass('dfx-ve-hidden-element');

            // change icons and title in editor settings menu
            menu_icon.removeClass('fa-compress');
            menu_icon.addClass('fa-expand');
            menu_label.text('Show Panels');
        } else {
            // show or hide all panels
            panel_left.removeClass('dfx-ve-hidden-element');
            panel_right.removeClass('dfx-ve-hidden-element');

            // change icons and title in editor settings menu
            menu_icon.removeClass('fa-expand');
            menu_icon.addClass('fa-compress');
            menu_label.text('Hide Panels');
        }
    };

    api.detachPanels = function() {
        api.closeViewSettingsMenu();

        var panel_left = $('#dfx-ve-sidenav-left');
        var panel_right = $('#dfx-ve-sidenav-right');

        panel_left.toggleClass('dfx-ve-floating-panel');
        panel_right.toggleClass('dfx-ve-floating-panel');
        panel_left.toggleClass('dfx-ve-floating-palette-panel');
        panel_right.toggleClass('dfx-ve-floating-properties-panel');

        $('#dfx-ve-property-title').toggleClass('dfx-ve-hidden-element');
        $('#dfx-ve-sidenav-left-header').toggleClass('dfx-ve-hidden-element');
        $('#dfx-ve-sidenav-right-header').toggleClass('dfx-ve-hidden-element');

        // acting if panel is minimized
        if (panel_left.hasClass('dfx-ve-floating-collapsed-panel')) {
            panel_left.removeClass('dfx-ve-floating-collapsed-panel');
            $('#dfx-ve-sidenav-left-content').removeClass('dfx-ve-hidden-element');
        }
        if (panel_right.hasClass('dfx-ve-floating-collapsed-panel')) {
            panel_right.removeClass('dfx-ve-floating-collapsed-panel');
            $('#dfx-ve-sidenav-right-content').removeClass('dfx-ve-hidden-element');
        }

        // if detached
        if (panel_left.hasClass('dfx-ve-floating-panel')) {
            // makes detached panels draggable
            makePanelsDraggable('dfx-ve-sidenav-left');
            makePanelsDraggable('dfx-ve-sidenav-right');

            // change icons and title in editor settings menu
            $('#dfx-ve-settings-menu-detach-panels-icon').removeClass('fa-external-link');
            $('#dfx-ve-settings-menu-detach-panels-icon').addClass('fa-thumb-tack');
            $('#dfx-ve-settings-menu-detach-panels-label').text('Pin Panels');
        } else {
            // change icons and title in editor settings menu
            $('#dfx-ve-settings-menu-detach-panels-icon').removeClass('fa-thumb-tack');
            $('#dfx-ve-settings-menu-detach-panels-icon').addClass('fa-external-link');
            $('#dfx-ve-settings-menu-detach-panels-label').text('Detach Panels');
        }

        setFloatingPanelHeight('dfx-ve-sidenav-left');
        setFloatingPanelHeight('dfx-ve-sidenav-right');
    };

    api.minimizePanel = function(panel_id) {
        var panel = $('#' + panel_id);

        // minimize/maximize
        panel.toggleClass('dfx-ve-floating-collapsed-panel');
        $('#' + panel_id + '-content').toggleClass('dfx-ve-hidden-element');

        // change icon
        if ( panel.hasClass('dfx-ve-floating-collapsed-panel') ) {
            $('#' + panel_id + '-collapser').removeClass('fa-minus');
            $('#' + panel_id + '-collapser').addClass('fa-plus');
        } else {
            $('#' + panel_id + '-collapser').removeClass('fa-plus');
            $('#' + panel_id + '-collapser').addClass('fa-minus');
        }

        setFloatingPanelHeight('dfx-ve-sidenav-left');
        setFloatingPanelHeight('dfx-ve-sidenav-right');
    };

    api.closePanel = function(panel_id) {
        $('#' + panel_id).toggleClass('dfx-ve-hidden-element');

        // change icons and title in editor settings menu
        var menu_icon = $('#dfx-ve-settings-menu-hide-panels-icon');
        var menu_label = $('#dfx-ve-settings-menu-hide-panels-label');

        if (menu_icon.hasClass('fa-compress')) {
            menu_icon.removeClass('fa-compress');
            menu_icon.addClass('fa-expand');
            menu_label.text('Show Panels');
        }
    };

    return api;
}());
