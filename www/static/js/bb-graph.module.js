/*
    bbGraph

    AngularJS Module for displaying Bollinger Band graph of stocks.

    Uses the DataService and ChartService API.
*/


(function(w, d) {
    'use strict';

    angular.module('bbGraph', [])
            .controller('BbGraphCtnl', BbGraphCtnl)
            .directive('cmBbGraph', BbGraph);


    BbGraphCtnl.$inject = ['ChartService', 'DataService'];

    function BbGraphCtnl(ChartService, DataService) {
        var bb = this, hasData;
        
        bb.data = DataService.getData();
        bb.chartsService = ChartService;
        hasData = bb.data['Stocks'].length > 0;
        
        bb.indicies = (hasData) ? DataService.getPredictionIndicies() : [];
    }
    
    function BbGraph() {
        var directive = {
            link: link,
            controller: BbGraphCtnl,
            controllerAs: 'bb',
            templateUrl: 'static/js/templates/bb-graph-template.html',
            restrict: 'EA'
        };
        return directive;

        function link(scope, element, attrs, cntrl) {
            var colors, predictedColor,
            graphData, legendData, dataSet,
            lowrBands, upperBands, adjustedClosed,
            lowrBandsHist, lowrBandsPred,
            upperBandsHist, upperBandsPred,
            adjustedClosedHist, adjustedClosedPred,
            chartData, legendData;

            cntrl.name = attrs.symbol;

            for(var i = 0; i < cntrl.data['Stocks'].length; i++){
                if(cntrl.data['Stocks'][i].Symbol === attrs.symbol){
                    dataSet = cntrl.data['Stocks'][i];
                    break;
                }
            }

            // colors
            colors = ['#f39237', '#1c77c3', '#3cca68'];
            predictedColor = '#d63230';

            chartData = [];
            legendData = [];

            lowrBands = cntrl.chartsService.splitPredictedVals(dataSet, 'Lower_bb', cntrl.indicies);
            upperBands = cntrl.chartsService.splitPredictedVals(dataSet, 'Upper_bb', cntrl.indicies);
            adjustedClosed = cntrl.chartsService.splitPredictedVals(dataSet, 'Target_Vals', cntrl.indicies);

            // lower bands
            chartData.push({
                color: colors[0],
                name: attrs.symbol + ' Lower Bands',
                data: cntrl.chartsService.generateValues(lowrBands.histValues, lowrBands.histDates)
            });

            chartData.push({
                color: predictedColor,
                name: attrs.symbol + ' Lower Bands Predicted',
                data: cntrl.chartsService.generateValues(lowrBands.predictValues, lowrBands.predictDates)
            });

            legendData.push({
                color: colors[0],
                text: attrs.symbol + ' Upper Bands'
            });

             // Upper bands
            chartData.push({
                color: colors[1],
                name: attrs.symbol + ' Upper Bands',
                data: cntrl.chartsService.generateValues(upperBands.histValues, upperBands.histDates)
            });

            chartData.push({
                color: predictedColor,
                name: attrs.symbol + ' Upper Bands Predicted',
                data: cntrl.chartsService.generateValues(upperBands.predictValues, upperBands.predictDates)
            });

            legendData.push({
                color: colors[1],
                text: attrs.symbol + ' Upper Bands'
            });

             // Adjusted Close
            chartData.push({
                color: colors[2],
                name: attrs.symbol + ' Adjusted Close',
                data: cntrl.chartsService.generateValues(adjustedClosed.histValues, adjustedClosed.histDates)
            });

            chartData.push({
                color: predictedColor,
                name: attrs.symbol + ' Adjusted Close Predicted',
                data: cntrl.chartsService.generateValues(adjustedClosed.predictValues, adjustedClosed.predictDates)
            });

            legendData.push({
                color: colors[2],
                text: attrs.symbol + ' Adjusted Close'
            });

            legendData.push({
                color: predictedColor,
                text: 'Predicted'
            });

            // generate the chart
            cntrl.chartsService.generateDateChart({
                margins: {'top':20, 'right':20, 'bottom':50, 'left':60},
                wrapper: element[0].querySelector('.box-chart'),
                data: chartData,
                dateParser: '%Y-%m-%d',
                dates: dataSet.Dates,
                className: 'bb-ratios-chart-' + attrs.symbol.toLowerCase()
            });

            // generate the Legend
            cntrl.chartsService.generateLegend({
                margins: {'top':10, 'right':10, 'bottom':10, 'left':10},
                wrapper: element[0].querySelector('.box-legend'),
                className: 'bb-ratios-legend-' + attrs.symbol.toLowerCase(),
                data: legendData
            });
        }
    }

})(window, document);