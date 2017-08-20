
/*
    chartService

    AngularJS Module for creating an API for Displaying graphs with D3.js.

    NOTE: Much of this code is not truly reusable and should be reorganized
    and heavily modified in future iterations of web app.

*/

(function(w, d) {
    'use strict';

    angular.module('chartService', [])
            .factory('ChartService', ChartService);


    function ChartService() {

        // return service
        var service = {
            generateDateChart: generateDateChart,
            generateLegend: generateLegend,
            generateChartData: generateChartData,
            splitPredictedVals: splitPredictedVals,
            generateValues: generateValues
        };
        return service;


        /**
         * public methods exposed to the user
         */

         /**
         * Re-shape the data in a usable format for the 
         * charting functions. Specific to this web app
         * and not the charting
         */
        function generateValues(values, dates){
            var returnData = [];

            if(values.length !== dates.length) return returnData;

            for(var i = 0; i < values.length; i++){
                var obj = {}

                obj.x = dates[i];
                obj.y = values[i];
                returnData.push(obj)
            }

            return returnData;
        }

        /**
         * Method to help split the stocks data into
         * historical data, and predicted data
         */
        function splitPredictedVals(stock, list, predictIndicies){
            var data = stock[list];
            var dates = stock['Dates'];
            var predSize = stock['Prediction_Size'];

            var returnData = {
                histValues: data.slice(0, -predSize + 1),
                histDates: dates.slice(0, -predSize + 1),
                predictValues: data.slice(predictIndicies[0]),
                predictDates: dates.slice(predictIndicies[0])
            }

            return returnData;
        }

         /**
         * Specific to this web app. 
         * Returns a usable format of data to draw
         * a graph of each stock for comparison
         */
        function generateChartData(stocks, list, predictIndicies, colors, predictColor){
            var data = [];
            var legendData = [];

            for(var i = 0; i < stocks.length; i++){
                var stockHistoricalObj = {};
                var stockPredictedlObj = {};
                var dataChopped = splitPredictedVals(stocks[i], list, predictIndicies)

                stockHistoricalObj.color = colors[i];
                stockHistoricalObj.name = stocks[i].Symbol;
                stockHistoricalObj.data = generateValues(dataChopped.histValues, dataChopped.histDates);

                stockPredictedlObj.color = predictColor;
                stockPredictedlObj.name = stocks[i].Symbol + ' Predicted';
                stockPredictedlObj.data = generateValues(dataChopped.predictValues, dataChopped.predictDates);

                data.push(stockHistoricalObj);
                data.push(stockPredictedlObj);
                legendData.push({
                    color: colors[i],
                    text: stocks[i].Symbol
                });
            }
            
            legendData.push({
                color: predictColor,
                text: 'Predicted'
            });

            return {
                chartData : data,
                legendData : legendData
            };
        };

        /**
         * Specific to this web app. 
         * Returns a usable format of data to draw
         * a graphs legends
         */
        function generateLegend(obj) {
            var legend, legendGroup, legendHeight,
                recWidth, recHeight, legendSpacing;

            legend = d3.select(obj.wrapper);

            legendSpacing = 4;
            recWidth = 100;
            recHeight = 10;

            legendHeight = (obj.data.length * recHeight) + (obj.margins.top + obj.margins.bottom) + (obj.data.length * legendSpacing);

            legend = d3.select(obj.wrapper)
                        .append('svg')
                        .attr('width', '100%')
                        .attr('height', legendHeight)
                        .classed('svg-legend ' + obj.className, true);

            legendGroup = legend.append('g')
                        .classed('display', true)
                        .attr('transform', 'translate('+ obj.margins.left +', '+ obj.margins.top +')');

            drawLegend.call(legendGroup, {
                data: obj.data,
                className: ['legend-point', obj.className],
                legendSpacing: legendSpacing,
                recWidth: recWidth,
                recHeight: recHeight
            });
        }
        
        /**
         * 
         * main funciton for generting charts for this applicatin
         * 
         * Obj is graph overrides
         */
        function generateDateChart(obj) {
    
            var chart, chartGroup, chartWidth, chartHeight,
                dateParser, xScaller, yScaller,
                gHeight, gWidth, max_min;

            chart = d3.select(obj.wrapper);
            chartWidth = chart.node().getBoundingClientRect().width;
            chartHeight = (chartWidth * 9) / 16; // generate a rough 16:9 ratio for the height
            
            gWidth = chartWidth - (obj.margins.left + obj.margins.right);
            gHeight = chartHeight - (obj.margins.top + obj.margins.bottom);
            
            dateParser = d3.timeParse(obj.dateParser);
            max_min = getMaxMin(obj.data);

            chart = chart.append('div')
                        .classed('svg-container', true)
                        .append('svg')
                        .attr('preserveAspectRatio', 'xMinYMin meet')
                        .attr('viewBox', '0 0 '+chartWidth+' '+chartHeight)
                        .classed('svg-graph ' + obj.className, true);

            chartGroup = chart.append('g')
                        .classed('display', true)
                        .attr('transform', 'translate('+ obj.margins.left +', '+ obj.margins.top +')');

            xScaller = d3.scaleTime()
                        .domain(d3.extent(obj.dates, function(d){
                            var date = dateParser(d);
                            return date;
                        }))
                        .range([0, gWidth]);

            yScaller = d3.scaleLinear()
                        .domain([max_min.y.min, max_min.y.max])
                        .range([gHeight, 0]);
                    
            drawX_Axis.call(chartGroup, {
                scaller: xScaller,
                gHeight: gHeight,
                gWidth: gWidth,
                label: 'Dates'
            });

            drawY_Axis.call(chartGroup, {
                scaller: yScaller,
                gHeight: gHeight,
                label: 'Adjusted Close'
            });

            generateLines(chartGroup, obj, xScaller, yScaller, dateParser);
        }




        /**
         * Private functions 
         * used for generating graphs
         */

         /**
         * create the data on the graph
         */
        function generateLines(chartGroup, obj, xScaller, yScaller, dateParser) {
            for(var i = 0; i < obj.data.length; i++){
                var config = {
                    data: obj.data[i].data,
                    dateParser: dateParser,
                    xScaller: xScaller,
                    yScaller: yScaller,
                    color: obj.data[i].color
                };

                config.className = ['trend-line', obj.className, 'line' + i]
                drawDateLine.call(chartGroup, config);

                config.className = ['point', obj.className, 'point-set' + i]
                drawDatePoints.call(chartGroup, config);
            }
        }

        /**
         * x axis generator
         */
        function drawX_Axis(config) {
            var xAxis = d3.axisBottom().scale(config.scaller);
            this.append('g')
                .classed('x axis', true)
                .attr('transform', 'translate(0, ' + config.gHeight + ')')
                .call(xAxis);

            this.append('text')
                .classed('x-label label', true)
                .attr('text-anchor', 'middle')
                .attr('font-size', '1.4em')
                .attr('fill', '#8e8e8e')
                .attr('transform', 'translate(' + (config.gWidth/2) + ', ' + (config.gHeight + 40) + ')')
                .text(config.label);
        }

        /**
         * y axis generator
         */
        function drawY_Axis(config) {
            var yAxis = d3.axisLeft().scale(config.scaller);
            this.append('g')
                .classed('y axis', true)
                .attr('transform', 'translate(0, 0)')
                .call(yAxis);

            this.append('text')
                .classed('y-label label', true)
                .attr('text-anchor', 'middle')
                .attr('font-size', '1.4em')
                .attr('fill', '#8e8e8e')
                .attr('transform', 'rotate(-90) translate(' + (-config.gHeight/2) + ', -40)')
                .text(config.label);
        }

        /**
         * legend drawing generator
         * this refers to the desired group
         */
        function drawLegend(config) {
            // enter()
            // rec
            this.selectAll('.' + config.className.join('.') + '.rec')
                .data(config.data)
                .enter()
                .append('rect')
                .classed(config.className.join(' ') + ' rec', true);

            // text
            this.selectAll('.' + config.className.join('.') + '.text')
                .data(config.data)
                .enter()
                .append('text')
                .attr('dominant-baseline', 'hanging')
                .classed(config.className.join(' ') + ' text', true);

            // update
            // rec
            this.selectAll('.' + config.className.join('.') + '.rec')
                .attr('width', config.recWidth)
                .attr('height', config.recHeight)
                .attr('fill', function(d) { 
                    return d.color;
                })
                .attr('transform', function(d, i){
                    var top = (i === 0 ) ? top = config.recHeight * i : (config.recHeight + config.legendSpacing) * i;
                    return 'translate(0,' + top + ')';
                });
            
            // text
            this.selectAll('.' + config.className.join('.') + '.text')
                .text(function(d) { 
                    return d.text;
                })
                .attr('x', config.recWidth + 10)
                .attr('y', function(d, i){
                    var top = (i === 0 ) ? top = config.recHeight * i : (config.recHeight + config.legendSpacing) * i;
                    return top;
                });

            // exit()
            // rec
            this.selectAll('.' + config.className.join('.') + '.rec')
                .data(config.data)
                .exit()
                .remove();

            // text
            this.selectAll('.' + config.className.join('.') + '.text')
                .data(config.data)
                .exit()
                .remove();
        }

        /**
         * Point drawing generator
         * this refers to the desired group
         */
        function drawDatePoints(config) {
            // enter()
            this.selectAll('.' + config.className.join('.'))
                .data(config.data)
                .enter()
                .append('circle')
                .classed(config.className.join(' '), true)
                .attr('fill', config.color)
                .attr('r', 2);

            // update
            this.selectAll('.' + config.className.join('.'))
                .attr('cx', function(d, i){
                    var date = config.dateParser(d.x);
                    return config.xScaller(date);
                })
                .attr('cy', function(d){
                    return config.yScaller(d.y);
                });

            // exit()
            this.selectAll('.' + config.className.join('.'))
                .data(config.data)
                .exit()
                .remove();
        }

        /**
         * Line drawing generator
         * this refers to the desired group
         */
         function drawDateLine(config) {
            var line = d3.line()
                        .x(function(d, i){
                            var date = config.dateParser(d.x);
                            return config.xScaller(date);
                        })
                        .y(function(d){
                            return config.yScaller(d.y);
                        });

            // enter()
            this.selectAll('.' + config.className.join('.'))
                .data([config.data])
                .enter()
                .append('path')
                .attr('stroke', config.color)
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

        /**
         * Grap the max and min values
         * for scaling the graphs
         */
        function getMaxMin(data){
            var min_max = {x: {}, y: {}};

            for(var i = 0; i < data.length; i++){
                var set = data[i].data;

                if(i === 0){
                    min_max.x.min = set[0].x;
                    min_max.x.max = set[0].x;
                    min_max.y.min = set[0].y;
                    min_max.y.max = set[0].y;
                }

                for(var k = 0; k < set.length; k++){
                    //min x
                    if(set[k].x < min_max.x.min){
                        min_max.x.min = set[k].x;
                    }
                    //max x
                    if(set[k].x > min_max.x.max){
                        min_max.x.max = set[k].x;
                    }
                    //min y
                    if(set[k].y < min_max.y.min){
                        min_max.y.min = set[k].y;
                    }
                    //max y
                    if(set[k].y > min_max.y.max){
                        min_max.y.max = set[k].y;
                    }
                }
            }

            return min_max;
        }
    
    } // end of chart service

})(window, document);