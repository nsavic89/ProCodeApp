from rest_framework import serializers
from core.models import Classification
from .models import Feedback


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


class FeedbackSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True, 
        default=serializers.CurrentUserDefault())

    class Meta:
        model = Feedback 
        fields = '__all__'