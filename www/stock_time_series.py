import pandas as pd
from pandas_datareader import data, wb
import datetime
from dateutil.relativedelta import relativedelta

class Stock_Time_Series():
    """ Class for gathering data from Yahoo finance."""

    def __init__(self, to_date=datetime.datetime.now(), year_span=2):
        """ Initialize Stock_Time_Series

            keyword Arguments:
            to_date = The end date for gathering data. default current date
            year_span = amount of data in years to return. Default 2
        """

        start_date = to_date - relativedelta(years=year_span)
        self.dates = pd.date_range(start_date, to_date)
                
    def fetch_data(self, symbol_list):
        """ Returns Pandas DF of data for each symbol passed,
            an array of succeful symbols (good_symbols),
            and an array of unsuccessful symbols (bad_symbols)

            keyword Arguments:
            symbol_list = array of stoc symbols. ex ['SPY', 'GOOG']

            Public methos for getting data, does validation on 
            requested data.
        """

        good_symbols = []
        bad_symbols = []

        if 'SPY' not in symbol_list:
            symbol_list.insert(0, 'SPY')

        # parse SPY first
        # and create the base DF from it
        try:
            df = self.__fetch_data('SPY')
            good_symbols.append('SPY')
        except Exception as e:
            # print(e)
            bad_symbols.append('SPY')


        # parse the adittional symbols and add it 
        # to the main DF
        for symbol in symbol_list:
            try:

                if symbol == 'SPY':
                    continue

                data_df = self.__fetch_data(symbol)
                df[symbol] = data_df
                good_symbols.append(symbol)

            except Exception as e:
                # print(e)
                bad_symbols.append(symbol)

        df = df.dropna(subset=['SPY'])
        df.fillna(method='ffill', inplace=True)
        df.fillna(method='bfill', inplace=True)

        return df, good_symbols, bad_symbols

    def __fetch_data(self, symbol):
        """ Returns Pandas DF of data for requested symbol from
            YAHOO finance.

            keyword Arguments:
            symbol = a string representing a stock symbol. ex 'SPY'

            Private methos for getting data internally
        """
        fetched_data = data.DataReader(symbol, 'yahoo', self.dates[0], self.dates[-1])
        fetched_data = fetched_data.rename(columns={'Adj Close' : symbol})
        return pd.DataFrame(data=fetched_data, columns=[symbol], index=fetched_data.index.values)