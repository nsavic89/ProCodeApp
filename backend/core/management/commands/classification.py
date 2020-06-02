from django.core.management.base import BaseCommand, CommandError
from backend.base import BASE_DIR
from core.models import Classification, Code
from core.serializers import CodeSerializer
import os, xlrd

class Command(BaseCommand):
    help = "Installs classification placed in DATA/CLASSIFICATION"

    def add_arguments(self, parser):
        parser.add_argument('my_file', type=str)

    def handle(self, *args, **options):

        # test 1: first checking if the file exists in the given folder -----------
        list_of_files = os.listdir(os.path.join(BASE_DIR, 'DATA/CLASSIFICATIONS'))
        my_file = options['my_file'] + '.xlsx'

        if my_file not in list_of_files:
            self.stdout.write(self.style.ERROR('ERROR: FILE NOT FOUND'))
            return

        # test 2: now check if some codes repeat ----------------------------------
        # read first file and the first sheet of the excel file
        path = os.path.join(BASE_DIR, 'DATA/CLASSIFICATIONS/' + my_file)
        my_file = xlrd.open_workbook(path)
        my_file = my_file.sheet_by_index(0)
        
        # get index of col containing codes
        cols = my_file.row_values(0)
        code_index = cols.index('code')

        # now we check if all codes are different -> no duplicates
        codes = my_file.col_values(code_index)
        codes = [str(int(code)) if type(code) is float else str(code) for code in codes]
        codes = [code.strip() for code in codes]
        codes_set = set(codes)
        duplicates_exist = False

        for code in codes_set:
            if codes.count(code) > 1:
                self.stdout.write(self.style.ERROR(
                    'ERROR: {} repeated'.format(code))
                )
                duplicates_exist = True

        # if repeats stop process
        if duplicates_exist == True:
            return

        # check parents
        parents = my_file.col_values(cols.index('child_of'))
        parents = [str(int(p)) if type(p) is float else str(p) for p in parents]
        for parent in parents:
            if parent not in codes_set and parent not in ['child_of', 'root']:
                self.stdout.write(
                    self.style.ERROR(
                        'ERROR: {} cannot be parent code'.format(parent)
                    )
                )

        # save data ------------------------------------
        # collection classification details
        classification = {}

        self.stdout.write(('Classification reference name:'))
        classification['reference'] = input()

        # check if one with that reference already exists
        # if yes, then update
        try:
            instance = Classification.objects.get(reference=classification['reference'])
            instance.delete()
            self.stdout.write(self.style.WARNING('Classification already existed!'))
        except:
            self.stdout.write(self.style.WARNING('Classification did not exist...'))
        
        # we create new instance
        self.stdout.write('Classification full name:')
        classification['name'] = input()

        self.stdout.write('Short name:')
        classification['short'] = input()

        self.stdout.write('Classification year:')
        classification['year'] = input()

        self.stdout.write('Occupation (O) or Economic activity (E):')
        classification['type_of_cls'] = input()

        # save new
        cls_instance = Classification.objects.create(**classification)

        # first create list of objects
        data = []
        for row in range(1, my_file.nrows):
            obj = {}

            for col in range(0, len(cols)):
                value = my_file.cell_value(row, col)

                if type(value) is float:
                    value = str(int(value))
                else:
                    value = str(value)

                obj[cols[col]] = value
            # append new code instance to data
            obj['parent'] = cls_instance.id
            data.append(obj)

        codes_ser = CodeSerializer(data=data, many=True)
        
        if codes_ser.is_valid():
            codes_ser.save()
            self.stdout.write(self.style.SUCCESS('Classification saved!'))
        
        else:
            self.stdout.write(self.style.ERROR(codes_ser.errors))
            self.stdout.write(self.style.ERROR('ERROR: Codes were not saved'))