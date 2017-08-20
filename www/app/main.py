
from collections import OrderedDict
from stock_time_series import Stock_Time_Series
from stock_explorer import Stock_Explorer


def stocks_data(symbol_list):
    """ return full JSON data from stock predictions 

        keyword Arguments:
        symbol_list = an array of stock symbols. ex: ['SPY', 'GOOG']

        The main entry point into gathering stock data,
        running it through the classifer, and returning
        all the data needed for the html rendering.
    """

    sts = Stock_Time_Series()
    symbol_list = list(OrderedDict.fromkeys(symbol_list))

    stocks_df, good_symbols, bad_symbols = sts.fetch_data(symbol_list)
    retrun_json = {}
    retrun_json['Stocks'] = []

    for symbol in good_symbols:
        stock_data = Stock_Explorer(stocks_df[symbol], symbol)
        retrun_json['Stocks'].append(stock_data.get_json())

    retrun_json['successful'] = good_symbols
    retrun_json['errors'] = bad_symbols

    return retrun_json


if __name__ == '__main__':
    data = stocks_data(['GOOG'])
    print data

