import pandas as pd
import numpy as np
import datetime
from dateutil.relativedelta import relativedelta
from stock_classifier import Stock_Classifier

class Stock_Explorer:
    def __init__(self, series, symbol, rolling_window_size=10, prediction_window_size=14, retrun_date_range=100):
        self.symbol = symbol
        self.stock_clf = Stock_Classifier()
        self.series = series
        self.rolling_window_size = rolling_window_size
        self.prediction_window_size = prediction_window_size
        self.retrun_date_range = retrun_date_range
    


    def get_json(self):
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
        dates = self.series.tail(date_range).index.strftime('%Y-%m-%d').tolist()
        return dates
        



    def __predict_vals(self):
        pw = self.prediction_window_size
        
        for i in range(0 , pw):
            pred_val = self.stock_clf.query(self.X_features.tail(1).values)[0]
            self.__update_series(pred_val)
    



    def __update_series(self, new_val):
        new_date = self.series.index[-1] + relativedelta(days=1)
        new_target = pd.Series([new_val], index=[new_date])
        self.series = self.series.append(new_target)
        self.__get_X_y()
        



    def __get_X_y(self):
        w = self.rolling_window_size
        features_df = { 'BB_RATIOS' : self.__get_bollinger_ratios(), 
             'SMA_RATIOS' : self.__get_sma_ratio(), 
             'MOMENTUM' : self.__get_momentum()}
        features_df = pd.DataFrame(features_df)
        
        self.X_features = self.__replace_nan(features_df)
        self.y_target = self.series[w:]
        



    def __train_and_test(self):
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
        w = self.rolling_window_size
        sma = self.series.rolling(w, center=False).mean()
        return sma[w:]




    def __get_rolling_std(self):
        w = self.rolling_window_size
        r_std = self.series.rolling(w, center=False).std()
        return r_std[w:]




    def __get_bollinger_bands(self):
        lower_band = self.__get_rolling_mean() - (self.__get_rolling_std() * 2)
        upper_band = self.__get_rolling_mean() + (self.__get_rolling_std() * 2)
        return lower_band, upper_band




    def __get_bollinger_ratios(self):
        bb = self.series.copy()
        sma = self.__get_rolling_mean()
        r_std = self.__get_rolling_std()
        w = self.rolling_window_size
        bb[w:] = (bb[w:] - sma) / (2 * r_std)
        return bb[w:]




    def __get_momentum(self):
        momentum = self.series.copy()
        w = self.rolling_window_size
        momentum[w:] = (momentum[w:] / momentum[0:-w].values) - 1
        return momentum[w:]




    def __get_sma_ratio(self):
        sma = self.series.copy()
        w = self.rolling_window_size
        sma[w:] = (sma[w:] / sma[0:-w].mean()) - 1
        return sma[w:]




    def __get_normalize_values(self, date_range):
        return_range = self.series.tail(date_range)
        normed = return_range /return_range [0:1].values
        return normed
    



    def __get_stats(self, series):
        vals = series.values
        return {
            'Mean' : np.mean(vals),
            'Median' : np.median(vals),
            'Std' : np.std(vals)
        }

    


    def __replace_nan(self, df_copy):
        df = df_copy.copy().replace([np.inf, -np.inf], np.nan)
        return df.fillna(df.mean())