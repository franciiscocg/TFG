from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UploadedFile


class FileUploadSerializer(serializers.ModelSerializer):
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB en bytes
    url = serializers.SerializerMethodField()  # Añade la URL del archivo

    class Meta:
        model = UploadedFile
        fields = ['id', 'file', 'uploaded_at', 'url']  # Campos que queremos devolver

    def validate_file(self, value):
        if value.size > self.MAX_FILE_SIZE:
            raise serializers.ValidationError("El archivo excede el tamaño máximo de 5MB.")
        if not value.name.endswith('.pdf'):
            raise serializers.ValidationError("Solo se permiten archivos PDF.")
        return value

    def get_url(self, obj):
        # Devuelve la URL completa del archivo
        request = self.context.get('request')
        if request is not None and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None