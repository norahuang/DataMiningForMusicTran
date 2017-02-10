psfk4App.controller('postsListController', ['$scope', '$rootScope', '$http', '$sce', function ($scope, $rootScope, $http, $sce) {

    // init start data
    $scope.dataPosts = {
        'posts': [],
        'phpPosts': [],
        'pulse': [],
        'parity': 0,
        'no_results_title_show': false
    };
    $scope.loadingData = false;
    $scope.loadingDataNotEnd = true;
    $scope.currentPage = 2;
    $scope.currentPostType = 'post';
    $scope.currentPostId = 0;
    $scope.currentPostIndex = '';
    $scope.inviewpart = '';
    $scope.positionY = 0;
    $scope.ga_init_removed = false;
    $scope.isSingle = false;
    $scope.loadingNoMore = false;
    $scope.showed_posts_cookie_key = '';
    $scope.showed_category = [[],[]];
    $scope.c_post_php = 0;
    $scope.count_total_results = 0;

    $scope.$on('eventAllFavsMenuHide', function(event, params) {
        for (key in $scope.dataPosts.phpPosts) {
            if ($scope.dataPosts.phpPosts.hasOwnProperty(key)) {
                if ($scope.dataPosts.phpPosts[key].hasOwnProperty('favs_menu')
                    && $scope.dataPosts.phpPosts[key].favs_menu == true) {
                    $scope.dataPosts.phpPosts[key].favs_menu = false;
                }
            }
        }
        for (key in $scope.dataPosts.posts) {
            if ($scope.dataPosts.posts.hasOwnProperty(key)) {
                if ($scope.dataPosts.posts[key].hasOwnProperty('favs_menu')
                    && $scope.dataPosts.posts[key].favs_menu == true) {
                    $scope.dataPosts.posts[key].favs_menu = false;
                }
            }
        }
    });
    $scope.$on('eventAllDocMenuHide', function(event, params) {
        for (key in $scope.dataPosts.phpPosts) {
            if ($scope.dataPosts.phpPosts.hasOwnProperty(key)) {
                if ($scope.dataPosts.phpPosts[key].hasOwnProperty('doc_menu')
                    && $scope.dataPosts.phpPosts[key].doc_menu == true) {
                    $scope.dataPosts.phpPosts[key].doc_menu = false;
                }
            }
        }
        for (key in $scope.dataPosts.posts) {
            if ($scope.dataPosts.posts.hasOwnProperty(key)) {
                if ($scope.dataPosts.posts[key].hasOwnProperty('doc_menu')
                    && $scope.dataPosts.posts[key].doc_menu == true) {
                    $scope.dataPosts.posts[key].doc_menu = false;
                }
            }
        }
    });
    $scope.$on('eventAllShareMenuHide', function(event, params) {
        for (key in $scope.dataPosts.phpPosts) {
            if ($scope.dataPosts.phpPosts.hasOwnProperty(key)) {
                if ($scope.dataPosts.phpPosts[key].hasOwnProperty('share_menu')
                    && $scope.dataPosts.phpPosts[key].share_menu == true) {
                    $scope.dataPosts.phpPosts[key].share_menu = false;
                }
            }
        }
        for (key in $scope.dataPosts.posts) {
            if ($scope.dataPosts.posts.hasOwnProperty(key)) {
                if ($scope.dataPosts.posts[key].hasOwnProperty('share_menu')
                    && $scope.dataPosts.posts[key].share_menu == true) {
                    $scope.dataPosts.posts[key].share_menu = false;
                }
            }
        }
    });
    $scope.$on('eventAllTagExtraMenuHide', function(event, params) {
        for (key in $scope.dataPosts.phpPosts) {
            if ($scope.dataPosts.phpPosts.hasOwnProperty(key)) {
                if ($scope.dataPosts.phpPosts[key].hasOwnProperty('tags_menu')) {
                    for (key_i in $scope.dataPosts.phpPosts[key].tags_menu) {
                        $scope.dataPosts.phpPosts[key].tags_menu[key_i]['menu'] = false;
                    }
                }
            }
        }
    });
    $scope.$on('eventPostTagActionDone', function(event, params) {
        if (typeof params.post_key != "undefined" && typeof params.post_key != "null" &&
            typeof params.tag_id != "undefined" && typeof params.tag_id != "null" ){
            $scope.dataPosts.phpPosts[params.post_key].tags_menu[params.tag_id].loading = false;
            $scope.dataPosts.phpPosts[params.post_key].tags_menu[params.tag_id].action_done = true;
        }
    });

    $scope.$watch("appPhpPosts", function(){
        $scope.dataPosts.phpPosts = $scope.appPhpPosts.phpPosts;
        var post_not_in = [];
        for (key in $scope.dataPosts.phpPosts) {
            post_not_in.push($scope.dataPosts.phpPosts[key].id);
        }
        $scope.showed_posts_cookie_key = $scope.appPhpPosts.showed_posts_cookie_key;
        if ($scope.showed_posts_cookie_key != '' && post_not_in.length > 0) {
            var date_expire = new Date(new Date().getTime() + 60*60 * 1000);
            $rootScope.setCookie('showed_posts_'+$scope.showed_posts_cookie_key, post_not_in);
        }
        $scope.dataPosts.phpPostsSize = 0;
        $scope.showed_category = $scope.appPhpPosts.showed_category;
        var key;
        for (key in $scope.dataPosts.phpPosts) {
            if ($scope.dataPosts.phpPosts.hasOwnProperty(key)) $scope.dataPosts.phpPostsSize++;
        }
        if (typeof $scope.dataPosts.phpPosts != "undefined" && typeof $scope.dataPosts.phpPosts != "null"){
            if (typeof $scope.dataPosts.phpPosts[-1] != "undefined" && typeof $scope.dataPosts.phpPosts[-1] != "null"){
                $rootScope.sponsorAd = {
                    'showAd': ($scope.dataPosts.phpPosts[-1].branded_content)?true:false,
                    'type':$scope.dataPosts.phpPosts[-1].sidebar,
                    'dfp':$scope.dataPosts.phpPosts[-1].sidebar_dfp,
                    'url':$scope.dataPosts.phpPosts[-1].sidebar_url,
                    'image':$scope.dataPosts.phpPosts[-1].sidebar_ad_image.url,
                    'bgColor':$scope.dataPosts.phpPosts[-1].sidebar_color
                };
            }
        }
        if (typeof $scope.appParams.pw_post_access != "undefined" &&
            typeof $scope.appParams.pw_post_access != "null" &&
            $scope.appParams.pw_post_access == 0){
            var pw_popup_key = '/page/paid_membership_required';
            if (typeof $scope.appParams.pw_popup_key != "undefined" &&
                typeof $scope.appParams.pw_popup_key != "null" &&
                $scope.appParams.pw_popup_key != '') {
                pw_popup_key = $scope.appParams.pw_popup_key;
            }
            $rootScope.getShowOffer(pw_popup_key);
        }
    });

    $scope.startUrl = window.location.href;
    $scope.startTitle = angular.element('title').text();

    $scope.gpt_ad = angular.element('.div-gpt-ad-1').html();

    /**
     * infinite scroll loading data
     */
    $scope.loadNextPost = function() {
        //console.log('loadNextPost;');
        if (!$scope.loadingData && !$scope.loadingNoMore) {
            $scope.loadingData = true;
            var params = {
                json: 'get_recent_posts',
                count: $scope.postperpage,
                page: $scope.currentPage
            };
            if (typeof $scope.appParams != "undefined" && typeof $scope.appParams != "null"){
                if (typeof $scope.appParams.before != "undefined" && typeof $scope.appParams.before != "null" && $scope.appParams.before != ''){
                    params.before = $scope.appParams.before;
                }
                if (typeof $scope.appParams.post_not_id != "undefined" && typeof $scope.appParams.post_not_id != "null" && $scope.appParams.post_not_id > 0){
                    params.post_not_id = $scope.appParams.post_not_id;
                }
                if (typeof $scope.appParams.taxonomy != "undefined" && typeof $scope.appParams.taxonomy != "null" && $scope.appParams.taxonomy != ''){
                    params.taxonomy = $scope.appParams.taxonomy;
                }
                if (typeof $scope.appParams.tax_type != "undefined" && typeof $scope.appParams.tax_type != "null" && $scope.appParams.tax_type != ''){
                    params.tax_type = $scope.appParams.tax_type;
                }
                if (typeof $scope.appParams.post_type != "undefined" && typeof $scope.appParams.post_type != "null" && $scope.appParams.post_type != ''){
                    params.post_type = $scope.appParams.post_type;
                }
                if (typeof $scope.appParams.author_id != "undefined" && typeof $scope.appParams.author_id != "null" && $scope.appParams.author_id > 0){
                    params.author_id = $scope.appParams.author_id;
                }
                /*if (typeof $scope.appParams.pw_type != "undefined" && typeof $scope.appParams.pw_type != "null" && $scope.appParams.pw_type > 0){
                 params.pw_type = $scope.appParams.pw_type;
                 }*/
            }
            $http({
                method: 'GET',
                url: $scope.api,
                params: params
            }).success(function(data, status, headers, config) {
                if (typeof data.posts != "null" &&
                    typeof data.posts != "undefined" &&
                    data.posts != "null" &&
                    data.posts != "" &&
                    data.posts != null){
                    if (data.posts.length>0){
                        for (var i = 0; i < data.posts.length; i++) {

                            data.posts[i].content = $sce.trustAsHtml(data.posts[i].content);
                            data.posts[i].excerpt = $sce.trustAsHtml(data.posts[i].excerpt);
                            data.posts[i].pdf_url = '/print-post?format=pdf&id='+data.posts[i].id;
                            data.posts[i].ppt_url = '/print-post?format=ppt&id='+data.posts[i].id;
                            $scope.dataPosts.posts.push(data.posts[i]);
                            if (i == data.posts.length-1){
                                $scope.loadingData = false;
                                $scope.currentPage += 1;
                                FB.XFBML.parse(angular.element('.content-posts')[0]);
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
                    $scope.loadingDataNotEnd = true;
                    $scope.loadingNoMore = true;
                    $scope.loadingData = false;
                }
            }).error(function(data, status, headers, config) {
            });
        }
    };

    /**
     * for video block: showing video object when clicking on the thumbnail
     * @param post
     */
    $scope.showVideo = function(post) {
        for (var i = $scope.dataPosts.posts.length; i > 0 ; i -= 1 ){
            if ($scope.dataPosts.posts[i-1].is_video &&
                typeof $scope.dataPosts.posts[i-1].video_content != "undefined" &&
                typeof $scope.dataPosts.posts[i-1].video_content != "null" &&
                $scope.dataPosts.posts[i-1].video_content.play) {
                $scope.dataPosts.posts[i-1].video_content.play = false;
                $scope.dataPosts.posts[i-1].video_content.show = $scope.dataPosts.posts[i-1].video_content.image;
            }
        }
        if (!post.video_content.play) {
            post.video_content.play = true;
            post.video_content.show = $sce.trustAsHtml(post.video_content.video);
        }
    };

    /**
     * expand (show) full content of post
     * @param post
     */
    $scope.expandPostContent = function(post) {
        post.expandcontent = true;
        FB.XFBML.parse(angular.element('.post-item-content-'+post.id)[0]);
    };

    $scope.gallerySlideShow = function(postId, slideId){
        angular.element(".content-block").stop().animate({
            scrollTop: angular.element(".post-item-id-"+postId).offset().top+100
        }, 500);
    };

    $scope.loadMoreHomepagePosts = function (options) {
        if (!$scope.loadingData) {
            $scope.loadingData = true;
            var http_option = {
                method: 'GET',
                url: $scope.api,
                params: {
                    json: 'get_homepage_posts',
                    count: $scope.postperpage,
                    page: $scope.currentPage,
                    showed_posts_cookie_key: $scope.showed_posts_cookie_key,
                    memcached_enabled: 0
                }
            };
            if (typeof $scope.appParams.before != "undefined" && typeof $scope.appParams.before != "null" && $scope.appParams.before != ''){
                http_option.params.before = $scope.appParams.before;
            }
            if (typeof $scope.appParams.post_not_id != "undefined" && typeof $scope.appParams.post_not_id != "null" && $scope.appParams.post_not_id > 0){
                http_option.params.post_not_id = $scope.appParams.post_not_id;
            }
            if (typeof $scope.appParams.taxonomy != "undefined" && typeof $scope.appParams.taxonomy != "null" && $scope.appParams.taxonomy != ''){
                http_option.params.taxonomy = $scope.appParams.taxonomy;
            }
            if (typeof $scope.appParams.tax_type != "undefined" && typeof $scope.appParams.tax_type != "null" && $scope.appParams.tax_type != ''){
                http_option.params.tax_type = $scope.appParams.tax_type;
            }
            if (typeof $scope.appParams.author_id != "undefined" && typeof $scope.appParams.author_id != "null" && $scope.appParams.author_id > 0){
                http_option.params.author_id = $scope.appParams.author_id;
            }
            if (typeof $scope.appParams.count_total_results != "undefined" &&
                typeof $scope.appParams.count_total_results != "null" &&
                $scope.appParams.count_total_results > 0 &&
                $scope.count_total_results == 0){
                $scope.count_total_results = $scope.appParams.author_id;
            }
            if (typeof options.page != "undefined" && typeof options.page != "null" && options.page != ''){
                switch (options.page) {
                    case 'tag':
                        http_option.params.json = 'get_recent_posts';
                        break;
                    case 'search':
                        delete http_option.params.json;
                        http_option.method = 'POST';
                        http_option.data = {
                            'action': 'get_search_result_posts_json',
                            'count': $scope.postperpage,
                            'page': $scope.currentPage,
                            'showed_posts_cookie_key': $scope.showed_posts_cookie_key
                        };
                        http_option.dataType = 'json';
                        delete http_option.params;
                        // get search query:
                        var query = window.location.search.substring(1);
                        var vars = query.split("&");
                        for (var i=0;i<vars.length;i++) {
                            var pair = vars[i].split("=");
                            if (pair[0] == 's') {
                                http_option.data.s = decodeURIComponent(pair[1]);
                            } else if (pair[0] == 'search_sortby' && pair[1] == 'date') {
                                http_option.data.search_sortby = 'date';
                            }
                        }
                        http_option.data = Object.keys(http_option.data).map(function(k) {
                            return encodeURIComponent(k) + '=' + encodeURIComponent(http_option.data[k])
                        }).join('&');
                        http_option.headers = {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        };
                        http_option.url = MyAjax.ajaxurl;
                        break;
                }
            }
            if ($scope.dataPosts.posts.length == 0) {
                for (key in $scope.dataPosts.phpPosts) {
                    if ($scope.dataPosts.phpPosts[key].is_pulse == 0) {
                        $scope.c_post_php++;
                    }
                }
                $scope.dataPosts.parity = 0;
                if ($scope.c_post_php % 2) {
                    $scope.dataPosts.parity = 1;
                }
            }
            $http(http_option).success(function(data, status, headers, config) {
                if (typeof data.posts != "null" &&
                    typeof data.posts != "undefined" &&
                    data.posts != "null" &&
                    data.posts != "" &&
                    data.posts != null){
                    if (data.posts.length>0){
                        var found = false;
                        if ( typeof $scope.showed_category[1] == "undefined" || typeof $scope.showed_category[1] == "null" ) {
                            $scope.showed_category[1] = [];
                        }
                        if ( typeof $scope.showed_category[2] == "undefined" || typeof $scope.showed_category[2] == "null" ) {
                            $scope.showed_category[2] = [];
                        }
                        for (var i = 0; i < data.posts.length; i++) {
                            data.posts[i].excerpt = $sce.trustAsHtml(data.posts[i].excerpt);

                            if (data.posts[i].is_pulse == 1){
                                $scope.dataPosts.pulse.push(data.posts[i]);
                            } else {
                                data.posts[i].category_show_id = 0;
                                for (var cat_key in data.posts[i].categories) {
                                    found = false;
                                    for (key in $scope.showed_category[1]) {
                                        if (data.posts[i].categories[cat_key].id == $scope.showed_category[1][key]) {
                                            found = true;
                                        }
                                    }
                                    if (found == false) {
                                        $scope.showed_category[1].push(data.posts[i].categories[cat_key].id);
                                        data.posts[i].category_show_id = data.posts[i].categories[cat_key].id;
                                        data.posts[i].category_show_key = cat_key;
                                    }
                                }
                                if (data.posts[i].category_show_id == 0) {
                                    for (var cat_key in data.posts[i].categories) {
                                        found = false;
                                        for (key in $scope.showed_category[2]) {
                                            if (data.posts[i].categories[cat_key].id == $scope.showed_category[2][key]) {
                                                found = true;
                                            }
                                        }
                                        if (found == false) {
                                            $scope.showed_category[2].push(data.posts[i].categories[cat_key].id);
                                            data.posts[i].category_show_id = data.posts[i].categories[cat_key].id;
                                            data.posts[i].category_show_key = cat_key;
                                        }
                                    }
                                }
                                if (data.posts[i].category_show_id == 0) {
                                    $scope.showed_category[1] = $scope.showed_category[2];
                                    $scope.showed_category[2] = [];
                                    data.posts[i].category_show_id = data.posts[i].categories[0].id;
                                    data.posts[i].category_show_key = 0;
                                }
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
                                $scope.currentPage += 1;
                            }
                        }
                    }
                    if (options.page == 'search') {
                        if ($scope.count_total_results <= $scope.dataPosts.posts.length + $scope.dataPosts.pulse.length + $scope.c_post_php) {
                            $scope.loadingNoMore = true;
                        }
                    } else {
                        if (data.count_total <= $scope.dataPosts.posts.length + $scope.dataPosts.pulse.length + $scope.c_post_php) {
                            $scope.loadingNoMore = true;
                        }
                    }
                } else {
                    $scope.loadingNoMore = true;
                }

                $scope.loadingData = false;
            }).error(function(data, status, headers, config) {
                $scope.loadingData = false;
            });
        }
    };

    $scope.togglePostTagsMenu = function (post_i, tags_id) {
        if (typeof post_i == "undefined" || typeof post_i == "null" ||
            typeof tags_id == "undefined" || typeof tags_id == "null") {
            return;
        }
        $scope.dataPosts.phpPosts[post_i].tags_menu[tags_id].action_done = false;
        if ($scope.dataPosts.phpPosts[post_i].tags_menu[tags_id].menu){
            $scope.dataPosts.phpPosts[post_i].tags_menu[tags_id].menu = false;
        } else {
            $rootScope.hideAllTagExtraMenu();
            $scope.dataPosts.phpPosts[post_i].tags_menu[tags_id].menu = true;
        }
        return false;
    };

    $scope.createTagAlert = function (tag, taxonomy, post_key, tag_id) {
        if ($scope.dataPosts.phpPosts[post_key].tags_menu[tag_id].loading){
            $scope.dataPosts.phpPosts[post_key].tags_menu[tag_id].loading = false;
        } else {
            $scope.dataPosts.phpPosts[post_key].tags_menu[tag_id].loading = true;
        }
        $scope.dataPosts.phpPosts[post_key].tags_menu[tag_id].action_done = false;
        $rootScope.$broadcast('eventÑreateTagAlert', {
            tag: tag,
            taxonomy: taxonomy,
            post_key: post_key,
            tag_id: tag_id
        });
    };

    $scope.createTagFavFolder = function (tag, taxonomy, post_key, tag_id) {
        if ($scope.dataPosts.phpPosts[post_key].tags_menu[tag_id].loading){
            $scope.dataPosts.phpPosts[post_key].tags_menu[tag_id].loading = false;
        } else {
            $scope.dataPosts.phpPosts[post_key].tags_menu[tag_id].loading = true;
        }
        $scope.dataPosts.phpPosts[post_key].tags_menu[tag_id].action_done = false;
        $rootScope.$broadcast('eventÑreateTagFolder', {
            tag: tag,
            taxonomy: taxonomy,
            post_key: post_key,
            tag_id: tag_id
        });
    };

}]);