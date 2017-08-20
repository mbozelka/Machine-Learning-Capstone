import pandas as pd
import numpy as np
import datetime
from dateutil.relativedelta import relativedelta
from stock_classifier import Stock_Classifier

class Stock_Explorer():
    """ Stock_Explorer Class

        Interacts with a single Stocks data to 
        evaluate it, and return predicted future 
        values
    """

    def __init__(self, series, symbol, rolling_window_size=10, prediction_window_size=14, retrun_date_range=100):
        """ Initialize Stock_Explorer

            keyword Arguments:
            series = Pandas Series of the Stocks data. Dates as index, and values
                for Adjusted Close.
            symbol = String of symbol to be evaluated. Ex: 'SPY' 
            rolling_window_size = The widnow size for Rolling statistics. default 10, 
            prediction_window_size = The amount of dates out to 
                predict future values. default 14, 
            retrun_date_range = range of dates that should be evaluated. Used
                for training the classifer and stats. default is 100 days
        """

        self.symbol = symbol
        self.stock_clf = Stock_Classifier()
        self.series = series
        self.rolling_window_size = rolling_window_size
        self.prediction_window_size = prediction_window_size
        self.retrun_date_range = retrun_date_range
    


    def get_json(self):
        """ Retrun Dict of stocks exploration

            Public method used to get all the stocks
            exploration and predictions.

            Data returned:
                'Symbol'
                'BB_Ratios'
                'Momentum'
                'SMA_Ratios'
                'SMA'
                'Lower_bb'
                'Upper_bb'
                'Target_Vals'
                'Normed_Data'
                'Stats'
                'Prediction_Size'
                'Train_Test_Data'
                'Dates'
        """
        final_json = {}
        
        # if set is empty send back error error
        if len(self.series) <= self.stock_clf.get_splits():
            final_json['error'] = 'Error with Data'
            return final_json
        
        # split and train
        self.__get_X_y()
        train_test_data = self.__train_and_test()
        
        # predict the new vals
        self.__predict_vals()
        
        #bb bands
        lower_bb, upper_bb = self.__get_bollinger_bands()
        
        date_range = self.retrun_date_range + self.prediction_window_size

        normed_range = self.__get_normalize_values(date_range)

        final_json['Symbol'] = self.symbol
        final_json['BB_Ratios'] = self.X_features['BB_RATIOS'].tail(date_range).values.tolist()
        final_json['Momentum'] = self.X_features['MOMENTUM'].tail(date_range).values.tolist()
        final_json['SMA_Ratios'] = self.X_features['SMA_RATIOS'].tail(date_range).values.tolist()
        final_json['SMA'] = self.__get_rolling_mean().tail(date_range).values.tolist()
        final_json['Lower_bb'] = lower_bb.tail(date_range).values.tolist()
        final_json['Upper_bb'] = upper_bb.tail(date_range).values.tolist()
        final_json['Target_Vals'] = self.y_target.tail(date_range).values.tolist()
        final_json['Normed_Data'] = normed_range.values.tolist()
        
        final_json['Stats'] = self.__get_stats(normed_range)
        final_json['Prediction_Size'] = self.prediction_window_size
        final_json['Train_Test_Data'] = train_test_data
        final_json['Dates'] = self.__dates_to_string(date_range)
        
        return final_json
    



    def __dates_to_string(self, date_range):
        """ returns a list of dates as string values 
            
            Private Method
        """

        dates = self.series.tail(date_range).index.strftime('%Y-%m-%d').tolist()
        return dates
        



    def __predict_vals(self):
        """ Return None 

            Makes the future predictions based on prediction window size

            Private Method
        """

        pw = self.prediction_window_size
        
        for i in range(0 , pw):
            pred_val = self.stock_clf.query(self.X_features.tail(1).values)[0]
            self.__update_series(pred_val)
    



    def __update_series(self, new_val):
        """ Return None 

            Updates the series of data with the new prediction value

            Private Method
        """

        new_date = self.series.index[-1] + relativedelta(days=1)
        new_target = pd.Series([new_val], index=[new_date])
        self.series = self.series.append(new_target)
        self.__get_X_y()
        



    def __get_X_y(self):
        """ Return None 

            Updates class properties X_features and y_features
            with appropriate series values

            Private Method
        """

        w = self.rolling_window_size
        features_df = { 'BB_RATIOS' : self.__get_bollinger_ratios(), 
             'SMA_RATIOS' : self.__get_sma_ratio(), 
             'MOMENTUM' : self.__get_momentum()}
        features_df = pd.DataFrame(features_df)
        
        self.X_features = self.__replace_nan(features_df)
        self.y_target = self.series[w:]
        



    def __train_and_test(self):
        """ Return Dict of training and testing scores

            Uses class properdies to train and test
            the data against the classifier property

            Private Method
        """

        X = self.X_features[0 : -1].values
        y = self.y_target[1 : ].values
        

        train_splits, test_splits = self.stock_clf.get_cv_splits(X, y)

        self.stock_clf.train(X, y, train_splits)

        train_scores = self.stock_clf.score(X, y, train_splits)
        test_scores = self.stock_clf.score(X, y, test_splits)
        
        self.stock_clf.full_set_train(X, y)
        
        return {'train_mean' : np.asarray(train_scores).mean(), 'train_std' : np.asarray(train_scores).std(),
              'test_mean' : np.asarray(test_scores).mean(), 'test_std' : np.asarray(test_scores).std()}
    



    def __get_rolling_mean(self):
        """ Return series of Rolling Mean Values

            Private Method
        """

        w = self.rolling_window_size
        sma = self.series.rolling(w, center=False).mean()
        return sma[w:]




    def __get_rolling_std(self):
        """ Return series of Rolling STD Values
        
            Private Method
        """

        w = self.rolling_window_size
        r_std = self.series.rolling(w, center=False).std()
        return r_std[w:]




    def __get_bollinger_bands(self):
        """ Returns two series
            lower_band Bollinger Band values
            and upper_band Bollinger Band values
        
            Private Method
        """

        lower_band = self.__get_rolling_mean() - (self.__get_rolling_std() * 2)
        upper_band = self.__get_rolling_mean() + (self.__get_rolling_std() * 2)
        return lower_band, upper_band




    def __get_bollinger_ratios(self):
        """ Returns series of Bollinger Band Ratios
        
            Private Method
        """

        bb = self.series.copy()
        sma = self.__get_rolling_mean()
        r_std = self.__get_rolling_std()
        w = self.rolling_window_size
        bb[w:] = (bb[w:] - sma) / (2 * r_std)
        return bb[w:]




    def __get_momentum(self):
        """ Returns series of Momentum values
        
            Private Method
        """

        momentum = self.series.copy()
        w = self.rolling_window_size
        momentum[w:] = (momentum[w:] / momentum[0:-w].values) - 1
        return momentum[w:]




    def __get_sma_ratio(self):
        """ Returns series of SMA values
        
            Private Method
        """

        sma = self.series.copy()
        w = self.rolling_window_size
        sma[w:] = (sma[w:] / sma[0:-w].mean()) - 1
        return sma[w:]




    def __get_normalize_values(self, date_range):
        """ Returns series of SMA values

            date_range = Intiger. Number of days back from
                the end of series data to normalize

            Private Method
        """

        return_range = self.series.tail(date_range)
        normed = return_range /return_range [0:1].values
        return normed
    



    def __get_stats(self, series):
        """ Returns series of SMA values

            series = PD Series of values to get 
                basic statistics on

            Private Method
        """

        vals = series.values
        return {
            'Mean' : np.mean(vals),
            'Median' : np.median(vals),
            'Std' : np.std(vals)
        }

    


    def __replace_nan(self, df_copy):
        """ returns data frame with nan values replaced with
                datas mean

            df_copy = dataframe to remove nan values from

            Private Method
        """

        df = df_copy.copy().replace([np.inf, -np.inf], np.nan)
        return df.fillna(df.mean())