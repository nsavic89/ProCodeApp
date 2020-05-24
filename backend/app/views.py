from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from .coding import code
from .models import Feedback, MyFile, MyFileData
from rest_framework.parsers import MultiPartParser, FormParser
from core.models import (
    CrosswalkFile,
    Crosswalk,
    Code,
    Classification
)
from core.serializers import CodeSerializer
from .serializers import (
    CodingSerializer,
    FeedbackSerializer,
    MyFileSerializer,
    MyFileDataSerializer,
    TranscodingSerializer
)
import json


# coding of a single input or many stored as a file
class CodingView(APIView):
    serializer_class = CodingSerializer

    def post(self, request):
        data_ser = CodingSerializer(data=request.data)

        if data_ser.is_valid():
            kwargs = data_ser.get_data()
            output = code(**kwargs)

            if 'my_file' in data_ser.data:
                # coding files
                # save output to My_File_Data
                data = data_ser.data
                my_file = MyFile.objects.get(pk=data['my_file'])
                my_data = MyFileData.objects.filter(parent=my_file)

                # add classification name in my file
                clsf = json.loads(my_file.classifications)
                # only if not already added
                # if added then it will overpaste
                if data['classification'] not in clsf:
                    clsf.append(data['classification'])

                my_file.classifications = json.dumps(clsf)
                my_file.save()
                # add codes 
                for i, o in enumerate(my_data):
                    codes = json.loads(o.codes)
                    codes[data['classification']] = [output[i]]
                    o.codes = json.dumps(codes)
                    o.save()

                # serialize data 
                my_data_ser = MyFileDataSerializer(my_data, many=True)

                return Response(my_data_ser.data, status.HTTP_200_OK)

            else:
                # when single coding
                return Response(output, status.HTTP_200_OK)

        return Response(status=status.HTTP_204_NO_CONTENT)


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
    parser_classes = (MultiPartParser, FormParser)
    """
    def list(self, request):
        self.queryset = self.queryset.filter(user=request.user.id)
        return super().list(self, request)"""

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


# load children model instances based on the parent's reference/id
# for example all codes for which classification reference is PCS
class CodesByCls(APIView):
    def get(self, request, reference):
        # try to find codes by reference name of classification
        try:
            classification = Classification.objects.get(reference=reference)
            queryset = Code.objects.filter(parent=classification)
            ser_data = CodeSerializer(queryset, many=True)
            return Response(ser_data.data, status=status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_204_NO_CONTENT)

# Get data of a file by using ID of the file
class FileDataByFileID(APIView):
    def get(self, request, pk):
        try:
            my_file = MyFile.objects.get(pk=pk)
            queryset = MyFileData.objects.filter(parent=my_file)
            ser_data = MyFileDataSerializer(queryset, many=True)
            return Response(ser_data.data, status=status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_204_NO_CONTENT)