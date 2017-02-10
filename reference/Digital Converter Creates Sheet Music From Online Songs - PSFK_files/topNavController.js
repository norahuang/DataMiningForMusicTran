psfk4App.controller('topNavController', ['$scope', '$rootScope', function ($scope, $rootScope) {

    $scope.isInvisible = false;
    $scope.isDetached = false;
    $scope.isExpanded = false;
    $scope.detachPoint = 1; // point of detach (after scroll passed it, menu is fixed)
    $scope.previousScroll = 0; // previous scroll position
    $scope.menuOffset = 54; // height of menu (once scroll passed it, menu is hidden)
    $scope.hideShowOffset = 6; // scrolling value after which triggers hide/show menu
    $scope.currentScroll = 0;
    $scope.scrollDifference = 0;

    angular.element(".content-block").on('scroll', function(e) {
        $scope.topNavToggleOnScroll(e);
    });

    /**
     * logic for showing top nav by scrolling event
     */
    $scope.topNavToggleOnScroll = function(e) {
        if (!$scope.isExpanded) {

            $scope.currentScroll = angular.element(e.currentTarget).scrollTop(); // gets current scroll position
            $scope.scrollDifference = Math.abs($scope.currentScroll - $scope.previousScroll); // calculates how fast user is scrolling
            // if scrolled past menu
            if ($scope.scrollDifference > 5) {
                var isInvisible = $scope.isInvisible;
                if ($scope.currentScroll > $scope.menuOffset) {
                    // if scrolled past detach point add class to fix menu
                    if ($scope.currentScroll > $scope.detachPoint) {
                        if (!$scope.isDetached){
                            $scope.isDetached = true;
                        }
                    }
                    // if scrolling faster than hideShowOffset hide/show menu
                    //if ($scope.scrollDifference >= $scope.hideShowOffset) {
                    //    if ($scope.currentScroll > $scope.previousScroll) {
                    //        // scrolling down; hide menu
                    //        if (!$scope.isInvisible) {
                    //            isInvisible = true
                    //            if (angular.element(".action-single-event-nav").length>0){
                    //                angular.element(".action-single-event-nav").addClass('detached-controls');
                    //            }
                    //        }
                    //    } else {
                    //        // scrolling up; show menu
                    //        if ($scope.isInvisible) {
                    //            isInvisible = false;
                    //            if (angular.element(".action-single-event-nav").length>0){
                    //                angular.element(".action-single-event-nav").removeClass('detached-controls');
                    //            }
                    //        }
                    //    }
                    //}
                } else {
                    // only remove �detached� class if user is at the top of document (menu jump fix)
                    if ($scope.currentScroll <= 0){
                        $scope.isDetached = false;
                    }
                }
                // if user is at the bottom of document show menu
                //if ((angular.element('.content-block').innerHeight + angular.element('.content-block').scrollY) >=
                //    document.getElementById('content').offsetHeight) {
                //    isInvisible = false;
                //    if (angular.element(".action-single-event-nav").length>0){
                //        angular.element(".action-single-event-nav").removeClass('detached-controls');
                //    }
                //}
                // replace previous scroll position with new one
                $scope.previousScroll = $scope.currentScroll;
                //$scope.$apply(function () {
                //    $scope.isInvisible = isInvisible;
                //    if (angular.element(".action-single-event-nav").length>0){
                //        if (isInvisible){
                //            angular.element(".action-single-event-nav").addClass('detached-controls');
                //        } else {
                //            angular.element(".action-single-event-nav").removeClass('detached-controls');
                //        }
                //    }
                //});
            }
        }
    };


    var hash = jQuery(location).attr('hash');
    var search = jQuery(location).attr('search');

    var pathname = jQuery(location).attr('pathname');
    pathname = pathname.split("/");
    pathname = pathname[1];

    if(pathname == "membership" && (hash == "#Profile" || search == "?Profile")) {
        $rootScope.getShowOffer('profile');
    }
    if(pathname == "membership" && (hash == "#Newsletter" || search == "?Newsletter")) {
        $rootScope.getShowOffer('edit_newsletter');
    }
    if(pathname == "membership" && (hash == "#Upgrade" || search == "?Upgrade")) {
        $rootScope.getShowOffer('subscription/select_plan');
    }
    if(pathname == "membership" && search.replace(/[\d]+/gi, '?Invoice')) {
        var re = /\?Invoice(\d+)/i;
        var found = search.match(re);
        if(found && Array.isArray(found) &&  found[1] != undefined && found[1] != "") {
            $rootScope.getShowOffer('payment_receipt/create/'+found[1]);
        }
    }
    if(pathname == "membership" && search == "?SignIn") {
        $rootScope.getShowOffer('profile');
    }
    if(pathname == "membership" && search == "?CancelMembership") {
        $rootScope.getShowOffer('delete_newsletter');
    }
    if(pathname == "membership" && search == "?newsletters") {
        $rootScope.getShowOffer('edit_newsletter');
    }
    if(pathname == "membership" && search == "?SignUp") {
        $rootScope.getShowOffer('sign_up');
    }
    if(pathname == "membership" && hash.length == 41) {
        hash = hash.replace(/#/gi, '');
        setAction('goTo_main');
        $rootScope.getShowOffer('change_password/'+hash);
    }
    if(pathname == "membership" && search.replace(/[\d\w]+/gi, '?Confirm')) {
        var re = /\?Confirm([\d\w]+)/i;
        var found = search.match(re);
        if(found && Array.isArray(found) &&  found[1] != undefined && found[1] != "") {
            $rootScope.getShowOffer('confirmation/'+found[1]);
        }

    }
    if(pathname == "membership" &&  search.length == 41 ) {
        search = search.replace(/\?/gi, '');
        $rootScope.getShowOffer('change_password/'+search);
    }
    if(pathname == "membership" &&  (hash == "#ResetPassword" || search == "?ResetPassword")) {
        $rootScope.getShowOffer('profile/remind_password');
    }
    if(pathname == "membership" &&  hash == "#PurchasingReport") {
       // bucket must be cleaned at page-memberchip_popup by hashtag Purchasing Report
    }
    if(pathname == "reports" || pathname == "report" || pathname == "checkout") {

        var amount = parseInt(jQuery("span.amount:last").text().replace(/\D+/g,""));
        var is_retail = parseInt(jQuery("a.cart:last").data('is_retail'));
        var count_reports = parseInt(jQuery("span.count:last").text().replace(/\D+/g,""));
        if( count_reports > 0 && !MEMBER.top_user && getCookie("purchasing_report_popup") != 1) {
            setCookie("purchasing_report_popup", 1);
            //if (getCookie("purchasing_report")) {
            //    delCookie("purchasing_report");
            //}
            //$rootScope.getShowPopup('purchasing_report');
            if (MEMBER.type == 'retail' && is_retail < 1) {
                $rootScope.getShowOffer('page/purchasing_a_report');
            } else {
                if (is_retail > 0) {
                    $rootScope.getShowOffer('page/purchasing_a_report_retail');
                } else {
                    $rootScope.getShowOffer('page/purchasing_a_report');
                }
            }
        }
    }
    if(pathname == "membership" && search.indexOf('invite_') > -1) {
        var re = /\?(invite_.*)/i;
        var found = search.match(re);
        if(found && Array.isArray(found) &&  found[1] != undefined && found[1] != "") {
            $rootScope.getShowOffer(found[1]);
        }
    }

    if(!pathname.match(/(event|report|checkout)/i) && getCookie("deja_vu") ) {
        $rootScope.getShowOffer('/page/deja_vu');
        delCookie("deja_vu");
    }

    /**
     * broadcast event for showing right sidebar
     */
    $scope.eventSidebarShow = function(){
        $rootScope.$broadcast('eventSidebarShow', {});
    };

}]);