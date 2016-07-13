        // type your code here
        $scope.books = {
            'ProAngularJS':                 {'title': 'Pro AngularJS (Experts Voice in Web Development)', 'author': 'Adam Freeman'},
            'ThePrinciplesofJavaScript':    {'title': 'The Principles of Object-Oriented JavaScript', 'author': 'Nicholas C. Zakas'},
            'SpeakingJavaScript':           {'title': 'Speaking JavaScript: An In-Depth Guide for Programmers', 'author': 'Axel Rauschmayer'},
            'No Book Selected':             {'title': 'No Book Selected', 'author': 'No Author'}
        };

        $scope.bookId = ($scope.parameters) ? $scope.parameters.value : 'No Book Selected';

        $scope.openAnotherWidget = function(widget_name) {
            DFXMobile.openWidget(widget_name);
        };