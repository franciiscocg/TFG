from django.db import models
from django.contrib.auth.models import User
import os

def user_pdf_path(instance, filename):
    safe_username = ''.join(c for c in instance.user.username if c.isalnum())
    return f'uploads/{safe_username}/pdf/{filename}'

def user_txt_path(instance, filename):
    safe_username = ''.join(c for c in instance.user.username if c.isalnum())
    return f'uploads/{safe_username}/txt/{filename}'
 
class UploadedFile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to=user_pdf_path)
    text_file = models.FileField(upload_to=user_txt_path, null=True, blank=True)
    extracted_data = models.JSONField(default=dict, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at', 'id']


    def __str__(self):
        return f"{self.user.username} - {self.file.name}"