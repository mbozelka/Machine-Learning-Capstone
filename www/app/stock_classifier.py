from sklearn.linear_model import LinearRegression
from sklearn.model_selection import TimeSeriesSplit
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

class Stock_Classifier():
    def __init__(self, n_splits=3):
        self.n_splits = n_splits
        self.clf = Pipeline([
            ('scl', StandardScaler()),
            ('clf', LinearRegression())
        ])
        self.cv = TimeSeriesSplit(n_splits=self.n_splits)
    
    def get_cv_splits(self, X, y):
        train_splits = []
        test_splits = []
        
        for train_index, test_index in self.cv.split(X):
            train_splits.append(train_index)
            test_splits.append(test_index)
            
        return train_splits, test_splits
            
    def train(self, X, y, split_indexes):      
        for set_index in split_indexes:
            self.clf.fit(X[set_index], y[set_index])
    
    def score(self, X, y, split_indexes):
        scores = []
        for set_index in split_indexes:
            scores.append(self.clf.score(X[set_index], y[set_index]))
        return scores
    
    def full_set_train(self, X, y):
        self.clf.fit(X, y)
        
    def query(self, X):
        return self.clf.predict(X)
    
    def get_splits(self):
        return self.n_splits