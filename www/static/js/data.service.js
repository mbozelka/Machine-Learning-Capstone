
(function(w, d) {
    'use strict';

    angular.module('dataService', [])
            .factory('DataService', DataService);


    function DataService() {
        var data = window.stockData;
        var service = {
            getData: getData,
            getPredictionIndicies: getPredictionIndicies,
            getStats: getStats
        };
        return service;

        function getData() {
            return data;
        }

        function getPredictionIndicies(){
            var intervals = [];
            var predictionRange = data['Stocks'][0]['Prediction_Size'];
            var dates = data['Stocks'][0]['Dates'];
            
            if(predictionRange <= 0 || dates.length <= 0) return intervals;
            intervals.push(dates.length - predictionRange);
            intervals.push(dates.length - (predictionRange/2));
            intervals.push(dates.length - 1);
            return intervals;
        }

        function getStats(){
            var stats = [];

            for(var i = 0; i < data['Stocks'].length; i++){
                var statsObj = data['Stocks'][i]['Stats'];
                statsObj['name'] = data['Stocks'][i]['Symbol'];
                stats.push(statsObj);
            }

            return stats
        }
    }

})(window, document);