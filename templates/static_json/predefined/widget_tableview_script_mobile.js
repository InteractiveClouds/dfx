    $scope.tableView = [
        {'label': 'Pro AngularJS', 'value': 'ProAngularJS', 'icon': 'edit', 'chevron': 'wBooksInfo'},
        {'label': 'Speaking JavaScript', 'value': 'SpeakingJavaScript', 'icon': 'edit', 'chevron': 'wBooksInfo'},
        {'label': 'The Principles of JavaScript', 'value': 'ThePrinciplesofJavaScript', 'icon': 'edit', 'chevron': 'wBooksInfo'}
    ];

    $scope.openAnotherWidget = function(widget_name) {
        DFXMobile.openWidget(widget_name);
    };