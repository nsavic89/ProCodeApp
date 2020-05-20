from django.urls import path
from .views import CodingView, FeedbackView


urlpatterns = [
    path('coding/', CodingView.as_view()),
    path('feedback/', FeedbackView.as_view())
]