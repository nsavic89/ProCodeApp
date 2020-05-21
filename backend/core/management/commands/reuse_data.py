from django.core.management.base import BaseCommand, CommandError
from core.models import (
    CrosswalkFile,
    Crosswalk,
    TrainingDataFile,
    TrainingData,
    Classification
)



# arguments of this command are
# 1. classification 1
# 2. classification 2
# 3. training data file
class Command(BaseCommand):
    help = """
        Uses training data for a given classification (x)
        and transcodes it in another classification (y)
        by using corresponding crosswalks rules
    """

    def add_arguments(self, parser):
        parser.add_argument('params', nargs=3, type=str)

    def handle(self, *args, **options):
        trd_file = options['params'][0]
        clsf = options['params'][1]

        # get data file
        train_file = TrainingDataFile.objects.get(name=trd_file)
        train = TrainingData.objects.filter(parent=train_file)

        # get crosswalk rules
        crs_file = CrosswalkFile.objects.get(
            classification_1=train_file.classification,
            classification_2=clsf
        )
        crosswalk = Crosswalk.objects.filter(parent=crs_file)
        

        # transcode save new file and the data
        classification = Classification.objects.get(reference=clsf)
        new_train_file = TrainingDataFile.objects.create(
            classification=classification
            name=clsf + "_TR_FROM_" + train_file.name,
            language=train_file.language,
            info="Transcoded data from " + train_file.name
        )
        converted_data = []
        for e in train:
            # take only those more probable
            codes = [c.code_2 for c in codes if c.prob > 20 and c.code_1==e.code]

            for code in codes:
                level = Code.objects.get(
                    classification=classification, code=code).level

                obj = TrainingData(
                    parent=new_train_file,
                    text=e.code,
                    code=code,
                    level=level
                )
                converted_data.append(obj)

        TrainingData.objects.bulk_create(converted_data)
        return

