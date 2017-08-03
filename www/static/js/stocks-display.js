

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

    NormedDisplayCtnl.$inject = ['DataService'];
    function NormedDisplayCtnl(DataService) {
        var nd = this;
        var data = DataService.getData();

        nd.dates = data['Stocks'][0]['Dates'];
        nd.indicies = DataService.getPredictionIndicies();
        nd.predLength = data['Stocks'][0]['Prediction_Size'];

        nd.getVals = function(){
            var vals = [];

            for(var i = 0; i < data['Stocks'].length; i++){
                vals.push({
                    'symbol': data['Stocks'][i]['Symbol'],
                    'values': data['Stocks'][i]['Normed_Data']
                })
            }

            return vals;
        }

        nd.getMax = function(lists){
            var max = 0;

            for(var i = 0; i < lists.length; i++){
                var valList = lists[i]['values'];
                for(var k = 0; k < valList.length; k++){
                    if(valList[k] > max){
                        max = valList[k];
                    }
                }
            }

            return max;
        }
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
            var wrapper, svg, chart, dateParser, xScaller, yScaller, margins,
            svgHeight, svgWidth, gHeight, gWidth, valuesList, predValuesList, colors, predictedColor,
            legendData = [];

            colors = ['1c77c3', '39a9db', '40bcd8', 'f39237', 'd63230'];
            predictedColor = ['d63230']
            wrapper = d3.select('.chart-wrapper').node();
            margins = {'top':20, 'right':20, 'bottom':30, 'left':40};
            svgHeight = 400;
            svgWidth = wrapper.getBoundingClientRect().width;
            gHeight = svgHeight - (margins.top + margins.bottom);
            gWidth = svgWidth - (margins.left + margins.right);

            //console.log(cntrl.indicies);
            valuesList = cntrl.getVals();
            predValuesList = cntrl.getVals();

            //console.log(valuesList);
            svg = d3.select('.chart-wrapper')
                        .append('svg')
                        .attr('width', svgWidth)
                        .attr('height', svgHeight)
                        .classed('svg-graph', true);

            chart = svg.append('g')
                        .classed('display', true)
                        .attr('width', gWidth)
                        .attr('height', gHeight)
                        .attr('transform', 'translate('+ margins.left +', '+ margins.top +')');

            dateParser = d3.timeParse('%Y-%m-%d');

            xScaller = d3.scaleTime()
                        .domain(d3.extent(cntrl.dates, function(d){
                            var date = dateParser(d);
                            return date;
                        }))
                        .range([0, gWidth]);

            yScaller = d3.scaleLinear()
                        .domain([0, cntrl.getMax(valuesList)])
                        .range([gHeight, 0]);
            
            drawX_Axis.call(chart, {
                scaller: xScaller,
                gHeight: gHeight
            });

            drawY_Axis.call(chart, {
                scaller: yScaller
            });

            for(var i = 0; i < valuesList.length; i++){
                var v = valuesList[i]['values'].slice(0, -cntrl.predLength + 1);
                var vp = valuesList[i]['values'].slice(cntrl.indicies[0]);
                var dp = cntrl.dates.slice(cntrl.indicies[0]);

                var config = {
                    dates: cntrl.dates,
                    data: v,
                    dateParser: dateParser,
                    xScaller: xScaller,
                    yScaller: yScaller,
                    color: colors[i]
                }

                config.className = ['trend-line', 'line-' + i];
                drawDateLine.call(chart, config);

                config.className = ['point', 'point-set-' + i];
                drawDatePoints.call(chart, config);

                // predictions
                config.className = ['trend-line', 'line-predict-' + i];
                config.data = vp;
                config.dates = dp;
                config.color = predictedColor;
                drawDateLine.call(chart, config);

                config.className = ['point', 'point-set-predict-' + i];
                drawDatePoints.call(chart, config);

                legendData.push({
                    color: colors[i],
                    value: valuesList[i].symbol
                });
            }

            legendData.push({
                color: predictedColor,
                value: 'Predicted'
            });
            console.log(legendData);
        }
    }

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

















    // Helper functions
    
    function drawX_Axis(config) {
        var xAxis = d3.axisBottom().scale(config.scaller);
        // x axis creation
        this.append('g')
            .classed('x axis', true)
            .attr('transform', 'translate(0, ' + config.gHeight + ')')
            .call(xAxis);
    }

    function drawY_Axis(config) {
        var yAxis = d3.axisLeft().scale(config.scaller);

        // y axis creation
        this.append('g')
            .classed('y axis', true)
            .attr('transform', 'translate(0, 0)')
            .call(yAxis);
    }

    function drawDatePoints(config) {
        // enter()
        this.selectAll('.' + config.className.join('.'))
            .data(config.data)
            .enter()
            .append('circle')
            .style("fill", function(d) { 
                return config.color;
            })
            .classed(config.className.join(' '), true)
            .attr('r', 2);

        // update
        this.selectAll('.' + config.className.join('.'))
            .attr('cx', function(d, i){
                var date = config.dateParser(config.dates[i]);
                return config.xScaller(date);
            })
            .attr('cy', function(d){
                return config.yScaller(d);
            });

        // exit()
        this.selectAll('.' + config.className.join('.'))
            .data(config.data)
            .exit()
            .remove();
    }

    function drawDateLine(config) {
        // line generating function

        var line = d3.line()
                    .x(function(d, i){
                        var date = config.dateParser(config.dates[i]);
                        return config.xScaller(date);
                    })
                    .y(function(d){
                        return config.yScaller(d);
                    });

        // enter()
        this.selectAll('.' + config.className.join('.'))
            .data([config.data])
            .enter()
            .append('path')
            .style("stroke", function(d) { 
                return config.color;
            })
            .classed(config.className.join(' '), true);

        // update
        this.selectAll('.' + config.className.join('.'))
            .attr('d', function(d){
                return line(d);
            });

        // exit()
        this.selectAll('.' + config.className.join('.'))
            .data([config.data])
            .exit()
            .remove();
    }

})(window, document);