from django.db import models


# Everything starts from classification
class Classification(models.Model):
    reference = models.CharField(max_length=25)
    name = models.CharField(max_length=150)
    year = models.CharField(max_length=4)
    type_of_cls = models.CharField(max_length=1) # can take O or E

# Code is child of classification 
# or a single classification of occupation (CODE | TITLE)
class Code(models.Model):
    parent = models.ForeignKey(Classification, on_delete=models.CASCADE)
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
    language = models.CharField(max_length=10)
    size = models.CharField(max_length=50)

class TrainingData(models.Model):
    parent = models.ForeignKey(TrainingDataFile, on_delete=models.CASCADE)
    code = models.CharField(max_length=25)
    text = models.CharField(max_length=255)
    text_en = models.CharField(max_length=255, blank=True)
    tokens = models.CharField(max_length=255)
    tokens_en = models.CharField(max_length=255, blank=True)