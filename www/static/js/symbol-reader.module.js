
/*
    symbolReaderModule

    AngularJS Module used for evaluating user entered stock symbols.
*/
(function(w, d) {
    'use strict';

    angular.module('symbolReaderModule', [])
        .controller('SymbolReaderCtnl', SymbolReaderCtnl)
        .directive('cmSymbolReader', SymbolReader);

    SymbolReaderCtnl.$inject = ['$rootScope'];
    function SymbolReaderCtnl($rootScope) {
        var sr = this;
        sr.maxSymbols = 4;
        sr.symbolList = [];
        sr.blankSymbolList = ['', '', '', ''];
        sr.symbolVal = '';
        sr.disabled = true;

        sr.evaluateForm = function(e){
            e.preventDefault();
            parseInput();
        }

        sr.exploreSumbit = function(e){
            e.preventDefault();
            $rootScope.$broadcast('launch-loader');
            sr.disabled = true;
            w.location.href = 'stocks-evaluation?symbols=' + sr.symbolList.join(',');
        };

        sr.removeSymbol = function(e, i){
            e.preventDefault();
            sr.symbolList.splice(i, 1);
            sr.blankSymbolList.push('');
            sr.disabled = (sr.symbolList.length > 0) ? false : true;
        };

        function parseInput(){
            var inputVal = sr.symbolVal.trim();
            var vals;
            var badSymbols = [];

            if(inputVal.length === 0 || inputVal === ''){
                $rootScope.$broadcast('notify', 'Invalid Symbols:', 'Please enter valid inputs.');
                sr.symbolVal = '';
                return;
            }

            if(sr.symbolList.length >= sr.maxSymbols){
                $rootScope.$broadcast('notify', 'Max Symbols Added:', 'You\'ve already added the max amount of Symbols.');
                sr.symbolVal = '';
                return;
            }

            vals = inputVal.split(',');

            for(var i = 0; i < vals.length; i++){
                var trimmedVal  = vals[i].trim();
                trimmedVal = trimmedVal.toUpperCase();

                if(!isValidSymbol(trimmedVal)){
                    badSymbols.push(trimmedVal);
                }
                else if(sr.symbolList.indexOf(trimmedVal) !== -1){
                    badSymbols.push(trimmedVal);
                }else{
                    if(i < sr.maxSymbols){
                        sr.symbolList.push(trimmedVal);
                        sr.blankSymbolList.splice(0, 1);
                    }
                }
            }

            if(badSymbols.length > 0){
                $rootScope.$broadcast('notify', 'Invalid Symbols:', badSymbols.join(', '));
            }

            sr.disabled = (sr.symbolList.length > 0) ? false : true;
            sr.symbolVal = '';
        }

        function isValidSymbol(symbol){
            return symbol.match(/^[0-9a-zA-Z]+$/) && 
                    symbol.length < (sr.maxSymbols + 1) &&
                    symbol !== '';
        }
    }
    
    function SymbolReader() {
        var directive = {
            link: link,
            controller: SymbolReaderCtnl,
            controllerAs: 'sr',
            templateUrl: 'static/js/templates/symbol-reader-template.html',
            restrict: 'EA'
        };
        return directive;

        function link(scope, element, attrs) {}
    }

})(window, document);