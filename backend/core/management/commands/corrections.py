from django.core.management.base import BaseCommand, CommandError
from backend.base import BASE_DIR
from core.models import SpellCorrection
import os, xlrd


# uploads corrections for spelling
# command: python manage.py corrections fr my_file
class Command(BaseCommand):
    help = "Upload corrections for different spellings"

    def add_arguments(self, parser):
        parser.add_argument('params', nargs=2, type=str)

    def handle(self, *args, **options):
        lng = options['params'][0]
        my_file = options['params'][1]

        # read Excel file in DATA/CORRECTIONS
        path = os.path.join(BASE_DIR, 'DATA/CORRECTIONS/{}.xlsx'.format(my_file))
        my_file = xlrd.open_workbook(path)
        my_file = my_file.sheet_by_index(0)
        
        # colonm names and indexes of first row for words and corrections
        cols = my_file.row_values(0)
        word_inx = cols.index('word')
        corr_inx = cols.index('correction')

        # now for every row save spell correction instance
        for row in range(1, my_file.nrows):
            SpellCorrection.objects.create(
                word=my_file.cell_value(row, word_inx),
                correction=my_file.cell_value(row, corr_inx),
                language=lng
            )

        self.stdout.write(self.style.SUCCESS('SUCCESS: CORRECTIONS UPLOADED'))
