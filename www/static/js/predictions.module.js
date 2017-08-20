

/*
    predictions

    AngularJS Module for displaying predictions of chosen stocks
*/

(function(w, d) {
    'use strict';

angular.module('predictions', [])
        .controller('PredictionBreakdownCtnl', PredictionBreakdownCtnl)
        .directive('cmPredictionBreakdown', PredictionBreakdown);


    PredictionBreakdownCtnl.$inject = ['DataService'];
    function PredictionBreakdownCtnl(DataService) {
        var pb = this;
        var data = DataService.getData();

        pb.stocks = data['Stocks'];
        pb.dates = pb.stocks[0]['Dates'];
        pb.indicies = DataService.getPredictionIndicies();
        
        pb.getDate = function(d){
            return new Date(d);
        }

        pb.getAdjClose = function(stock, i){
            return stock.Target_Vals[i];
        }

        pb.getAction = function(stock, i){
            var bbRatios = stock.BB_Ratios[i];
            var prevDay = stock.BB_Ratios[i - 1];

            if( (bbRatios > 0 && bbRatios <= 1) && prevDay >= 1){
                return 'Sell';
            }else if((bbRatios < 0 && bbRatios >= -1) && prevDay <= -1){
                return 'Buy';
            }
            return 'None';
        }
    }
    
    function PredictionBreakdown() {
        var directive = {
            link: link,
            controller: PredictionBreakdownCtnl,
            controllerAs: 'pb',
            templateUrl: 'static/js/templates/prediction-breakdown-template.html',
            restrict: 'EA'
        };
        return directive;

        function link(scope, element, attrs) {}
    }

})(window, document);