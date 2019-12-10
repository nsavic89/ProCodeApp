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

urlpatterns = [
    path('', include(core_router.urls)),
    path('upload-view/', UploadView.as_view()),
    path('scheme-upload-view/', SchemeUploadView.as_view())
]