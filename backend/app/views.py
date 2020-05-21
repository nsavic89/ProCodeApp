from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from .coding import code
from .models import Feedback, MyFile, MyFileData
from core.models import CrosswalkFile, Crosswalk
from .serializers import (
    CodingSerializer,
    FeedbackSerializer,
    MyFileSerializer,
    MyFileDataSerializer,
    TranscodingSerializer
)


# coding of a single input or many stored as a file
class CodingView(APIView):
    serializer_class = CodingSerializer

    def post(self, request):
        data_ser = CodingSerializer(data=request.data)
        if data_ser.is_valid():
            kwargs = data_ser.get_data()
            output = code(**kwargs)
        return Response(output, status.HTTP_200_OK)


# save new or list all feedbacks for a given user
class FeedbackView(APIView):
    serializer_class = FeedbackSerializer

    def post(self, request):
        feedback_ser = FeedbackSerializer(data=request.data)

        if feedback_ser.is_valid():
            feedback_ser.save()
            return Response(feedback_ser.data, status.HTTP_201_CREATED)

        return Response(status.HTTP_400_BAD_REQUEST)

    # return feedbacks created by the current user
    def get(self, request):
        queryset = Feedback.objects.filter(user=request.user.id)
        data_ser = FeedbackSerializer(queryset, many=True)
        return Response(data_ser.data, status.HTTP_200_OK)

class MyFileViewSet(viewsets.ModelViewSet):
    serializer_class = MyFileSerializer
    queryset = MyFile.objects.all()

class MyFileDataViewSet(viewsets.ModelViewSet):
    serializer_class = MyFileDataSerializer
    queryset = MyFileData.objects.all()

# transcoding view
class TranscodingView(APIView):
    serializer_class = TranscodingSerializer

    def post(self, request):
        data_ser = TranscodingSerializer(data=request.data)

        if data_ser.is_valid() == False:
            return Response(status.HTTP_400_BAD_REQUEST)

        # if valid we proceed to recoding
        try:
            crsw_file = CrosswalkFile.objects.get(
                classification_1=data_ser.data['from_cls'],
                classification_2=data_ser.data['to_cls']
            )
        except:
            return Response("CRSW_NOT_FOUND", status.HTTP_204_NO_CONTENT)

        # now perform recoding
        crosswalk = Crosswalk.objects.filter(parent=crsw_file)

        # depends if file recoding or single
        if 'my_file' not in data_ser.data:
            translations = crosswalk.filter(code_1=data_ser.data['from_code'])
            trans_codes = [trans.code_2 for trans in translations]
            return Response(trans_codes, status.HTTP_200_OK)