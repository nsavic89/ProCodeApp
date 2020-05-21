from django.db import models


# Everything starts from classification
class Classification(models.Model):
    reference = models.CharField(max_length=25)
    name = models.CharField(max_length=150)
    year = models.CharField(max_length=4)
    type_of_cls = models.CharField(max_length=1, verbose_name="Type") # can take O or E

# Code is child of classification 
# or a single classification of occupation (CODE | TITLE)
class Code(models.Model):
    parent = models.ForeignKey(Classification, on_delete=models.CASCADE)
    child_of = models.CharField(max_length=25)
    code = models.CharField(max_length=25)
    level = models.IntegerField()
    title = models.CharField(max_length=255, blank=True)
    title_fr = models.CharField(max_length=255, blank=True)
    title_ge = models.CharField(max_length=255, blank=True)
    title_it = models.CharField(max_length=255, blank=True)
    info = models.CharField(max_length=255, blank=True)


# Every time a file holding training data is uploaded
# corresponding instance of TrainingDataFile is created
# if deleted, all underlying TrainingData are deleted
class TrainingDataFile(models.Model):
    classification = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    language = models.CharField(max_length=10)
    date = models.DateField(auto_now_add=True)
    size = models.CharField(max_length=50)
    info = models.CharField(max_length=255, blank=True)

class TrainingData(models.Model):
    parent = models.ForeignKey(TrainingDataFile, on_delete=models.CASCADE)
    code = models.CharField(max_length=25)
    level = models.IntegerField()
    text = models.CharField(max_length=255)

# determines which Training_Data_Files will be loaded
# for a given classification scheme
# if requested level for coding > max_level -> no coding permitted
class CodingRules(models.Model):
    classification = models.CharField(max_length=50)
    input_lng = models.CharField(max_length=10)
    td_file_lng = models.CharField(max_length=10)
    max_level = models.IntegerField(default=1)

# Spell corrections defined by admin
# sometimes pycheckspeller package results in misspelling
# therefore we store every time the admin makes manual correction
class SpellCorrection(models.Model):
    language = models.CharField(max_length=2)
    word = models.CharField(max_length=50)
    correction = models.CharField(max_length=50)
    # we must prevent two instances with same word and language
    # this is defined in serializer. It includes a custom validation

# CrosswalkFile contains only a list of transcoding rules between two classifications
# For vice-versa, another file must be uploaded
class CrosswalkFile(models.Model):
    reference = models.CharField(max_length=50)
    classification_1 = models.CharField(max_length=25)
    classification_2 = models.CharField(max_length=25)

# Single transcoding rule
# if code 1 leads to multiple outcomes, they are defined in separate instances
class Crosswalk(models.Model):
    parent = models.ForeignKey(CrosswalkFile, on_delete=models.CASCADE)
    code_1 = models.CharField(max_length=25)
    code_2 = models.CharField(max_length=25)
    prob = models.IntegerField() # value from 1-100