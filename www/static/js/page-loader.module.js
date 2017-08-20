
/*
    Loader

    AngularJS Module for displaying page loader
*/
(function(w, d) {
    'use strict';
    angular.module('Loader', [])
    .controller('PageLoaderCntrl', PageLoaderCntrl)
    .directive('cmPageLoader', PageLoader);

    PageLoaderCntrl.$inject = ['$rootScope', '$timeout'];
    function PageLoaderCntrl($rootScope, $timeout) {
        var pl = this;
        pl.active = false;

        $rootScope.$on('launch-loader', function(event) {
            pl.active = true;
        });

        $rootScope.$on('hide-loader', function(event) {
            pl.active = false;
        });
    }

    function PageLoader() {
        var directive = {
            link: link,
            controller: PageLoaderCntrl,
            controllerAs: 'pl',
            template: '<div class="loader-wrap" ng-class="{active: pl.active}"></div>',
            restrict: 'EA'
        };
        return directive;

        function link(scope, element, attrs) {}
    }

})(window, document);