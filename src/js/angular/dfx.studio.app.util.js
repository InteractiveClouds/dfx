var DfxStudioAppUtil = (function() {
    var api = {};

    api.toggleSelection = function($scope, item, items_selected_array_name) {
        var idx = $scope[items_selected_array_name].indexOf(item);
        if (idx > -1) {
            $scope[items_selected_array_name].splice(idx, 1);
        } else {
            $scope[items_selected_array_name].push(item);
        }
    };

    api.toggleAll = function($scope, items_array, items_selected_array_name, is_all_items_selected) {
        if ($scope[items_selected_array_name].length === items_array.length) {
            $scope[items_selected_array_name] = [];
        } else if ($scope[items_selected_array_name].length === 0 || $scope[items_selected_array_name].length > 0) {
            if (is_all_items_selected) {
                $scope[items_selected_array_name] = [];
            } else {
                $scope[items_selected_array_name] = items_array.slice(0);
            }
        }
    };

    api.isSelected = function($scope, item, items_selected_array_name) {
        //console.log('item: ', item, ', items_selected_array_name: ', items_selected_array_name);
        return $scope[items_selected_array_name].indexOf(item) > -1;
    };

    return api;
}());
