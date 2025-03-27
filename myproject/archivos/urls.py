from django.urls import path
from .views import FileUploadView, FileListView, FileDeleteView, ExtractTextView, ReadTextView, UserExtractedDataView

urlpatterns = [
    path('', FileUploadView.as_view(), name='api_upload'),
    path('list/', FileListView.as_view(), name='api_list'),
    path('delete/<int:file_id>/', FileDeleteView.as_view(), name='api_delete'),
    path('<int:file_id>/extract/', ExtractTextView.as_view(), name='api_extract_text'),  
    path('<int:file_id>/text/', ReadTextView.as_view(), name='api_read_text'),
    path('extracted/', UserExtractedDataView.as_view(), name='api_extracted_data'),
    
]