from django.db import models


# Administrator's data --------------------------------------
# The admin uploads Scheme, Classification, Translations and Training data

# this is required when saving new Data instance (see below)
from .tokenization import get_tokens

class Scheme(models.Model):
    # classification scheme of occupations or economic sectors
    # includes details on the given scheme: year, version ...
    name = models.CharField(max_length=50)
    stype = models.CharField(max_length=1)
    version = models.CharField(max_length=10, blank=True)
    year = models.CharField(max_length=4, blank=True)
    dscr = models.CharField(
        max_length=255,
        blank=True, 
        verbose_name="Description (optional)")  

    def __str__(self):
        return self.name

class Classification(models.Model):
    # one classification entry for Scheme
    # one instance contains different languages
    scheme = models.ForeignKey(
        Scheme,
        on_delete=models.CASCADE
    )
    parent = models.CharField(max_length=25, verbose_name="Parent code")
    code = models.CharField(max_length=25)
    level = models.CharField(max_length=1)
    title = models.CharField(max_length=255, blank=True)
    title_ge = models.CharField(max_length=255, blank=True)
    title_fr = models.CharField(max_length=255, blank=True)
    title_it = models.CharField(max_length=255, blank=True)

    # tokens for titles -> see the next comment
    tokens = models.CharField(max_length=255, blank=True)
    tokens_ge = models.CharField(max_length=255, blank=True)
    tokens_fr = models.CharField(max_length=255, blank=True)
    tokens_it = models.CharField(max_length=255, blank=True)

    # we need to get tokens at this point when saving new instance
    # to save time when later we run CNB algorithm...then we have already tokens
    def set_tokens(self):
        self.tokens = get_tokens(self.title, 'en')
        self.tokens_ge = get_tokens(self.title_ge, 'ge')
        self.tokens_fr = get_tokens(self.title_fr, 'fr')
        self.tokens_it = get_tokens(self.title_it, 'it')

    # before saving needed to tokenize titles
    def save(self, *args, **kwargs):
        self.set_tokens()
        super(Classification, self).save(*args, **kwargs)

    def __str__(self):
        if self.title != "":
            return '{}: {}'.format(self.code, self.title)
        
        elif self.title_fr != "":
            return '{}: {}'.format(self.code, self.title_fr)

        return '{}: {}'.format(self.code, self.title_ge)

class Translation(models.Model):
    # translation between two classification entries
    # e.g. between ISCO and NOC
    starting = models.ForeignKey(
        Classification,
        related_name="starting",
        on_delete=models.CASCADE
    )
    output = models.ManyToManyField(
        Classification,
        related_name="outcome"
    )

class Data(models.Model):
    # data to train machine learning algorithm
    # uploaded by admin or sent as feedback from user
    scheme = models.ForeignKey(
        Scheme,
        on_delete=models.CASCADE,
        verbose_name="Classification scheme"
    )
    code = models.ForeignKey(
        Classification,
        on_delete=models.CASCADE
    )
    text = models.CharField(max_length=255)
    tokens = models.CharField(max_length=255)
    lng = models.CharField(max_length=2)

    # get tokens for self.text
    def set_tokens(self):
        self.tokens = get_tokens(self.text, self.lng)

    def save(self, *args, **kwargs):
        self.set_tokens()
        super(Data, self).save(*args, **kwargs)


# User's models ----------------------------------
# Regular John Doe uploads its own Files
# User files -> for coding and transcoding

class MyFile(models.Model):
    # file uploaded by user -> contains details
    name = models.CharField(max_length=50)
    date = models.DateField(auto_now_add=True)
    dscr = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Description (optional)")

    variables = models.CharField(max_length=255, blank=True)
    lng = models.CharField(max_length=2)
    def __str__(self):
        return self.name

class MyData(models.Model):
    # contains user's files' data
    # data: any data can be stored
    # json -> [{"name": "definition", "value": "def1"}...]
    # code: results of coding or transcoding saved every time
    my_file = models.ForeignKey(
        MyFile,
        on_delete=models.CASCADE,
        related_name="my_data"
    ) 
    var1 = models.CharField(max_length=255, blank=True)
    var2 = models.CharField(max_length=255, blank=True)
    var3 = models.CharField(max_length=255, blank=True)
    var4 = models.CharField(max_length=255, blank=True)
    var5 = models.CharField(max_length=255, blank=True)

    # results of coding/transcoding
    # when transcoded -> code takes transcoded values
    code = models.ForeignKey(
        Classification,
        on_delete=models.SET_NULL,
        blank=True,
        null=True)

    def __str__(self):
        return '{} {} {} {} {}'.format(
            self.var1,
            self.var2,
            self.var3,
            self.var4,
            self.var5)

# desired to keep track of previous codings and transcodings
# foreign keys (coding): MyFile, Scheme, Classification
# many Classification instances may be result
# variable in Coding is column name that was coded (from MyData.data["variable_x"])
class Coding(models.Model):
    my_file = models.ForeignKey(
        MyFile,
        on_delete=models.CASCADE
    )
    scheme = models.ForeignKey(
        Scheme,
        on_delete=models.CASCADE
    )
    variable = models.CharField(max_length=50)
    output = models.ManyToManyField(
        Classification
    )

class Transcoding(models.Model):
    my_file = models.ForeignKey(
        MyFile,
        on_delete=models.CASCADE
    )
    scheme_starting = models.ForeignKey(
        Scheme,
        on_delete=models.CASCADE,
        related_name="starting"
    )
    scheme_output = models.ForeignKey(
        Scheme,
        on_delete=models.CASCADE,
        related_name="output"
    )
    variable = models.CharField(max_length=50)
    output = models.ManyToManyField(
        Classification
    )