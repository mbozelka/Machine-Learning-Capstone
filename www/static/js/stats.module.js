
/*
    statsModule

    AngularJS Module for displaying statistics of chosen stocks
*/
(function(w, d) {
    'use strict';

    angular.module('statsModule', [])
        .controller('StatsDisplayCtnl', StatsDisplayCtnl)
        .directive('cmStatsDisplay', StatsDisplay);


    StatsDisplayCtnl.$inject = ['DataService'];
    function StatsDisplayCtnl(DataService) {
        var sd = this;
        var data = DataService.getData();
        sd.stats = DataService.getStats();
    }
    
    function StatsDisplay() {
        var directive = {
            link: link,
            controller: StatsDisplayCtnl,
            controllerAs: 'sd',
            templateUrl: 'static/js/templates/stats-display-template.html',
            restrict: 'EA'
        };
        return directive;

        function link(scope, element, attrs) {}
    }

})(window, document);