from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, renderer_classes, permission_classes
from drf_renderer_xlsx.renderers import XLSXRenderer
from rest_framework.parsers import MultiPartParser, FormParser
from .models import *
from .serializers import *
import xlrd
import json
from .coding import run_cnb

# General views ------------------------------------------
# both administrator and end-users

class UploadView(APIView):
    """
        For scheme/classification, data and mydata
        we need to read excel files and save the data
        in a single step, instead of one entry at time

        This class is not used as view in urls.py -> no end-point
    """
    variables = None
    parser_classes = (MultiPartParser, FormParser)

    def read_excel(self):
        # read excel file and the first sheet
        excel = xlrd.open_workbook(
            file_contents=self.excel.read()
        )
        excel = excel.sheet_by_index(0)

        # get column names
        col_names = excel.row_values(0)
        self.excel_col_names = col_names 

        # if variables are already defined by parent
        # --> column names or fields of this object
        if self.variables is not None:
            col_names = self.variables
            col_names = col_names[0:len(self.excel_col_names)]

        # dictionary will store data from excel 
        data_list = []

        # convert data in excel to dictionary
        for row in range(1, excel.nrows):
            one_row = {}
            for col in range(0, len(col_names)):

                # get cell value in given row and col
                value = excel.cell_value(row, col)

                # sometimes excel keeps code values as floats (e.g. 322.0)
                # must be converted to int and then to strings
                if (type(value) is float):
                    value = str( int(value) )

                one_row[col_names[col]] = value
            
            # append to the list
            data_list.append(one_row)

        self.data_list = data_list

    def post(self, request):
        # to avoid overriding in inherited views if not needed
        if self.run_read_excel == True:
            self.excel = request.data['excel']
            self.read_excel()

        if self.excel is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # data decoded from ms excel
        data = self.data_list
        # foreign key in the given model
        # for classification, e.g., we must know scheme
        if self.parent is not None:
            parent_id = request.data[self.parent]

            # add parent id to each row from excel
            # which is now decoded in self.data_list
            for e in data:
                e[self.parent] = parent_id

        # now serialization and saving
        data_serialized = self.model_serializer(data=data, many=True)
        
        if data_serialized.is_valid():
            data_serialized.save()
            return Response("CREATED", status=status.HTTP_201_CREATED)

        # if something wrong
        print(data_serialized.errors)
        return Response(status=status.HTTP_400_BAD_REQUEST)



# Administrator's pages ----------------------------------

# Views based on UploadExcelView

class SchemeUploadView(UploadView):
    """
        Upload all classification data at once
    """
    serializer_class = SchemeUploadSerializer
    model_serializer = ClassificationSerializer
    parent = "scheme"
    run_read_excel = False

    def set_levels(self, pk):
        """ 
            get classification levels
        """
        data = self.data_list
        levels = []
        scheme = Scheme.objects.get(pk=pk)

        if scheme is None:
            return False

        for e in data:
            lvl = e['level']

            if lvl not in levels:
                levels.append(lvl)

        # to json
        levels = json.dumps(levels)
        scheme.levels = levels
        scheme.save()
        return scheme

    def post(self, request):
        # because we must set levels
        self.excel = request.data['excel']
        self.read_excel()

        if self.excel is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        self.set_levels(pk=request.data['scheme'])

        return super().post(request)

    def put(self, request):
        """
            to updata language

            ...e.g. initially added english
            later we want german or french
        """
        # to avoid overriding in inherited views if not needed
        if self.run_read_excel == True:
            self.excel = request.data['excel']
            self.read_excel()

        if self.excel is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        self.set_levels(pk=request.data['scheme'])

        # data decoded from ms excel
        data = self.data_list
        
        # this will not allow to create new objects
        # just update existing ones with new lang
        for e in data:
            try:
                if (type(e['code']) is float):
                    e['code'] = str( int(e['code']) )

                cls_obj = Classification.objects.get(
                    scheme=request.data['scheme'],
                    code=e['code']
                )
                
                if 'title' in e:
                    cls_obj.title = e['title']
                
                if 'title_ge' in e:
                    cls_obj.title_ge = e['title_ge']

                if 'title_fr' in e:
                    cls_obj.title_fr = e['title_fr']

                if 'title_it' in e:
                    cls_obj.title_it = e['title_it']

                cls_obj.save()
            except:
                continue

        return Response(status=status.HTTP_200_OK)



class DataUploadView(UploadView):
    """
        Upload training data for machine learning
        for a given Scheme and language
    """
    serializer_class = DataUploadSerializer
    model_serializer = DataSerializer
    parent = 'scheme'
    run_read_excel = False

    # because it includes two parents
    # second parent is not found in excel (cls code -> cls id)
    def post(self, request):

        # read excel file
        self.excel = request.data['excel']
        self.read_excel()
        scheme = request.data['scheme']

        # convert codes to their id (Classification table)
        for e in self.data_list:

            # set language based on request.data
            e['lng'] = request.data['lng']

            # try to identify classification object based on code
            try:
                code_id = Classification.objects.get(
                            scheme=scheme,
                            code=e['code']
                        ).id
                e['code'] = code_id

            except:
                e['code'] = ''
                print("Classification instance not found for provided code")

        # remove those fields with code == 'xxx'
        self.data_list = [e for e in self.data_list if e['code'] != '' and e['text'] != '']

        # get levels and create copies of this data for lower levels
        # this saves time to predicting part
        new_data_list = []
        for e in self.data_list:
            my_clsf = Classification.objects.get(pk=e['code'])
            e['level'] = my_clsf.level
            new_data_list.append(e)

            run = my_clsf.parent != 'root'
            while run:
                new_e = e
                new_clsf = Classification.objects.get(
                    scheme=scheme,
                    code=my_clsf.parent
                )
                new_e['code'] = new_clsf.id
                new_e['level'] = new_clsf.level 
                new_data_list.append(new_e)
                my_clsf = new_clsf

                run = new_clsf.parent != 'root'             

        self.data_list = new_data_list
        return super().post(request)


class TranslationUploadView(UploadView):
    """
        Upload of MS Excel with translations
    """
    serializer_class = TranslationUploadSerializer
    model_serializer = TranslationSerializer
    run_read_excel = False
    parent = None

    def post(self, request):
        self.excel = request.data['excel']
        self.read_excel()

        starting_scheme_id = self.request.data['starting_scheme_id']
        output_scheme_id = self.request.data['output_scheme_id']

        new_data_list = []
        for e in self.data_list:
            try:
                starting_cls = Classification.objects.get(
                        scheme=starting_scheme_id,
                        code=e['starting']
                    ).id 

                output_cls = []
                output_list = e['output'].split(",")
                print(output_list)
                for out in output_list:
                    try:
                        out = Classification.objects.get(
                            scheme=output_scheme_id,
                            code=out
                        ).id
                        output_cls.append(out)
                    except:
                        continue
                    
                new_data_list.append(
                    {
                        "starting": starting_cls,
                        "output": output_cls
                    }
                )
            except:
                continue
            
        self.data_list = new_data_list
        return super().post(request)


# Viewsets -------------------------------------------

class SchemeViewSet(viewsets.ModelViewSet):
    queryset = Scheme.objects.all()
    serializer_class = SchemeSerializer

    def retrieve(self, request, pk):
        scheme = get_object_or_404(Scheme, pk=pk)
        scheme_ser = SchemeSerializer(scheme)
        scheme_ser.data['level'] = 3
        return Response(scheme_ser.data, status=status.HTTP_200_OK)

# schemes without classifications
class SchemeOnlyViewSet(viewsets.ModelViewSet):
    queryset = Scheme.objects.all()
    serializer_class = SchemeOnlySerializer

class ClassificationViewSet(viewsets.ModelViewSet):
    queryset = Classification.objects.all()
    serializer_class = ClassificationSerializer

class TranslationViewSet(viewsets.ModelViewSet):
    queryset = Translation.objects.all()
    serializer_class = TranslationSerializer

class DataViewSet(viewsets.ModelViewSet):
    queryset = Data.objects.all()
    serializer_class = DataSerializer




# End-user views ----------------------------------------------
class MyFileViewSet(viewsets.ModelViewSet):
    queryset = MyFile.objects.all()
    serializer_class = MyFileSerializer

    def list(self, request):
        self.queryset = MyFile.objects.filter(
            user = request.user
        )
        return super().list(request)

class MyDataViewSet(viewsets.ModelViewSet):
    queryset = MyData.objects.all()
    serializer_class = MyDataSerializer


# Excel upload views
class MyFileUploadView(UploadView):
    serializer_class = MyFileUploadSerializer
    model_serializer = MyDataSerializer
    parent = 'my_file'
    run_read_excel = False

    # field names defined in parent field variables
    variables = ['var1', 'var2', 'var3', 'var4', 'var5']

    # in order to get column names we override post method
    def post(self, request):
        self.excel = request.data['excel']
        self.read_excel()
        my_file = MyFile.objects.get(pk=request.data['my_file'])
        my_file.variables = json.dumps(self.excel_col_names)
        my_file.save()
        return super().post(request)


# Performing predictions/coding of texts
class MyCodingViewSet(viewsets.ModelViewSet):
    queryset = MyCoding.objects.all()
    serializer_class = MyCodingSerializer

    def list(self, request):
        self.queryset = MyCoding.objects.filter(
            user = request.user
        )
        return super().list(request)

    def update(self, request, pk):
        coding = MyCoding.objects.get(pk=pk)
        coding.output.set([])

        output = request.data['output']
        
        for out in output:
            clsf = Classification.objects.get(pk=out)
            coding.output.add(clsf)
            
        coding.save()

        coding_ser = MyCodingSerializer(coding)
        return Response(coding_ser.data, status=status.HTTP_200_OK)

    def create(self, request):
        # Runs the CNB algorithm from predictions
        # for a single or array of texts returns
        # codings of a given classificaiton scheme

        scheme = request.data['scheme']
        level = request.data['level']
        my_file = None
        
        if 'my_file' in request.data:
            file_id = request.data['my_file']
            my_file = MyFile.objects.get(pk=file_id)
            lng = my_file.lng
        else:
            lng = request.data['lng']

        # error handling -----------------------------
        # if scheme has no titles for a given language
        first_clsf = Classification.objects.filter(
            scheme=scheme
        )[0]

        first_clsf_ser = ClassificationSerializer(first_clsf)
        titleLabel = 'title' if lng == 'en' else 'title_' + lng

        if first_clsf_ser.data[titleLabel] == '':
            return Response(status=status.HTTP_204_NO_CONTENT)

        # --------------------------------------------
        
        # if coding file
        # then text (given a variable) is in my_file
        if 'my_file' in request.data:
            text = []
            var = request.data['variable']

            # filter texts of my_file
            my_data = MyData.objects.filter(my_file=my_file.id)
            
            for obj in my_data:
                text.append( MyDataSerializer(obj).data[var] )

            # for saving coding of files only
            # for one my_file several schemes may be validated
            # prvent the same my_file with multiple the same schemes
            myCoding = MyCoding.objects.filter(
                my_file=my_file.id,
                scheme=scheme
                )

            for cod in myCoding:
                cod.delete()

        else:
            text = [ request.data['text'] ]
      
        # run CNB and get codes
        res = run_cnb(text, lng, level, scheme)
      
        # because res is numpy array
        res = res.tolist()

        # now save the resuts to db
        for txt in text:

            my_coding = MyCoding(
                my_file=my_file,
                scheme=Scheme.objects.get(pk=scheme),
                text=txt,
                lng=lng,
                user=request.user
            )
            my_coding.save()
            output = Classification.objects.get(
                scheme=Scheme.objects.get(pk=scheme),
                code=res[text.index(txt)])
     
            my_coding.output.add(output)
    
        return Response(res, status=status.HTTP_200_OK)

class MyTranscodingViewSet(viewsets.ModelViewSet):
    queryset = MyTranscoding.objects.all()
    serializer_class = MyTranscodingSerializer

    def list(self, request):
        self.queryset = MyTranscoding.objects.filter(
            user = request.user
        )
        return super().list(request)

    def create(self, request):
        my_file = None
        end_scheme_id = request.data['end_scheme']
        end_scheme = Scheme.objects.get(pk=end_scheme_id)

        # starting codes
        starting = []

        if request.data['my_file'] != '':
            my_file = MyFile.objects.get(pk=request.data['my_file'])
            var = request.data['variable']

            # filter texts of my_file
            my_data = MyData.objects.filter(my_file=my_file.id)
            my_data_ser = MyDataSerializer(my_data, many=True)

            for obj in my_data_ser.data:
                starting.append( obj[var] )
        
        else:
            starting = [ request.data['starting'] ]

        # transcode codes
        my_transcoding = None

        for code in starting:
            try:
                starting_id = Classification.objects.get(
                    code=code,
                    scheme=request.data['scheme']
                )
                output = Translation.objects.get(starting=starting_id).output.all()
                my_transcoding = MyTranscoding(
                    my_file=my_file,
                    starting=starting_id,
                    end_scheme=end_scheme,
                    user=request.user
                )

                # for files -> if the coding to the same scheme already performed
                # we need to delete them to avoid duplications
                existing = MyTranscoding.objects.filter(
                    my_file=my_file,
                    starting=starting_id,
                    end_scheme=end_scheme,
                    user=request.user
                )
                for e in existing:
                    e.delete()

                my_transcoding.save()

                for out in output:
                    my_transcoding.output.add(out)
            except:
                continue
            
        if request.data['my_file'] == '':
            # if transcoding failed
            if my_transcoding is None:
                return Response(status=status.HTTP_204_NO_CONTENT)

            my_transcoding_ser = MyTranscodingSerializer(my_transcoding)
            return Response(my_transcoding_ser.data, status=status.HTTP_201_CREATED)
        
        # if file transcoded
        else:
            return Response(status=status.HTTP_201_CREATED)


# if deleting coding of files
# then we delete all codings for a given file
@api_view(['DELETE'])
def delete_file_coding(request, pk):
    coding = MyCoding.objects.filter(my_file=pk)
    for c in coding:
        c.delete()
    return Response(status=status.HTTP_200_OK)

@api_view(['DELETE'])
def delete_file_transcoding(request, pk):
    coding = MyTranscoding.objects.filter(my_file=pk)
    for c in coding:
        c.delete()
    return Response(status=status.HTTP_200_OK)



# download xlsx files for history of coding or transcoding
# pk is primary key for file
@api_view(['GET'])
@renderer_classes([ XLSXRenderer ])
@permission_classes([ permissions.AllowAny ])
def download_coding(request, pk):

    data = MyCoding.objects.filter(my_file=pk)
    data_list = []
   
    for d in data:
        obj = {
            "input_text": d.text,
            "classification_scheme": d.scheme.name
        }
        # as one coding object may include many outputs
        codes = []
        titles = []

        for out in d.output.all():
            codes.append(out.code)

            if d.lng == "ge":
                titles.append(out.title_ge)
            elif d.lng == "fr":
                titles.append(out.title_fr)
            elif d.lng == "it":
                titles.append(out.title_it)
            else:
                titles.append(out.title)
        
        obj["codes"] = ','.join(codes)
        obj["titles"] = ','.join(titles)
        
        data_list.append(obj)

    # now serializer data list
    data_ser = DownloadMyCodingSerializer(data=data_list, many=True)
    if data_ser.is_valid():
        return Response(
            data_ser.data,
            headers={
                'Content-Disposition': 
                'attachment; filename=download.xlsx'
                }
            )
    
    return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@renderer_classes([ XLSXRenderer ])
@permission_classes([ permissions.AllowAny ])
def download_transcoding(request, pk):
    data = MyTranscoding.objects.filter(my_file=pk)
    data_list = []

    for d in data:
        obj = {
            "starting_scheme": d.starting.scheme.name,
            "starting_code": d.starting.code
        }

        if d.my_file.lng == "ge":
            obj['starting_title'] = d.starting.title_ge
        elif d.my_file.lng == "fr":
            obj['starting_title'] = d.starting.title_fr
        elif d.my_file.lng == "it":
            obj['starting_title'] = d.starting.title_it
        else:
            obj['starting_title'] = d.starting.title
        
        codes = []
        titles = []
        
        for out in d.output.all():
            codes.append(out.code)

            if d.my_file.lng == "ge":
                titles.append(out.title_ge if out.title_ge != '' else '-')
            elif d.my_file.lng == "fr":
                titles.append(out.title_fr if out.title_fr != '' else '-')
            elif d.my_file.lng == "it":
                titles.append(out.title_it if out.title_it != '' else '-')
            else:
                titles.append(out.title if out.title != '' else '-')

        obj["end_code"] = ','.join(codes) if len(codes) > 0 else "-"
        obj["end_title"] = ','.join(titles) if len(titles) > 0 else "-"
        obj['end_scheme'] = d.end_scheme.name

        data_list.append(obj)

    # now serializer data list
    data_ser = DownloadMyTranscodingSerializer(data=data_list, many=True)
    if data_ser.is_valid():
        return Response(
            data_ser.data,
            headers={
                'Content-Disposition': 
                'attachment; filename=download.xlsx'
                }
            )
    
    return Response(status=status.HTTP_400_BAD_REQUEST)