from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework import viewsets
from .coding import code
from .models import Feedback, MyFile, MyFileData
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import authenticate
from rest_framework.decorators import renderer_classes, api_view
from drf_renderer_xlsx.renderers import XLSXRenderer
from django.contrib.auth.models import User, AnonymousUser
from .coding import prepare_input
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
    TranscodingSerializer,
    ExcelSerializer,
    UserSerializer
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

                # coded variables
                coded_variables = json.loads(my_file.coded_variables)
                coded_variables[data['classification']] = data['variable']

                my_file.classifications = json.dumps(clsf)
                my_file.coded_variables = json.dumps(coded_variables)
                my_file.save()
                # add codes 
                for i, o in enumerate(my_data):
                    codes = json.loads(o.codes)
                    codes[data['classification']] = output[i]
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
            # lemmatize, tokenize, to lower from .coding
            prep_text = prepare_input(
                [ feedback_ser.data['text'] ],
                feedback_ser.data['language']
            )
            fb.data['text'] = prep_text
            fb = feedback_ser.save()
            
            # save same text for the training data towards top-level
            classification = Classification.objects.get(
                reference=fb.classification
            )
            code_instance = Code.objects.get(
                parent=classification,
                code=fb.code
            )
            child_of = code_instance.child_of

            while child_of != 'root':
                new_fb = Feedback.objects.create(
                    user=fb.user,
                    text=fb.text,
                    language=fb.language,
                    code=code_instance.code,
                    level=code_instance.level-1,
                    classification=fb.classification
                )

                code_instance = Code.objects.get(
                    parent=classification,
                    code=code_instance.child_of
                )
                child_of = code_instance.child_of

            return Response(feedback_ser.data, status.HTTP_201_CREATED)
        else:
            print(feedback_ser.errors)
        
        return Response(status=status.HTTP_400_BAD_REQUEST)

    # return feedbacks created by the current user
    def get(self, request):
        queryset = Feedback.objects.filter(user=request.user.id)
        data_ser = FeedbackSerializer(queryset, many=True)
        return Response(data_ser.data, status.HTTP_200_OK)

class MyFileViewSet(viewsets.ModelViewSet):
    serializer_class = MyFileSerializer
    queryset = MyFile.objects.all()
    parser_classes = (MultiPartParser, FormParser)
    
    def list(self, request):
        self.queryset = self.queryset.filter(user=request.user.id)
        return super().list(self, request)

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
        
        # if file
        data = data_ser.data 
        cls_1 = data['from_cls']
        cls_2 = data['to_cls']

        crosswalk_file = CrosswalkFile.objects.get(
            classification_1=cls_1,
            classification_2=cls_2)

        my_file = MyFile.objects.get(pk=data['my_file'])
        my_data = MyFileData.objects.filter(parent=my_file)

        # may be classifation or variable
        variable = data["variable"]
        file_variables = json.loads(my_file.variables)
        file_classifications = json.loads(my_file.classifications)

        #recoding
        for o in my_data:
            # is variable or classification
            if variable in file_variables:
                code_1 = json.loads(o.data)[variable]
            else:
                code_1 = json.loads(o.codes)[variable]
           
            code_2 = Crosswalk.objects.filter(
                    parent=crosswalk_file,
                    code_1=code_1[0]
                )
            
            code_2 = [c.code_2 for c in code_2]
            codes = json.loads(o.codes)
            codes[cls_2] = code_2
            o.codes = json.dumps(codes)
            o.save()
        
        # udpate my file
        clsfs = json.loads(my_file.classifications)
        
        if cls_2 not in clsfs:
            clsfs.append(cls_2)
            my_file.classifications = json.dumps(clsfs)
            my_file.save()

        my_data = MyFileData.objects.filter(parent=my_file)
        my_data_ser = MyFileDataSerializer(my_data, many=True)
        return Response(my_data_ser.data, status=status.HTTP_200_OK)



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


# downlaod xlsx data
from collections import OrderedDict

@api_view(['GET'])
@renderer_classes([ XLSXRenderer ])
def download(request, pk):
    my_file = MyFile.objects.get(pk=pk)
    my_data = MyFileData.objects.filter(parent=my_file)

    # now create json
    excel_list = []
    data = json.loads(my_data[0].data)
    codes = json.loads(my_data[0].codes)

    excel = {}
    i = 1
    for key in data:
        excel['var%i' % i] = key
        i = i + 1

    i = 1
    for key in codes:
        excel['code%i' % i] = key
        i = i + 1

    excel_list.append(excel)

    for o in my_data:
        data = json.loads(o.data)
        codes = json.loads(o.codes)

        excel = {}
        i = 1
        for key in data:
            excel['var%i' % i] = data[key]
            print(data[key])
            i = i + 1

        i = 1
        for key in codes:
            excel['code%i' % i] = ' '.join(codes[key])
            print(codes[key])
            i = i + 1

        excel_list.append(excel)

    excel_ser = ExcelSerializer(data=excel_list, many=True)
    if excel_ser.is_valid():      
        return Response(excel_ser.data, headers={
                'Content-Disposition': 'attachment; filename=download.xlsx',
            })
    
    print(excel_ser.errors)



# User details and sign up
class UserView(APIView):

    permission_classes = [AllowAny]

    # get user details current user
    def get(self, request):
        user = request.user

        # Well becuase we allow anybody to access this view
        # if a random user requests it before signed in
        # he is an anonymous user and we return HTTP 401
        if isinstance(user, AnonymousUser) == True:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        user = UserSerializer(User.objects.get(username=user))
        return Response(user.data, status=status.HTTP_200_OK)

    # sign-up new user
    def post(self, request):
        user = UserSerializer(data=request.data)
    
        if user.is_valid():
            user.save()
            return Response(user.data, status=status.HTTP_201_CREATED)
        
        return Response(status=status.HTTP_400_BAD_REQUEST)

# user password change
@api_view(['POST'])
def pw_change(request):
    
    # authenticate the current user
    user = authenticate(
        username=request.user,
        password=request.data['pw']
    )
    
    if user is not None:
        user.set_password(request.data['pw_new'])
        user.save()
        return Response("Password changed", status=status.HTTP_200_OK)
    
    return Response(status=status.HTTP_400_BAD_REQUEST)
