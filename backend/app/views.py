from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import CodingSerializer
from .coding import code
from .serializers import FeedbackSerializer
from .models import Feedback


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