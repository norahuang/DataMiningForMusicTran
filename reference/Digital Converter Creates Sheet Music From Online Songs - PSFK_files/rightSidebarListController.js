psfk4App.controller('rightSidebarListController', ['$scope', '$rootScope', '$http', '$sce', function ($scope, $rootScope, $http, $sce) {

    $scope.dataPosts = {
        'posts': []
    };
    $scope.channels = [];
    $scope.loadingData = false;
    $scope.currentPage = 1;
    $scope.currentPostType = 'post';
    $scope.showArticlesList = true;
    $scope.showChannelsList = false;
    $scope.ga_init_removed_slot2 = false;
    $scope.ga_init_removed_slot3 = false;
    $scope.resizeTimeout = false;
    $scope.post_not_id = '';

    $scope.$watch("appParams", function(){
        if (typeof $scope.appParams.sidebarIsClosed != "undefined" &&
            typeof $scope.appParams.sidebarIsClosed != "null" &&
            $scope.appParams.sidebarIsClosed){
            $rootScope.sidebarIsClosed = true;
            $rootScope.sidebarIsActive = false;
            angular.element('.articles-pane-block, .sidebar-controls-app-block').css("right", $rootScope.widthRightSidebar[$rootScope.currrentViewport]);
        }
        if ($rootScope.sidebarIsActive && $scope.dataPosts.posts.length  == 0){
            $scope.loadNextPost();
        }
    });
    $scope.googleAds = {
        slot2: angular.element('.advert-banner-slot2').html(),
        slot3: angular.element('.advert-banner-slot3').html()
    };

    $scope.$on('changeCurrentPost', function(event, params) {
        console.log('!changeCurrentPost!');
        setTimeout(function(){
            $rootScope.sponsorAd = params;
        }, 1);
    });

    $scope.$on('eventSidebarShow', function(event, params) {
        $scope.sidebarShow(params.show);
    });

    $scope.$on('eventLoadListPost', function(event, params) {
        $scope.loadListPost(params.partType, params.subPartType, params.tax_type, params.taxonomy);
    });

    $scope.$on('eventLoadChannels', function(event, params) {
        $scope.loadChannels(params.group);
    });

    angular.element(window).on('resize', function() {
        $scope.sidebarShowOnResize();
    });

    //angular.element(".articles-pane-block").on('scroll', function(e) {
    //    if (angular.element(".articles-pane-block").scrollTop() > 20 ){
    //        $scope.$apply(function () {
    //            $rootScope.sidebarBannerOff = true;
    //        });
    //    } else {
    //        $scope.$apply(function () {
    //            $rootScope.sidebarBannerOverflow = true;
    //            $rootScope.sidebarBannerOff = false;
    //        });
    //        setTimeout(function(){
    //            $scope.$apply(function () {
    //                $rootScope.sidebarBannerOverflow = false;
    //            });
    //        }, 1000);
    //    }
    //});

    /**
     * load data for infinite scroll
     */
    $scope.loadNextPost = function() {
        if (!$scope.loadingData && $rootScope.sidebarIsActive) {
            $scope.loadingData = true;
            var params = {
                count: $scope.postperpage,
                page: $scope.currentPage
            };
            if (typeof $scope.appParams.taxonomy != "undefined" && typeof $scope.appParams.taxonomy != "null" && $scope.appParams.taxonomy != ''){
                params.taxonomy = $scope.appParams.taxonomy;
            }
            if (typeof $scope.appParams.tax_type != "undefined" && typeof $scope.appParams.tax_type != "null" && $scope.appParams.tax_type != ''){
                params.tax_type = $scope.appParams.tax_type;
            }
            if (typeof $scope.appParams.post_type != "undefined" && typeof $scope.appParams.post_type != "null" && $scope.appParams.post_type != ''){
                params.post_type = $scope.appParams.post_type;
            }
            if (typeof $scope.appParams.popular != "undefined" && typeof $scope.appParams.popular != "null" && $scope.appParams.popular > 0){
                params.popular = 1;
            }
            if (typeof $scope.appParams.post_not_id != "undefined" && typeof $scope.appParams.post_not_id != "null" && $scope.appParams.post_not_id != ''){
                params.post_not_id = $scope.appParams.post_not_id;
            }
            $scope.getPosts(params);
        }
    };

    /**
     * get data from backend api
     * @param params
     */
    $scope.getPosts = function(params){
        if (typeof $scope.dataPosts == "undefined" && typeof $scope.dataPosts == "null") {
            $scope.dataPosts = {
                'posts': []
            };
        }
        params.json = 'get_recent_posts';
        $http({
            method: 'GET',
            url: $scope.api,
            params: params
        }).success(function(data, status, headers, config) {
            if (data.posts.length>0){
                for (var i = 0; i < data.posts.length; i++) {
                    $scope.dataPosts.posts.push(data.posts[i]);
                    if (i == data.posts.length-1){
                        $scope.loadingData = false;
                        $scope.currentPage += 1;
                        if ($scope.dataPosts.posts.length < 10){
                            $scope.loadNextPost();
                        }
                    }
                    if (typeof data.post_not_id != "undefined" &&
                        typeof data.post_not_id != "null" &&
                        data.post_not_id != '' &&
                        $scope.appParams.post_not_id != data.post_not_id){
                        $scope.appParams.post_not_id = data.post_not_id;
                    }
                    // google ads slot2 after second post in right sidebar
                    if ($scope.dataPosts.posts.length==2){
                        if (!$scope.ga_init_removed_slot2){
                            angular.element('.advert-banner-slot2').html('');
                            angular.element('.advert-banner-slot2').slideUp();
                            $scope.ga_init_removed_slot2 = true;
                        }
                        $scope.dataPosts.posts[1].gpt_ad_slot2 = $sce.trustAsHtml($scope.googleAds.slot2);
                        setTimeout(function(){
                            try {
                                googletag.display("div-gpt-ad-1418270738409-0");
                                googletag.pubads().refresh([slot2]);
                            } catch (_) {}
                        }, 1000);
                    }
                    // google ads slot3 after every 10 post in right sidebar
                    if ($scope.dataPosts.posts.length % 10 == 0 && $scope.dataPosts.posts.length>=10){
                        if ($scope.dataPosts.posts.length>10){
                            var key = $scope.dataPosts.posts.length-11;
                        } else {
                            var key = 9;
                        }
                        $scope.removeGcode();
                        if (!$scope.ga_init_removed_slot3){
                            angular.element('.advert-banner-slot3').html('');
                            angular.element('.advert-banner-slot3').slideUp();
                            $scope.ga_init_removed_slot3 = true;
                        }
                        $scope.dataPosts.posts[key].gpt_ad_slot3 = $sce.trustAsHtml($scope.googleAds.slot3);
                        setTimeout(function(){
                            googletag.display("div-gpt-ad-1418270784337-0");
                            googletag.pubads().refresh([slot3]);
                        }, 1000);

                    }
                }
            }
        }).error(function(data, status, headers, config) {
        });
    };

    /**
     * remove all google ads code slot3 when moving code to another block
     */
    $scope.removeGcode = function(){
        for (var i = 0; i<$scope.dataPosts.posts.length; i++){
            if ($scope.dataPosts.posts[i].gpt_ad_slot3){
                $scope.dataPosts.posts[i].gpt_ad_slot3 = false;
            }
        }
    };

    $scope.loadChannels = function(group){
        if (typeof group == "undefined" || typeof group == "null") {
            group = '';
        }
        $scope.loadingData = true;
        $rootScope.subPartType = 'by'+group;
        $scope.channels = [];
        $http({
            method: 'GET',
            url: $scope.api,
            params: {
                json: 'get_taxonomy_index',
                taxonomy: 'channel',
                tax_group: group
            }
        }).success(function(data, status, headers, config) {
            if (data.terms.length>0){
                for (var i = 0; i < data.terms.length; i++) {
                    $scope.channels.push(data.terms[i]);
                }
                $scope.showArticlesList = false;
                $scope.showChannelsList = true;
                $rootScope.subscribeBlock = false;
            }
        }).error(function(data, status, headers, config) {
        });
    };

    /**
     * change list of content in sidebar
     * @param partType
     * @param subPartType
     * @param tax_type
     * @param taxonomy
     */
    $scope.loadListPost = function(partType, subPartType, tax_type, taxonomy){
        if (typeof partType == "undefined" || typeof partType == "null") {
            partType = '';
        }
        if (typeof subPartType == "undefined" || typeof subPartType == "null") {
            subPartType = '';
        }
        if (partType != $rootScope.partType || subPartType != $rootScope.subPartType) {
            $scope.showArticlesList = true;
            $scope.showChannelsList = false;
            $rootScope.subscribeBlock = true;
            $scope.loadingData = true;
            $rootScope.partType = partType;
            $rootScope.subPartType = subPartType;
            if ($scope.postperpage<10){
                $scope.currentPage = Math.ceil(10/$scope.postperpage);
            } else {
                $scope.currentPage = 1;
            }
            var params = {
                count: $scope.postperpage*$scope.currentPage,
                page: 1
            };

            if (typeof taxonomy != "undefined" && typeof taxonomy != "null" && taxonomy != ''){
                params.taxonomy = taxonomy;
            }
            if (typeof tax_type != "undefined" && typeof tax_type != "null" && tax_type != ''){
                params.tax_type = tax_type;
            }

            switch ($rootScope.partType){
                case "videos":
                    ga('send', 'event', 'Articles Nav', 'Click', 'Videos');
                    params.post_type = 'video';
                    switch ($rootScope.subPartType){
                        case "all":
                            break;
                        case "byevent":
                            params.byevent = '1';
                            break;
                        case "bytopic":
                            params.bytopic = '1';
                            break;
                        default :
                            $rootScope.subPartType = 'all';
                            break;
                    }
                    break;
                case "latest":
                    ga('send', 'event', 'Articles Nav', 'Click', 'Latest');
                    params.post_type = 'post';
                    break;
                case "popular":
                    ga('send', 'event', 'Articles Nav', 'Click', 'Popular');
                    params.post_type = 'post';
                    params.popular = 1;
                    break;
            }

            $scope.appParams = {
                'popular' : params.popular,
                'post_type' : params.post_type,
                'taxonomy' : params.taxonomy,
                'tax_type' : params.tax_type,
                'byevent' : params.byevent,
                'bytopic' : params.bytopic
            }

            $scope.dataPosts = {
                'posts': []
            }
            $scope.getPosts(params);
        }
    };

    /**
     * show or hide right sidebar
     * @param is_show
     */
    $scope.sidebarShow = function(is_show){
        if (is_show === true) {
            $rootScope.sidebarIsActive = true;
        } else if (is_show === false) {
            $rootScope.sidebarIsActive = false;
        } else if (typeof is_show == "undefined" || typeof is_show == "null") {
            $rootScope.sidebarIsActive = !$rootScope.sidebarIsActive;
        }
        if ($rootScope.sidebarIsActive){
            angular.element('.articles-pane-block, .sidebar-controls-app-block').css("right", "0");
        } else {
            angular.element('.articles-pane-block, .sidebar-controls-app-block').css("right", $rootScope.widthRightSidebar[$rootScope.currrentViewport]);
        }
        $rootScope.sidebarIsClosed = !$rootScope.sidebarIsActive;
        if ($rootScope.sidebarIsActive && $scope.dataPosts.posts.length  == 0){
            $scope.loadNextPost();
        }
    };

    /**
     * show or hide right sidebar if it's needed
     */
    $scope.sidebarShowOnResize = function(){
        $rootScope.windowWidth = angular.element(window).width();
        if ($rootScope.windowWidth >= 1500){
            $rootScope.currrentViewport = 1;
        } else if ($rootScope.windowWidth >= 1200 && $rootScope.windowWidth < 1500) {
            $rootScope.currrentViewport = 2;
        } else if ($rootScope.windowWidth >= 1025 && $rootScope.windowWidth < 1200) {
            $rootScope.currrentViewport = 3;
        } else if ($rootScope.windowWidth >= 768 && $rootScope.windowWidth < 1025) {
            $rootScope.currrentViewport = 4;
        } else if ($rootScope.windowWidth >= 480 && $rootScope.windowWidth < 768) {
            $rootScope.currrentViewport = 5;
        } else if ($rootScope.windowWidth < 480) {
            $rootScope.currrentViewport = 6;
        }
        //console.log('$rootScope.windowWidth: ', $rootScope.windowWidth);
        //console.log('$rootScope.currrentViewport: ', $rootScope.currrentViewport);

        if ($rootScope.currrentViewport > 3) {
            $scope.$apply(function () {
                $rootScope.sidebarIsActive = false;
                $rootScope.sidebarIsClosed = true;
            });
            angular.element('.articles-pane-block, .sidebar-controls-app-block').css("right", $rootScope.widthRightSidebar[$rootScope.currrentViewport]);
        } else {
            $scope.$apply(function () {
                $rootScope.sidebarIsActive = true;
                $rootScope.sidebarIsClosed = false;
                $scope.loadNextPost();
            });
            angular.element('.articles-pane-block, .sidebar-controls-app-block').css("right", "0");
        }

        $scope.$apply(function () {
            $rootScope.windowHeight = angular.element(window).height()-angular.element('header').outerHeight();
        });
    };

    /**
     * event listener for scroll on resizable banner in sidebar
     */
    $scope.addWheelEventListener = function(){
        var elem = document.getElementById('sidebar-controls-nav');
        if (elem.addEventListener) {
            if ('onwheel' in document) {
                elem.addEventListener ("wheel", $scope.onWheelAction, false);
            } else if ('onmousewheel' in document) {
                elem.addEventListener ("mousewheel", $scope.onWheelAction, false);
            } else {
                elem.addEventListener ("MozMousePixelScroll", $scope.onWheelAction, false);
            }
        } else {
            elem.attachEvent ("onmousewheel", $scope.onWheelAction);
        }
    };

    /**
     * action on wheel scrolling
     * @param e
     */
    $scope.onWheelAction = function(e){
        e = e || window.event;
        var delta = e.deltaY || e.detail || e.wheelDelta;
        var scrollArticlePaneBlock = angular.element(".articles-pane-block").scrollTop();
        angular.element(".articles-pane-block").scrollTop(scrollArticlePaneBlock+delta);
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    };

    $scope.addWheelEventListener();

}]);