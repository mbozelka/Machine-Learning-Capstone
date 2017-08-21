
from flask import Flask, redirect, url_for, render_template, request
from stock_time_series import Stock_Time_Series
from stock_explorer import Stock_Explorer
from main import stocks_data

app = Flask(__name__)

@app.errorhandler(404)
def not_found(error):
    """ Return HTML template for pages not found """
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(error):
    """ Return HTML error template when there is an application level error """
    return render_template('500.html'), 500

@app.route('/')
def index():
    """ Return the main index page for the application """
    return render_template('index.html')

@app.route('/stocks-evaluation')
def stock_eval():
    """ Return the html template for redenering predictions of stocks """
    symbols = request.args.get('symbols')

    if not symbols:
        return redirect('')

    symbol_list = symbols.split(',')
    data = stocks_data(symbol_list)
    
    return render_template('stocks-evaluation.html', data=data)

# @app.route('/test')
# def test():
#     """ Return the html template for rtest page with cached data for development purposes """
#     return render_template('test-template.html')


if __name__ == '__main__':
    app.run(port=5000, debug=False)
