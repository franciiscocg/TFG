from django.db import models
from django.contrib.auth.models import User
import os

def user_directory_path(instance, filename):
    safe_username = ''.join(c for c in instance.user.username if c.isalnum())
    return f'uploads/{safe_username}/{filename}'

class UploadedFile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to=user_directory_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.file.name}"