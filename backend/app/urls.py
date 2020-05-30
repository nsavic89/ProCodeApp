from django.urls import path
from .views import (
    CodingView,
    FeedbackView,
    MyFileViewSet,
    MyFileDataViewSet,
    TranscodingView,
    CodesByCls,
    FileDataByFileID,
    download,
    sign_up,
    pw_change
)
from rest_framework.routers import DefaultRouter
from rest_framework_jwt.views import obtain_jwt_token
from rest_framework_jwt.views import verify_jwt_token
from rest_framework_jwt.views import refresh_jwt_token


router = DefaultRouter()
router.register(r'my-files', MyFileViewSet)
router.register(r'my-file-data', MyFileDataViewSet)


urlpatterns = [
    path('coding/', CodingView.as_view()),
    path('feedback/', FeedbackView.as_view()),
    path('transcoding/', TranscodingView.as_view()),
    path('codes/ref=<reference>/', CodesByCls.as_view()),
    path('file-data/pk=<int:pk>/', FileDataByFileID.as_view()),
    path('download/pk=<int:pk>/', download),

    # user sign-up/login
    path('sign-up/', sign_up),
    path('pw-change/', pw_change),
    path('api-token-auth/', obtain_jwt_token),
    path('api-token-verify/', verify_jwt_token),
    path('api-token-refresh/', refresh_jwt_token)
] + router.urls