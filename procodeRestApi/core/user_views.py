from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework import serializers, status, permissions
from rest_framework.response import Response
from django.contrib.auth import authenticate
# user serializers and views 


# sign up
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = '__all__'

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()

        return user



@api_view(['POST'])
@permission_classes([ permissions.AllowAny ])
def sign_up(request):
    user = UserSerializer(data=request.data)
    
    if user.is_valid():
        user.save()
        return Response(user.data, status=status.HTTP_201_CREATED)
    
    return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def pw_change(request):
    user = authenticate(
        username=request.user,
        password=request.data["old_pw"]
    )

    if user is not None:
        user.set_password(request.data['new_pw'])
        user.save()
        return Response(status=status.HTTP_200_OK)

    return Response(status=status.HTTP_400_BAD_REQUEST)