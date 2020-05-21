from django.urls import path
from .views import (
    CodingView,
    FeedbackView,
    MyFileViewSet,
    MyFileDataViewSet,
    TranscodingView
)
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'my-files', MyFileViewSet)
router.register(r'my-file-data', MyFileDataViewSet)


urlpatterns = [
    path('coding/', CodingView.as_view()),
    path('feedback/', FeedbackView.as_view()),
    path('transcoding/', TranscodingView.as_view())
] + router.urls