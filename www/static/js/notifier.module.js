
/*
    Notifier

    AngularJS Module for displaying notifcations 
    to alert users to specific callouts.

    Relies on broadcasting and listens for the 'notify' event
*/

(function(w, d) {
    'use strict';
    angular.module('Notifier', [])
    .controller('NotifierCntrl', NotifierCntrl)
    .directive('cmNotifierDir', NotifierDir);

    NotifierCntrl.$inject = ['$rootScope', '$timeout'];
    function NotifierCntrl($rootScope, $timeout) {
        var nd = this;
        nd.title = '';
        nd.msg = '';
        nd.active = false;

        $rootScope.$on('notify', function(event, title, msg) {
            nd.title = title;
            nd.msg = msg;
            nd.active = true;
            $timeout(function(){
                nd.title = '';
                nd.msg = '';
                nd.active = false;
            }, 1250);
        });
    }

    function NotifierDir() {
        var directive = {
            link: link,
            controller: NotifierCntrl,
            controllerAs: 'nd',
            template: '<div class="notifier-wrap" ng-class="{active: nd.active}"><div class="notification"><h3>{{nd.title}}</h3><p>{{nd.msg}}</p></div></div>',
            restrict: 'EA'
        };
        return directive;

        function link(scope, element, attrs) {}
    }

})(window, document);