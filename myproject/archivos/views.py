from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import FileUploadSerializer
from .models import UploadedFile
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 4  # 4 archivos por página
    page_size_query_param = 'page_size'
    max_page_size = 100

#subir archivos
class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = FileUploadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"message": "Archivo subido con éxito"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#listar archivos
class FileListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        files = UploadedFile.objects.filter(user=request.user)
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(files, request)
        serializer = FileUploadSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)
    
#eliminar archivos
class FileDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, file_id):
        file = get_object_or_404(UploadedFile, id=file_id, user=request.user)
        file.file.delete()  # Elimina el archivo físico
        file.delete()  # Elimina el registro de la base de datos
        return Response({"message": "Archivo eliminado con éxito"}, status=status.HTTP_204_NO_CONTENT)