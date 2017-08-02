

(function(w, d) {
    'use strict';

angular.module('displays', [])
        .factory('DataService', DataService)

        .controller('NormedDisplayCtnl', NormedDisplayCtnl)
        .directive('cmNormedDisplay', NormedDisplay)

        .controller('StatsDisplayCtnl', StatsDisplayCtnl)
        .directive('cmStatsDisplay', StatsDisplay);

    function DataService() {
        var data = window.stockData;
        var service = {
            getData: getData
        };
        return service;

        function getData() {
            return data;
        }
    }

    StatsDisplayCtnl.$inject = ['DataService'];
    function StatsDisplayCtnl(DataService) {
        var ds = this;
        var data = DataService.getData();
        ds.stats = isolateStats(data);

        console.log(ds.stats);

        function isolateStats(data){
            var stats = [];

            for(var stock in data['Stocks']){
                var statsObj = data['Stocks'][stock]['Stats'];
                statsObj['name'] = stock;
                stats.push(statsObj);
            }

            return stats
        }
    }
    
    function StatsDisplay() {
        var directive = {
            link: link,
            controller: StatsDisplayCtnl,
            controllerAs: 'ds',
            templateUrl: 'static/js/templates/stats-display-template.html',
            restrict: 'EA'
        };
        return directive;

        function link(scope, element, attrs) {}
    }



    NormedDisplayCtnl.$inject = ['DataService'];
    function NormedDisplayCtnl(DataService) {
        var ds = this;
        var data = DataService.getData();
        var dateParser = d3.timeParse('%Y-%m-%d');
   
        console.log('2015-08-17');
        console.log(dateParser('2015-08-17'))
    }
    
    function NormedDisplay() {
        var directive = {
            link: link,
            controller: NormedDisplayCtnl,
            controllerAs: 'ngm',
            templateUrl: 'static/js/templates/normed-graph-template.html',
            restrict: 'EA'
        };
        return directive;

        function link(scope, element, attrs) {}
    }







    function lineChart(config) {
        return function() {
            // generate chart here, using `config.width` and `config.height`
        };
    }


})(window, document);