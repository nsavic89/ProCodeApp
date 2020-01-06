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

    # load training data
    # also include classification for the given scheme
    data = Data.objects.filter(scheme=scheme, lng=lng)
    clsf = Classification.objects.filter(scheme=scheme)
    # get all texts from data
    data_list1 = [(o.code.code, o.tokens) for o in data]

    # determined by the language (lng in args)
    label = 'tokens'
    if lng == 'en':
        data_list2 = [(o.code, o.tokens) for o in clsf]
    elif lng == 'ge':
        data_list2 = [(o.code, o.tokens_ge) for o in clsf]
    
    elif lng == 'fr':
        data_list2 = [(o.code, o.tokens_fr) for o in clsf]
    elif lng == 'it':
        data_list2 = [(o.code, o.tokens_it) for o in clsf]
    
    # final tuples (code id, label)
    data_final = data_list1 + data_list2
    
    # know we need to get actual codes
    # at required level
    # it is important to exclude those of lower levels
    # higher level obj must be converted to the required one
    refined = []

    for tpl in data_final:
        clsf = Classification.objects.get(scheme=scheme,code=tpl[0])
    
        # if lower level (e.g. code = '5' but level required == 2)
        if int(clsf.level) < level:
            continue
        # if equal to level -> just append
        # code from clsf and title from tlp as tuple
        if int(clsf.level) == level:
            refined.append( (clsf.code, tpl[1]) )
            continue
        
        # finally if higher level (better precision than required)
        is_leveled = False
        while is_leveled == False:
            clsf = Classification.objects.get(
                code=clsf.parent, scheme=scheme)
            if int(clsf.level) == level:
                refined.append( (clsf.code, tpl[1] ))
                is_leveled = True


    codes = [x for (x,y) in refined]
    titles = [y for (x,y) in refined]

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