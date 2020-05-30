from django.core.management.base import BaseCommand, CommandError
from backend.settings import BASE_DIR
from core.models import (
    Classification, Code, SpellCorrection,
    TrainingDataFile, TrainingData
)
from core.serializers import SpellCorrectionSerializer
from spellchecker import SpellChecker
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import os, xlrd, re, spacy


class Command(BaseCommand):
    help = "Uploads training data placed in DATA/TRAINING"

    # used for all functions in this class
    # whenever ERROR occurs it becomes True
    # ERROR_TEXT is diplayed and process stopped
    CLASSIFICATION = ""
    LNG = "en"
    ERROR = False
    ERROR_TEXT = ""
    DATA = []

    def add_arguments(self, parser):
        parser.add_argument(
            'params',
            nargs='+',
            type=str,
            help="Three parameters as ordered: file classification language"
        )

        # named argument
        parser.add_argument(
                '--check-spelling',
                action='store_true',
                help='Check spelling of data',
            )

        parser.add_argument(
                '--most-probable',
                action='store_true',
                help='Select the most probable candidate when running check spell',
            )

    # verification functions --------------------------------------------
    def verify_codes(self):
        # for each code in data checks if it is defined in classification
        try:
            my_cls = Classification.objects.get(reference=self.CLASSIFICATION)
            codes = Code.objects.filter(parent=my_cls)
            codes = [c.code for c in codes]
        except:
            self.stdout.write(self.style.ERROR('ERROR: CLASSIFICATION NOT FOUND'))
            return
        
        # only if my_cls in try succeeded
        # now for each code in DATA we check if it is 
        # defined in the given classification
        not_found = []
        for e in self.DATA:
            if e['code'] not in codes:
                not_found.append(e['code'])

        not_found = list(set(not_found))
        if len(not_found) > 0:
            self.stdout.write(self.style.WARNING('Some codes not found in classification'))
            self.stdout.write(', '.join(not_found))

            # if user decides to proceed
            # he types Y and pressed Enter
            # the programming code then ignores those codes
            # that are not found in the classification
            # however this will reduce the data size
            # so it is recommended to modify the Excel file
            # and repeat the process
            answer = input('Do you want to continue?\n')
            self.ERROR = answer != 'Y'  
            self.ERROR_TEXT = "ERROR: CODES IN FILE NOT DEFINED IN CLASSIFICATION"
            
            if self.ERROR == True:
                return
            
            # if the admin decides to continue regardless undefined codes
            # these codes must be removed from self.DATA
            filtered_data = []

            for data in self.DATA:
                if data['code'] not in not_found:
                    filtered_data.append(data)
            
            self.DATA = filtered_data
        return

    def check_spelling(self):
        # requires 'pyspellchecker' package of Python
        # for texts checks if they are spelled correctly
        # if low frequency of suggestion, manual intervention needed
        # manual entry will be stored and used for the next time

        # if ERROR is True, the next code will not be executed
        if self.ERROR == True:
            return

        langs = {
            'en': 'english',
            'fr': 'french',
            'de': 'german',
            'it': 'italian'
        }

        # provide a list of corrections
        corrections_list = []
        corrected_data = []
        
        # join all texts from self.data in one string
        # easier to later tokenize in a single step
        self.stdout.write('Spell checking ->\n')
        spell = SpellChecker(self.LNG)

        # get stop words for the given language
        stop_words = set(stopwords.words(langs[self.LNG]))

        # list of all tested words to avoid repetitions
        tested_words = {}

        i = 0
        for row in self.DATA:
            
            i += 1
            if i == 1000:
                self.stdout.write('1k')
                i = 0

            text = row['text']
            words = word_tokenize(text)

            # filter stop words
            words_filtered = [w for w in words if w not in stop_words and len(w) > 1]

            # check spelling and correct
            # create set to be faster process with a shorter number of words
            words_filtered = set(words_filtered)
            words_unknown = spell.unknown(words_filtered)

            # this will replace previous input in self.DATA
            words_corrected = []

            for word in words_filtered:
                           
                if len(word) > 3:
                    try:
                        # if already corrected previously
                        # this includes all those with low freq that are not unknown
                        correction = SpellCorrection.objects.get(
                            language=self.LNG, word=word)
                        words_corrected.append(correction.correction)
                   
                    except:
                        # if not we need to check for candidates, if unknown
                        if word in words_unknown:
                            
                            if word in tested_words:
                                # well, if already tested
                                words_corrected.append(tested_words[word])
                                continue

                            candidates = list( spell.candidates(word) )
                            
                            # if correction is equal to word well it means that correcting failed
                            if len(candidates) == 1 and word == candidates[0]:
                                corrections_list.append({'word':word,
                                    'correction':' '.join(candidates),'prob':'unknown'} )

                            # if many candidates
                            if len(candidates) > 1:
                                corrections_list.append({'word':word,
                                    'correction':' '.join(candidates),'prob':'unknown'} )

                            # for correction we take the most probable word
                            words_corrected.append(candidates[0])
                        else:
                            words_corrected.append(word)

                        if self.ARG_MOST_PROBABLE == False and word not in words_unknown:
                            # also calculate frequency of those words
                            if word not in tested_words:
                                prob = spell.word_probability(word) * 10e6

                                if prob < 10:
                                    corrections_list.append({
                                        'word':word,'correction':word,'prob':prob} )
                                    tested_words[word] = word

                # not correcting those shorter or equal to length 3
                else:
                    words_corrected.append(word)

            # now correct row in self.DATA
            corrected_row = {
                'text': ' '.join(words_corrected),
                'code': row['code']
            }
            corrected_data.append(corrected_row)

        self.DATA = corrected_data

        # if arg is --most-probable True
        # we assign the most probable candidate
        if self.ARG_MOST_PROBABLE == True:
            return

        # if no corrections in corrections_list no need to go further
        if len(corrections_list) == 0:
            self.stdout.write(self.style.SUCCESS("SUCCESS: NO CORRECTIONS REQUIRED"))
            return

        # ask if admin wants to provide corrections in console
        else:
            self.stdout.write(self.style.WARNING("%d corrections required" % len(corrections_list)))
            provide_corrections = input('Do you want to provide spell corrections?\n')

            if provide_corrections == 'Y':
                for cor in corrections_list:
                    self.stdout.write(
                        "Which is correct for %s: \n %s\n" %(cor['word'], cor['correction']))
                    cor_text = input()

                    if cor_text == 'cpy':
                        # keep the same word
                        cor_text = cor['word']

                    elif cor_text == 'ign':
                        # skip correction
                        continue

                    spell_cor_ser = {"language":self.LNG,"word":cor['word'],"correction":cor_text}

                    if spell_cor_ser.is_valid():
                        spell_cor_ser.save()
        
        # if not most probable
        # we must write CSV file with recommended candidates
        # and those with low freqency
        self.stdout.write("Writing to CSV")
        path = os.path.join(BASE_DIR, 'DATA/exported/corrections.csv')
        with open(path, 'w') as f:
            # write header
            f.write("word;correction;prob\n")
            for e in corrections_list:
                f.write( "{};{};{}\n".format( e['word'], e['correction'], e['prob'] ) )
               
        self.ERROR = True
        self.ERROR_TEXT = "SOME WORDS REQUIRE SPELL CHECK"
        return False

    def tokenize(self):
        # tokenize all data in self.DATA
        if self.ERROR == True:
            return

        self.stdout.write("Tokenization ->\n")

        langs = {'en': 'english','fr': 'french','de': 'german','it': 'italian'}

        # get stop words for the given language
        stop_words = set(stopwords.words(langs[self.LNG]))
        data_tokenized = []

        for e in self.DATA:
            text = e['text']
            tokens = word_tokenize(text)
            tokens = [w for w in tokens if w not in stop_words and len(w) > 1]
            text = ' '.join(tokens)
            data_tokenized.append({ "text": text, "code": e['code']})
        
        self.DATA = data_tokenized
        self.stdout.write(self.style.SUCCESS('SUCCESS: TOKENIZATION DONE'))


    def lemmatize(self):
        # for the data in self.DATA run stemming using spacy
        # this will have many advantages for futher lang translation
        if self.ERROR == True:
            return
        
        self.stdout.write("Lemmatize ->\n")
        langs = {
            'en': 'en_core_web_md',
            'fr': 'fr_core_news_md',
            'de': 'ge_core_web_md',
            'it': 'it_core_web_md'
        }

        nlp = spacy.load(langs[self.LNG])
        stem_data = []

        for data in self.DATA:
            text = data['text']
            doc = nlp(text)
            tokens = [token.lemma_ for token in doc]
            stem_data.append({
                'text': ' '.join(tokens), 
                'code': data['code']})

        self.DATA = stem_data
        self.stdout.write(self.style.SUCCESS('SUCCESS: STEMMING DONE'))

    def save(self):
        # saves the data in db
        # this is the final step
        if self.ERROR == True:
            return

        # enter file name that will be stored in db
        self.stdout.write("Enter file name:\n")
        name = input()
        size = len(self.DATA)

        self.stdout.write("Saving data to db\n")
        try:
            tf = TrainingDataFile.objects.create(
                name=name, size=size, language=self.LNG,
                classification=self.CLASSIFICATION
            )
            self.stdout.write(self.style.SUCCESS("SUCCESS: File saved\n"))
            self.stdout.write("Saving data")

            data = []
            # get all levels for the given classification
            # if not of level 1 we copy-paste text to lower-level-ward :)
            my_cls = Classification.objects.get(reference=self.CLASSIFICATION)
            all_codes = Code.objects.filter(parent=my_cls)
            levels = set([ code.level for code in all_codes ])

            for e in self.DATA:
                code_obj = Code.objects.get(
                    parent=my_cls,
                    code=e['code']
                )
                td_obj = TrainingData(
                    parent=tf,
                    text=e['text'],
                    code=e['code'],
                    level=code_obj.level
                )
                data.append(td_obj)
                
                # extend list to parent codes
                is_root = code_obj.level == min(levels)
                next_code = code_obj

                while is_root == False:
                    child_of = Code.objects.get(
                        parent=my_cls,
                        code=next_code.child_of)

                    td_obj = TrainingData(
                        parent=tf,
                        text=e['text'],
                        code=child_of.code,
                        level=child_of.level
                    )
                    
                    data.append(td_obj)
                    next_code = child_of
                    
                    is_root = next_code.level == min(levels)

            TrainingData.objects.bulk_create(data)
            self.stdout.write(self.style.SUCCESS("SUCCESS: DATA SAVED\n"))

        except:
            self.ERROR = True
            self.ERROR_TEXT = "ERROR: SAVING FAILED\n"

            # if not successful no need to keep training data file
            # well if it was succesffully saved :)
            if tf is not None:
                tf.delete()

            return False


    def handle(self, *args, **options):
        my_file = options['params'][0] + '.xlsx'
        self.CLASSIFICATION = options['params'][1]
        self.LNG = options['params'][2]
        self.ARG_MOST_PROBABLE = options['most_probable']

        # test 1: first checking if the file exists in the given folder -----------
        list_of_files = os.listdir(os.path.join(BASE_DIR, 'DATA/TRAINING'))

        if my_file not in list_of_files:
            self.stdout.write(self.style.ERROR('ERROR: FILE NOT FOUND'))
            return
        
        # read excel file
        path = os.path.join(BASE_DIR, 'DATA/TRAINING/' + my_file)
        my_file = xlrd.open_workbook(path)
        my_file = my_file.sheet_by_index(0)

        # create a data variable
        # holding list of texts and corresponding codes
        # used globally within this script
        cols = my_file.row_values(0)
        codes = my_file.col_values(cols.index('code'))
        del codes[0] # the first is title (column name)

        texts = my_file.col_values(cols.index('text'))
        del texts[0]

        codes = [str(int(c)) if type(c) is float else str(c) for c in codes]
        data = []
        
        #len(codes)
        for i in range(101, 5000):
            try:
                text = texts[i].lower()
                text = re.sub('[^a-zà-ÿ]', ' ', text)
                text = text.strip()

                if len(text) < 5:
                    continue
                
                data.append({
                    'code': codes[i],
                    'text': text
                })
            except:
                continue
        self.DATA = data

        # run other tests
        # before executing any of the following fun (except first)
        # it is checked if self.ERROR is True
        # if there is no error, the function proceeds
        # otherwise it's not executed and process stops
        self.verify_codes()

        if options['check_spelling'] == True:
            self.check_spelling()
        
        self.tokenize()
        self.lemmatize()
        self.save()

        if self.ERROR == True:
            self.stdout.write(self.style.ERROR(self.ERROR_TEXT))