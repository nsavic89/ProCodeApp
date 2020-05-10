from django.core.management.base import BaseCommand, CommandError
from backend.settings import BASE_DIR
import os

class Command(BaseCommand):
    help = "This is help text"

    def add_arguments(self, parser):
        parser.add_argument('my_file', type=str)

    def handle(self, *args, **options):
        # first checking if the file exists in the given folder
        self.stdout.write("Searching file in DATA/CLASSIFICATIONS/", ending='\n')
        list_of_files = os.listdir(os.path.join(BASE_DIR, 'DATA/CLASSIFICATIONS'))
        
        if options['my_file'] not in list_of_files:
            self.stdout.write(self.style.ERROR('ERROR: FILE NOT FOUND'))
            return