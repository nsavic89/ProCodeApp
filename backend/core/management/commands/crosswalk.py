from django.core.management.base import BaseCommand, CommandError
from backend.settings import BASE_DIR
from core.models import (
    Classification, Code, CrosswalkFile, Crosswalk
)
import os, xlrd


# Takes three arguments:
# classification 1 and classification 2 names
# and file name in DATA/CROSSWALKS
class Command(BaseCommand):
    help = """
        Install and upload crosswalk rules
        between two classification schemes
    """

    # Classification reference names
    # starting and end classification
    CLSF_1 = ""
    CLSF_2 = ""

    CODES_1 = []
    CODES_2 = []
    PROB = []

    def add_arguments(self, parser):
        parser.add_argument('params', nargs=3, type=str)

    def verify_classification(self):
        # check if clsf 1 and 2 exist
        clsf1 = False
        clsf2 = False

        try:
            if Classification.objects.get(reference=self.CLSF_1):
                clsf1 = True
            if Classification.objects.get(reference=self.CLSF_2):
                clsf2 = True
            return True
        except:
            not_found = 1 if clsf1 == False else 2
            raise CommandError("ERROR: Classification %i NOT FOUND" % not_found)

    def verify_codes(self):
        # for codes for a given classification
        # verifies if all are complete
        codes_obj = Code.objects.filter(parent=self.CLSF_1)
        codes = [c.code for c in codes_obj]

        # unique list (set) of codes in excel file
        codes_1_file = set(self.CODES_1)

        # check if every code in classification exists in file
        not_found = []
        for code in codes:
            if code not in codes_1_file:
                not_found.append(code)
        
        if len(not_found) > 0:
            # there are codes not defined in file
            self.stdout.write("Not found in file:\n % s" % ' '.join(not_found))
            self.stdout.write("Proceed?\n")
            proceed = input()
            if proceed != 'Y':
                raise CommandError("ERROR: Some codes not found in file!")
        return True

    def save(self):
        # save all data
        reference = self.CLSF_1 + " - " + self.CLSF_2
        self.stdout.write("Saving crosswalk file ->\n")

        # check if already exists
        # if so result in error
        try:
            crs = CrosswalkFile.objects.get(reference=reference)
            raise CommandError("ERROR: Crosswalk already exist!")
        except:
            pass

        crs_file = CrosswalkFile.objects.create(
            reference=reference,
            classification_1=self.CLSF_1,
            classification_2=self.CLSF_2
        )

        # save data (crosswalk rules) for the given crosswalk file
        self.stdout.write("Saving crosswalk data ->\n")
        crosswalks_list = []

        for i in range(1, len(self.CODES_1)):
            obj = Crosswalk(
                parent=crs_file,
                code_1=self.CODES_1[i],
                code_2=self.CODES_2[i],
                prob=self.PROB[i]
            )
            crosswalks_list.append(obj)
        
        Crosswalk.objects.bulk_create(crosswalks_list)
        return True

    def handle(self, *args, **options):
        self.CLSF_1 = options['params'][0]
        self.CLSF_2 = options['params'][1]
        my_file = options['params'][3]

        # check if CLSF_1 and 2 exist in db
        self.verify_classification()

        # if yes load excel file
        path = os.path.join(BASE_DIR, 'DATA/CROSSWALKS/%s.xlsx' % my_file)
        my_file = xlrd.open_workbook(path)
        my_file = my_file.sheet_by_index(0)

        # column values - codes of classification 1
        # and corresponding of classification 2 with probabilities
        # probabilities range between 0 and 100
        codes_1 = my_file.col_values(0)
        codes_2 = my_file.col_values(1)
        self.CODES_1 = [str(int(c)) if type(c) is float else str(c) for c in codes_1]
        self.CODES_2 = [str(int(c)) if type(c) is float else str(c) for c in codes_2]
        self.PROB = my_file.col_values(2)

        # verify if all codes are there
        self.verify_codes()
        self.save()