from django.shortcuts import render, HttpResponse
from rest_framework import viewsets
from .models import (
    Classification,
    Code,
    TrainingDataFile,
    TrainingData,
    CrosswalkFile,
    Crosswalk
)
from .serializers import (
    ClassificationSerializer,
    CodeSerializer,
    TrainingDataFileSerializer,
    TrainingDataSerializer,
    CrosswalkFileSerializer,
    CrosswalkSerializer
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

class CrosswalkFileViewSet(viewsets.ModelViewSet):
    queryset = CrosswalkFile.objects.all()
    serializer_class = CrosswalkFileSerializer
    
class CrosswalkViewSet(viewsets.ModelViewSet):
    queryset = Crosswalk.objects.all()
    serializer_class = CrosswalkSerializer