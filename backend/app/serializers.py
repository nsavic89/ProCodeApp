from rest_framework import serializers
from core.models import Classification, Code
from rest_framework.response import Response
from rest_framework import status
from .models import Feedback, MyFile, MyFileData
from django.contrib.auth.models import User
import xlrd, json



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
    classification = serializers.CharField()
    level = serializers.IntegerField()
    language = serializers.ChoiceField(choices=get_lng_choices(), required=False)
    my_input = serializers.CharField(required=False)
    my_file = serializers.IntegerField(required=False)
    variable = serializers.CharField(required=False)

    def get_data(self):
        # creates arguments for coding function -> .coding.code
        # if no my_file value, it means simple single input coding
        # for a file, we must get the corresponding inputs from db
        
        if 'my_file' not in self.data:
            return {
                'lng': self.data['language'],
                'clsf': self.data['classification'],
                'inputs': [self.data['my_input']],
                'level': self.data['level']
            }

        # if file we must load texts from file
        data = self.data
        my_file = MyFile.objects.get(pk=data['my_file'])
        my_data = MyFileData.objects.filter(parent=my_file)
        inputs = [json.loads(o.data)[data['variable']] for o in my_data]
        
        return {
            'lng': my_file.language,
            'clsf': data['classification'],
            'inputs': inputs,
            'level': data['level']
        }

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
                cell_val = excel.cell_value(row, cols.index(col))

                if isinstance(cell_val, float):
                    data[col] = str(int(cell_val))
                else:
                    data[col] = str(cell_val)
            
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
    class Meta:
        model = Feedback 
        fields = '__all__'


# transcoding or recoding from classification 1 to classification 2
class TranscodingSerializer(serializers.Serializer):
    my_file = serializers.CharField(required=False)
    from_cls = serializers.CharField()
    from_code = serializers.CharField(required=False)
    to_cls = serializers.CharField()
    variable = serializers.CharField(required=False)


class ExcelSerializer(serializers.Serializer):
    var1 = serializers.CharField(required=False, allow_blank=True)
    var2 = serializers.CharField(required=False, allow_blank=True)
    var3 = serializers.CharField(required=False, allow_blank=True)
    var4 = serializers.CharField(required=False, allow_blank=True)
    var5 = serializers.CharField(required=False, allow_blank=True)

    code1 = serializers.CharField(required=False, allow_blank=True)
    code2 = serializers.CharField(required=False, allow_blank=True)
    code3 = serializers.CharField(required=False, allow_blank=True)
    code4 = serializers.CharField(required=False, allow_blank=True)
    code5 = serializers.CharField(required=False, allow_blank=True)


# sign up
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username', 
            'first_name', 'last_name',
            'email',
            'password'
        ]

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()

        return user