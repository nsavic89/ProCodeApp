from rest_framework import serializers
from rest_framework.response import Response
from rest_framework import status
from .models import *
import xlrd


# Admin: Scheme, Classification, Translation, Data
# User: MyFile, MyData

# Serializers for upload
class SchemeUploadSerializer(serializers.Serializer):
    scheme = serializers.PrimaryKeyRelatedField(
            queryset=Scheme.objects.all()
        )
    excel = serializers.FileField(label="MS Excel file")

# when scheme is imported, we can convert its names to data
# and then use this data as the training dataset for ML
class SchemeAsDataSerializer(serializers.Serializer):
    scheme = serializers.PrimaryKeyRelatedField(
            queryset=Scheme.objects.all()
        )
    LANG = [
        ('en', 'English'),
        ('ge', 'German'),
        ('fr', 'French'),
        ('it', 'Italian')
    ]

    lng = serializers.ChoiceField(
        choices=LANG, label="Language")

# Machine learning data for a scheme upload from Excel
class DataUploadSerializer(serializers.Serializer):
    scheme = serializers.PrimaryKeyRelatedField(
            queryset=Scheme.objects.all()
        )
    excel = serializers.FileField(label="MS Excel file")

    LANG = [
        ('en', 'English'),
        ('ge', 'German'),
        ('fr', 'French'),
        ('it', 'Italian')
    ]

    lng = serializers.ChoiceField(
        choices=LANG, label="Language")

# Translation upload
class TranslationUploadSerializer(serializers.Serializer):
    excel = serializers.FileField(label="MS Excel file")
    starting_scheme_id = serializers.PrimaryKeyRelatedField(
            queryset=Scheme.objects.all()
        )
    output_scheme_id = serializers.PrimaryKeyRelatedField(
            queryset=Scheme.objects.all()
        )


# Serializers for viewsets ------------------------------------
class ClassificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classification
        fields = '__all__'
class SchemeSerializer(serializers.ModelSerializer):
    CHOICES = [
        ('O', 'Occupations'),
        ('E', 'Economic sectors')
    ]

    stype = serializers.ChoiceField(
        choices=CHOICES,
        label = "Scheme type"
    )
    classification = ClassificationSerializer(read_only=True, many=True)
    class Meta:
        model = Scheme
        fields = '__all__'

# only schemes serializer
class SchemeOnlySerializer(serializers.ModelSerializer):
    CHOICES = [
        ('O', 'Occupations'),
        ('E', 'Economic sectors')
    ]

    stype = serializers.ChoiceField(
        choices=CHOICES,
        label = "Scheme type"
    )
    class Meta:
        model = Scheme
        fields = '__all__'
        



class TranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Translation
        fields = '__all__'

# Machine learning data -> train CNB
class DataSerializer(serializers.ModelSerializer):
    class Meta:
        model = Data
        fields = '__all__'

    LANG = [
        ('en', 'English'),
        ('ge', 'German'),
        ('fr', 'French'),
        ('it', 'Italian')
    ]

    lng = serializers.ChoiceField(
        choices=LANG,
        label="Language")
    
    # since data_tokens is required in model
    # we make its validation to read_only and thus not required
    # but actually it is -> but after it is passed through create
    # we pass data (raw text) through tokenization and then save
    tokens = serializers.CharField(read_only=True)


# End-user serializers ----------------------------------------------
class MyDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyData
        fields = '__all__'
        
class MyFileSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
        )
        
    LANG = [
        ('en', 'English'),
        ('ge', 'German'),
        ('fr', 'French'),
        ('it', 'Italian')
    ]
    date = serializers.DateField(format="%d-%m-%Y", read_only=True)
    lng = serializers.ChoiceField(
        choices=LANG, label="Language")

    my_data = MyDataSerializer(read_only=True, many=True)

    class Meta:
        model = MyFile 
        fields = '__all__'

# upload serializer ------------------------------------------------
class MyFileUploadSerializer(serializers.Serializer):
    excel = serializers.FileField(label="MS Excel file")
    my_file = serializers.CharField()




# Coding and transcoding
class MyCodingSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
        )
    output = ClassificationSerializer(read_only=True, many=True)
    variable = serializers.CharField(
        write_only=True,
        allow_blank=True,
        label="Variable in file"
        )

    # lng only required when not coding entire file
    # since files include language information
    LANG = [
        ('en', 'English'),
        ('ge', 'German'),
        ('fr', 'French'),
        ('it', 'Italian')
    ]
    lng = serializers.ChoiceField(
        choices=LANG,
        label="Language (if not coding file)",
        allow_blank=True
        )
    level = serializers.CharField(write_only=True)

    class Meta:
        model = MyCoding 
        fields = [
            'id',
            'my_file',
            'variable',
            'text',
            'scheme',
            'level',
            'lng',
            'output',
            'user'
        ]    
        
class MyTranscodingSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
        )
    variable = serializers.CharField(write_only=True)
    starting = ClassificationSerializer(read_only=True)
    end_scheme = serializers.PrimaryKeyRelatedField(
            queryset=Scheme.objects.all(), write_only=True
        )
    output = ClassificationSerializer(read_only=True, many=True)

    class Meta:
        model = MyTranscoding
        fields = [
            'id',
            'my_file',
            'variable',
            'starting',
            'end_scheme',
            'output',
            'user'
        ]

# serializers for download
class DownloadMyCodingSerializer(serializers.Serializer):
    input_text = serializers.CharField()
    classification_scheme = serializers.CharField()
    codes = serializers.CharField()
    titles = serializers.CharField()

class DownloadMyTranscodingSerializer(serializers.Serializer):
    starting_scheme = serializers.CharField()
    starting_code = serializers.CharField()
    starting_title = serializers.CharField()
    end_scheme = serializers.CharField()
    end_code = serializers.CharField()
    end_title = serializers.CharField()