from django.shortcuts import render, HttpResponse
from rest_framework import viewsets
from rest_framework.views import APIView
from .models import (
    Classification,
    Code,
    TrainingDataFile,
    TrainingData,
    CrosswalkFile,
    Crosswalk,
    SpellCorrection,
    CodingRules
)
from .serializers import (
    ClassificationSerializer,
    CodeSerializer,
    TrainingDataFileSerializer,
    TrainingDataSerializer,
    CrosswalkFileSerializer,
    CrosswalkSerializer,
    SpellCorrectionSerializer,
    CodingRulesSerializer
)



# Models managed by admin
class ClassificationViewSet(viewsets.ModelViewSet):
    queryset = Classification.objects.all()
    serializer_class = ClassificationSerializer

class CodeViewSet(viewsets.ModelViewSet):
    queryset = Code.objects.all()
    serializer_class = CodeSerializer

class TrainingDataFileViewSet(viewsets.ModelViewSet):
    queryset = TrainingDataFile.objects.all()
    serializer_class = TrainingDataFileSerializer

class TrainingDataViewSet(viewsets.ModelViewSet):
    queryset = TrainingData.objects.all()
    serializer_class = TrainingDataSerializer

class CodingRulesViewSet(viewsets.ModelViewSet):
    queryset = CodingRules.objects.all()
    serializer_class = CodingRulesSerializer

class CrosswalkFileViewSet(viewsets.ModelViewSet):
    queryset = CrosswalkFile.objects.all()
    serializer_class = CrosswalkFileSerializer
    
class CrosswalkViewSet(viewsets.ModelViewSet):
    queryset = Crosswalk.objects.all()
    serializer_class = CrosswalkSerializer

class SpellCorrectionViewSet(viewsets.ModelViewSet):
    queryset = SpellCorrection.objects.all()
    serializer_class = SpellCorrectionSerializer
