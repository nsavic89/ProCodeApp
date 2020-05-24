from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import ComplementNB
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from django.core.cache import cache
from core.models import (
    TrainingDataFile,
    TrainingData,
    CodingRules,
    Classification,
    Code
)
import string, spacy, translate, json




"""
    This file contains several function related to the coding of input data
"""



def prepare_input(inputs, lng):
    # tokenize, lemmatize and removes stopwords
    # first phase before an input is used for coding

    # full names of languages needed to determine
    # which stop words should be loaded
    lang_dict = {
        'en': 'english',
        'fr': 'french',
        'ge': 'german',
        'it': 'italian'
    }

    # words & characters (punctuations) that will be removed
    unwanted = list( set(stopwords.words(lang_dict[lng])) 
                ) + list(string.punctuation)
    
    # lemmatize the tokens
    # using spacy package
    lang_core = {
        'en': 'en_core_news_sm',
        'fr': 'fr_core_news_sm',
        'de': 'ge_core_news_sm',
        'it': 'it_core_news_sm'
    }

    # try loading from cache
    # if not in cache then cache it
    nlp = spacy.load(lang_core[lng])

    # tokenize and remove unwanted tokens
    cleaned_inputs = []
    for text in inputs:
        text = text.replace('-', ' ')
        tokens = word_tokenize(text)
        tokens = [t for t in tokens if t not in unwanted]
        doc = nlp(' '.join(tokens))
        tokens = [t.lemma_ for t in doc]
        cleaned_inputs.append(' '.join(tokens))

    return cleaned_inputs


# Coding a textual entry agains a classification
# using training data also stored in the db
# arguments:
#   1. input: a list of textual entries
#   2. clsf: classification reference name
#   3. lng: language of input list
import time
def code(inputs, clsf, lng, level):
    # training data file and training data
    # detect in which language the data should be
    try:
        rules = CodingRules.objects.get(
            classification=clsf,
            input_lng=lng
        )
        max_level = rules.max_level
        td_file_lng = rules.td_file_lng

        if level > max_level:
            level = max_level

        # get which levels are possible for the given classification
        classification = Classification.objects.get(reference=clsf)
    except:
        # no given rule defined
        # this will result in an error
        return False

    # list of codes corresponding to classification (in try)
    codes = Code.objects.filter(parent=classification)

    # loading only data that is in the requested language
    tdf = TrainingDataFile.objects.filter(
        classification=clsf,
        language=td_file_lng
    )

    # well, its possible that their is no data
    # for the selected classfication scheme :)
    if len(tdf) == 0:
        return False
        
    # well, this is funny part
    # if lng of inputs is not equal to td_file_lng
    # defined in Coding_Rules, then it must be 
    # translated to td_file_lng
    # this is how we avoid that coding for some 
    # language would not work because of lack of data
    if lng != td_file_lng:
        translator = translate.Translator(
            from_lang=lng,
            to_lang=td_file_lng
        )

        for i in range(0, len(inputs)):
            inputs[i] = translator.translate(inputs[i])
            
    # 1. tokenization
    # 2. clean stop words
    # 3. lemmatize
    # all that defined in function prepare_input
    # that takes inputs and lng args provided here
    inputs = prepare_input(inputs, td_file_lng)
    
    # vectorizer to transform data into td-idf 
    tf = TfidfVectorizer(
        analyzer="word", ngram_range=(1,2),
        min_df=0, sublinear_tf=True)

    # filter data
    train = TrainingData.objects.filter(parent__in=tdf, level=level)
    train_text = [t.text for t in train]
    train_codes = [t.code for t in train]
    
    X = tf.fit_transform(train_text)
    
    # finally, model
    # complement naive bayes
    model = ComplementNB()
    model.fit(X, train_codes)
    inputs_tf = tf.transform(inputs)
    output = model.predict(inputs_tf)

    return output

