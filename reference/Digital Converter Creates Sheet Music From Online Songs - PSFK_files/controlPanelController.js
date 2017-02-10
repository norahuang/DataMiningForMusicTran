psfk4App.controller('controlPanelController', ['$scope', '$rootScope', '$http', '$sce', function ($scope, $rootScope, $http, $sce) {
    $scope.loadingAll = true;
    $scope.titleLength = 20;
    $scope.descriptionLength = 130;
    $scope.loadingBlocks = {
        'watchlist': true,
        'alerts': true,
        'folders': true,
        'shared': true
    };
    $scope.newTagItem = {
        'id': Math.random().toString(36).substr(2)+'-tag-item',
        'title': ''
    };
    $scope.newTagItemVal = '';
    $scope.newWatchItem = {
        'id': 'not_saved',
        't_id': Math.random().toString(36).substr(2)+'-watch-list',
        'title': '',
        'description': '',
        'tags': [],
        'status': 'edit',
        'a_id': 0,
        'loading': 0,
        'search_method': 'containing',
        'alert': {
            'period': 'daily'
        }
    };
    $scope.cacheTagSearch = {};
    $scope.download_control_status = {
        'id':0,
        'status': 0,
        'type': ''
    };
    $scope.alert_control_status = {
        'id':0,
        'status': 0
    };
    $scope.download_control_timeout = false;
    $scope.alert_control_timeout = false;

    setTimeout(function(){
        try {
            googletag.display("div-gpt-ad-1418270738409-0");
            if (angular.element(".advert-banner-slot-2").length > 0) {
                googletag.pubads().refresh([slot2]);
            }
        } catch (_) {}
    }, 1000);

    // init start data
    $scope.dataPosts = {
        'posts': [],
        'phpPosts': [],
        'phpPostsPulse': []
    };
    $scope.$watch("appPhpPostsPulse", function(){
        $scope.dataPosts.phpPostsPulse = $scope.appPhpPostsPulse;
        $scope.dataPosts.phpPostsPulseSize = 0;
        var key;
        for (key in $scope.dataPosts.phpPostsPulse) {
            if ($scope.dataPosts.phpPostsPulse.hasOwnProperty(key)) $scope.dataPosts.phpPostsPulseSize++;
        }
    });

    $scope.$on('eventAllFavsMenuHide', function(event, params) {
        for (key in $scope.dataPosts.phpPostsPulse) {
            if ($scope.dataPosts.phpPostsPulse.hasOwnProperty(key)) {
                if ($scope.dataPosts.phpPostsPulse[key].hasOwnProperty('favs_menu')
                    && $scope.dataPosts.phpPostsPulse[key].favs_menu == true) {
                    $scope.dataPosts.phpPostsPulse[key].favs_menu = false;
                }
            }
        }
    });
    $scope.$on('eventÑreateTagAlert', function(event, params) {
        $scope.newWatchItemClear();
        $scope.newWatchItem.tags.push({
            'id': Math.random().toString(36).substr(2)+'-tag-item',
            'title': params.tag
        });
        $scope.newWatchItem.search_method = 'tagged';
        $scope.controlAction('search_tags', 'create_alert', {
            event_param: {
                post_key: params.post_key,
                tag_id: params.tag_id
            }
        })
    });
    $scope.$on('eventÑreateTagFolder', function(event, params) {
        $scope.controlAction('folders', 'create', {
            item: {
                title: params.tag
            },
            event_param: {
                post_key: params.post_key,
                tag_id: params.tag_id
            },
            is_create_folder_favs_content: 1
        });
    });
    /**
     * Functions
     */

    /**
     * Init Functions: get member data or another init actions
     */
    $scope.init = function() {
        if ($rootScope.memberData == ''){
            $http({
                method: 'GET',
                url: $scope.api,
                params: {
                    'memcached_enabled': 0,
                    'json': 'get_member_control_options'
                }
            }).success(function(data, status, headers, config) {
                $rootScope.memberData = data.data;
                setTimeout(function(){
                    $scope.getCurrentWatchlist();
                }, 2000);
                $scope.loadingAll = false;

                setInterval(function(){
                    $scope.getFavoritesUpdates();
                }, 60000);

            }).error(function(data, status, headers, config) {
            });
        }
    };

    $scope.getFavoritesUpdates = function(){
        $http({
            method: 'GET',
            url: $scope.api,
            params: {
                'memcached_enabled': 0,
                'json': 'get_member_favorites_actual_state'
            }
        }).success(function(data, status, headers, config) {
            if (typeof data.result != "undefined" &&
                typeof data.result != "null" &&
                typeof data.result.data != "undefined" &&
                typeof data.result.data != "null" &&
                data.result.data != '') {
                $rootScope.memberData.folders = data.result.data;
            }
        }).error(function(data, status, headers, config) {
        });
    };

    $scope.getCurrentWatchlist = function(){
        var url = window.location.href;
        var url_a = url.split('/')
        if (url_a[3] != 'tag') {
            var name = "s".replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if(!results || !results[2]) {
                return true;
            }
        }
        var current_watchlist = $rootScope.getCookie('current_watchlist');
        if (current_watchlist != null && current_watchlist != undefined &&
            current_watchlist != ''){
            current_watchlist = JSON.parse($rootScope.Base64.decode(current_watchlist));
            if (current_watchlist.id == 'not_saved'){
                $scope.$apply(function () {
                    $scope.newWatchItem = current_watchlist;
                });
            } else {
                current_watchlist.id = parseInt(current_watchlist.id);
                if (current_watchlist.id > 0) {
                    $scope.$apply(function () {
                        angular.forEach($rootScope.memberData.watchlist, function (value, key) {
                            if (value.id == current_watchlist.id) {
                                value.status = 'show';
                            }
                        });
                    });
                }
            }
        }
    };

    /**
     * Action Function: one function for all actions
     */
    $scope.controlAction = function(model, action, options){
        if (typeof action == "undefined" || typeof action == "null" || action == null ||
            action == undefined || action == ''){
            action = '';
        }
        if (typeof model != "undefined" && typeof model != "null" && model != null &&
            model != undefined && model != ''){
            switch(model) {
                case 'search_tags':
                    switch(action) {
                        case 'add':
                            if ($scope.newTagItemVal.title != null && $scope.newTagItemVal.title != undefined &&
                                $scope.newTagItemVal.title != ''){
                                $scope.newTagItem.title = $scope.newTagItemVal.title;
                            } else if ($scope.newTagItemVal != null && $scope.newTagItemVal != undefined &&
                                $scope.newTagItemVal != ''){
                                $scope.newTagItem.title = $scope.newTagItemVal;
                            }
                            if ($scope.newTagItem.title != null && $scope.newTagItem.title != undefined &&
                                $scope.newTagItem.title != ''){
                                $scope.newTagItem.title = $scope.newTagItem.title.trim();
                                var insert = true;
                                var titles = [];
                                if ($scope.newTagItem.title.indexOf(',') > -1){
                                    titles = $scope.newTagItem.title.split(',');
                                    angular.forEach(titles, function(value_t, key) {
                                        value_t = value_t.trim();
                                        insert = true;
                                        if (value_t != ''){
                                            angular.forEach($scope.newWatchItem.tags, function(value, key) {
                                                if (value.title == value_t){
                                                    insert = false;
                                                }
                                            });
                                        } else {
                                            insert = false;
                                        }
                                        if (insert) {
                                            $scope.newWatchItem.tags.push({
                                                'id': Math.random().toString(36).substr(2)+'-tag-item',
                                                'title': value_t
                                            });
                                        }
                                    });
                                    insert = false;
                                } else {
                                    if ($scope.newTagItem.title != '') {
                                        angular.forEach($scope.newWatchItem.tags, function (value, key) {
                                            if (value.title == $scope.newTagItem.title) {
                                                insert = false;
                                            }
                                        });
                                    } else {
                                        insert = false;
                                    }
                                }
                                if (insert) {
                                    $scope.newWatchItem.tags.push($scope.newTagItem);
                                }
                                $scope.newTagItemClear();
                            }
                            break;

                        case "actionover" :
                            break;
                        case 'delete':
                            angular.forEach($scope.newWatchItem.tags, function(value, key) {
                                if (value.id == options.tag_id){
                                    $scope.newWatchItem.tags.splice(key, 1);
                                }
                            });
                            break;
                        case 'run':
                            if ($rootScope.memberData.restrictions.search !== false) {
                                if ($scope.newTagItemVal.title != null && $scope.newTagItemVal.title != undefined &&
                                    $scope.newTagItemVal.title != ''){
                                    $scope.newTagItem.title = $scope.newTagItemVal.title;
                                } else if ($scope.newTagItemVal != null && $scope.newTagItemVal != undefined &&
                                    $scope.newTagItemVal != ''){
                                    $scope.newTagItem.title = $scope.newTagItemVal;
                                }
                                if ($scope.newTagItem.title != ''){
                                    $scope.controlAction('search_tags', 'add', {});
                                }
                                if (typeof $scope.newWatchItem.tags != "undefined" &&
                                    typeof $scope.newWatchItem.tags != "null" &&
                                    $scope.newWatchItem.tags != null &&
                                    $scope.newWatchItem.tags != undefined &&
                                    $scope.newWatchItem.tags != '') {
                                    // ver 1 start
                                    //$rootScope.runSearchPostWatchlist = $scope.newWatchItem;
                                    //$rootScope.runSearchPostCP = true;
                                    //$rootScope.$broadcast('eventRunSearchControlPanel', {});
                                    // ver 1 end

                                    // ver 2 start
                                    if (!Array.isArray) {
                                        Array.isArray = function(arg) {
                                            return Object.prototype.toString.call(arg) === '[object Array]';
                                        };
                                    }
                                    if (typeof $scope.newWatchItem.tags != "undefined" &&
                                        typeof $scope.newWatchItem.tags != "null" &&
                                        $scope.newWatchItem.tags != null &&
                                        $scope.newWatchItem.tags != undefined &&
                                        $scope.newWatchItem.tags != '' &&
                                        Array.isArray($scope.newWatchItem.tags)){
                                        $rootScope.setCookie('current_watchlist', $rootScope.Base64.encode(JSON.stringify($scope.newWatchItem)));
                                        var tags_string = '';
                                        $scope.newWatchItem.tags.forEach(function(val, idx, array) {
                                            if (tags_string !== '') {
                                                tags_string += '+';
                                            }
                                            tags_string += val.title;
                                        });
                                        if (tags_string !== '') {
                                            tags_string = encodeURI(tags_string);
                                            tags_string = tags_string.replace(/#/g, '%23');
                                            window.location.assign('/?s='+tags_string+'&search_sortby=date');
                                        }
                                    }
                                    // ver 2 end
                                }
                            }
                            break;
                        case 'create_alert':
                            if ($scope.newWatchItem.loading != 1 && $scope.newWatchItem.tags.length > 0) {
                                $scope.hidingModel('watchlist');
                                $scope.hidingModel('alerts');
                                $scope.newWatchItem.loading = 1;
                                $scope.newWatchItem.tags.forEach(function(val, idx, array) {
                                    if ($scope.newWatchItem.title !== '') {
                                        $scope.newWatchItem.title += ' ';
                                    }
                                    $scope.newWatchItem.title += val.title;
                                });
                                $scope.newWatchItem.status = 'show';
                                $rootScope.memberData.watchlist.push($scope.newWatchItem);
                                if (typeof options.event_param == "undefined" ||
                                    typeof options.event_param == "null") {
                                    options.event_param = {};
                                }
                                $scope.controlAction('watchlist', 'save', {
                                    'item': $scope.newWatchItem,
                                    'is_create_watchlist_alert': 1,
                                    'event_param': options.event_param
                                });
                            }
                            break;
                    }
                    break;
                case 'watchlist':
                    switch(action) {
                        case 'show':
                            if ($rootScope.memberData.restrictions.watchlist.display){
                                $scope.hidingModel('alerts');
                                $scope.hidingModel('folders');
                                $scope.hidingModel('shared');
                                var showingAnother = $scope.hidingModel('watchlist');
                                if (options.item.status == 'list' && showingAnother){
                                    //options.item.status = 'show';
                                    $scope.controlAction('watchlist', 'run', {'item': options.item});
                                }
                            }
                            break;
                        case 'edit':
                            if ($rootScope.memberData.restrictions.watchlist.edit) {
                                options.item.status = 'edit';
                            }
                            break;
                        case 'create':
                            if ($rootScope.memberData.restrictions.watchlist.edit && $scope.newWatchItem.loading != 1) {
                                if ($rootScope.memberData.watchlist == '' || $rootScope.memberData.watchlist == null) {
                                    $rootScope.memberData.watchlist = [];
                                } else {
                                    angular.forEach($rootScope.memberData.watchlist, function (value, key) {
                                        if (value.title != '') {
                                            value.status = 'list';
                                        }
                                    });
                                }
                                if ($scope.newWatchItem.title.length > $scope.titleLength){
                                    $scope.newWatchItem.title = $scope.newWatchItem.title.substring(0, $scope.titleLength);
                                }
                                if ($scope.newWatchItem.description.length > $scope.descriptionLength){
                                    $scope.newWatchItem.description = $scope.newWatchItem.description.substring(0, $scope.descriptionLength);
                                }
                                $rootScope.memberData.watchlist.push($scope.newWatchItem);
                                $scope.newWatchItemClear();
                            }
                            break;
                        case "close" :
                            if (options.item.status == "edit") {
                                //$rootScope.setCookie('current_watchlist', '');
                                options.item.status = 'show';
                            }
                            break;
                        case 'save':
                            if ($rootScope.memberData.restrictions.watchlist.edit) {
                                if (options.item.title == '') {
                                    return false;
                                } else {
                                    if (options.item.title.length > $scope.titleLength){
                                        options.item.title = options.item.title.substring(0, $scope.titleLength);
                                    }
                                    if (options.item.description.length > $scope.descriptionLength){
                                        options.item.description = options.item.description.substring(0, $scope.descriptionLength);
                                    }
                                    if (typeof options.event_param == "undefined" ||
                                        typeof options.event_param == "null") {
                                        options.event_param = {};
                                    }
                                    $scope.controlActionServer('watchlist', 'save_item', {
                                        'item': options.item,
                                        'is_create_watchlist_alert': options.is_create_watchlist_alert,
                                        'event_param': options.event_param
                                    });
                                }
                                $rootScope.setCookie('current_watchlist', '');
                                options.item.status = 'list';
                            }
                            break;
                        case 'tag_delete':
                            if ($rootScope.memberData.restrictions.watchlist.edit) {
                                angular.forEach(options.item.tags, function (value, key) {
                                    if (value.id == options.tag_id) {
                                        options.item.tags.splice(key, 1);
                                    }
                                });
                                if (options.item.status == 'show') {
                                    options.item.status = 'edit';
                                }
                            }
                            break;


                        case "actionover" :

                            if (typeof options.item.alert != "undefined" &&
                                typeof options.item.alert != "null" &&
                                options.item.alert != null &&
                                options.item.alert != undefined &&
                                options.item.alert != '') {

                                options.item.alert.control = 0;
                            }

                            if(typeof options.item.download != "undefined" &&
                                typeof options.item.download != "null" &&
                                options.item.download != null &&
                                options.item.download != undefined &&
                                options.item.download != '') {
                                options.item.download.control = 0;
                            }

                            break;
                        case 'delete':
                            if ($rootScope.memberData.restrictions.watchlist.edit) {
                                angular.forEach($rootScope.memberData.watchlist, function (value, key) {
                                    if (value.id == options.item.id) {
                                        $rootScope.memberData.watchlist.splice(key, 1);
                                        if (typeof options.ignor_server == "undefined" ||
                                            typeof options.ignor_server == "null" ||
                                            options.ignor_server == null ||
                                            options.ignor_server == undefined ||
                                            options.ignor_server == '') {
                                            options.ignor_server = '';
                                        }
                                        if (options.ignor_server == '') {
                                            $scope.controlActionServer('watchlist', 'delete_item', {'item': options.item});
                                        }
                                    }
                                });
                            }
                            break;
                        case 'run':
                            if ($rootScope.memberData.restrictions.search) {
                                if (typeof options.item.tags != "undefined" &&
                                    typeof options.item.tags != "null" &&
                                    options.item.tags != null &&
                                    options.item.tags != undefined &&
                                    options.item.tags != ''){
                                    // ver 1 start
                                    //$rootScope.runSearchPostWatchlist = options.item;
                                    //$rootScope.runSearchPostCP = true;
                                    //$rootScope.$broadcast('eventRunSearchControlPanel', {'item': options.item});
                                    // ver 1 end

                                    // ver 2 start
                                    if (!Array.isArray) {
                                        Array.isArray = function(arg) {
                                            return Object.prototype.toString.call(arg) === '[object Array]';
                                        };
                                    }
                                    if (typeof options.item.tags != "undefined" &&
                                        typeof options.item.tags != "null" &&
                                        options.item.tags != null &&
                                        options.item.tags != undefined &&
                                        options.item.tags != '' &&
                                        Array.isArray(options.item.tags)){
                                        $rootScope.setCookie('current_watchlist', $rootScope.Base64.encode(JSON.stringify(options.item)));
                                        var tags_string = '';
                                        options.item.tags.forEach(function(val, idx, array) {
                                            if (tags_string !== '') {
                                                tags_string += '+';
                                            }
                                            tags_string += val.title;
                                        });
                                        if (typeof options.item.additional != "undefined" &&
                                            typeof options.item.additional != "null" &&
                                            options.item.additional != null &&
                                            options.item.additional != undefined) {
                                            if (typeof options.item.additional.type != "undefined" &&
                                                typeof options.item.additional.type != "null" &&
                                                typeof options.item.additional.url != "undefined" &&
                                                typeof options.item.additional.url != "null" &&
                                                options.item.additional.type == 'tagged' &&
                                                options.item.additional.url !== '') {
                                                window.location.assign('/tag/'+options.item.additional.url);
                                            }
                                        } else if (tags_string !== '') {
                                            tags_string = encodeURI(tags_string);
                                            tags_string = tags_string.replace(/#/g, '%23');
                                            window.location.assign('/?s='+tags_string+'&search_sortby=date');
                                        }
                                    }
                                    // ver 2 end
                                }
                            }
                            break;
                    }
                    break;
                case 'alerts':
                    switch(action) {
                        case 'show':
                            if ($rootScope.memberData.restrictions.alerts.display && $rootScope.memberData.restrictions.alerts.edit) {
                                $scope.hidingModel('watchlist');
                                $scope.hidingModel('alerts');
                                $scope.hidingModel('folders');
                                $scope.hidingModel('shared');

                                if (options.item.show == 'list') {
                                    options.item.show = 'edit';
                                }
                            }
                            break;
                        case 'create':
                            if ($rootScope.memberData.restrictions.alerts.edit &&
                                $rootScope.memberData.restrictions.watchlist.edit) {
                                var timestamp = new Date().getTime();
                                var period = 'daily';
                                if (typeof options.item.alert != "undefined" &&
                                    typeof options.item.alert != "null" &&
                                    typeof options.item.alert.period != "undefined" &&
                                    typeof options.item.alert.period != "null" &&
                                    options.item.alert.period != null &&
                                    options.item.alert.period != undefined &&
                                    options.item.alert.period != '') {
                                    period = options.item.alert.period;
                                }
                                var newAlert = {
                                    'id': 'not_saved',
                                    't_id': Math.random().toString(36).substr(2) + '-' + timestamp.toString(),
                                    'watchlist_id': options.item.id,
                                    'title': options.item.title,
                                    'type': true,
                                    'period': period,
                                    'status': 'list',
                                    'show': 'list'
                                };
                                if ($rootScope.memberData.alerts == '' || $rootScope.memberData.alerts == null) {
                                    $rootScope.memberData.alerts = [];
                                } else {
                                    angular.forEach($rootScope.memberData.alerts, function (value, key) {
                                        value.show = 'list';
                                    });
                                }
                                $rootScope.memberData.alerts.push(newAlert);
                                //$scope.controlAction('watchlist', 'delete', {'item': options.item, 'ignor_server': 1});
                                if (typeof options.event_param == "undefined" ||
                                    typeof options.event_param == "null") {
                                    options.event_param = {};
                                }
                                $scope.controlActionServer('alerts', 'save_item', {
                                    'item': newAlert,
                                    'is_create_watchlist_alert': options.is_create_watchlist_alert,
                                    'event_param': options.event_param
                                });
                            }
                            break;
                        case 'delete':
                            if ($rootScope.memberData.restrictions.alerts.edit) {
                                angular.forEach($rootScope.memberData.alerts, function (value, key) {
                                    if (value.id == options.item.id) {
                                        $scope.controlActionServer('alerts', 'delete_item', {'item': options.item});
                                        $rootScope.memberData.alerts.splice(key, 1);
                                    }
                                });
                            }
                            break;
                        case 'switch_period':
                            if ($rootScope.memberData.restrictions.alerts.edit) {
                                if (options.item.period == 'daily') {
                                    options.item.period = 'weekly';
                                } else {
                                    options.item.period = 'daily';
                                }
                                $scope.controlActionServer('alerts', 'save_item', {'item': options.item});
                            }
                            break;
                        case 'switch_on_off':
                            if ($rootScope.memberData.restrictions.alerts.edit) {
                                if (options.item.status == 'list') {
                                    options.item.type = false;
                                    options.item.status = 'disable';
                                } else if (options.item.status == 'disable') {
                                    options.item.type = true;
                                    options.item.status = 'list';
                                }
                                $scope.controlActionServer('alerts', 'save_item', {'item': options.item});
                            }
                            break;
                    }
                    break;
                case 'folders':
                    switch(action) {
                        case 'show':
                            if ($rootScope.memberData.restrictions.folders.display) {
                                $scope.hidingModel('watchlist');
                                $scope.hidingModel('alerts');
                                $scope.hidingModel('folders');
                                $scope.hidingModel('shared');

                                if (options.item.show == 'list') {
                                    options.item.show = 'show';
                                    $scope.controlAction('folders', 'run', {'item': options.item});
                                }
                            }
                            break;
                        case 'edit':
                            if ($rootScope.memberData.restrictions.folders.display) {
                                $scope.hidingModel('watchlist');
                                $scope.hidingModel('alerts');
                                $scope.hidingModel('folders');
                                $scope.hidingModel('shared');

                                options.item.show = 'edit';
                            }
                            break;
                        case 'delete':
                            if ($rootScope.memberData.restrictions.folders.edit) {
                                angular.forEach($rootScope.memberData.folders, function (value, key) {
                                    if (value.id == options.item.id) {
                                        $scope.controlActionServer('folders', 'delete_item', {'item': options.item});
                                        $rootScope.memberData.folders.splice(key, 1);
                                    }
                                });
                            }
                            break;
                        case 'run':
                            if ($rootScope.memberData.restrictions.search) {
                                $scope.hidingModel('watchlist');
                                $scope.hidingModel('alerts');
                                $scope.hidingModel('folders');
                                $scope.hidingModel('shared');
                                if (options.item.show == 'list') {
                                    options.item.show = 'show';
                                }
                                $rootScope.runSearchPostFolder = options.item;
                                $rootScope.runSearchPostCP = true;
                                $rootScope.$broadcast('eventRunFolderControlPanel', {'item': options.item});
                            }
                            break;
                        case 'save':
                            //console.log('options.item.title: ', options.item.title);
                            if ($rootScope.memberData.restrictions.folders.edit) {
                                if (options.item.title == '') {
                                    return false;
                                } else {
                                    $scope.controlActionServer('folders', 'save_item', {'item': options.item});
                                }
                                options.item.show = 'list';
                            }
                            break;
                        case 'create':
                            if ($rootScope.memberData.restrictions.folders.edit) {
                                var newFolder = {
                                    'id': 'not_saved',
                                    'title': options.item.title,
                                    'count_favs': 0,
                                    'show': 'list'
                                };
                                if ($rootScope.memberData.folders == '' || $rootScope.memberData.folders == null) {
                                    $rootScope.memberData.folders = [];
                                }
                                $rootScope.memberData.folders.push(newFolder);
                                if (typeof options.event_param == "undefined" ||
                                    typeof options.event_param == "null") {
                                    options.event_param = {};
                                }
                                $scope.controlActionServer('folders', 'save_item', {
                                    'item': newFolder,
                                    'is_create_folder_favs_content': options.is_create_folder_favs_content,
                                    'event_param': options.event_param
                                });
                            }
                            break;
                        case "actionover" :
                            if(typeof options.item.alert != "undefined" && typeof options.item.alert != "null" &&
                                options.item.alert != undefined && options.item.alert != null && options.item.alert) {
                                options.item.alert.control = 0;
                            }
                            if(typeof  options.item.download != "undefined" && typeof options.item.download != "null" &&
                                options.item.download != undefined && options.item.download != null && options.item.download) {
                                options.item.download.control = 0;
                            }
                            break;
                    }
                    break;
                case 'shared':
                    switch(action) {
                        case 'create':
                            if ($rootScope.memberData.restrictions.shared.edit &&
                                $rootScope.memberData.restrictions.folders.edit && (
                                    $rootScope.memberData.restrictions.shared.count==-1 ||
                                    $rootScope.memberData.restrictions.shared.count > $rootScope.memberData.shared.length
                                ) &&
                                $rootScope.memberData.restrictions.company > 0
                            ) {
                                var newShared = {
                                    'id': 'not_saved',
                                    'folder_id': options.item.id,
                                    'title': options.item.title,
                                    'count_favs': options.item.count_favs,
                                    'first_name': options.item.first_name,
                                    'last_name': options.item.last_name,
                                    'show': 'list'
                                };
                                //console.log('newShared: ',newShared);
                                if ($rootScope.memberData.shared == '' || $rootScope.memberData.shared == null) {
                                    $rootScope.memberData.shared = [];
                                } else {
                                    angular.forEach($rootScope.memberData.shared, function (value, key) {
                                        value.show = 'list';
                                    });
                                }
                                $rootScope.memberData.shared.push(newShared);
                                $scope.controlActionServer('shared', 'save_item', {'item': newShared});
                            }
                            break;
                        case 'create_all':
                            if ($rootScope.memberData.restrictions.shared.edit &&
                                $rootScope.memberData.restrictions.folders.edit && (
                                    $rootScope.memberData.restrictions.shared.count==-1 ||
                                    $rootScope.memberData.restrictions.shared.count > $rootScope.memberData.shared.length
                                ) &&
                                $rootScope.memberData.restrictions.s_user > 0
                            ) {
                                var newShared = {
                                    'id': 'not_saved',
                                    'folder_id': options.item.id,
                                    'title': options.item.title,
                                    'count_favs': options.item.count_favs,
                                    'first_name': options.item.first_name,
                                    'last_name': options.item.last_name,
                                    'show': 'list'
                                };
                                if ($rootScope.memberData.shared == '' || $rootScope.memberData.shared == null) {
                                    $rootScope.memberData.shared = [];
                                } else {
                                    angular.forEach($rootScope.memberData.shared, function (value, key) {
                                        value.show = 'list';
                                    });
                                }
                                $rootScope.memberData.shared.push(newShared);
                                $scope.controlActionServer('shared', 'save_item_all', {'item': newShared});
                            }
                            break;
                        case 'show':
                            if ($rootScope.memberData.restrictions.shared.display) {
                                $scope.hidingModel('watchlist');
                                $scope.hidingModel('alerts');
                                $scope.hidingModel('folders');
                                $scope.hidingModel('shared');

                                if (options.item.show == 'list') {
                                    options.item.show = 'show';
                                    $scope.controlAction('shared', 'run', {'item': options.item});
                                }
                            }
                            break;
                        case 'edit':
                            if ($rootScope.memberData.restrictions.shared.display) {
                                $scope.hidingModel('watchlist');
                                $scope.hidingModel('alerts');
                                $scope.hidingModel('folders');
                                $scope.hidingModel('shared');

                                options.item.show = 'edit';
                            }
                            break;
                        case 'run':
                            if ($rootScope.memberData.restrictions.search) {
                                $scope.hidingModel('watchlist');
                                $scope.hidingModel('alerts');
                                $scope.hidingModel('folders');
                                $scope.hidingModel('shared');
                                if (options.item.show == 'list') {
                                    options.item.show = 'show';
                                }
                                var folder_item = {
                                    'id': options.item.folder_id,
                                    'title': options.item.title,
                                    'first_name': options.item.first_name,
                                    'last_name': options.item.last_name,
                                    'count_favs': 0,
                                    'is_shared': 1
                                };
                                $rootScope.runSearchPostFolder = folder_item;
                                $rootScope.runSearchPostCP = true;
                                $rootScope.$broadcast('eventRunFolderControlPanel', {'item': folder_item});
                            }
                            break;
                        case 'delete':
                            if ($rootScope.memberData.restrictions.shared.edit) {
                                angular.forEach($rootScope.memberData.shared, function (value, key) {
                                    if (value.id == options.item.id) {
                                        $scope.controlActionServer('shared', 'delete_item', {'item': options.item});
                                        $rootScope.memberData.shared.splice(key, 1);
                                    }
                                });
                            }
                            break;
                    }
                    break;
                case 'control':
                    switch (action) {
                        case 'download':
                            if ($rootScope.memberData.restrictions.search) {
                                if (typeof options.item.download == "undefined" ||
                                    typeof options.item.download == "null" ||
                                    options.item.download == null ||
                                    options.item.download == undefined ||
                                    options.item.download == '') {
                                    options.item.download = {
                                        'control': 0,
                                        'count': 10,
                                        'format': 'pdf'
                                    };
                                } else {
                                    options.item.download.control = 0;
                                }
                                $scope.download_control_status = {
                                    'id': options.item.id,
                                    'status': options.item.download.control,
                                    'type': options.type
                                };
                                options.item.download.loading = 1;
                                $scope.controlActionServer(options.type, 'download', {'item': options.item});
                            }
                            break;

                        case "actionover" :
                            if(typeof options.item.alert != "undefined" && typeof options.item.alert != "null" &&
                                options.item.alert != undefined && options.item.alert != null) {
                                options.item.alert.control = 0;
                            }

                            if (typeof options.item.download != "undefined" &&
                                typeof options.item.download != "null" &&
                                options.item.download != null &&
                                options.item.download != undefined &&
                                options.item.download != '') {
                                options.item.download.control = 0;
                            }
                            break;
                        case 'control_alert':
                            if ($rootScope.memberData.restrictions.alerts.edit &&
                                $rootScope.memberData.restrictions.watchlist.edit) {
                                if (typeof $scope.alert_control_timeout != "undefined" &&
                                    typeof $scope.alert_control_timeout != "null" &&
                                    $scope.alert_control_timeout != null &&
                                    $scope.alert_control_timeout != undefined &&
                                    $scope.alert_control_timeout){
                                    clearTimeout($scope.alert_control_timeout);
                                }
                                if (typeof options.item.alert == "undefined" ||
                                    typeof options.item.alert == "null" ||
                                    options.item.alert == null ||
                                    options.item.alert == undefined ||
                                    options.item.alert == '') {
                                    options.item.alert = {
                                        'control': 2,
                                        'period': 'daily'
                                    };
                                } else {
                                    if (options.item.alert.control == 1) {
                                        options.item.alert.control = 2;
                                    } else if (options.item.alert.control == 0) {
                                        options.item.alert.control = 2;
                                    } else {
                                        options.item.alert.control = 0;
                                    }
                                }
                                $scope.alert_control_status = {
                                    'id': options.item.id,
                                    'status': options.item.alert.control
                                };
                                if (typeof options.item.download != "undefined" &&
                                    typeof options.item.download != "null" &&
                                    options.item.download != null &&
                                    options.item.download != undefined &&
                                    options.item.download != '') {
                                    options.item.download.control = 0;
                                }
                            }
                            break;
                        case 'control_alert_mouseover':
                            if ($rootScope.memberData.restrictions.alerts.edit &&
                                $rootScope.memberData.restrictions.watchlist.edit) {
                                if (typeof $scope.alert_control_timeout != "undefined" &&
                                    typeof $scope.alert_control_timeout != "null" &&
                                    $scope.alert_control_timeout != null &&
                                    $scope.alert_control_timeout != undefined &&
                                    $scope.alert_control_timeout){
                                    clearTimeout($scope.alert_control_timeout);
                                }
                                if (typeof options.item.alert == "undefined" ||
                                    typeof options.item.alert == "null" ||
                                    options.item.alert == null ||
                                    options.item.alert == undefined ||
                                    options.item.alert == '') {
                                    options.item.alert = {
                                        'control': 2,
                                        'period': 'daily'
                                    };
                                } else {
                                    if (options.item.alert.control == 0) {
                                        options.item.alert.control = 2;
                                    }
                                }
                                $scope.alert_control_status = {
                                    'id': options.item.id,
                                    'status': options.item.alert.control
                                };
                                if (typeof options.item.download != "undefined" &&
                                    typeof options.item.download != "null" &&
                                    options.item.download != null &&
                                    options.item.download != undefined &&
                                    options.item.download != '') {
                                    options.item.download.control = 0;
                                }
                            }
                            break;
                        case 'control_alert_mouseleave':
                            if (typeof $scope.alert_control_timeout != "undefined" &&
                                typeof $scope.alert_control_timeout != "null" &&
                                $scope.alert_control_timeout != null &&
                                $scope.alert_control_timeout != undefined &&
                                $scope.alert_control_timeout){
                                clearTimeout($scope.alert_control_timeout);
                            }
                            if (typeof options.item.alert == "undefined" ||
                                typeof options.item.alert == "null" ||
                                options.item.alert == null ||
                                options.item.alert == undefined||
                                options.item.alert == ''){
                            } else {
                                options.item.alert.control = 1;
                                $scope.alert_control_status = {
                                    'id': options.item.id,
                                    'status': options.item.alert.control
                                };
                                $scope.alert_control_timeout = setTimeout(function(){
                                    //value.alert.control = 0;
                                    //if ($scope.alert_control_status.id > 0 &&
                                      //  $scope.alert_control_status.status > 0) {
                                        $scope.$apply(function () {

                                            if(typeof options.item.alert != "undefined" && typeof options.item.alert != "null"
                                                && options.item.alert.control != undefined && options.item.alert != null
                                            ) {
                                                options.item.alert.control = 0;
                                            }

                                            /*angular.forEach($rootScope.memberData.watchlist, function(value, key) {
                                                options.item.alert.control = 0;
                                                //if (value.id == $scope.alert_control_status.id) {
                                                    if (typeof value.alert != "undefined" &&
                                                        typeof value.alert != "null" &&
                                                        value.alert != null &&
                                                        value.alert != undefined &&
                                                        value.alert != ''){
                                                        value.alert.control = 0;
                                                    }
                                                //}

                                            });*/
                                            });
                                    //}
                                }, 1000);
                            }
                            break;
                        case 'control_alert_period':
                            if (typeof options.item.alert == "undefined" ||
                                typeof options.item.alert == "null" ||
                                options.item.alert == null ||
                                options.item.alert == undefined||
                                options.item.alert == ''){
                                options.item.alert = {
                                    'control': 2,
                                    'period': 'daily'
                                };
                            }
                            if (options.period == 'daily'){
                                options.item.alert.period = 'daily';
                            } else {
                                options.item.alert.period = 'weekly';
                            }
                            break;
                        case 'control_download':
                            if ($rootScope.memberData.restrictions.can_download_posts) {
                                if (typeof $scope.download_control_timeout != "undefined" &&
                                    typeof $scope.download_control_timeout != "null" &&
                                    $scope.download_control_timeout != null &&
                                    $scope.download_control_timeout != undefined &&
                                    $scope.download_control_timeout){
                                    clearTimeout($scope.download_control_timeout);
                                }
                                if (typeof options.item.download == "undefined" ||
                                    typeof options.item.download == "null" ||
                                    options.item.download == null ||
                                    options.item.download == undefined ||
                                    options.item.download == '') {
                                    options.item.download = {
                                        'control': 2,
                                        'count': 10,
                                        'format': 'pdf'
                                    };
                                } else {
                                    if (options.item.download.control == 1) {
                                        options.item.download.control = 2;
                                    } else if (options.item.download.control == 0) {
                                        options.item.download.control = 2;
                                    } else {
                                        options.item.download.control = 0;
                                    }
                                }
                                $scope.download_control_status = {
                                    'id': options.item.id,
                                    'status': options.item.download.control,
                                    'type': options.type
                                };
                                if (typeof options.item.alert != "undefined" &&
                                    typeof options.item.alert != "null" &&
                                    options.item.alert != null &&
                                    options.item.alert != undefined &&
                                    options.item.alert != '') {
                                    options.item.alert.control = 0;
                                }
                            }
                            break;
                        case 'control_download_mouseover':
                            if ($rootScope.memberData.restrictions.can_download_posts) {
                                if (typeof $scope.download_control_timeout != "undefined" &&
                                    typeof $scope.download_control_timeout != "null" &&
                                    $scope.download_control_timeout != null &&
                                    $scope.download_control_timeout != undefined &&
                                    $scope.download_control_timeout){
                                    clearTimeout($scope.download_control_timeout);
                                }
                                if (typeof options.item.download == "undefined" ||
                                    typeof options.item.download == "null" ||
                                    options.item.download == null ||
                                    options.item.download == undefined ||
                                    options.item.download == '') {
                                    options.item.download = {
                                        'control': 2,
                                        'count': 10,
                                        'format': 'pdf'
                                    };
                                } else {
                                    if (options.item.download.control == 0) {
                                        options.item.download.control = 2;
                                    }
                                }
                                $scope.download_control_status = {
                                    'id': options.item.id,
                                    'status': options.item.download.control,
                                    'type': options.type
                                };
                                if (typeof options.item.alert != "undefined" &&
                                    typeof options.item.alert != "null" &&
                                    options.item.alert != null &&
                                    options.item.alert != undefined &&
                                    options.item.alert != '') {
                                    options.item.alert.control = 0;
                                }
                            }
                            break;
                        case 'control_download_mouseleave':
                            if (typeof $scope.download_control_timeout != "undefined" &&
                                typeof $scope.download_control_timeout != "null" &&
                                $scope.download_control_timeout != null &&
                                $scope.download_control_timeout != undefined &&
                                $scope.download_control_timeout){
                                clearTimeout($scope.download_control_timeout);
                            }
                            if (typeof options.item.download == "undefined" ||
                                typeof options.item.download == "null" ||
                                options.item.download == null ||
                                options.item.download == undefined ||
                                options.item.download == ''){
                            } else {
                                options.item.download.control = 1;
                                $scope.download_control_status = {
                                    'id': options.item.id,
                                    'status': options.item.download.control,
                                    'type': options.type
                                };
                                $scope.download_control_timeout = setTimeout(function(){
                                    if ($scope.download_control_status.id > 0 &&
                                        $scope.download_control_status.status > 0) {
                                        $scope.$apply(function () {
                                            angular.forEach($rootScope.memberData[options.type], function(value, key) {
                                                if (value.id == $scope.download_control_status.id) {
                                                    if (typeof value.download != "undefined" &&
                                                        typeof value.download != "null" &&
                                                        value.download != null &&
                                                        value.download != undefined &&
                                                        value.download != ''){

                                                        value.download.control = 0;
                                                    }
                                                }
                                            });
                                        });
                                    }
                                }, 1000);
                            }
                            break;
                        case 'control_download_count':
                            if (typeof options.item.download == "undefined" ||
                                typeof options.item.download == "null" ||
                                options.item.download == null ||
                                options.item.download == undefined||
                                options.item.download == ''){
                                options.item.download = {
                                    'control': 2,
                                    'count': 10,
                                    'format': 'pdf'
                                };
                            }
                            if (options.count == 20){
                                options.item.download.count = 20;
                            } else if (options.count == 5){
                                options.item.download.count = 5;
                            } else {
                                options.item.download.count = 10;
                            }
                            break;
                        case 'control_download_format':
                            if (typeof options.item.download == "undefined" ||
                                typeof options.item.download == "null" ||
                                options.item.download == null ||
                                options.item.download == undefined||
                                options.item.download == ''){
                                options.item.download = {
                                    'control': 2,
                                    'count': 10,
                                    'format': 'pdf'
                                };
                            }
                            if (options.format == 'ppt'){
                                options.item.download.format = 'ppt';
                            } else {
                                options.item.download.format = 'pdf';
                            }
                            break;
                    }
                    break;
            }
        }
        return false;

    };

    $scope.controlActionServer = function(model, action, options) {
        var params = '';

        switch(model) {
            case 'watchlist':
                switch(action) {
                    case 'save_item':
                        //console.log('server: watchlist: save_item');
                        params = {
                            'memcached_enabled': 0,
                            'json': 'member_control_watchlist_item_save',
                            'id': options.item.id,
                            'title': options.item.title,
                            'description': options.item.description,
                            'tags[]': options.item.tags,
                            'search_method': options.item.search_method
                        };
                        break;
                    case 'delete_item':
                        params = {
                            'memcached_enabled': 0,
                            'json': 'member_control_watchlist_item_delete',
                            'id': options.item.id
                        };
                        break;
                    case 'download':
                        params = {
                            'memcached_enabled': 0,
                            'json': 'member_control_watchlist_item_download',
                            'id': options.item.id,
                            'count': options.item.download.count,
                            'format': options.item.download.format
                        };
                        break;
                }
                break;
            case 'alerts':
                switch(action) {
                    case 'save_item':
                        params = {
                            'memcached_enabled': 0,
                            'json': 'member_control_alerts_item_save',
                            'id': options.item.id,
                            'watchlist_id': options.item.watchlist_id,
                            'period': options.item.period,
                            'status': options.item.status
                        };
                        break;
                    case 'delete_item':
                        params = {
                            'memcached_enabled': 0,
                            'json': 'member_control_alerts_item_delete',
                            'id': options.item.id
                        };
                        break;
                }
                break;
            case 'folders':
                switch(action) {
                    case 'delete_item':
                        params = {
                            'memcached_enabled': 0,
                            'json': 'member_control_folders_item_delete',
                            'id': options.item.id
                        };
                        break;
                    case 'save_item':
                        params = {
                            'memcached_enabled': 0,
                            'json': 'member_control_folders_item_save',
                            'id': options.item.id,
                            'title': options.item.title,
                            'is_create_folder_favs_content': options.is_create_folder_favs_content
                        };
                        break;
                    case 'download':
                        params = {
                            'memcached_enabled': 0,
                            'json': 'member_control_folders_item_download',
                            'id': options.item.id,
                            'count': options.item.download.count,
                            'format': options.item.download.format
                        };
                        break;
                }
                break;
            case 'shared':
                switch(action) {
                    case 'save_item':
                        params = {
                            'memcached_enabled': 0,
                            'json': 'member_control_shared_item_save',
                            'id': options.item.folder_id,
                            'for_all': 0
                        };
                        break;
                    case 'save_item_all':
                        params = {
                            'memcached_enabled': 0,
                            'json': 'member_control_shared_item_save',
                            'id': options.item.folder_id,
                            'for_all': 1
                        };
                        break;
                    case 'delete_item':
                        params = {
                            'memcached_enabled': 0,
                            'json': 'member_control_shared_item_delete',
                            'id': options.item.id
                        };
                        break;
                    case 'download':
                        params = {
                            'memcached_enabled': 0,
                            'json': 'member_control_folders_item_download',
                            'id': options.item.folder_id,
                            'count': options.item.download.count,
                            'format': options.item.download.format,
                            'is_shared': 1
                        };
                        break;
                }
                break;
        }
        if (params !== ''){
            $http({
                method: 'GET',
                url: $scope.api,
                params: params
            }).success(function(data, status, headers, config) {
                switch(model) {
                    case 'watchlist':
                        switch(action) {
                            case 'save_item':
                                if (typeof data.result != "undefined" &&
                                    typeof data.result != "null" &&
                                    data.result != null &&
                                    data.result != undefined &&
                                    data.result != ''){
                                    angular.forEach($rootScope.memberData.watchlist, function(value, key) {
                                        if (value.title == data.result.title &&
                                            value.description == data.result.description &&
                                            value.id == 'not_saved') {
                                            value.id = data.result.id;
                                            value.additional = data.result.additional;
                                            if (options.is_create_watchlist_alert == 1) {
                                                if (typeof options.event_param == "undefined" ||
                                                    typeof options.event_param == "null") {
                                                    options.event_param = {};
                                                }
                                                $scope.controlAction('alerts', 'create', {
                                                    'item': options.item,
                                                    'is_create_watchlist_alert': 1,
                                                    'event_param': options.event_param
                                                });
                                            }
                                        } else {
                                            if (options.item.a_id > 0){
                                                angular.forEach($rootScope.memberData.alerts, function(value, key) {
                                                    if (value.id == options.item.a_id) {
                                                        value.title = options.item.title;
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                                break;
                            case 'download':
                                if (typeof data.result != "undefined" &&
                                    typeof data.result != "null" &&
                                    data.result != null &&
                                    data.result != undefined &&
                                    data.result != ''){
                                    window.location.assign(data.result+'&fname='+options.item.title);
                                }
                                break;
                            case 'delete_item':
                                break;
                        }
                        break;
                    case 'alerts':
                        switch(action) {
                            case 'save_item':
                                if (typeof data.result != "undefined" &&
                                    typeof data.result != "null" &&
                                    data.result != null &&
                                    data.result != undefined &&
                                    data.result != ''){
                                    angular.forEach($rootScope.memberData.alerts, function(value, key) {
                                        if (value.watchlist_id == data.result.watchlist_id &&
                                            value.period == data.result.period &&
                                            value.id == 'not_saved') {
                                            value.id = data.result.id;
                                            if (options.is_create_watchlist_alert == 1) {
                                                $scope.newWatchItemClear();
                                            }
                                            if (typeof options.event_param !== "undefined" &&
                                                typeof options.event_param !== "null") {
                                                if (typeof options.event_param.post_key != "undefined" &&
                                                    typeof options.event_param.post_key != "null" &&
                                                    typeof options.event_param.tag_id != "undefined" &&
                                                    typeof options.event_param.tag_id != "null") {
                                                    $rootScope.$broadcast('eventPostTagActionDone', options.event_param);
                                                }
                                            }
                                        }
                                    });
                                    angular.forEach($rootScope.memberData.watchlist, function(value, key) {
                                        if (value.id == data.result.watchlist_id) {
                                            value.a_id = data.result.id;
                                        }
                                    });
                                }
                                break;
                            case 'delete_item':
                                if (typeof data.status != "undefined" &&
                                    typeof data.status != "null" &&
                                    data.status != null &&
                                    data.status != undefined &&
                                    data.status != '' &&
                                    data.status != false){
                                    angular.forEach($rootScope.memberData.watchlist, function(value, key) {
                                        if (value.id == options.item.watchlist_id) {
                                            value.a_id = 0;
                                        }
                                    });
                                }
                                break;
                        }
                        break;
                    case 'folders':
                        switch(action) {
                            case 'delete_item':
                                break;
                            case 'save_item':
                                if (typeof data.result != "undefined" &&
                                    typeof data.result != "null" &&
                                    data.result != null &&
                                    data.result != undefined &&
                                    data.result != ''){
                                    angular.forEach($rootScope.memberData.folders, function(value, key) {
                                        if (value.title == data.result.title &&
                                            value.id == 'not_saved') {
                                            value.id = data.result.id;
                                            if (typeof options.event_param !== "undefined" &&
                                                typeof options.event_param !== "null") {
                                                if (typeof options.event_param.post_key != "undefined" &&
                                                    typeof options.event_param.post_key != "null" &&
                                                    typeof options.event_param.tag_id != "undefined" &&
                                                    typeof options.event_param.tag_id != "null") {
                                                    $rootScope.$broadcast('eventPostTagActionDone', options.event_param);
                                                }
                                            }
                                        }
                                    });
                                }
                                break;
                            case 'download':
                                if (typeof data.result != "undefined" &&
                                    typeof data.result != "null" &&
                                    data.result != null &&
                                    data.result != undefined &&
                                    data.result != ''){
                                    window.location.assign(data.result+'&fname='+options.item.title);
                                }
                                break;
                        }
                        break;
                    case 'shared':
                        switch(action) {
                            case 'delete_item':
                                if (typeof data.result != "undefined" &&
                                    typeof data.result != "null" &&
                                    data.result != null &&
                                    data.result != undefined &&
                                    data.result != ''){
                                    angular.forEach($rootScope.memberData.folders, function(value, key) {
                                        if (value.id == data.result.folder_id) {
                                            value.sh_id = 0;
                                        }
                                    });
                                }
                                break;
                            case 'save_item':
                            case 'save_item_all':
                                if (typeof data.result != "undefined" &&
                                    typeof data.result != "null" &&
                                    data.result != null &&
                                    data.result != undefined &&
                                    data.result != ''){
                                    angular.forEach($rootScope.memberData.shared, function(value, key) {
                                        if (value.folder_id == data.result.folder_id &&
                                            value.title == data.result.title &&
                                            value.id == 'not_saved') {
                                            value.id = data.result.id;
                                        }
                                    });
                                    angular.forEach($rootScope.memberData.folders, function(value, key) {
                                        //console.log(value);
                                        if (value.id == data.result.folder_id) {
                                            value.sh_id = data.result.id;
                                        }
                                    });
                                }
                                break;
                            case 'download':
                                if (typeof data.result != "undefined" &&
                                    typeof data.result != "null" &&
                                    data.result != null &&
                                    data.result != undefined &&
                                    data.result != '' &&
                                    data.result){
                                    window.location.assign(data.result+'&fname='+options.item.title);
                                } else {
                                    angular.forEach($rootScope.memberData.shared, function(value, key) {
                                        if (typeof value.download != "undefined" &&
                                            typeof value.download != "null" &&
                                            value.download != null &&
                                            value.download != undefined &&
                                            value.download != ''){
                                            if (value.download.loading == 1) {
                                                value.download.loading = 0;
                                            }
                                        }


                                    });
                                }
                                break;
                        }
                        break;
                }
                //$rootScope.memberData = data;
                //$scope.loadingAll = false;
            }).error(function(data, status, headers, config) {
            });
        }
        return false;
    };

    $scope.hidingModel = function(model){
        var showingAnother = true;
        if (model == 'watchlist') {
            angular.forEach($rootScope.memberData.watchlist, function(value, key) {
                if (value.title != '') {
                    value.status = 'list';
                } else {
                    showingAnother = false;
                }
                if (typeof value.alert != "undefined" &&
                    typeof value.alert != "null" &&
                    value.alert != null &&
                    value.alert != undefined &&
                    value.alert != ''){
                    value.alert.control = 0;
                }
                if (typeof value.download != "undefined" &&
                    typeof value.download != "null" &&
                    value.download != null &&
                    value.download != undefined &&
                    value.download != ''){
                    value.download.control = 0;
                }
            });
        }
        if (model == 'alerts') {
            angular.forEach($rootScope.memberData.alerts, function(value, key) {
                value.show = 'list';
            });
        }
        if (model == 'folders') {
            angular.forEach($rootScope.memberData.folders, function(value, key) {
                value.show = 'list';
            });
        }
        if (model == 'shared') {
            angular.forEach($rootScope.memberData.shared, function(value, key) {
                value.show = 'list';
            });
        }
        return showingAnother;
    };

    /**
     * Clear defaults new Tag item
     */
    $scope.newTagItemClear = function(){
        $scope.newTagItemVal = '';
        $scope.newTagItem = {
            'id': Math.random().toString(36).substr(2)+'-tag-item',
            'title': ''
        };
    };

    /**
     * Clear defaults new Watch item
     * @returns {boolean}
     */
    $scope.newWatchItemClear = function(){
        $scope.newWatchItem = {
            'id': 'not_saved',
            't_id': Math.random().toString(36).substr(2)+'-watch-list',
            'title': '',
            'description': '',
            'tags': [],
            'status': 'edit',
            'a_id': 0,
            'loading': 0,
            'search_method': 'containing',
            'alert': {
                'period': 'daily'
            }
        };
        return false;
    };

    /**
     * Searching tags on server
     * @param tagNameSearch
     * @returns {*}
     */
    $scope.getTagsAjax = function(tagNameSearch) {
        if ($scope.cacheTagSearch[tagNameSearch] != null &&
            $scope.cacheTagSearch[tagNameSearch] != undefined &&
            $scope.cacheTagSearch[tagNameSearch] != ''){
            return $scope.cacheTagSearch[tagNameSearch].map(function(item){
                return {'title':item.name, 'count':item.post_count };
            });
        } else {
            return $http.get($scope.api, {
                params: {
                    'memcached_enabled': 0,
                    'json': 'get_search_in_taxonomy',
                    'taxonomy': 'post_tag',
                    's': tagNameSearch,
                    'count': -1
                }
            }).then(function(response){
                if (response.data.terms != null && response.data.terms != undefined){
                    if (Object.keys($scope.cacheTagSearch).length >= 20) {
                        Object.getOwnPropertyNames($scope.cacheTagSearch).forEach(function(val, idx, array) {
                            if (idx == 0) {
                                delete $scope.cacheTagSearch[val];
                            }
                        });
                    }
                    $scope.cacheTagSearch[tagNameSearch] = response.data.terms;
                    return response.data.terms.map(function(item){
                        return {'title':item.name, 'count':item.post_count };
                    });
                } else {
                    return '';
                }
            });
        }
    };

    $scope.getTagsAjaxStatic = [{"title":"Advertising","slug":"","post_count":0},{"title":"Africa","slug":"","post_count":0},{"title":"Amazon","slug":"","post_count":0},{"title":"American Express","slug":"","post_count":0},{"title":"Apple","slug":"","post_count":0},{"title":"Arts & Culture","slug":"","post_count":0},{"title":"Asia","slug":"","post_count":0},{"title":"AT&T","slug":"","post_count":0},{"title":"Audi","slug":"","post_count":0},{"title":"Automotive","slug":"","post_count":0},{"title":"Baby Boomers","slug":"","post_count":0},{"title":"Beauty","slug":"","post_count":0},{"title":"BMW","slug":"","post_count":0},{"title":"Brand Development","slug":"","post_count":0},{"title":"Brazil","slug":"","post_count":0},{"title":"Budweiser","slug":"","post_count":0},{"title":"Canada","slug":"","post_count":0},{"title":"Children","slug":"","post_count":0},{"title":"China","slug":"","post_count":0},{"title":"Cisco","slug":"","post_count":0},{"title":"Cities","slug":"","post_count":0},{"title":"Coca-Cola","slug":"","post_count":0},{"title":"Consumer Goods","slug":"","post_count":0},{"title":"Customer acquisition","slug":"","post_count":0},{"title":"Customer retention","slug":"","post_count":0},{"title":"Design","slug":"","post_count":0},{"title":"Design Update","slug":"","post_count":0},{"title":"Disney","slug":"","post_count":0},{"title":"Drive Sales","slug":"","post_count":0},{"title":"Earn media / increase exposure","slug":"","post_count":0},{"title":"Education","slug":"","post_count":0},{"title":"Entertainment","slug":"","post_count":0},{"title":"ESPN","slug":"","post_count":0},{"title":"Europe","slug":"","post_count":0},{"title":"Experiential Marketing","slug":"","post_count":0},{"title":"Facebook","slug":"","post_count":0},{"title":"Fashion / Apparel","slug":"","post_count":0},{"title":"Financial Services","slug":"","post_count":0},{"title":"Fitness / Sport","slug":"","post_count":0},{"title":"Food / Beverage","slug":"","post_count":0},{"title":"Frito-Lay","slug":"","post_count":0},{"title":"Gaming","slug":"","post_count":0},{"title":"Gen X","slug":"","post_count":0},{"title":"Gen Z","slug":"","post_count":0},{"title":"General Electric","slug":"","post_count":0},{"title":"Gillette","slug":"","post_count":0},{"title":"Google","slug":"","post_count":0},{"title":"H&M","slug":"","post_count":0},{"title":"Health / Wellness","slug":"","post_count":0},{"title":"Hewlett-Packard","slug":"","post_count":0},{"title":"Hispanic","slug":"","post_count":0},{"title":"Home","slug":"","post_count":0},{"title":"Home Appliances / Furnishing","slug":"","post_count":0},{"title":"Home Depot","slug":"","post_count":0},{"title":"Honda","slug":"","post_count":0},{"title":"HSBC","slug":"","post_count":0},{"title":"IBM","slug":"","post_count":0},{"title":"India","slug":"","post_count":0},{"title":"Infants","slug":"","post_count":0},{"title":"Innovation ","slug":"","post_count":0},{"title":"Intel","slug":"","post_count":0},{"title":"IoT","slug":"","post_count":0},{"title":"Japan","slug":"","post_count":0},{"title":"L'Or?al","slug":"","post_count":0},{"title":"Latin America","slug":"","post_count":0},{"title":"LGBT","slug":"","post_count":0},{"title":"Louis Vuitton","slug":"","post_count":0},{"title":"Luxury","slug":"","post_count":0},{"title":"Market Research","slug":"","post_count":0},{"title":"Marlboro","slug":"","post_count":0},{"title":"McDonald's","slug":"","post_count":0},{"title":"Media & Publishing","slug":"","post_count":0},{"title":"Mercedes-Benz","slug":"","post_count":0},{"title":"Mexico","slug":"","post_count":0},{"title":"Microsoft","slug":"","post_count":0},{"title":"Middle East","slug":"","post_count":0},{"title":"Millennials","slug":"","post_count":0},{"title":"Mobile","slug":"","post_count":0},{"title":"Nescafe","slug":"","post_count":0},{"title":"NIKE","slug":"","post_count":0},{"title":"Oracle","slug":"","post_count":0},{"title":"Pepsi","slug":"","post_count":0},{"title":"Product Launch","slug":"","post_count":0},{"title":"Raise Awareness","slug":"","post_count":0},{"title":"Retail","slug":"","post_count":0},{"title":"Samsung","slug":"","post_count":0},{"title":"SAP","slug":"","post_count":0},{"title":"South Korea","slug":"","post_count":0},{"title":"Sustainability","slug":"","post_count":0},{"title":"Technology","slug":"","post_count":0},{"title":"Toyota","slug":"","post_count":0},{"title":"Travel","slug":"","post_count":0},{"title":"UK","slug":"","post_count":0},{"title":"UPS","slug":"","post_count":0},{"title":"USA","slug":"","post_count":0},{"title":"Verizon","slug":"","post_count":0},{"title":"Visa","slug":"","post_count":0},{"title":"Wal-Mart","slug":"","post_count":0},{"title":"Work","slug":"","post_count":0}];

    $scope.noScrollTextarea = function (id) {
        var element = document.getElementById(id);
        var scrollHeight = element.scrollHeight; // replace 60 by the sum of padding-top and padding-bottom
        element.style.height =  scrollHeight + "px";
    };


}]).directive('clickOut', ['$window', '$parse', function ($window, $parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var clickOutHandler = $parse(attrs.clickOut);

            angular.element($window).on('click', function (event) {
                if (element[0].contains(event.target)) return;
                clickOutHandler(scope, {$event: event});
                scope.$apply();
            });
        }
    };
}]);