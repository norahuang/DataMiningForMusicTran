psfk4App.controller('runSearchControlPanelController', ['$scope', '$rootScope', '$http', '$sce', function ($scope, $rootScope, $http, $sce) {

    // init start data
    $scope.dataPosts = {
        'posts': [],
        'pulse': [],
        'parity': 0,
        'no_results_title_show': false
    };
    $scope.loadingData = false;
    $scope.loadingDataNotEnd = true;
    $scope.currentPage = 1;
    $scope.currentPostType = 'post';
    $scope.currentPostIndex = '';
    $scope.inviewpart = '';
    $scope.positionY = 0;
    $scope.loadingNoMore = false;
    $scope.offset = 0;
    $scope.postperpage = 12;

    $scope.$on('eventRunSearchControlPanel', function(event, params) {
        console.log('eventRunSearchControlPanel');
        $scope.offset = 0;
        $scope.dataPosts = {
            'posts': [],
            'pulse': [],
            'parity': 0
        };
        $scope.loadingData = false;
        $scope.loadingNoMore = false;
        $scope.loadingDataNotEnd = true;
        $scope.currentPage = 1;
        $rootScope.runSearchPostFolder = '';
        $scope.runSearchPost()
    });

    $scope.$on('eventRunFolderControlPanel', function(event, params) {
        console.log('eventRunFolderControlPanel');
        $scope.offset = 0;
        $scope.dataPosts = {
            'posts': [],
            'pulse': [],
            'parity': 0
        };
        $scope.loadingData = false;
        $scope.loadingNoMore = false;
        $scope.loadingDataNotEnd = true;
        $scope.currentPage = 1;
        $rootScope.runSearchPostWatchlist = '';
        $scope.runSearchPost()
    });


    /**
     * infinite scroll loading data
     */
    $scope.runSearchPost = function() {
        if (!$scope.loadingData && !$scope.loadingNoMore && $rootScope.runSearchPostWatchlist !== '') {
            $scope.getSearchPosts();
        }
        if (!$scope.loadingData && !$scope.loadingNoMore && $rootScope.runSearchPostFolder !== '') {
            $scope.getFolderPosts();
        }
    };

    $scope.getFolderPosts = function(){
        $scope.loadingData = true;
        if (typeof $rootScope.runSearchPostFolder.id != "undefined" &&
            typeof $rootScope.runSearchPostFolder.id != "null" &&
            $rootScope.runSearchPostFolder.id != null &&
            $rootScope.runSearchPostFolder.id != undefined &&
            $rootScope.runSearchPostFolder.id != ''){

            if (typeof $rootScope.runSearchPostFolder.is_shared != "undefined" &&
                typeof $rootScope.runSearchPostFolder.is_shared != "null" &&
                $rootScope.runSearchPostFolder.is_shared != null &&
                $rootScope.runSearchPostFolder.is_shared != undefined &&
                $rootScope.runSearchPostFolder.is_shared != '' &&
                $rootScope.runSearchPostFolder.is_shared != false){
                $rootScope.runSearchPostFolder.is_shared = 1;
            }

            return $http.get($scope.api, {
                params: {
                    'memcached_enabled': 0,
                    'json': 'get_posts_by_folder_short',
                    'folder_id': $rootScope.runSearchPostFolder.id,
                    'offset': $scope.offset,
                    'count': $scope.postperpage,
                    'is_shared': $rootScope.runSearchPostFolder.is_shared
                }
            }).then(function(response){
                $scope.offset += $scope.postperpage;
                var data = response.data;
                if (typeof data.posts != "null" &&
                    typeof data.posts != "undefined" &&
                    data.posts != "null" &&
                    data.posts != "" &&
                    data.posts != null){
                    if (data.posts.length>0){
                        for (var i = 0; i < data.posts.length; i++) {
                            data.posts[i].content = $sce.trustAsHtml(data.posts[i].content);
                            if (data.posts[i].is_pulse == 1){
                                $scope.dataPosts.pulse.push(data.posts[i]);
                            }
                            if ($scope.dataPosts.parity == 0){
                                $scope.dataPosts.posts = $scope.dataPosts.posts.concat($scope.dataPosts.pulse);
                                $scope.dataPosts.pulse = [];
                                if (data.posts[i].is_pulse == 0){
                                    $scope.dataPosts.parity = 1;
                                    $scope.dataPosts.posts.push(data.posts[i]);
                                }
                            } else {
                                if (data.posts[i].is_pulse == 0){
                                    $scope.dataPosts.parity = 0;
                                    $scope.dataPosts.posts.push(data.posts[i]);
                                }
                            }
                            if (i == data.posts.length-1){
                                $scope.loadingData = false;
                                $scope.currentPage += 1;
                            }
                        }
                        if (data.count_total == $scope.dataPosts.posts.length){
                            $scope.loadingDataNotEnd = false;
                            $scope.loadingNoMore = true;
                            $scope.loadingData = false;
                        }
                    } else {
                        $scope.loadingDataNotEnd = true;
                        $scope.loadingNoMore = true;
                        $scope.loadingData = false;
                    }
                } else {
                    if ($scope.dataPosts.posts.length == 0) {
                        $scope.dataPosts = {
                            'posts': [],
                            'pulse': [],
                            'parity': 0,
                            'no_results_title_show': true
                        };
                    }
                    $scope.loadingDataNotEnd = true;
                    $scope.loadingNoMore = true;
                    $scope.loadingData = false;
                }
            });
        }
    };

    $scope.getSearchPosts = function(){
        $scope.loadingData = true;
        if (!Array.isArray) {
            Array.isArray = function(arg) {
                return Object.prototype.toString.call(arg) === '[object Array]';
            };
        }
        if (typeof $rootScope.runSearchPostWatchlist.tags != "undefined" &&
            typeof $rootScope.runSearchPostWatchlist.tags != "null" &&
            $rootScope.runSearchPostWatchlist.tags != null &&
            $rootScope.runSearchPostWatchlist.tags != undefined &&
            $rootScope.runSearchPostWatchlist.tags != '' &&
            Array.isArray($rootScope.runSearchPostWatchlist.tags)){
            var tags_string = '';
            $rootScope.runSearchPostWatchlist.tags.forEach(function(val, idx, array) {
                if (tags_string !== '') {
                    tags_string += ',';
                }
                tags_string += val.title;
            });
            if (tags_string !== '') {
                return $http.get($scope.api, {
                    params: {
                        //'memcached_enabled': 0,
                        'json': 'get_posts_by_taxonomy_short',
                        'watchlist_id': $rootScope.runSearchPostWatchlist.id,
                        'tags': tags_string,
                        'offset': $scope.offset,
                        'count': $scope.postperpage
                    }
                }).then(function(response){
                    $scope.offset += $scope.postperpage;
                    var data = response.data;
                    if (typeof data.posts != "null" &&
                        typeof data.posts != "undefined" &&
                        data.posts != "null" &&
                        data.posts != "" &&
                        data.posts != null){
                        if (data.posts.length>0){
                            for (var i = 0; i < data.posts.length; i++) {
                                data.posts[i].content = $sce.trustAsHtml(data.posts[i].content);
                                if (data.posts[i].is_pulse == 1){
                                    $scope.dataPosts.pulse.push(data.posts[i]);
                                }
                                if ($scope.dataPosts.parity == 0){
                                    $scope.dataPosts.posts = $scope.dataPosts.posts.concat($scope.dataPosts.pulse);
                                    $scope.dataPosts.pulse = [];
                                    if (data.posts[i].is_pulse == 0){
                                        $scope.dataPosts.parity = 1;
                                        $scope.dataPosts.posts.push(data.posts[i]);
                                    }
                                } else {
                                    if (data.posts[i].is_pulse == 0){
                                        $scope.dataPosts.parity = 0;
                                        $scope.dataPosts.posts.push(data.posts[i]);
                                    }
                                }
                                if (i == data.posts.length-1){
                                    $scope.loadingData = false;
                                    $scope.currentPage += 1;
                                }
                            }
                            if (data.count_total == $scope.dataPosts.posts.length){
                                $scope.loadingDataNotEnd = false;
                                $scope.loadingNoMore = true;
                                $scope.loadingData = false;
                            }
                        } else {
                            $scope.loadingDataNotEnd = true;
                            $scope.loadingNoMore = true;
                            $scope.loadingData = false;
                        }
                    } else {
                        if ($scope.dataPosts.posts.length == 0) {
                            $scope.dataPosts = {
                                'posts': [],
                                'pulse': [],
                                'parity': 0,
                                'no_results_title_show': true
                            };
                        }
                        $scope.loadingDataNotEnd = true;
                        $scope.loadingNoMore = true;
                        $scope.loadingData = false;
                    }
                });
            }
        }
    };

}]);