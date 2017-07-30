

(function(w, d) {
    'use strict';

    function SymbolReader(symbol_form, symbol_list, explore_btn, symbol_max_length, max_symbols){
        var _self = this;
        _self.symbol_max_length = symbol_max_length;
        _self.max_symbols = max_symbols;
        _self.form = $(symbol_form);
        _self.input = _self.form.find('input[type=text]');
        _self.explore_btn = $(explore_btn);
        _self.symbols_list = $(symbol_list).find('li');
        _self.symbols = [];

        _self.form.on('submit', function(e){
            e.preventDefault();
            _self.parse_input()
        });

        _self.symbols_list.on('click', function(e){
            e.preventDefault();
            var _this = $(this);
            if(!_this.hasClass('active')) return;

            _self.symbols.splice(_this.index(), 1);
            _self._set_symbols();
        });

        _self.explore_btn.on('click', function(e){
            e.preventDefault();
            
            w.location.href = 'stocks-evaluation?symbols=' + _self.symbols.join(',');
        });
    }

    SymbolReader.prototype.get_symbols = function(){
        return this.symbols;
    };

    SymbolReader.prototype.parse_input = function(){
        var input_val = $.trim(this.input.val());
        var vals;
        var bad_symbols = [];

        if(input_val.length === 0 || input_val === ''){
            console.log('Please enter valid inputs.');
            this.input.val('');
            return;
        }
        
        if(this.symbols.length === this.max_symbols){
            console.log('You\'ve already added the max amount of Symbols.');
            this.input.val('');
            return;
        }

        vals = input_val.split(',');

        for(var i = 0; i < vals.length; i++){
            var trimmed_val  = $.trim(vals[i]);
            trimmed_val = trimmed_val.toUpperCase();

            if(i > this.max_symbols){
                break;
            }
            else if(!this._isValidSymbol(trimmed_val)){
                bad_symbols.push(trimmed_val);
            }else{
                this.symbols.push(trimmed_val);
            }
        }

        this.input.val('');

        if(bad_symbols.length > 0){
            console.log('Invalid Symbols: ', bad_symbols.join(', '));
        }

        if(this.symbols.length > 0){
            this._set_symbols();
        }
    };

    SymbolReader.prototype._isValidSymbol = function(symbol){
        return symbol.match(/^[0-9a-zA-Z]+$/) && 
               symbol.length < (this.max_symbols + 1) &&
               symbol !== '';
    };

    SymbolReader.prototype._set_symbols = function(){
        for(var i = 0; i < this.max_symbols; i++){
            if(typeof this.symbols[i] === 'undefined'){
                this.symbols_list.eq(i).html('').removeClass('active');
            }else{
                this.symbols_list.eq(i).html(this.symbols[i]).addClass('active');
            }
        }
        this._toggle_explore();
    };

    SymbolReader.prototype._toggle_explore = function(){
        if(this.symbols.length === 0)
            this.explore_btn.prop('disabled', true);
        else
            this.explore_btn.prop('disabled', false);
    };

    w.SymbolReader = SymbolReader;

})(window, document);