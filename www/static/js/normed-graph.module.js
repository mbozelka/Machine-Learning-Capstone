
/*
    normalizedGraph

    AngularJS Module for displaying normalized data comparison graph of stocks.

    Uses the DataService and ChartService API.
*/

(function(w, d) {
    'use strict';

    angular.module('normalizedGraph', [])
            .controller('NormedDisplayCtnl', NormedDisplayCtnl)
            .directive('cmNormedDisplay', NormedDisplay);


    NormedDisplayCtnl.$inject = ['ChartService', 'DataService'];

    function NormedDisplayCtnl(ChartService, DataService) {
        var nd = this, hasData;
        
        nd.data = DataService.getData();
        nd.chartsService = ChartService;
        hasData = nd.data['Stocks'].length > 0;
        
        nd.dates = (hasData) ? nd.data['Stocks'][0]['Dates'] : [];
        nd.indicies = (hasData) ? DataService.getPredictionIndicies() : [];
    }
    
    function NormedDisplay() {
        var directive = {
            link: link,
            controller: NormedDisplayCtnl,
            controllerAs: 'nd',
            templateUrl: 'static/js/templates/normed-graph-template.html',
            restrict: 'EA'
        };
        return directive;

        function link(scope, element, attrs, cntrl) {
            var colors, predictedColor,
            graphData, legendData;

            // colors
            colors = ['#f39237', '#1c77c3', '#3cca68', '#be3cca', '#f3d637'];
            predictedColor = '#d63230';

            graphData = cntrl.chartsService.generateChartData(cntrl.data['Stocks'], 'Normed_Data', 
                            cntrl.indicies, colors, predictedColor);

            // generate the chart
            cntrl.chartsService.generateDateChart({
                margins: {'top':20, 'right':20, 'bottom':50, 'left':60},
                wrapper: '.normed-chart',
                data: graphData.chartData,
                dateParser: '%Y-%m-%d',
                dates: cntrl.dates,
                className: 'normed-data'
            });

            // generate the Legend
            cntrl.chartsService.generateLegend({
                margins: {'top':10, 'right':10, 'bottom':10, 'left':10},
                wrapper: '.normed-legend',
                className: 'normed-legend',
                data: graphData.legendData
            });
        }
    }

})(window, document);