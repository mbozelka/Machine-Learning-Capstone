

(function(w, d) {
    'use strict';

angular.module('displays', [])
        .factory('DataService', DataService)

        .controller('NormedDisplayCtnl', NormedDisplayCtnl)
        .directive('cmNormedDisplay', NormedDisplay)

        .controller('StatsDisplayCtnl', StatsDisplayCtnl)
        .directive('cmStatsDisplay', StatsDisplay)
        
        .controller('PredictionBreakdownCtnl', PredictionBreakdownCtnl)
        .directive('cmPredictionBreakdown', PredictionBreakdown);

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

    NormedDisplayCtnl.$inject = ['DataService'];
    function NormedDisplayCtnl(DataService) {
        var nd = this;
        var data = DataService.getData();

        nd.dates = data['Stocks'][0]['Dates'];
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
    
            console.log(cntrl.dates);

            var svg = d3.select('.chart-wrapper')
                            .append('svg')
                            .classed('chart', true);

            var chart = svg.append('g')
                            .classed('display', true)
                            .attr('transform', 'translate(100, 0)');

            var dateParser = d3.timeParse('%Y-%m-%d');

            var xScaller = d3.scaleTime()
                            .domain(d3.extent(cntrl.dates, function(d){
                                var date = dateParser(d);
                                return date;
                            }))
                            .range([0, 700]);

            var yScaller = d3.scaleLinear()
                            .domain([0, 300])
                            .range([300, 0]);
            
            drawX_Axis.call(chart, {
                scaller:  xScaller
            });

            drawY_Axis.call(chart, {
                scaller:  yScaller
            })
        }
    }

    StatsDisplayCtnl.$inject = ['DataService'];
    function StatsDisplayCtnl(DataService) {
        var sd = this;
        var data = DataService.getData();
        sd.stats = isolateStats(data);

        function isolateStats(data){
            var stats = [];

            for(var i = 0; i < data['Stocks'].length; i++){
                var statsObj = data['Stocks'][i]['Stats'];
                statsObj['name'] = data['Stocks'][i]['Symbol'];
                stats.push(statsObj);
            }

            return stats
        }
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


    PredictionBreakdownCtnl.$inject = ['DataService'];
    function PredictionBreakdownCtnl(DataService) {
        var pb = this;
        var data = DataService.getData();
        var predictionRange = data['Stocks'][0]['Prediction_Size'];
        pb.stocks = data['Stocks'];
        pb.predictionDates = pb.stocks[0]['Dates'];
        pb.indicies = getPredictionIndiciesSubset(predictionRange, pb.predictionDates.length);

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



    /*
    // scale returns a scaler function
    var x_scaler = d3.scale.linear()
                    .domain([0, max]) // min, max scaler
                    .range([0, w]) // 

    var y_scaler = d3.scale.linear()
                    .domain([0, max]) // min, max scaler
                    .range([0, w]) //

    // groups
    var groupname = svg.append('g')
                        .classed('display', true);

    // clsas
    .classed('class_name', true)

    // labels example
    svg.selectAll('.class-name')
        .data(data)
        .enter()
            .append('text')
            .classed('class_name', true)
            .text((d,i) =>{
                return d;
            })

    */

    // Helper functions
    
    function drawX_Axis(config) {
        var xAxis = d3.axisBottom()
                        .scale(config.scaller);

        // x axis creation
        this.append('g')
            .classed('x axis', true)
            .attr('transform', 'translate(0, 0)')
            .call(xAxis);
    }

    function drawY_Axis(config) {
        var yAxis = d3.axisLeft()
                        .scale(config.scaller);

        // y axis creation
        this.append('g')
            .classed('y axis', true)
            .attr('transform', 'translate(0, 0)')
            .call(yAxis);
    }

    function drawDatePoints(config) {

        // enter()
        this.selectAll('.point')
            .data(config.data)
            .enter()
            .append('circle')
            .classed('point', true)
            .attr('r', 2);

        // update
        this.selectAll('.point')
            .attr('cx', function(d){
                var date = config.dateParser(d);
                return config.xScaller(date);
            })
            .attr('cy', function(value){
                return config.yScaller(value);
            });

        // exit()
        this.selectAll('.point')
            .data(config.data)
            .exit()
            .remove();
    }

    function drawDateLine(config) {
        // line generating function
        var line = d3.svg.line()
                    .x(function(d){
                        var date = config.dateParser(d);
                        return config.xScaller(date);
                    })
                    .y(function(d){
                        return config.yScaller(d);
                    });

        // enter()
        this.selectAll('.trend-line')
            .data([config.data])
            .enter()
            .append('path')
            .classed('trend-line', true);

        // update
        this.selectAll('.trend-line')
            .attr('d', function(d){
                return line(d);
            });

        // exit()
        this.selectAll('.trend-line')
            .data([config.data])
            .exit()
            .remove();
    }

    function getPredictionIndiciesSubset(predictionRange, predictionLength){
        var intervals = []
        
        if(predictionRange <= 0 || predictionLength <= 0) return intervals;
        intervals.push(predictionLength - predictionRange);
        intervals.push(predictionLength - (predictionRange/2));
        intervals.push(predictionLength - 1);
        return intervals;
    }

})(window, document);