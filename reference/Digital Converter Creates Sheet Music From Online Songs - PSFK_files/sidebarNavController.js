psfk4App.controller('sidebarNavController', ['$scope', '$rootScope', function ($scope, $rootScope) {

    /**
     * broadcast event for showing right sidebar
     */
    $scope.eventSidebarShow = function(is_show){
        $rootScope.$broadcast('eventSidebarShow', {
            'show': is_show
        });
    };

    /**
     * broadcast event for showing new content in right sidebar
     */
    $scope.eventLoadListPost = function(partType, subPartType, tax_type, taxonomy){
        $rootScope.$broadcast('eventLoadListPost', {
            'partType': partType,
            'subPartType': subPartType,
            'tax_type': tax_type,
            'taxonomy': taxonomy
        });
    };

    /**
     * broadcast event for showing new Channels content in right sidebar
     */
    $scope.eventLoadChannels = function(group){
        $rootScope.$broadcast('eventLoadChannels', {
            'group': group
        });
    };

}]);