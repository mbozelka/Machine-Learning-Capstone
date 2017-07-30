
from flask import Flask, redirect, url_for, render_template, request
from app.main import stocks_data

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/stocks-evaluation')
def stock_eval():
    symbols = request.args.get('symbols')
    data = stocks_data()

    if not symbols:
        return redirect('')

    return render_template('stocks-evaluation.html', data=data)



if __name__ == '__main__':
    app.run(port=5000, debug=True)
