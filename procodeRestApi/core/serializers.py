from rest_framework import serializers
from rest_framework.response import Response
from rest_framework import status
from .models import *
import xlrd


# Admin: Scheme, Classification, Translation, Data
# User: MyFile, MyData

# Serializers for upload
class SchemeUploadSerializer(serializers.Serializer):
    CHOICES = [
        (
            scheme.id,
            scheme.name
        ) for scheme in Scheme.objects.all()]
        
    scheme = serializers.ChoiceField(
        choices=CHOICES
    )

    excel = serializers.FileField(
        write_only=True, label="MS Excel file")

# Serializers for viewsets
class SchemeSerializer(serializers.ModelSerializer):
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
        

class ClassificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classification
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

