from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import FileUploadSerializer, UploadedFileSerializer
import pdfplumber
from .models import UploadedFile
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from django.core.files.base import ContentFile


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 4  # 4 archivos por página
    page_size_query_param = 'page_size'
    max_page_size = 100

class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = FileUploadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"message": "Archivo subido con éxito"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
class FileListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        files = UploadedFile.objects.filter(user=request.user)
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(files, request)
        serializer = UploadedFileSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

class FileDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, file_id):
        file = get_object_or_404(UploadedFile, id=file_id, user=request.user)
        file.file.delete()
        if file.text_file:
            file.text_file.delete()
        file.delete()
        return Response({"message": "Archivo eliminado con éxito"}, status=status.HTTP_204_NO_CONTENT)

class ExtractTextView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, file_id):
        file_obj = get_object_or_404(UploadedFile, id=file_id, user=request.user)
        
        # Extraer texto con pdfplumber
        with pdfplumber.open(file_obj.file.path) as pdf:
            text = ''
            for page in pdf.pages:
                text += page.extract_text() or ''
        
        if not text.strip():
            return Response({"message": "No se pudo extraer texto del PDF"}, status=status.HTTP_400_BAD_REQUEST)

        # Generar el nombre del archivo de texto
        pdf_filename = file_obj.file.name.split('/')[-1] 
        text_filename = pdf_filename.replace('.pdf', '.txt')
        
        # Guardar el archivo de texto en uploads/{safe_username}/txt/
        file_obj.text_file.save(text_filename, ContentFile(text.encode('utf-8')))
        file_obj.save()

        serializer = UploadedFileSerializer(file_obj, context={'request': request})
        return Response({
            "message": "Texto extraído y guardado con éxito",
            "file": serializer.data
        }, status=status.HTTP_200_OK)
        

class ReadTextView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id):
        file_obj = get_object_or_404(UploadedFile, id=file_id, user=request.user)
        if not file_obj.text_file:
            return Response({"message": "No hay texto extraído para este archivo"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            with open(file_obj.text_file.path, 'r', encoding='utf-8') as f:
                text_content = f.read()
            return Response({
                "text": text_content,
                "extracted_data": file_obj.extracted_data if file_obj.extracted_data else {}
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": f"Error al leer el archivo de texto: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class UserExtractedDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Obtener todos los archivos del usuario autenticado
        files = UploadedFile.objects.filter(user=request.user)
        
        # Filtrar solo los archivos que tienen extracted_data
        files_with_data = files.exclude(extracted_data__isnull=True).exclude(extracted_data={})
        
        if not files_with_data.exists():
            return Response({
                "message": "No se encontraron datos extraídos para este usuario",
                "data": []
            }, status=status.HTTP_200_OK)

        # Serializar los datos
        serializer = UploadedFileSerializer(files_with_data, many=True, context={'request': request})
        
        # Preparar la respuesta con solo los extracted_data
        extracted_data_list = [
            {
                "file_id": file["id"],
                "filename": file["file"].split('/')[-1],
                "extracted_data": file["extracted_data"]
            }
            for file in serializer.data if file["extracted_data"]
        ]

        return Response({
            "message": "Datos extraídos encontrados",
            "count": len(extracted_data_list),
            "data": extracted_data_list
        }, status=status.HTTP_200_OK)
        
class UpdateExtractedDataView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, file_id):
        file = get_object_or_404(UploadedFile, id=file_id, user=request.user)
        extracted_data = request.data.get('extracted_data', {})
        file.extracted_data = extracted_data
        file.save()
        return Response({'message': 'Datos actualizados con éxito'}, status=status.HTTP_200_OK)