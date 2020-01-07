""" 
    Code textual raw data inputs
    using Complementary Naïve Bayes algorithm
    (also used for email classification).
"""
from .models import Data, Classification
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import ComplementNB
from .tokenization import get_tokens
from django.core.cache import cache
import json, datetime

def run_cnb(text, lng, level, scheme):
    """
        executes CNB algorithm
        -> returns assigned classification
    """
    level = int(level)

    # first check if data is in cache
    codes = cache.get('{}_{}_{}_{}'.format('codes', scheme, lng, level))
    titles = cache.get('{}_{}_{}_{}'.format('titles', scheme, lng, level))

    # otherwise load from db
    if codes is None or titles is None:
        data = Data.objects.filter(scheme=scheme, lng=lng, level=level)
        codes = [d.code.code for d in data]
        titles = [d.tokens for d in data]

        cache.set('{}_{}_{}_{}'.format('codes', scheme, lng, level), codes)
        cache.set('{}_{}_{}_{}'.format('titles', scheme, lng, level), titles)

    # the actual CNB code starts here -------------------
    # First step -> tf-idf 
    tf = TfidfVectorizer(analyzer='word', ngram_range=(1,2),
                        min_df=0, sublinear_tf=True)

    X = tf.fit_transform(titles)

    # Sencondly -> train classifer CNB
    classifier = ComplementNB()
    classifier.fit(X, codes)

    # Finally -> we have trained CNB
    # Run prediction for text (list of texts)
    text_tokenized = [ get_tokens(t, lng) for t in text ]
    text_tf = tf.transform(text_tokenized)
    output = classifier.predict(text_tf)
    
    return output