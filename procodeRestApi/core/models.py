from django.db import models


# Administrator's data --------------------------------------
# The admin uploads Scheme, Classification, Translations and Training data

class Scheme(models.Model):
    # classification scheme of occupations or economic sectors
    # includes details on the given scheme: year, version ...
    name = models.CharField(max_length=50)
    stype = models.CharField(max_length=25)
    version = models.CharField(max_length=10, blank=True)
    year = models.CharField(max_length=4, blank=True)
    dscr = models.CharField(max_length=255, blank=True)

class Classification(models.Model):
    # one classification entry for Scheme
    # one instance contains different languages
    scheme = models.ForeignKey(
        Scheme,
        on_delete=models.CASCADE
    )
    parent = models.CharField(max_length=25)
    code = models.CharField(max_length=25)
    title = models.CharField(max_length=255, blank=True)
    title_ge = models.CharField(max_length=255, blank=True)
    title_fr = models.CharField(max_length=255, blank=True)
    title_it = models.CharField(max_length=255, blank=True)

class Translation(models.Model):
    # translation between two classification entries
    # e.g. between ISCO and NOC
    starting = models.ForeignKey(
        Classification,
        related_name="starting",
        on_delete=models.CASCADE
    )
    outcome = models.ManyToManyField(
        Classification,
        related_name="outcome"
    )

class Data(models.Model):
    # data to train machine learning algorithm
    # uploaded by admin or sent as feedback from user
    scheme = models.ForeignKey(
        Scheme,
        on_delete=models.CASCADE
    )
    code = models.ForeignKey(
        Classification,
        on_delete=models.CASCADE
    )
    data = models.CharField(max_length=255)
    data_tokens = models.CharField(max_length=255)
    lng = models.CharField(max_length=15)



# User's models ----------------------------------
# Regular John Doe uploads its own Files
# User files -> for coding and transcoding

class MyFile(models.Model):
    # file uploaded by user -> contains details
    name = models.CharField(max_length=50)
    date = models.DateField(auto_now_add=True)
    dscr = models.CharField(max_length=255, blank=True)

class MyData(models.Model):
    # contains user's files' data
    # data: any data can be stored
    # json -> [{"name": "definition", "value": "def1"}...]
    # code: results of coding or transcoding saved every time
    my_file = models.ForeignKey(
        MyFile,
        on_delete=models.CASCADE
    ) 
    data = models.TextField()
    code = models.ManyToManyField(
        Classification
    )