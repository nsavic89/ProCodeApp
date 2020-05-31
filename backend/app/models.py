from django.db import models
from django.contrib.auth.models import User

# My file is users data uploaded as an Excel file
# each file stores variables or column names 
# while the actual data is stored in My_File_Data
class MyFile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    language = models.CharField(max_length=10)
    date = models.DateField(auto_now_add=True)
    info = models.CharField(max_length=255, blank=True)
    variables = models.TextField(max_length=255, default='[]')
    classifications = models.TextField(default='[]')
    coded_variables = models.TextField(default='{}') # json with clsf_ref: variable_name
# tip: we must know each time which variable was coded against a classification
# beacuse we must know when reporting feedback which data should be added to the training
# dataset from MyFileData.data -> as this one may contain several variables

class MyFileData(models.Model):
    parent = models.ForeignKey(MyFile, on_delete=models.CASCADE)
    data = models.TextField(default='{}') # json form var: value
    codes = models.TextField(max_length=255, default='{}')

# collects user data
# every feedback will be later added to the training data
class Feedback(models.Model):
    user = models.CharField(max_length=50)
    text = models.CharField(max_length=255)
    language = models.CharField(max_length=10)
    classification = models.CharField(max_length=25)
    code = models.CharField(max_length=25)
    level = models.IntegerField()