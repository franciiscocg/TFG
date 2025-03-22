from django.urls import path
from .views import ExtractDatesView

urlpatterns = [
    path('<int:file_id>/dates/', ExtractDatesView.as_view(), name='api_extract_dates'),  
]