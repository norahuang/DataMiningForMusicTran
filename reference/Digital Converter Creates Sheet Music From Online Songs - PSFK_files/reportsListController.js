psfk4App.controller('reportsListController', ['$scope', '$http', '$sce', function ($scope, $http, $sce) {

    $scope.dataPosts = {
        'posts': []
    }
    $scope.showed_reports = [];
    $scope.loadingData = false;
    $scope.currentPage = 2;
    $scope.currentPostType = 'reports';
    $scope.loadingNoMore = false;

    $scope.$watch("appParams", function() {
        $scope.showed_reports = $scope.appParams.showed_reports;
    });

    // infinite scroll loading data
    $scope.loadNextPost = function() {
        //console.log('loadNextReports;');
        if (!$scope.loadingData && !$scope.loadingNoMore) {
            $scope.loadingData = true;
            var params = {
                json: 'get_recent_posts',
                post_type: 'reports',
                count: $scope.postperpage,
                page: $scope.currentPage,
                post_not_id: $scope.showed_reports
            };
            $http({
                method: 'GET',
//                url: $scope.api+'psfk/get_recent_posts/',
                url: $scope.api,
                params: params
            }).success(function(data, status, headers, config) {
                if (typeof data.posts != "null" &&
                    typeof data.posts != "undefined" &&
                    data.posts != "null" &&
                    data.posts != "" &&
                    data.posts != null){
                    if(data.posts.length>0){
                        for (var i = 0; i < data.posts.length; i++) {
                            $scope.dataPosts.posts.push(data.posts[i]);
                            if (i == data.posts.length-1){
                                $scope.loadingData = false;
                                $scope.currentPage += 1;
                            }
                        }
                        if (data.count_total == $scope.dataPosts.posts.length){
                            $scope.loadingNoMore = true;
                            $scope.loadingData = false;
                        }
                    } else {
                        $scope.loadingNoMore = true;
                        $scope.loadingData = false;
                    }
                } else {
                    $scope.loadingNoMore = true;
                    $scope.loadingData = false;
                }
            }).error(function(data, status, headers, config) {
            });
        }
    };

}]);