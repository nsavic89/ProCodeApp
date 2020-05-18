from rest_framework import serializers
from .models import (
    Classification,
    Code,
    TrainingDataFile,
    TrainingData,
    CrosswalkFile,
    Crosswalk,
    SpellCorrection
)


class ClassificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classification
        fields = '__all__'

class CodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Code 
        fields = '__all__'

class TrainingDataFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingDataFile
        fields = '__all__'

class TrainingDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingData
        fields = '__all__'

class CrosswalkFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrosswalkFile
        fields = '__all__'

class CrosswalkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crosswalk
        fields = '__all__'

class SpellCorrectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpellCorrection
        fields = '__all__'

    # we must prevent two instances with same word and language
    def validate(self, data):
        word = data['word']
        lng = data['language']

        try:
            cor = SpellCorrection.objects.get(word=word, language=lng)
        except: 
            return data

        raise serializers.ValidationError("Correction exists")