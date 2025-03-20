from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UploadedFile

class FileUploadSerializer(serializers.ModelSerializer):
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB en bytes

    class Meta:
        model = UploadedFile
        fields = ['file']

    def validate_file(self, value):
        if value.size > self.MAX_FILE_SIZE:
            raise serializers.ValidationError("El archivo excede el tamaño máximo de 5MB.")
        if not value.name.endswith('.pdf'):
            raise serializers.ValidationError("Solo se permiten archivos PDF.")
        return value