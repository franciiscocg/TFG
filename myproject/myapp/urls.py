from django.urls import path
from .views import ExtractDatesView, ProcessExtractedDataView, GetUserCalendarDataView, AsignaturaUpdateView, AsignaturaDeleteView

urlpatterns = [
    path('<int:file_id>/dates/', ExtractDatesView.as_view(), name='api_extract_dates'),  
    path('<int:file_id>/process-extracted-data/', ProcessExtractedDataView.as_view(), name='process_extracted_data'),
    path('calendar/data/', GetUserCalendarDataView.as_view(), name='get_user_calendar_data'),
    path('asignaturas/<str:nombre>/', AsignaturaUpdateView.as_view(), name='asignatura-update'),
    path('asignaturas/<str:nombre>/delete/', AsignaturaDeleteView.as_view(), name='asignatura-delete'),
]