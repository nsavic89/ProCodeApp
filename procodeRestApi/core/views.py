from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import *
from .serializers import *
import xlrd

# General views ------------------------------------------
# both administrator and end-users

class UploadView(APIView):
    """
        For scheme/classification, data and mydata
        we need to read excel files and save the data
        in a single step, instead of one entry at time
    """
    def read_excel(self):
        # read excel file and the first sheet
        excel = xlrd.open_workbook(
            file_contents=self.excel.read()
        )
        excel = excel.sheet_by_index(0)

        # get column names
        col_names = excel.row_values(0)

        # dictionary will store data from excel 
        one_row = {}
        data_list = []

        # convert data in excel to dictionary
        for row in range(1, excel.nrows):
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
        if 'excel' not in request.data:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        self.excel = request.data['excel']
        self.read_excel()



# Administrator's pages ----------------------------------

# views based on UploadExcelView
class SchemeUploadView(UploadView):
    serializer_class = SchemeUploadSerializer
    parent = "scheme"


# viewsets

class SchemeViewSet(viewsets.ModelViewSet):
    queryset = Scheme.objects.all()
    serializer_class = SchemeSerializer

class ClassificationViewSet(viewsets.ModelViewSet):
    queryset = Classification.objects.all()
    serializer_class = ClassificationSerializer

class TranslationViewSet(viewsets.ModelViewSet):
    queryset = Translation.objects.all()
    serializer_class = TranslationSerializer

class DataViewSet(viewsets.ModelViewSet):
    queryset = Data.objects.all()
    serializer_class = DataSerializer
