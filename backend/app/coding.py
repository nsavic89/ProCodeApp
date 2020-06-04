from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import ComplementNB
from nltk.corpus import stopwords
from nltk.corpus import wordnet as wn
from nltk.tokenize import word_tokenize
from django.core.cache import cache
from .models import Feedback
from core.models import (
    TrainingDataFile,
    TrainingData,
    CodingRules,
    Classification,
    Code,
    CrosswalkFile,
    Crosswalk
)
import string, spacy, translate, json
from unidecode import unidecode



"""
    This file contains several function
    related to the coding of input data
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
        'en': 'en_core_web_sm',
        'fr': 'fr_core_news_sm',
        'de': 'de_core_news_sm',
        'it': 'it_core_news_sm'
    }

    # try loading from cache
    # if not in cache then cache it
    nlp = spacy.load(lang_core[lng])

    # tokenize and remove unwanted tokens
    cleaned_inputs = []
    for text in inputs:
        text = text.lower()
        text = text.strip()
        text = text.replace('-', ' ')
        doc = nlp(text)
        tokens = [t.lemma_ for t in doc]
        tokens = [t for t in tokens if t not in unwanted]
        cleaned_inputs.append(' '.join(tokens))

    return cleaned_inputs



# used to extend inputs with their synonymes, definitions
# only if max()-min() == 0 -> which means that
# first trial failed to find a likely class
# lng argument is the language of inputs
# 
def extend_inputs_dict(inputs, probs, lng, trans_lng):

    # if german return
    # this language requires a special package
    if lng == 'ge':
        return inputs

    # languages for stopwords
    lang_dict = {
        'en': 'english',
        'fr': 'french',
        'ge': 'german',
        'it': 'italian'
    }

    # synsets use different labels for languages
    lang_dict2 = {'en': 'eng', 'fr': 'fra', 'it': 'ita'}

    # also remove stop words
    # words & characters (punctuations) that will be removed
    unwanted = list( set(stopwords.words(lang_dict[lng])) 
                ) + list(string.punctuation)

    # translate must be performed from english (resulting after synsets)
    # into the language of the training dataset (trans_lng)
    translator = translate.Translator(from_lng="en", to_lang=trans_lng)

    # each input has its array of probabilities
    # so we must iterate it for each input
    new_inputs = []
    for i in range(0, len(probs)):
        dif = max(probs[i]) - min(probs[i])
        
        # if difference is 0 
        # meaning no different probability for different classes
        # this is why it usually results in a outcome that makes no sense
        # such as for 'sécuritas' it assigns agriculture related code
        # which basically has the same probability as any other of PCS
        if dif == 0:
            my_input = inputs[i]
            my_input = my_input.replace("-", " ")
            tokens = word_tokenize(my_input)
            tokens = [token for token in tokens if token not in unwanted]
            tokens = [token.strip() for token in tokens]

            # definitions that will be used to replace my_input in inputs
            definitions = []

            # for each word (token) of input
            for token in tokens:
                synsets = wn.synsets(token, lang=lang_dict2[lng])

                # a single token may have multiple synsets
                for syn in synsets:
                    definition = syn.definition()

                    if lng != trans_lng:
                        trans_def = translator.translate(definition)
                        definitions.append(trans_def)
                    else:
                        definitions.append(definition)
            
            new_inputs.append(' '.join(definitions))


    new_inputs = prepare_input(new_inputs, trans_lng)
    return new_inputs



# Coding a textual entry agains a classification
# using training data also stored in the db
# arguments:
#   1. input: a list of textual entries
#   2. clsf: classification reference name
#   3. lng: language of input list
def code(inputs, clsf, lng, level):

    # keep original entry without modifications
    # needed for nltk dict fun later
    inputs_original_lng = inputs

    # training data file and training data
    # detect in which language the data should be

    try:
        rules = CodingRules.objects.get(classification=clsf)
        max_level = rules.max_level
        
        # language of training data
        languages = json.loads(rules.languages)
        
        if 'any' in languages:
            td_file_lng = languages['any']
        else:
            td_file_lng = languages[lng]
            
        # transcode from another classification after coding
        # or use training data available for original 
        if rules.recode_from != "this":
            later_trans_to = clsf
            clsf = rules.recode_from
            
        # cannot go deeper than max_level
        if level > max_level:
            level = max_level
            
        classification = Classification.objects.get(reference=clsf)
    except:
        # no given rule defined
        # this will result in an error
        return [] 

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
        return []
        
    # well, this is funny part
    # if lng of inputs is not equal to td_file_lng
    # defined in Coding_Rules, then it must be 
    # translated to td_file_lng
    # this is how we avoid that coding for some 
    # language would not work because of lack of data
    if lng != td_file_lng:

        from_lng = lng
        if lng == 'ge':
            from_lng = 'de'

        translator = translate.Translator(
            from_lang=from_lng,
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
    train_text = [unidecode(t.text) for t in train]
    train_codes = [t.code for t in train]

    # training data collected through feedbacks
    feedbacks = Feedback.objects.filter(
        classification=clsf,
        language=td_file_lng,
        level=level
    )
    train_text = train_text + [fb.text for fb in feedbacks]
    train_codes = train_codes + [fb.code for fb in feedbacks]
    
    X = tf.fit_transform(train_text)
    
    # finally, model
    # complement naive bayes
    model = ComplementNB()
    model.fit(X, train_codes)
    inputs = [unidecode(i) for i in inputs]
    inputs_tf = tf.transform(inputs)
    output = model.predict(inputs_tf)

    # get probabilities of intput belonging to any class
    # append other likely predictions
    # then if necessary run dictionaries
    # dictionary only if max(prob)-min(prob) == 0
    probs = model.predict_proba(inputs_tf)
    classes = model.classes_

    inputs_retrial = extend_inputs_dict(
        inputs_original_lng, probs, lng, td_file_lng)

    if len(inputs_retrial) > 0:
        inputs_retrial = [unidecode(i) for i in inputs_retrial]
        inputs_retrial_tf = tf.transform(inputs_retrial)

        # now rerun predictions for those for which prob == 0
        outputs_retrial = model.predict(inputs_retrial_tf)
        outputs_retrial = outputs_retrial.tolist()

        for i in range(0, len(probs)):
            dif = max(probs[i]) - min(probs[i])

            if dif == 0:
                output[i] = outputs_retrial.pop(0)


    # now if the training dataset was not
    # available for the classification against
    # which the data was coded
    # we must transcode it to that classification
    if rules.recode_from != 'this':
        try:
            crosswalk_file = CrosswalkFile.objects.get(
                classification_1=clsf,
                classification_2=later_trans_to
            )
            crosswalk = Crosswalk.objects.filter(
                parent=crosswalk_file
            )
        except:
            return []

        # recode
        re_outputs = []

        for code in output:
            recodes = crosswalk.filter(code_1=code)
            recodes = [recode.code_2 for recode in recodes]
            re_outputs.append(recodes)
        
        return re_outputs

    output = [[out] for out in output]
    return output

