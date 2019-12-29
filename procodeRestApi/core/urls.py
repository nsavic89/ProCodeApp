from rest_framework import routers
from .views import *
from django.urls import path, include

core_router = routers.DefaultRouter()

# admin end-points -----------------------------------
core_router.register(r'scheme', SchemeViewSet)
core_router.register(r'classification', ClassificationViewSet)
core_router.register(r'translation', TranslationViewSet)
core_router.register(r'data', DataViewSet)

# end-user endpoints --------------------------------- 
core_router.register(r'my-file', MyFileViewSet)
core_router.register(r'my-data', MyDataViewSet)
core_router.register(r'my-coding', MyCodingViewSet)
core_router.register(r'my-transcoding', MyTranscodingViewSet)


urlpatterns = [
    path('', include(core_router.urls)),

    # delete views for coding and transcoding -> for files (file pk)
    path('delete-file-coding/<int:pk>/', delete_file_coding),
    path('delete-file-transcoding/<int:pk>/', delete_file_transcoding),

    # upload urls
    path('scheme-upload/', SchemeUploadView.as_view()),
    path('data-upload/', DataUploadView.as_view()),
    path('translation-upload/', TranslationUploadView.as_view()),
    path('my-file-upload/', MyFileUploadView.as_view())
]