from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UploadedFile
import os


class FileUploadSerializer(serializers.ModelSerializer):
    MAX_FILE_SIZE = 5 * 1024 * 1024
    ALLOWED_EXTENSIONS = ['.pdf', '.pptx']

    class Meta:
        model = UploadedFile
        fields = ['file']

    def validate_file(self, value):
        if value.size > self.MAX_FILE_SIZE:
            raise serializers.ValidationError("El archivo excede el tamaño máximo de 5MB.")
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            allowed_ext_str = ", ".join(self.ALLOWED_EXTENSIONS)
            raise serializers.ValidationError(f"Tipo de archivo no permitido. Solo se aceptan: {allowed_ext_str}")
        return value

class UploadedFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    text_file_url = serializers.SerializerMethodField()

    class Meta:
        model = UploadedFile
        fields = ['id', 'file', 'uploaded_at', 'file_url', 'text_file', 'text_file_url', 'extracted_data']  

    def get_file_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url) if request else obj.file.url

    def get_text_file_url(self, obj):
        if obj.text_file:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.text_file.url) if request else obj.text_file.url
        return None