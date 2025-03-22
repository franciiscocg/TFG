from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UploadedFile


class FileUploadSerializer(serializers.ModelSerializer):
    MAX_FILE_SIZE = 5 * 1024 * 1024

    class Meta:
        model = UploadedFile
        fields = ['file']

    def validate_file(self, value):
        if value.size > self.MAX_FILE_SIZE:
            raise serializers.ValidationError("El archivo excede el tamaño máximo de 5MB.")
        if not value.name.endswith('.pdf'):
            raise serializers.ValidationError("Solo se permiten archivos PDF.")
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