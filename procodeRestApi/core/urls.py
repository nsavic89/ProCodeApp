from rest_framework import routers
from .views import *

core_router = routers.DefaultRouter()
core_router.register(r'scheme', SchemeViewSet)
core_router.register(r'classification', ClassificationViewSet)
core_router.register(r'translation', TranslationViewSet)
core_router.register(r'data', DataViewSet)

urlpatterns = core_router.urls