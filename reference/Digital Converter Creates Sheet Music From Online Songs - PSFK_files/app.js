// initialize the app

angular.module('Membership', [])
.factory('Membership', function(){
        return Membership;
  });



var psfk4App = angular.module('psfk4App', ['ngSanitize', 'infinite-scroll', 'ui.bootstrap', 'angular-inview', 'Membership'])

    .run(['$rootScope', 'Membership', '$http', function($rootScope, Membership, $http){

        var MemberShip = new Membership({
            rkey:PaperWall.settings.pw_rkey,
            pkey:PaperWall.settings.pw_pkey,
            pw_host:PaperWall.settings.pw_host,
            env:PaperWall.settings.env
        });

        // the following data is fetched from the JavaScript variables created by wp_localize_script(), and stored in the Angular rootScope
        $rootScope.dir = BlogInfo.url;
        $rootScope.site = BlogInfo.site;
        $rootScope.postperpage = BlogInfo.postperpage;
        $rootScope.api = AppAPI.url;
        $rootScope.TPCSettings = TPCApi.tpc_settings;
        $rootScope.startUrl = window.location.href;
        $rootScope.backUrl = document.referrer;
        $rootScope.isBackAction = true;
        $rootScope.prevUrl = '';
        $rootScope.currentUrl = '';
        $rootScope.windowWidth = angular.element(window).width();
        $rootScope.windowHeight = angular.element(window).height()-angular.element('header').outerHeight();
        //$rootScope.sidebarBannerOff = false;
        $rootScope.sidebarBannerOverflow = false;
        // viewports
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
        } else{
            $rootScope.currrentViewport = 6;
        }
        $rootScope.widthRightSidebar = {
            '1': '-420px',
            '2': '-420px',
            '3': '-420px',
            '4': '-420px',
            '5': '-100%',
            '6': '-100%'
        };
        $rootScope.cookies_a = {};
        $rootScope.cookies = document.cookie.split(';');
        $rootScope.setCookie = function(name, value, expire) {
            var expire_string = '';
            if (typeof expire != "undefined" &&
                typeof expire != "null" &&
                expire != null &&
                expire != undefined &&
                expire != ''){
                expire_string = 'expires=' + expire;
            }
            var cookie = [name, '=', JSON.stringify(value), '; domain=.', window.location.host.toString(), '; path=/;', expire_string].join('');
            window.document.cookie = cookie;
        };
        var temp = '';
        for(var i=0; i<$rootScope.cookies.length; i++) {
            while ($rootScope.cookies[i].charAt(0)==' ') $rootScope.cookies[i] = $rootScope.cookies[i].substring(1);
            var temp = $rootScope.cookies[i].split('=');
            if (typeof temp[1] != "undefined" && typeof temp[1] != "null"){
                if (temp[0].indexOf("showed_posts_") >=0 && temp[0]){
                    var date_exp = new Date(0);
                    $rootScope.setCookie(temp[0], '', date_exp);
                }
                $rootScope.cookies_a[temp[0]] = temp[1];
            }
        }
//        var sidebarIsClosed = $cookieStore.get('sidebarIsClosed');
//        if ($rootScope.cookies_a.sidebarIsClosed == 'true' || $rootScope.currrentViewport > 3) {
        if ($rootScope.currrentViewport > 3) {
            $rootScope.sidebarIsActive = false;
            $rootScope.sidebarIsClosed = true;
            angular.element('.articles-pane-block, .sidebar-controls-app-block').css("right", $rootScope.widthRightSidebar[$rootScope.currrentViewport]);
        } else {
            $rootScope.sidebarIsActive = true;
            $rootScope.sidebarIsClosed = false;
            angular.element('.articles-pane-block, .sidebar-controls-app-block').css("right", "0");
        }
        $rootScope.subscribeBlock = true;
        $rootScope.partType = 'latest';
        $rootScope.subPartType = 'all';
        $rootScope.sponsorAd = {
            'showAd': false,
            'type':'none',
            'url':'',
            'image':'',
            'bgColor':'#ffffff'
        };
        $rootScope.runSearchPostCP = false;
        $rootScope.runSearchPostWatchlist = '';
        $rootScope.runSearchPostFolder = '';
        $rootScope.memberData = '';
        $rootScope.newFolderItem = {
            id:'',
            title: ''
        };

        setInterval(function(){
            if ($rootScope.currentUrl != window.location.pathname){
                //console.log('href: ', window.location.pathname);
                if ($rootScope.isBackAction && $rootScope.currentUrl != '' && $rootScope.prevUrl == window.location.pathname){
                    if ($rootScope.backUrl != ''){
                        window.location = $rootScope.backUrl;
//                        console.log('back: ', $rootScope.backUrl);
                    } else {
                        window.location = 'http://'+window.location.host+'/';
//                        console.log('back: ', 'http://'+window.location.host+'/');
                    }
                } else {
                    $rootScope.isBackAction = true;
                }
                $rootScope.prevUrl = $rootScope.currentUrl;
                $rootScope.currentUrl = window.location.pathname;
            }
        }, 500);

        /**
         * Tinypass functions
         */

        $rootScope.getTPCInit = function() {
            tp = window["tp"] || [];
            tp.push(["setEndpoint", $rootScope.TPCSettings.endpoint]);
            tp.push(["setAid", $rootScope.TPCSettings.aid]);
            tp.push(["setSandbox", $rootScope.TPCSettings.sandbox]);
            tp.push(["setUseTinypassAccounts", true]);
            tp.push(["setDebug", true]);

            tp.push(["init", function() {
                //console.log('tp.user:',tp.user);
                $rootScope.$apply(function () {
                    
                });
                


            }]);
            
        };

        $rootScope.getShowLogin = function(){
           
        };
        $rootScope.initCallbacks = function(){
            
        };

        $rootScope.expandPostContentLocation = function(post, e) {

            //console.log('post.tp_access: ', post.tp_access);
            //console.log('post.tp_member: ', post.tp_member);
            if(!post.tp_access) {
                //jQuery('#subscription-popup').toggle();
                if (typeof e != "undefined" &&typeof e != "null"){
                    e.preventDefault();
                }
                if(post.pw_special_deny != undefined && post.pw_special_deny) {
                    // this special post, show popup by special
                    //$rootScope.getShowPopup('special_tag');
                    $rootScope.getShowOffer('/page/psfk_paid_member_content');
                } /*else if(!post.tp_member) {
                    $rootScope.getShowOffer('auth', {msg:'Not getting your future insights fill? <br>Free and paid membership levels offer access to more articles, archives and reports and special events.<br><br>Already a member?'});
                }*/ else {
                    //$rootScope.getShowPopup('post');
                    $rootScope.getShowOffer('/page/access_content_deny');
                }

                return false;
            } else {
                window.location = post.url;
            }
        };


        /* $rootScope.getShowPopup = function(link){
            if(link == 'close') {
                jQuery('#subscription-popup').hide();
            } else {
                jQuery('#subscription-popup iframe').attr("src", "/membership-popup?" + link)
                jQuery('#subscription-popup').toggle();
            }
        };*/


        $rootScope.getShowOffer = function(link, param){

            var old_token = $rootScope.getCookie('__pwt');
            /*if(old_token != "" && old_token != undefined && link == 'auth') {
                delCookie('__pwt');
                setCookie("__pwc", "goTo_main");
                $rootScope.getShowPopup('dejavu');
                return false;
            }*/

            MemberShip.setParam(param);
            MemberShip.OpenModal(link);

            return false;
        };

        var getShowOffer = $rootScope.getShowOffer;

        $rootScope.getCookie = function(name) {
            var matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        };

        $rootScope.addPostToFavs = function(post, foldersItem) {
            post.favs_menu = false;
            var params = {
                'memcached_enabled': 0,
                'json': 'member_control_post_to_favs',
                'post_id': post.id,
                'folder_title': foldersItem.title,
                'folder_id': foldersItem.id
            };
            $http({
                method: 'GET',
                url: $rootScope.api,
                params: params
            }).success(function(data, status, headers, config) {
                if (typeof data.result != "undefined" &&
                    typeof data.result != "null" &&
                    data.result != null &&
                    data.result != undefined &&
                    data.result != ''){
                    $rootScope.newFolderItem = {
                        id:'',
                        title: ''
                    };
                    post.favs = data.result.favs;
                    $rootScope.memberData.folders = data.result.folders;
                }
            }).error(function(data, status, headers, config) {
            });
            return false;
        };

        $rootScope.checkIfPostFaved = function(favs){
            var faved = false;
            if (typeof favs !== "undefined" && typeof favs !== "null" && typeof favs !== null){
                for (var key in favs) {
                    if (favs[key].folder_id>0){
                        faved = true;
                    }
                }
            }
            return faved;
        };
        $rootScope.checkFavInFolder = function (favs, folder_id) {
            var fav_in_fiolder = false;
            if (typeof favs !== "undefined" && typeof favs !== "null" && typeof favs !== null){
                for (var key in favs) {
                    if (favs[key].folder_id == folder_id){
                        fav_in_fiolder = true;
                    }
                }
            }
            return fav_in_fiolder;
        };

        $rootScope.showDropdownFavs = function(post) {
            if (post.favs_menu){
                post.favs_menu = false;
            } else {
                $rootScope.hideDropdownFavs();
                post.favs_menu = true;
            }
        };
        $rootScope.showDropdownDoc = function(post) {
            if (post.doc_menu){
                post.doc_menu = false;
            } else {
                $rootScope.hideDropdownDoc();
                post.doc_menu = true;
            }
        };
        $rootScope.showDropdownShare = function(post) {
            if (post.share_menu){
                post.share_menu = false;
            } else {
                $rootScope.hideDropdownShare();
                post.share_menu = true;
            }
        };

        $rootScope.hideDropdownFavs = function() {
            $rootScope.$broadcast('eventAllFavsMenuHide', {});
        };
        $rootScope.hideDropdownDoc = function() {
            $rootScope.$broadcast('eventAllDocMenuHide', {});
        };
        $rootScope.hideDropdownShare = function() {
            $rootScope.$broadcast('eventAllShareMenuHide', {});
        };
        $rootScope.hideAllTagExtraMenu = function() {
            $rootScope.$broadcast('eventAllTagExtraMenuHide', {});
        };

        angular.element(window).on('resize', function() {
            $rootScope.$apply(function() {
                $rootScope.windowHeight = angular.element(window).height() - angular.element('header').outerHeight();
            });
        });

        angular.element("html").bind('click', function(e) {
            if(!angular.element(e.target).hasClass('fav-part') && angular.element(e.target).closest('.fav-part').length < 1) {
                $rootScope.$apply(function() {
                    $rootScope.$broadcast('eventAllFavsMenuHide', {});
                });
            }
            if(!angular.element(e.target).hasClass('doc-part') && angular.element(e.target).closest('.doc-part').length < 1) {
                $rootScope.$apply(function() {
                    $rootScope.$broadcast('eventAllDocMenuHide', {});
                });
            }
            if(!angular.element(e.target).hasClass('share-part') && angular.element(e.target).closest('.share-part').length < 1) {
                $rootScope.$apply(function() {
                    $rootScope.$broadcast('eventAllShareMenuHide', {});
                });
            }
            if(!angular.element(e.target).hasClass('tag-item-extra') && angular.element(e.target).closest('.tag-item-extra').length < 1) {
                $rootScope.$apply(function() {
                    $rootScope.$broadcast('eventAllTagExtraMenuHide', {});
                });
            }
        });

        $rootScope.Base64 = {_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=$rootScope.Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=$rootScope.Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

    }]);
