from rest_framework import serializers
from core.models import Classification, Code
from rest_framework.response import Response
from rest_framework import status
from .models import Feedback, MyFile, MyFileData
import xlrd, json


def get_cls_choices():
    queryset = Classification.objects.all()
    return [(c.reference, c.reference) for c in queryset]

def get_lng_choices():
    choices = [
        ('en', 'English'),
        ('fr', 'français'),
        ('ge', 'Deutsch'),
        ('it', 'Italiano')
    ]
    return choices

# not a model serializer
# just used for coding
class CodingSerializer(serializers.Serializer):
    classification = serializers.ChoiceField(choices=get_cls_choices())
    level = serializers.IntegerField()
    language = serializers.ChoiceField(choices=get_lng_choices(), required=False)
    my_input = serializers.CharField(required=False)
    my_file = serializers.IntegerField(required=False)

    def get_data(self):
        # creates dictionary for coding function -> .coding.code
        # if no my_file value, it means simple single input coding
        # for a file, we must get the corresponding inputs from db
        
        if 'my_file' not in self.data:
            return {
                'lng': self.data['language'],
                'clsf': self.data['classification'],
                'inputs': [self.data['my_input']],
                'level': self.data['level']
            }
        return False

# my file serializer
class MyFileSerializer(serializers.ModelSerializer):
    # write only field just used to upload MS Excel file
    excel = serializers.FileField(write_only=True)
    variables = serializers.CharField(read_only=True)
    classifications = serializers.CharField(read_only=True)

    class Meta:
        model = MyFile
        fields = '__all__'

    def create(self, validated_data):
        excel = validated_data.pop('excel')

        # read excel file
        excel = xlrd.open_workbook(file_contents=excel.read())
        excel = excel.sheet_by_index(0)

        # first row or col names are variables field in MyFile
        cols = excel.row_values(0)

        # now save my_file as we have variables
        my_file = MyFile.objects.create(
            **validated_data,
            variables=json.dumps(cols)
        )

        # now save data
        instances_list = []
        for row in range(1, excel.nrows):
            data = {}

            for col in cols:
                data[col] = excel.cell_value(row, cols.index(col))
            
            instances_list.append(
                MyFileData(data=json.dumps(data), parent=my_file)
            )
        
        MyFileData.objects.bulk_create(instances_list)
        return my_file


class MyFileDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyFileData
        fields = '__all__'


class FeedbackSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True, 
        default=serializers.CurrentUserDefault())

    class Meta:
        model = Feedback 
        fields = '__all__'


# transcoding or recoding from classification 1 to classification 2
class TranscodingSerializer(serializers.Serializer):
    my_file = serializers.CharField(required=False)
    from_cls = serializers.ChoiceField(choices=get_cls_choices())
    from_code = serializers.CharField()
    to_cls = serializers.ChoiceField(choices=get_cls_choices())