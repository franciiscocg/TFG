from django.urls import path
from .views import FileUploadView, FileListView, FileDeleteView

urlpatterns = [
    path('', FileUploadView.as_view(), name='api_upload'),
    path('list/', FileListView.as_view(), name='api_list'),
    path('delete/<int:file_id>/', FileDeleteView.as_view(), name='api_delete')
]