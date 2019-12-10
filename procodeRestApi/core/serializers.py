from rest_framework import serializers
from rest_framework.response import Response
from rest_framework import status
from .models import *
import xlrd


# Language choices
LANG = [
        ('en', 'English'),
        ('ge', 'German'),
        ('fr', 'French'),
        ('it', 'Italian')
    ]

# Schemes choices
SCHEMES = [(s.id, s.name) for s in Scheme.objects.all()]

# Admin: Scheme, Classification, Translation, Data
# User: MyFile, MyData

# Serializers for upload
class SchemeUploadSerializer(serializers.Serializer):
    scheme = serializers.ChoiceField(choices=SCHEMES)
    excel = serializers.FileField(
        write_only=True, label="MS Excel file")

# Machine learning data for a scheme upload from Excel
class DataUploadSerializer(serializers.Serializer):
    scheme = serializers.ChoiceField(choices=SCHEMES)
    excel = serializers.FileField(
        write_only=True, label="MS Excel file")

    lng = serializers.ChoiceField(
        choices=LANG, label="Language")


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

    lng = serializers.ChoiceField(
        choices=LANG,
        label="Language")
    
    # since data_tokens is required in model
    # we make its validation to read_only and thus not required
    # but actually it is -> but after it is passed through create
    # we pass data (raw text) through tokenization and then save
    tokens = serializers.CharField(read_only=True)

