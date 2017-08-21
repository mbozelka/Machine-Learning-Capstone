from sklearn.linear_model import LinearRegression
from sklearn.model_selection import TimeSeriesSplit
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

class Stock_Classifier():
    """ Classifer Class Wrapper

        Supplies a common interface to be used
        for model classification. If the classifier 
        is to ever change, the interface will remain the
        same so rest of code still works as intended.
    """

    def __init__(self, n_splits=3):
        """ Initialize classifier

            keyword Arguments:
            n_splits = number of cross-validation splits to
            perform on classier. Default 3

            Initializes the classifier (Linear Regresion) as well
            as the Cross-validator and the Standard Scaler.
        """

        self.n_splits = n_splits
        self.clf = Pipeline([
            ('scl', StandardScaler()),
            ('clf', LinearRegression())
        ])
        self.cv = TimeSeriesSplit(n_splits=self.n_splits)
    
    def get_cv_splits(self, X, y):
        """ Returns the Training Splits as an array 
            and the Testing splits as an array
            from the cross-validator

            keyword Arguments:
            X = Numpy array of Features values
            y = Numpy array of target values
        """

        train_splits = []
        test_splits = []
        
        for train_index, test_index in self.cv.split(X):
            train_splits.append(train_index)
            test_splits.append(test_index)
            
        return train_splits, test_splits
            
    def train(self, X, y, split_indexes):      
        """ Returne None

            Keyword Arguments:
            X = Numpy array of Features values
            y = Numpy array of target values
            split_indexes: Array Indexs of data to train
        """
        for set_index in split_indexes:
            self.clf.fit(X[set_index], y[set_index])
    
    def score(self, X, y, split_indexes):
        """ Return array of scores

            Keyword Arguments:
            X = Numpy array of Features values
            y = Numpy array of target values
            split_indexes: Array Indexs of data to train
        """
        scores = []
        for set_index in split_indexes:
            scores.append(self.clf.score(X[set_index], y[set_index]))
        return scores
    
    def full_set_train(self, X, y):
        """ Return None

            Keyword Arguments:
            X = Numpy array of Features values
            y = Numpy array of target values
            
            Train the classifier on the full set of data.
            Used after training and scoring is done.
        """

        self.clf.fit(X, y)
        
    def query(self, X):
        """ Return Prediction from classifer

            Keyword Arguments:
            X = Numpy array of Features values
            
            Takes a set of features and uses the classifer
            to make a prediction.
        """

        return self.clf.predict(X)
    
    def get_splits(self):
        """ Return array of CV splits

            Helper function to return CV splits
        """

        return self.n_splits