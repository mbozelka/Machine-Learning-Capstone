
from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/stocks-evaluation')
def stock_eval():
    dates = request.args.get('dates')
    ticks = request.args.get('ticks')

    if not dates and not ticks:
        title = 'no querries made'
    else:
        title = ticks

    return render_template('stocks-evaluation.html', title=title)



if __name__ == '__main__':
    app.run(port=5000, debug=True)
