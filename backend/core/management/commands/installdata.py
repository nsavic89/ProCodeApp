from django.core.management.base import BaseCommand, CommandError
from backend.settings import BASE_DIR
from core.models import Classification, Code
import os, xlrd



class Command(BaseCommand):
    help = "Uploads training data placed in DATA/TRAINING"

    # used for all functions in this class
    # whenever ERROR occurs it becomes True
    # ERROR_TEXT is diplayed and process stopped
    ERROR = False
    ERROR_TEXT = ""
    DATA = []
    IGNORE_CODES = [] # cls codes that will be ignored if not found in cls

    def add_arguments(self, parser):
        parser.add_argument('params', nargs='+', type=str)


    # verification functions --------------------------------------------
    def verify_codes(self, my_cls):
        # for each code in data checks if it is defined in classification
        try:
            my_cls = Classification.objects.get(reference=my_cls)
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
            answer = input('Do you want to continue?')
            self.ERROR = answer != 'Y'  
            self.ERROR_TEXT = "ERROR: CODES IN FILE NOT DEFINED IN CLASSIFICATION"
            
            if self.ERROR == True:
                return
            
            self.IGNORE_CODES = not_found

        return

    def check_spelling:
        # requires 'pyspellchecker' package of Python
        # for texts checks if they are spelled correctly
        # if low frequency of suggestion, manual intervention needed
        # manual entry will be stored and used for the next time

        # if ERROR is True, the next code will not be executed
        if self.ERROR == True:
            return
            
        return

    def handle(self, *args, **options):
        my_file = options['params'][0] + '.xlsx'
        my_cls = options['params'][1]

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
        for i in range(0, len(codes)):
            data.append({
                'code': codes[i],
                'text': texts[i]
            })
        self.DATA = data

        # run other tests
        # before executing any of the following fun (except first)
        # it is checked if self.ERROR is True
        # if there is no error, the function proceeds
        # otherwise it's not executed and process stops
        self.verify_codes(my_cls)
        self.check_spelling()

        if self.ERROR == True:
            self.stdout.write(self.style.ERROR(self.ERROR_TEXT))