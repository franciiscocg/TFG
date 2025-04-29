# En archivos/conftest.py o en el conftest.py raíz del proyecto
import pytest
import os
from django.conf import settings
import shutil

@pytest.fixture(autouse=True)
def use_tmp_media_root(tmp_path_factory, settings): # <-- Cambia 'django_settings' a 'settings'
    """
    Asegura que MEDIA_ROOT sea un directorio temporal para las pruebas
    y lo limpia después. autouse=True lo aplica a todas las pruebas.
    """
    media_path = tmp_path_factory.mktemp("media", numbered=True)
    # Guarda el MEDIA_ROOT original si necesitas restaurarlo, aunque pytest-django suele aislarlo
    # original_media_root = settings.MEDIA_ROOT # Accede al valor antes de modificarlo

    # Establece el MEDIA_ROOT temporal para las pruebas usando la fixture 'settings'
    settings.MEDIA_ROOT = str(media_path)
    # Es buena idea asegurarse de que se usa el storage básico para tests,
    # a menos que quieras testear un storage específico como S3.
    settings.DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'

    # Ejecuta la prueba
    yield str(media_path) # Puedes hacer yield del path si algún test lo necesita explícitamente

    # Limpieza (generalmente manejada por tmp_path_factory, pero shutil es explícito)
    # try:
    #     # Asegurarse de que la ruta existe antes de intentar borrarla
    #     if os.path.exists(media_path) and os.path.isdir(media_path):
    #          shutil.rmtree(media_path)
    # except OSError as e:
    #      print(f"Warning: Could not cleanup test media directory {media_path}: {e}")
    # Restaurar (generalmente no necesario con pytest-django, pero por si acaso)
    # settings.MEDIA_ROOT = original_media_root