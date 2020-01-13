from rest_framework import routers
from .views import *
from django.urls import path, include
from .user_views import sign_up, pw_change
from rest_framework_jwt.views import obtain_jwt_token
from rest_framework_jwt.views import verify_jwt_token
from rest_framework_jwt.views import refresh_jwt_token


core_router = routers.DefaultRouter()

# admin end-points -----------------------------------
core_router.register(r'scheme', SchemeViewSet)
core_router.register(r'scheme-only', SchemeOnlyViewSet)
core_router.register(r'classification', ClassificationViewSet)
core_router.register(r'translation-file', TranslationFileViewSet)
core_router.register(r'translation', TranslationViewSet)
core_router.register(r'data', DataViewSet)

# end-user endpoints --------------------------------- 
core_router.register(r'my-file', MyFileViewSet)
core_router.register(r'my-data', MyDataViewSet)
core_router.register(r'my-coding', MyCodingViewSet)
core_router.register(r'my-transcoding', MyTranscodingViewSet)


urlpatterns = [
    path('', include(core_router.urls)),

    # download xlsx of coding history
    path('download-coding/<int:pk>/', download_coding),
    path('download-transcoding/<int:pk>/', download_transcoding),

    # delete views for coding and transcoding -> for files (file pk)
    path('delete-file-coding/<int:pk>/', delete_file_coding),
    path('delete-file-transcoding/<int:pk>/', delete_file_transcoding),

    # upload urls
    path('scheme-upload/', SchemeUploadView.as_view()),
    path('data-upload/', DataUploadView.as_view()),
    path('translation-upload/', TranslationUploadView.as_view()),
    path('my-file-upload/', MyFileUploadView.as_view()),

    # use scheme as ML data
    path('scheme-as-data/', SchemeAsData.as_view()),

    # user sign-up
    path('sign-up/', sign_up),
    path('pw-change/', pw_change),
    path('api-token-auth/', obtain_jwt_token),
    path('api-token-verify/', verify_jwt_token),
    path('api-token-refresh/', refresh_jwt_token)
]