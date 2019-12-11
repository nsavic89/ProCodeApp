""" 
    Code textual raw data inputs
    using Complementary Naïve Bayes algorithm
    (also used for email classification).
"""
from .models import Data, Classification
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import ComplementNB
from .tokenization import get_tokens



def run_cnb(text, scheme, lng, level):
    """
        executes CNB algorithm
        -> returns assigned classification
    """

    # load training data
    # also include classification for the given scheme
    data = Data.objects.filter(scheme=scheme, lng=lng)
    clsf = Classification.objects.filter(scheme=scheme)

    # get all texts from data
    data_list1 = [(o.code, o.text) for o in data]

    # label (field) of the titles in classification
    # determined by the language (lng in args)
    label = 'tokens'
    if lng != 'en':
        label = label + '_' + lng
    
    # get all texts, titles
    data_list2 = [(o.code, o[label]) for o in clsf]

    # final tuples (code id, label)
    data_final = data_list1 + data_list2

    # know we need to get actual codes
    # at required level
    # it is important to exclude those of lower levels
    # higher level obj must be converted to the required one
    data_final = set_levels(data_final, level, scheme)

    refined = []
    for tpl in data_final:
        clsf = Classification.objects.get(id=tpl[0])

        # if lower level (e.g. '5' but level required == 2)
        if int(clsf.level) < level:
            continue

        # if equal to level -> just append
        # code from clsf and title from tlp as tuple
        if int(clsf.level) == level:
            refined.append( (clsf.code, tlp[1]) )
            continue
        
        # finally if higher level (better precision than required)
        is_leveled = False

        while is_leveled == False:

            clsf = Classification.objects.get(
                code=clsf.parent, scheme=scheme)

            if int(clsf.code) == level:
                refined.append( (clsf.code, tlp[1] ))
                is_leveled = True

    codes = [x for (x,y) in refined]
    titles = [y for (x,y) in refined]

    # the actual CNB code starts here -------------------
    # First step -> tf-idf 
    tf = TfidfVectorizer(analyzer='word', ngram_range=(1,2),
                        min_df=0, sublinear_tf=True)

    X = tf.fit_tranform(titles)

    # Sencondly -> train classifer CNB
    classifier = ComplementNB()
    classifier.fit(X, codes)

    # Finally -> we have trained CNB
    # Run prediction for text (list of texts)
    text_tokenized = [ get_tokens(t, lng) for t in texts ]
    text_tf = tf.transform(text_tokenized)
    output = classifier.predict(text_tf)

    return output