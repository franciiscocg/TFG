import pytest
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from archivos.models import UploadedFile, user_pdf_path, user_txt_path

@pytest.mark.django_db
class TestUploadedFileModel(TestCase):
    def setUp(self):
        from django.contrib.auth.models import User
        self.User = User
        self.UploadedFile = UploadedFile
        self.user_pdf_path = user_pdf_path
        self.user_txt_path = user_txt_path
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.pdf_file = SimpleUploadedFile("test.pdf", b"PDF content")
        self.txt_file = SimpleUploadedFile("test.txt", b"Text content")

    def test_uploaded_file_creation(self):
        uploaded_file = self.UploadedFile.objects.create(
            user=self.user,
            file=self.pdf_file,
            text_file=self.txt_file,
            extracted_data={"key": "value"}
        )
        assert uploaded_file.user == self.user
        assert "testuser/pdf/test" in uploaded_file.file.name  # Verifica la ruta parcial
        assert "testuser/txt/test" in uploaded_file.text_file.name  # Verifica la ruta parcial
        assert uploaded_file.extracted_data == {"key": "value"}
        assert uploaded_file.uploaded_at is not None
        assert str(uploaded_file) == f"{self.user.username} - {uploaded_file.file.name}"

    def test_uploaded_file_without_text_file(self):
        uploaded_file = self.UploadedFile.objects.create(
            user=self.user,
            file=self.pdf_file
        )
        assert uploaded_file.user == self.user
        assert "testuser/pdf/test" in uploaded_file.file.name  # Verifica la ruta parcial
        assert uploaded_file.text_file.name is None  # text_file es opcional, name debería ser None
        assert uploaded_file.extracted_data == {}
        assert str(uploaded_file) == f"{self.user.username} - {uploaded_file.file.name}"

    def test_uploaded_file_missing_user(self):
        uploaded_file = self.UploadedFile(file=self.pdf_file)
        with pytest.raises(ValidationError):  # Validar en clean() o save()
            uploaded_file.full_clean()  # Usamos full_clean para validar

    def test_uploaded_file_missing_file(self):
        uploaded_file = self.UploadedFile(user=self.user)
        with pytest.raises(ValidationError):  # Validar en clean() o save()
            uploaded_file.full_clean()  # Usamos full_clean para validar

    def test_user_pdf_path(self):
        uploaded_file = self.UploadedFile(user=self.user, file=self.pdf_file)
        path = self.user_pdf_path(uploaded_file, "test.pdf")
        assert path == "uploads/testuser/pdf/test.pdf"

    def test_user_txt_path(self):
        uploaded_file = self.UploadedFile(user=self.user, text_file=self.txt_file)
        path = self.user_txt_path(uploaded_file, "test.txt")
        assert path == "uploads/testuser/txt/test.txt"

    def test_user_path_with_special_chars(self):
        special_user = self.User.objects.create_user(username="test@#$user", password="testpass")
        uploaded_file = self.UploadedFile(user=special_user, file=self.pdf_file)
        path = self.user_pdf_path(uploaded_file, "test.pdf")
        assert path == "uploads/testuser/pdf/test.pdf"

    def test_extracted_data_default(self):
        uploaded_file = self.UploadedFile.objects.create(
            user=self.user,
            file=self.pdf_file
        )
        assert uploaded_file.extracted_data == {}