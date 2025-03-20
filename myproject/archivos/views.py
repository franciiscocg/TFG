from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import FileUploadSerializer
from .models import UploadedFile


class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados

    def post(self, request):
        serializer = FileUploadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)  # Vincula el archivo al usuario autenticado
            return Response({"message": "Archivo subido con éxito"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)