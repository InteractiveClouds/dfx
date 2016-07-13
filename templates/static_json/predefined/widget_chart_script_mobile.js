    $scope.statistics = {};

    $scope.statistics.series = [
        "Sales",
        "Income",
        "Expense"
    ];
    $scope.statistics.data = [
        {
            "x": "Books",
            "y": [
                100,
                500,
                210
            ]
        },
        {
            "x": "Disks",
            "y": [
                300,
                100,
                100
            ]
        },
        {
            "x": "Cars",
            "y": [
                351,
                150,
                78
            ]
        }
    ];

    $scope.openAnotherWidget = function(widget_name) {
        DFXMobile.openWidget(widget_name);
    };