from rest_framework import serializers
from .models import *
import xlrd
from io import StringIO


# Admin: Scheme, Classification, Translation, Data
# User: MyFile, MyData


class SchemeSerializer(serializers.ModelSerializer):
    # Classification scheme 
    # on create: requests a MS Excel file
    # containing classification data (parent, code, title)

    excel = serializers.FileField(write_only=True)

    class Meta:
        model = Scheme
        fields = '__all__'

    def create(self, validated_data):
        # get excel data -> classification entries
        excel_file = validated_data.pop('excel', None)
        data = xlrd.open_workbook(file_contents=excel_file.read())
        sheet = data.sheet_by_index(0)

        # save scheme in order to use its id as foreign key later
        scheme = super().create(validated_data)

        # now sheet contains all data we need
        # sheet is a table with r rows and c cols (r, c)
        classification = {}
        cls_list = []

        # get column names
        col_names = sheet.row_values(0)

        for row in range(1, sheet.nrows):
            for col in range(0, len(col_names)):
                classification[col_names[col]] = sheet.cell_value(row, col)
            
            # add foreign key -> previously saved scheme
            classification['scheme'] = scheme.id
            cls_list.append(classification)
        
        # serialize and save if valid new classsification entry for scheme
        cls_ser = ClassificationSerializer(data=cls_list, many=True)
        if cls_ser.is_valid():
            cls_ser.save()
        else:
            print(cls_ser.errors)

        return scheme



class ClassificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classification
        fields = '__all__'

class TranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Translation
        fields = '__all__'

class DataSerializer(serializers.ModelSerializer):
    class Meta:
        model = Data
        fields = '__all__'