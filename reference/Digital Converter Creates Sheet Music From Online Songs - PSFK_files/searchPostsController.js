psfk4App.controller('searchPostsController', ['$scope', '$rootScope', '$http', '$sce', function ($scope, $rootScope, $http, $sce) {
    // init start data
    $scope.dataPosts = {
        'posts': [],
        'pulse': [],
        'parity': 0,
        'no_results_title_show': false
    };
    $scope.$watch("appPhpPosts", function(){
        $scope.dataPosts.phpPosts = $scope.appPhpPosts;
        $scope.dataPosts.phpPostsSize = 0;
    });

}]);