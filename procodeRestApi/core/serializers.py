from rest_framework import serializers
from .models import *
import xlrd

# Admin: Scheme, Classification, Translation, Data
# User: MyFile, MyData


class SchemeSerializer(serializers.ModelSerializer):
    # Classification scheme 
    # on create: requests a MS Excel file
    # containing classification data (parent, code, title)
    CHOICES = [
        ('O', 'Occupations'),
        ('E', 'Economic sectors')
    ]

    excel = serializers.FileField(write_only=True)
    stype = serializers.ChoiceField(choices=CHOICES)

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

                # get cell value in given row and col
                value = sheet.cell_value(row, col)

                # sometimes excel keeps code values as floats (e.g. 322.0)
                # must be converted to int and then to strings
                if (type(value) is float):
                    value = str( int(value) )

                classification[col_names[col]] = value
            
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

    def update(self, instance, validated_data):
        # INFO (important!): updates are used to add another language
        # for example when first time created an object
        # it might be that only english or french are added
        # while later one wants to upload german titles
        # then one uploads the same table as before + additional lang
        # this means that previous entries remain unchanged!

        # get excel data -> classification entries
        excel_file = validated_data.pop('excel', None)
        data = xlrd.open_workbook(file_contents=excel_file.read())
        sheet = data.sheet_by_index(0)
        
        # iterate through excel table and get changes
        # ! this does not modify neither parent nor code
        col_names = ['title', 'title_fr', 'title_ge', 'title_it']

        for row in range(1, sheet.nrows):
            # identify entry in Classification by parent and code in excel
            # parent is in the first column (0), code in the second (1)
            obj_for_update = Classification.objects.get(
                scheme=instance,
                parent=sheet.cell_value(row, 0),
                code=sheet.cell_value(row, 1)
            )

            # if not found in db; skip iteration step
            if obj_for_update is None:
                continue

            # data that will be used for partial update
            update_data = {}

            for col in range(0, len(col_names)):
                new_value = sheet.cell_value(row, col)
                update_data[ col_names[col] ] = new_value

            # partial update
            obj_for_update_ser = ClassificationSerializer(
                obj_for_update, update_data, partial=True
            )

            if obj_for_update_ser.is_valid():
                obj_for_update_ser.save()
            else:
                print(obj_for_update_ser.errors)
            
        return super().update(validated_data) 
        

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