var DfxViewEditorSettings = (function() {
    var api = {};

    var VIEW_SETTINGS_PATH = null;

    var getViewSettings = function() {
        var view_settings = window.localStorage.getItem(VIEW_SETTINGS_PATH);
        var default_settings = {
            'width': '',
            'height': '',
            'show_ruler': false,

            'show_dfx-ve-sidenav-left': true,
            'show_dfx-ve-sidenav-right': true,

            'detach_dfx-ve-sidenav-left': false,
            'detach_dfx-ve-sidenav-right': false,

            'minimize_dfx-ve-sidenav-left': false,
            'minimize_dfx-ve-sidenav-right': false,

            'left_dfx-ve-sidenav-left': -1,
            'top_dfx-ve-sidenav-left': -1,
            'left_dfx-ve-sidenav-right': -1,
            'top_dfx-ve-sidenav-right': -1,

            'height_dfx-ve-sidenav-left': -1,
            'height_dfx-ve-sidenav-right': -1
        };

        return view_settings ? JSON.parse(view_settings) : default_settings;
    };
    var setViewSettings = function(view_settings) {
        var current_view_settings = getViewSettings();
        angular.merge(current_view_settings, view_settings);

        window.localStorage.setItem(VIEW_SETTINGS_PATH, JSON.stringify(current_view_settings));
    };

    var getPanelInfoById = function(panel_id) {
        var panel_info = {};
        if (panel_id == 'dfx-ve-sidenav-left') {
            panel_info = { 'title': 'Palette', 'name': 'palette' };
        } else if (panel_id == 'dfx-ve-sidenav-right') {
            panel_info = { 'title': 'Property', 'name': 'property' };
        }
        return panel_info;
    };

    api.init = function($scope, $compile, $interval) {
        VIEW_SETTINGS_PATH = VIEW_SETTINGS_PATH ? VIEW_SETTINGS_PATH
                                                : 'DFX_' + $scope.tenant_id + '_' + $scope.view_name + '_view_settings';
        var view_settings = getViewSettings();

        var initSettings = function() {
            // Order of functions calls is important here!
            api.loadViewSettingsMenu($scope, $compile);
            api.closeViewSettingsMenu();

            api.setWorkspaceSize(view_settings);
            api.toggleRuler(view_settings);
            api.togglePanel('dfx-ve-sidenav-left', view_settings);
            api.togglePanel('dfx-ve-sidenav-right', view_settings);
            api.detachOrAttachPanel('dfx-ve-sidenav-left', view_settings);
            api.detachOrAttachPanel('dfx-ve-sidenav-right', view_settings);

            makePanelDraggable('dfx-ve-sidenav-left');
            makePanelDraggable('dfx-ve-sidenav-right');
            setPanelPosition('dfx-ve-sidenav-left');
            setPanelPosition('dfx-ve-sidenav-right');

            makePanelResizable('dfx-ve-sidenav-left');
            makePanelResizable('dfx-ve-sidenav-right');
            setResizablePanelHeight('dfx-ve-sidenav-left', view_settings);
            setResizablePanelHeight('dfx-ve-sidenav-right', view_settings);

            api.closePanel('dfx-ve-sidenav-left', view_settings);
            api.closePanel('dfx-ve-sidenav-right', view_settings);

            api.minimizeOrMaximizePanel('dfx-ve-sidenav-left', view_settings);
            api.minimizeOrMaximizePanel('dfx-ve-sidenav-right', view_settings);
        };

        var cards_ready = $interval(function() {
            var main_content_tab_parent = $('.dfx-ve-main-content-tab-content').parent();
            var main_content_tab_parent_height = main_content_tab_parent.css('height');
            // if cards are on the screen and have already set all its propeties
            if (main_content_tab_parent_height && main_content_tab_parent_height.indexOf('%') == -1) {
                $scope.stopWaitingCards();
                initSettings();
            }
        }, 100, 100);

        $scope.stopWaitingCards = function() {
            if (angular.isDefined(cards_ready)) {
                $interval.cancel(cards_ready);
                cards_ready = undefined;
            }
        };

        $scope.$on('$destroy', function() {
            $scope.stopWaitingCards();//make sure that the interval is destroyed too
        });
    };

    /*var createViewSettingsMenu = function($scope, $compile, options) {
        var snippet = '<md-menu-bar>';
        snippet += '<div id="dfx-ve-settings-menu" ng-mouseleave="closeViewSettingsMenu()" class="_md md-open-menu-container md-whiteframe-z2 md-altTheme-theme md-active md-clickable" style="left:'+options.x+'px;top:'+options.y+'px;" aria-hidden="false">';
        snippet += '<md-menu-content width="4" class="md-altTheme-theme">';
        snippet += '<md-menu-item ng-if="view_platform!==\'mobile\'"><md-button ng-click="changeCanvasSize()"><md-icon class="fa fa-square-o"></md-icon>Change Canvas Size</md-button></md-menu-item>';
        snippet += '<md-menu-item ng-if="view_platform!==\'mobile\'"><md-button ng-click="toggleRuler()"><md-icon class="fa fa-bars"></md-icon><span id="dfx-ve-settings-menu-show-ruler-label">Show Ruler</span></md-button></md-menu-item>';
        snippet += '<md-menu-divider></md-menu-divider>';

        snippet += '<md-menu-item>';
        snippet += '<md-menu id="dfx-ve-settings-panels-menu" md-offset="150 0">';
        snippet += '<md-menu-item><md-button ng-click="$mdOpenMenu();"><md-icon class="fa fa-columns"></md-icon>Panels</md-button></md-menu-item>';
        snippet += '<md-menu-content>';
        snippet += '<md-menu-item><md-button ng-click="togglePanel(\'dfx-ve-sidenav-left\')"><md-icon id="dfx-ve-settings-menu-hide-palette-panel-icon" class="fa fa-compress"></md-icon><span id="dfx-ve-settings-menu-hide-palette-panel-label">Hide Palette Panel</span></md-button></md-menu-item>';
        snippet += '<md-menu-item><md-button ng-click="togglePanel(\'dfx-ve-sidenav-right\')"><md-icon id="dfx-ve-settings-menu-hide-property-panel-icon" class="fa fa-compress"></md-icon><span id="dfx-ve-settings-menu-hide-property-panel-label">Hide Property Panel</span></md-button></md-menu-item>';
        snippet += '<md-menu-item><md-button ng-click="detachOrAttachPanel(\'dfx-ve-sidenav-left\')"><md-icon id="dfx-ve-settings-menu-detach-palette-panel-icon" class="fa fa-external-link"></md-icon><span id="dfx-ve-settings-menu-detach-palette-panel-label">Detach Palette Panel</span></md-button></md-menu-item>';
        snippet += '<md-menu-item><md-button ng-click="detachOrAttachPanel(\'dfx-ve-sidenav-right\')"><md-icon id="dfx-ve-settings-menu-detach-property-panel-icon" class="fa fa-external-link"></md-icon><span id="dfx-ve-settings-menu-detach-property-panel-label">Detach Property Panel</span></md-button></md-menu-item>';
        snippet += '</md-menu-content>';
        snippet += '</md-menu>';
        snippet += '</md-menu-item>';

        snippet += '</md-menu-content>';
        snippet += '</div>'
        snippet += '</md-menu-bar>';
        angular.element(document.getElementById('dfx-view-editor-body')).append($compile(snippet)($scope));
    };*/
    var createViewSettingsMenu = function($scope, $compile, options) {
        var snippet = '<md-menu-bar>';
        snippet += '<div id="dfx-ve-settings-menu" ng-mouseleave="closeViewSettingsMenu()" class="_md md-open-menu-container md-whiteframe-z2 md-altTheme-theme md-active md-clickable" style="left:'+options.x+'px;top:'+options.y+'px;" aria-hidden="false">';
        snippet += '<md-menu-content width="4" class="md-altTheme-theme">';
        snippet += '<md-menu-item ng-if="view_platform!==\'mobile\'"><md-button ng-click="changeCanvasSize()"><md-icon class="fa fa-square-o"></md-icon>Change Canvas Size</md-button></md-menu-item>';
        snippet += '<md-menu-item ng-if="view_platform!==\'mobile\'"><md-button ng-click="toggleRuler()"><md-icon class="fa fa-bars"></md-icon><span id="dfx-ve-settings-menu-show-ruler-label">Show Ruler</span></md-button></md-menu-item>';
        snippet += '<md-menu-divider></md-menu-divider>';
        snippet += '<md-menu-item><md-button ng-click="togglePanel(\'dfx-ve-sidenav-left\')"><md-icon id="dfx-ve-settings-menu-hide-palette-panel-icon" class="fa fa-compress"></md-icon><span id="dfx-ve-settings-menu-hide-palette-panel-label">Hide Palette Panel</span></md-button></md-menu-item>';
        snippet += '<md-menu-item><md-button ng-click="togglePanel(\'dfx-ve-sidenav-right\')"><md-icon id="dfx-ve-settings-menu-hide-property-panel-icon" class="fa fa-compress"></md-icon><span id="dfx-ve-settings-menu-hide-property-panel-label">Hide Property Panel</span></md-button></md-menu-item>';
        snippet += '<md-menu-item><md-button ng-click="detachOrAttachPanel(\'dfx-ve-sidenav-left\')"><md-icon id="dfx-ve-settings-menu-detach-palette-panel-icon" class="fa fa-external-link"></md-icon><span id="dfx-ve-settings-menu-detach-palette-panel-label">Detach Palette Panel</span></md-button></md-menu-item>';
        snippet += '<md-menu-item><md-button ng-click="detachOrAttachPanel(\'dfx-ve-sidenav-right\')"><md-icon id="dfx-ve-settings-menu-detach-property-panel-icon" class="fa fa-external-link"></md-icon><span id="dfx-ve-settings-menu-detach-property-panel-label">Detach Property Panel</span></md-button></md-menu-item>';
        snippet += '</md-menu-content>';
        snippet += '</div>'
        snippet += '</md-menu-bar>';
        angular.element(document.getElementById('dfx-view-editor-body')).append($compile(snippet)($scope));
    };
    api.loadViewSettingsMenu = function($scope, $compile, $event) {
        if ($event) { $event.stopImmediatePropagation(); }
        var settings_menu = $('#dfx-ve-settings-menu'),
            workspace_menu_icon = $('#dfx-ve-workspace-menu-icon')[0];

        if (settings_menu.length) {
            api.openViewSettingsMenu();
        } else {
            createViewSettingsMenu($scope, $compile, {'x': workspace_menu_icon.x, 'y': workspace_menu_icon.y+33});
        }
    };
    api.openViewSettingsMenu = function() {
        $('#dfx-ve-settings-menu').show();
    };
    api.closeViewSettingsMenu = function(called_from_main_menu) {
        $('#dfx-ve-settings-menu').hide();
    };

    api.setWorkspaceSize = function(view_settings) {
        var view_settings = view_settings ? view_settings : getViewSettings(),
            width = view_settings.width,
            height = view_settings.height;

        var workspace_container = $('#dfx-ve-main-content > md-tabs');

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
    api.changeCanvasSize = function($scope, $mdDialog, $event) {
        api.closeViewSettingsMenu();
        $mdDialog.show({
            controller: DialogController,
            templateUrl: '/gcontrols/web/workspace_change.html',
            parent: angular.element(document.body),
            targetEvent: $event
        })
        .then(function(workspace) {
            var view_settings = {'width': workspace.width, 'height': workspace.height};
            api.setWorkspaceSize(view_settings);
            setViewSettings(view_settings);
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
    var showRuler = function(dfx_ruler, menu_label) {
        dfx_ruler.removeClass('dfx-ve-hidden-element');
        api.fitRulerPosition();

        // change icons and title in editor settings menu
        menu_label.text('Hide Ruler');
    };
    var hideRuler = function(dfx_ruler, menu_label) {
        dfx_ruler.addClass('dfx-ve-hidden-element');
        api.fitRulerPosition();

        // change icons and title in editor settings menu
        menu_label.text('Show Ruler');
    };
    api.toggleRuler = function(view_settings) {
        var dfx_ruler = $('.dfx-ve-ruler'),
            menu_label = $('#dfx-ve-settings-menu-show-ruler-label');

        if (view_settings) {
            if (view_settings.show_ruler) {
                showRuler(dfx_ruler, menu_label);
            } else {
                hideRuler(dfx_ruler, menu_label);
            }
        } else {
            api.closeViewSettingsMenu();

            var view_settings = {'show_ruler': false};
            if ( dfx_ruler.hasClass('dfx-ve-hidden-element') ) {
                showRuler(dfx_ruler, menu_label);
                view_settings.show_ruler = true;
            } else {
                hideRuler(dfx_ruler, menu_label);
            }
            setViewSettings(view_settings);
        }
    };

    var showPanel = function(dfx_panel, menu_icon, menu_label, panel_title) {
        dfx_panel.removeClass('dfx-ve-hidden-element');

        // change icons and title in editor settings menu
        menu_icon.removeClass('fa-expand');
        menu_icon.addClass('fa-compress');
        menu_label.text('Hide ' + panel_title + ' Panel');
    };
    var hidePanel = function(dfx_panel, menu_icon, menu_label, panel_title) {
        dfx_panel.addClass('dfx-ve-hidden-element');

        // change icons and title in editor settings menu
        menu_icon.removeClass('fa-compress');
        menu_icon.addClass('fa-expand');
        menu_label.text('Show ' + panel_title + ' Panel');
    };
    api.togglePanel = function(panel_id, view_settings) {
        var dfx_panel = $('#' + panel_id),
            panel_info = getPanelInfoById(panel_id),
            menu_icon = $('#dfx-ve-settings-menu-hide-' + panel_info.name + '-panel-icon'),
            menu_label = $('#dfx-ve-settings-menu-hide-' + panel_info.name + '-panel-label'),
            show_panel_key = 'show_' + panel_id;

        if (view_settings) {
            if ( view_settings[show_panel_key] ) {
                showPanel(dfx_panel, menu_icon, menu_label, panel_info.title);
            } else {
                hidePanel(dfx_panel, menu_icon, menu_label, panel_info.title);
            }
        } else {
            api.closeViewSettingsMenu();

            var view_settings = {};
            view_settings[show_panel_key] = false;
            if (menu_icon.hasClass('fa-expand')) {
                showPanel(dfx_panel, menu_icon, menu_label, panel_info.title);
                view_settings[show_panel_key] = true;
            } else {
                hidePanel(dfx_panel, menu_icon, menu_label, panel_info.title);
            }
            setViewSettings(view_settings);
        }
    };

    var makePanelDraggable = function(panel_id) {
        var dfx_panel = $('#' + panel_id),
            dfx_panel_header = $('#' + panel_id + '-header'),
            left_settings_key = 'left_' + panel_id,
            top_settings_key = 'top_' + panel_id;

        var handleDragStop = function(event, ui) {
            var view_settings = getViewSettings(),
                offsetXPos = parseInt( ui.offset.left );
                offsetYPos = parseInt( ui.offset.top );

            view_settings[left_settings_key] = offsetXPos;
            view_settings[top_settings_key] = offsetYPos;

            setViewSettings(view_settings);
        };

        dfx_panel.draggable({
            handle: dfx_panel_header,
            cursor: "move",
            stop: handleDragStop
        });
    };
    var wasPanelMoved = function(panel_id) {
        var view_settings = getViewSettings(),
            left_settings_key = 'left_' + panel_id;

        return (view_settings[left_settings_key] && view_settings[left_settings_key] !== -1) ? true : false;
    };
    var setPanelPosition = function(panel_id) {
        var view_settings = getViewSettings(),
            dfx_panel = $('#' + panel_id),
            panel_info = getPanelInfoById(panel_id),
            left_settings_key = 'left_' + panel_id,
            top_settings_key = 'top_' + panel_id;

        if (isPanelDetached(dfx_panel) && wasPanelMoved(panel_id)) {
            dfx_panel.css('left', view_settings[left_settings_key] + 'px');
            dfx_panel.css('top', view_settings[top_settings_key] + 'px');
        } else if (isPanelDetached(dfx_panel) && !wasPanelMoved(panel_id)) {
            var panel_left = 'auto';
            var panel_right = 'auto';
            if (panel_info.name == 'palette') {
                panel_left = '20px';
            } else if (panel_info.name == 'property') {
                panel_right = '20px';
            }
            dfx_panel.css('left', panel_left);
            dfx_panel.css('right', panel_right);
            dfx_panel.css('top', '90px');
        } else if (!isPanelDetached(dfx_panel)) {
            dfx_panel.css('left', 'initial');
            dfx_panel.css('right', 'initial');
            dfx_panel.css('top', 'initial');
            dfx_panel.css('position', 'relative');
        }
    };
    var makePanelResizable = function(panel_id) {
        var dfx_panel = $('#' + panel_id),
            height_settings_key = 'height_' + panel_id;

        var handleResizeStop = function(event, ui) {
            var view_settings = getViewSettings(),
                height = parseInt( ui.size.height );

            view_settings[height_settings_key] = height;

            setViewSettings(view_settings);
        };

        dfx_panel.resizable({
            handles: 's',
            minHeight: '100px',
            cursor: "move",
            stop: handleResizeStop
        });
    };
    var setResizablePanelHeight = function(panel_id, view_settings) {
        var dfx_panel = $('#' + panel_id),
            height_settings_key = 'height_' + panel_id;

        if (view_settings[height_settings_key] && view_settings[height_settings_key] !== -1) {
            if ( isPanelDetached(dfx_panel) ) {
                dfx_panel.css('height', view_settings[height_settings_key] + 'px');
            } else {
                dfx_panel.css('height', 'auto');
            }
        }
    };
    var isPanelResized = function(panel_id) {
        var view_settings = getViewSettings(),
            height_settings_key = 'height_' + panel_id;

        if (view_settings[height_settings_key] && view_settings[height_settings_key] !== -1) {
            return true;
        } else {
            return false;
        }
    };
    var getDocHeight = function() {
        return parseInt(Math.max(
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        ));
    }
    var setFloatingPanelHeight = function(panel_id) {
        var view_settings = getViewSettings(),
            dfx_panel = $('#' + panel_id),
            height_settings_key = 'height_' + panel_id;

        if (isPanelDetached(dfx_panel) && isPanelMinimized(dfx_panel)) {
            // if detached and minimized
            dfx_panel.css('height', 'auto');
        } else if (isPanelDetached(dfx_panel)  && !isPanelMinimized(dfx_panel)) {
            // if detached change panel height
            var floating_panel_height = isPanelResized(panel_id) ? view_settings[height_settings_key] : getDocHeight() - 105;
            dfx_panel.css('height', floating_panel_height);
        } else if (!isPanelDetached(dfx_panel)) {
            // if not detached
            dfx_panel.css('height', 'auto');
        }
    };
    var isPanelDetached = function(dfx_panel) {
        return dfx_panel.hasClass('dfx-ve-floating-panel');
    };
    var detachPanel = function(panel_id, menu_icon, menu_label) {
        var dfx_panel = $('#' + panel_id),
            panel_info = getPanelInfoById(panel_id),
            dfx_floating_panel_class = 'dfx-ve-floating-' + panel_info.name + '-panel',
            dfx_floating_panel_title = $('#dfx-ve-' + panel_info.name + '-title'),
            dfx_floating_panel_header = $('#' + panel_id + '-header');

        dfx_panel.addClass('dfx-ve-floating-panel');
        dfx_panel.addClass(dfx_floating_panel_class);

        dfx_floating_panel_title.addClass('dfx-ve-hidden-element');
        dfx_floating_panel_header.removeClass('dfx-ve-hidden-element');

        // change icons and title in editor settings menu
        menu_icon.removeClass('fa-external-link');
        menu_icon.addClass('fa-thumb-tack');
        menu_label.text('Attach ' + panel_info.title + ' Panel');

        setPanelPosition(panel_id);
    };
    var attachPanel = function(panel_id, menu_icon, menu_label) {
        var dfx_panel = $('#' + panel_id),
            panel_info = getPanelInfoById(panel_id),
            dfx_floating_panel_class = 'dfx-ve-floating-' + panel_info.name + '-panel',
            dfx_floating_panel_title = $('#dfx-ve-' + panel_info.name + '-title'),
            dfx_floating_panel_header = $('#' + panel_id + '-header');

        dfx_panel.removeClass('dfx-ve-floating-panel');
        dfx_panel.removeClass(dfx_floating_panel_class);

        dfx_floating_panel_title.removeClass('dfx-ve-hidden-element');
        dfx_floating_panel_header.addClass('dfx-ve-hidden-element');

        // change icons and title in editor settings menu
        menu_icon.removeClass('fa-thumb-tack');
        menu_icon.addClass('fa-external-link');
        menu_label.text('Detach ' + panel_info.title + ' Panel');

        setPanelPosition(panel_id);
    };
    api.detachOrAttachPanel = function(panel_id, view_settings) {
        var dfx_panel = $('#' + panel_id),
            panel_info = getPanelInfoById(panel_id),
            menu_icon = $('#dfx-ve-settings-menu-detach-' + panel_info.name + '-panel-icon'),
            menu_label = $('#dfx-ve-settings-menu-detach-' + panel_info.name + '-panel-label'),
            detach_panel_key = 'detach_' + panel_id;

        if (view_settings) {
            if ( view_settings[detach_panel_key] ) {
                detachPanel(panel_id, menu_icon, menu_label);
            } else {
                attachPanel(panel_id, menu_icon, menu_label);
            }
        } else {
            api.closeViewSettingsMenu();

            var view_settings = {};
            view_settings[detach_panel_key] = false;
            if (menu_icon.hasClass('fa-external-link')) {
                detachPanel(panel_id, menu_icon, menu_label);
                view_settings[detach_panel_key] = true;
            } else {
                attachPanel(panel_id, menu_icon, menu_label);
            }
            setViewSettings(view_settings);
        }

        var actIfPanelMinimized = function(dfx_panel, dfx_panel_header, dfx_panel_content) {
            if (isPanelMinimized(dfx_panel) && !isPanelDetached(dfx_panel)) {
                dfx_panel_header.addClass('dfx-ve-hidden-element');
                dfx_panel_content.removeClass('dfx-ve-hidden-element');
            } else if (isPanelMinimized(dfx_panel) && isPanelDetached(dfx_panel)) {
                dfx_panel_header.removeClass('dfx-ve-hidden-element');
                dfx_panel_content.addClass('dfx-ve-hidden-element');
            }
        };
        actIfPanelMinimized(dfx_panel, $('#' + panel_id + '-header'), $('#' + panel_id + '-content'));

        setFloatingPanelHeight(panel_id);
    };

    var isPanelMinimized = function(dfx_panel) {
        return dfx_panel.hasClass('dfx-ve-floating-collapsed-panel');
    };
    var minimizePanel = function(dfx_panel, dfx_panel_content, dfx_collapser_icon) {
        if (! isPanelDetached(dfx_panel)) { return; }

        dfx_panel.addClass('dfx-ve-floating-collapsed-panel');
        dfx_panel_content.addClass('dfx-ve-hidden-element');

        // change icon
        dfx_collapser_icon.removeClass('fa-minus-square-o');
        dfx_collapser_icon.addClass('fa-plus-square-o');
    };
    var maximizePanel = function(dfx_panel, dfx_panel_content, dfx_collapser_icon) {
        dfx_panel.removeClass('dfx-ve-floating-collapsed-panel');
        dfx_panel_content.removeClass('dfx-ve-hidden-element');

        // change icon
        dfx_collapser_icon.removeClass('fa-plus-square-o');
        dfx_collapser_icon.addClass('fa-minus-square-o');
    };
    api.minimizeOrMaximizePanel = function(panel_id, view_settings) {
        var dfx_panel = $('#' + panel_id),
            dfx_panel_content = $('#' + panel_id + '-content'),
            dfx_collapser_icon = $('#' + panel_id + '-collapser'),
            minimize_settings_key = 'minimize_' + panel_id;

        if (view_settings) {
            if ( view_settings[minimize_settings_key] ) {
                minimizePanel(dfx_panel, dfx_panel_content, dfx_collapser_icon);
            } else {
                maximizePanel(dfx_panel, dfx_panel_content, dfx_collapser_icon);
            }
        } else {
            api.closeViewSettingsMenu();

            var view_settings = {};
            view_settings[minimize_settings_key] = false;

            if (! isPanelMinimized(dfx_panel)) {
                minimizePanel(dfx_panel, dfx_panel_content, dfx_collapser_icon);
                view_settings[minimize_settings_key] = true;
            } else {
                maximizePanel(dfx_panel, dfx_panel_content, dfx_collapser_icon);
            }
            setViewSettings(view_settings);
        }

        setFloatingPanelHeight(panel_id);
    };

    api.closePanel = function(panel_id, view_settings) {
        var dfx_panel = $('#' + panel_id),
            panel_info = getPanelInfoById(panel_id),
            menu_icon = $('#dfx-ve-settings-menu-hide-' + panel_info.name + '-panel-icon'),
            menu_label = $('#dfx-ve-settings-menu-hide-' + panel_info.name + '-panel-label'),
            show_panel_key = 'show_' + panel_id;

        if (view_settings) {
            if (! view_settings[show_panel_key] ) {
                hidePanel(dfx_panel, menu_icon, menu_label, panel_info.title);
            }
        } else {
            var view_settings = {};
            view_settings[show_panel_key] = false;
            setViewSettings(view_settings);

            hidePanel(dfx_panel, menu_icon, menu_label, panel_info.title);
        }
    };

    return api;
}());
