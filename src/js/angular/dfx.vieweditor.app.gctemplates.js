var DfxViewEditorGcTemplates = (function() {
    var api = {};

    // Toggle locked properties menu - START
    api.loadGcTemplateLockingMenu = function($event, $scope, $compile) {
        $event.stopImmediatePropagation();
        $scope.closeGcTemplateLockingMenu();
        var snippet = '<md-menu-content width="4" style="left:'+($event.x-250)+'px;top:'+($event.y-5)+'px;" layout="column" class="md-whiteframe-4dp dfx-ve-gc-templates-locking-popmenu md-menu-bar-menu md-dense .md-button" ng-mouseleave="closeGcTemplateLockingMenu()">';
        snippet += '<md-menu-item><md-button ng-click="displayAllGcTemplateAttributes()"><md-icon class="fa fa-folder-open" aria-label="Display All"></md-icon>Display All</md-button></md-menu-item>';
        snippet += '<md-menu-item><md-button ng-click="displayLockedGcTemplateAttributes()"><md-icon class="fa fa-lock" aria-label="Display Locked"></md-icon>Display Locked</md-button></md-menu-item>';
        snippet += '<md-menu-item><md-button ng-click="displayUnlockedGcTemplateAttributes()"><md-icon class="fa fa-unlock" aria-label="Display Unlocked"></md-icon>Display Unlocked</md-button></md-menu-item>';
        snippet += '</md-menu-content>';
        angular.element(document.getElementById('dfx-view-editor-body')).append($compile(snippet)($scope));
    };
    api.closeGcTemplateLockingMenu = function() {
        $('.dfx-ve-gc-templates-locking-popmenu').remove();
    };
    api.displayAllGcTemplateAttributes = function($scope) {
        $scope.display_all_attributes = true;
        $scope.display_locked_attributes = false;
        $scope.display_unlocked_attributes = false;
        $scope.closeGcTemplateLockingMenu();

        $scope.$broadcast('toggleGcTemplateProperties',{});
    };
    api.displayLockedGcTemplateAttributes = function($scope) {
        $scope.display_all_attributes = false;
        $scope.display_locked_attributes = true;
        $scope.display_unlocked_attributes = false;
        $scope.closeGcTemplateLockingMenu();

        $scope.$broadcast('toggleGcTemplateProperties',{});
    };
    api.displayUnlockedGcTemplateAttributes = function($scope) {
        $scope.display_all_attributes = false;
        $scope.display_locked_attributes = false;
        $scope.display_unlocked_attributes = true;
        $scope.closeGcTemplateLockingMenu();

        $scope.$broadcast('toggleGcTemplateProperties',{});
    };
    api.isGcAttributeVisible = function(is_locked, $scope) {
        if ($scope.display_all_attributes) {
            return true;
        } else if ($scope.display_locked_attributes) {
            return is_locked ? true : false;
        } else if ($scope.display_unlocked_attributes) {
            return is_locked ? false : true;
        }
        return true;
    };
    api.isGcSpecialAttributeVisible = function($scope) {
        if ($scope.display_all_attributes || $scope.display_unlocked_attributes) {
            return true;
        } else if ($scope.display_locked_attributes) {
            return false;
        }
        return true;
    };
    // Toggle locked properties menu - END

    return api;
}());
