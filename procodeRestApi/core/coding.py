""" 
    Code textual raw data inputs
    using Complementary Naïve Bayes algorithm
    (also used for email classification).
"""
from .models import Data, Classification
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import ComplementNB
from .tokenization import get_tokens, get_definitions
from django.core.cache import cache
import json, datetime

def run_cnb(text, lng, level, scheme):
    """
        executes CNB algorithm
        -> returns assigned classification
    """
    level = int(level)

    # data load
    data = Data.objects.filter(scheme=scheme, lng=lng, level=level)
    codes = [d.code_str for d in data]
    titles = [d.tokens for d in data]

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

    # check probabilities 
    probs = classifier.predict_log_proba(text_tf)
    diff = [max(p)-min(p) for p in probs]

    # assign '-' as code for those with prop == 0
    for i in range(0, len(diff)):
        if diff[i] == 0:
            output[i] = "-"
    
    return output


def run_dict(text, lng, level, scheme):
    """ if run_cnb fails to provide codes
    we can try to generate synonyms for the list of words
    and re-run CNB with new texts

    input: list of texts | output: new text """
    definitions = []

    for txt in text:
        tokens = get_tokens(txt, lng, do_stem=False, do_join=False)

        tokens_def = ""
        for token in tokens:
            tokens_def = tokens_def + get_definitions(token, lng) + " "

        definitions.append(tokens_def)
        
    res = run_cnb(definitions, "en", level, scheme)
    return res
