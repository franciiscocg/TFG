from django.urls import path
from .views import ExtractDatesView, ProcessExtractedDataView

urlpatterns = [
    path('<int:file_id>/dates/', ExtractDatesView.as_view(), name='api_extract_dates'),  
    path('<int:file_id>/process-extracted-data/', ProcessExtractedDataView.as_view(), name='process_extracted_data'),
]