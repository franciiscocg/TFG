import pytest
import os
from django.urls import reverse
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.files.base import ContentFile
from django.conf import settings
from rest_framework import status
from rest_framework.test import APIClient
from unittest.mock import patch, MagicMock # Para mockear la extracción

from archivos.models import UploadedFile
from django.core.files.storage import default_storage

# Marca para que todos los tests en este módulo usen la BD
pytestmark = pytest.mark.django_db

# --- Fixtures ---

@pytest.fixture
def api_client():
    """Fixture para obtener un cliente API no autenticado."""
    return APIClient()

@pytest.fixture
def test_user(db):
    """Fixture para crear un usuario de prueba."""
    user = User.objects.create_user(username='testuser', password='password123')
    return user

@pytest.fixture
def authenticated_client(api_client, test_user):
    """Fixture para obtener un cliente API autenticado."""
    api_client.force_authenticate(user=test_user)
    return api_client

@pytest.fixture
def create_uploaded_file(test_user):
    """Factory fixture para crear instancias de UploadedFile."""
    def _create_uploaded_file(filename="test.pdf", content=b"dummy pdf content", extracted_data=None, text_content=None):
       file_obj = SimpleUploadedFile(filename, content, content_type="application/pdf" if filename.endswith('.pdf') else 'application/vnd.openxmlformats-officedocument.presentationml.presentation')
       uploaded_file = UploadedFile.objects.create(user=test_user, file=file_obj, extracted_data=extracted_data or {})

       if text_content:
              safe_username = ''.join(c for c in test_user.username if c.isalnum())
              base_filename, _ = os.path.splitext(os.path.basename(filename)) # Usar basename
              text_filename = f"{base_filename}.txt"

                     # Dejar que Django construya la ruta relativa a través de save
                     # Primero creamos el ContentFile
              text_file_content = ContentFile(text_content.encode('utf-8'), name=text_filename)

                     # Asignamos el ContentFile al campo y guardamos el modelo
                     # Django Storage API se encargará de escribirlo en MEDIA_ROOT/uploads/user/txt/
                     # NOTA: Como ExtractTextView está mockeado, este bloque es principalmente
                     #       para preparar el estado para ReadTextView.
                     #       Si ExtractTextView *no* estuviera mockeado, su propia lógica
                     #       de .save() debería funcionar gracias al MEDIA_ROOT correcto.
              try:
                            # Intentar guardar directamente (puede que no funcione bien con mocks activos en otros tests)
                            # uploaded_file.text_file.save(text_filename, text_file_content, save=True)

                            # Alternativa más robusta para la fixture: Crear manualmente asegurando la ruta
                            # (Esta lógica puede ser necesaria si el .save directo da problemas en el contexto de tests)
                     relative_path = uploaded_file._meta.get_field('text_file').upload_to(uploaded_file, text_filename)
                     full_text_path = os.path.join(settings.MEDIA_ROOT, relative_path)
                     os.makedirs(os.path.dirname(full_text_path), exist_ok=True)
                     with open(full_text_path, 'w', encoding='utf-8') as f:
                            f.write(text_content)
                            # Asignar solo el nombre relativo al campo después de crearlo manualmente
                     uploaded_file.text_file.name = relative_path
                     uploaded_file.save(update_fields=['text_file']) # Guardar solo este campo


              except Exception as e:
                     # Añadir un print o logging para depurar si la escritura manual falla
                     print(f"Error creating text file in fixture: {e}")
                     pytest.fail(f"Fixture failed to create text file: {e}")

       return uploaded_file
    return _create_uploaded_file

# --- Tests para FileUploadView ---

def test_upload_file_pdf_success(authenticated_client, test_user):
    url = reverse('api_upload') # Asume que el name 'api_upload' está bajo el prefijo 'api/upload/'
    pdf_file = SimpleUploadedFile("test_document.pdf", b"file_content", content_type="application/pdf")
    data = {'file': pdf_file}
    response = authenticated_client.post(url, data, format='multipart')

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['message'] == "Archivo subido con éxito"
    assert UploadedFile.objects.filter(user=test_user, file__endswith='test_document.pdf').exists()
    # Limpieza (pytest-django suele manejar la BD, pero no los archivos)
    uploaded_file = UploadedFile.objects.get(user=test_user, file__endswith='test_document.pdf')
    if uploaded_file.file and os.path.exists(uploaded_file.file.path):
         os.remove(uploaded_file.file.path) # Eliminar archivo físico si existe

def test_upload_file_pptx_success(authenticated_client, test_user):
    url = reverse('api_upload')
    pptx_file = SimpleUploadedFile("test_presentation.pptx", b"file_content_ppt", content_type="application/vnd.openxmlformats-officedocument.presentationml.presentation")
    data = {'file': pptx_file}
    response = authenticated_client.post(url, data, format='multipart')
    assert response.status_code == status.HTTP_201_CREATED
    assert UploadedFile.objects.filter(user=test_user, file__endswith='test_presentation.pptx').exists()
    uploaded_file = UploadedFile.objects.get(user=test_user, file__endswith='test_presentation.pptx')
    if uploaded_file.file and os.path.exists(uploaded_file.file.path):
         os.remove(uploaded_file.file.path)

def test_upload_file_invalid_extension(authenticated_client):
    url = reverse('api_upload')
    txt_file = SimpleUploadedFile("test_invalid.txt", b"file_content", content_type="text/plain")
    data = {'file': txt_file}
    response = authenticated_client.post(url, data, format='multipart')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'Tipo de archivo no permitido' in response.data['file'][0]

def test_upload_file_too_large(authenticated_client):
    url = reverse('api_upload')
    # Crear contenido > 5MB
    large_content = b'a' * (6 * 1024 * 1024)
    large_file = SimpleUploadedFile("large_file.pdf", large_content, content_type="application/pdf")
    data = {'file': large_file}
    response = authenticated_client.post(url, data, format='multipart')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'El archivo excede el tamaño máximo de 5MB' in response.data['file'][0]

def test_upload_file_unauthenticated(api_client):
    url = reverse('api_upload')
    pdf_file = SimpleUploadedFile("test_document.pdf", b"file_content", content_type="application/pdf")
    data = {'file': pdf_file}
    response = api_client.post(url, data, format='multipart')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED # O 403 si las settings globales son diferentes

# --- Tests para FileListView ---

def test_list_files_success(authenticated_client, test_user, create_uploaded_file):
    create_uploaded_file(filename="file1.pdf")
    create_uploaded_file(filename="file2.pptx")
    # Crear archivo para otro usuario (no debe aparecer)
    other_user = User.objects.create_user(username='otheruser', password='password123')
    other_file_obj = SimpleUploadedFile("other.pdf", b"other content")
    UploadedFile.objects.create(user=other_user, file=other_file_obj)

    url = reverse('api_list')
    response = authenticated_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    # La paginación envuelve los resultados
    assert response.data['count'] == 2
    assert len(response.data['results']) == 2
    assert 'file1.pdf' in response.data['results'][0]['file_url']
    assert 'file2.pptx' in response.data['results'][1]['file_url']
    # Asegurarse de que el archivo del otro usuario no está
    assert 'other.pdf' not in str(response.data['results'])

def test_list_files_empty(authenticated_client):
    url = reverse('api_list')
    response = authenticated_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 0
    assert len(response.data['results']) == 0

def test_list_files_unauthenticated(api_client):
    url = reverse('api_list')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

# --- Tests para FileDeleteView ---

def test_delete_file_success(authenticated_client, create_uploaded_file, test_user):
    uploaded_file = create_uploaded_file(filename="to_delete.pdf")
    file_id = uploaded_file.id
    file_path = uploaded_file.file.path # Guardar path antes de borrar objeto

    url = reverse('api_delete', kwargs={'file_id': file_id})
    response = authenticated_client.delete(url)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not UploadedFile.objects.filter(id=file_id, user=test_user).exists()
    # Verificar que el archivo físico también se eliminó (si MEDIA_ROOT está configurado para tests)
    assert not os.path.exists(file_path)


def test_delete_file_not_found(authenticated_client):
    url = reverse('api_delete', kwargs={'file_id': 9999}) # ID inexistente
    response = authenticated_client.delete(url)
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_delete_file_wrong_user(authenticated_client, create_uploaded_file):
    # Crear archivo para un usuario diferente
    other_user = User.objects.create_user(username='otheruser', password='password123')
    other_file_obj = SimpleUploadedFile("other_user_file.pdf", b"content")
    other_uploaded_file = UploadedFile.objects.create(user=other_user, file=other_file_obj)

    url = reverse('api_delete', kwargs={'file_id': other_uploaded_file.id})
    response = authenticated_client.delete(url) # Intenta borrar como 'testuser'
    assert response.status_code == status.HTTP_404_NOT_FOUND # get_object_or_404 falla
    assert UploadedFile.objects.filter(id=other_uploaded_file.id).exists() # Verificar que no se borró


def test_delete_file_unauthenticated(api_client, create_uploaded_file, test_user):
    # Necesitamos crear el archivo primero, aunque el cliente no esté autenticado
    uploaded_file = create_uploaded_file(filename="unauth_delete.pdf")
    url = reverse('api_delete', kwargs={'file_id': uploaded_file.id})
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

# --- Tests para ExtractTextView ---
# Usaremos mock para no depender de pdfplumber y python-pptx

@patch('archivos.views.pdfplumber.open') # Mockear pdfplumber
# @patch('archivos.views.ContentFile') # <-- ELIMINADO
# def test_extract_text_pdf_success(mock_content_file, mock_pdf_open, authenticated_client, create_uploaded_file, test_user): # <-- mock_content_file ELIMINADO
def test_extract_text_pdf_success(mock_pdf_open, authenticated_client, create_uploaded_file, test_user):
    # ... (configuración del mock de pdfplumber igual que antes) ...
    mock_pdf = MagicMock()
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "Texto extraído de la página."
    mock_pdf.pages = [mock_page]
    mock_pdf_open.return_value.__enter__.return_value = mock_pdf

    uploaded_file = create_uploaded_file(filename="extract_me.pdf")
    file_id = uploaded_file.id
    expected_text_filename = 'extract_me.txt' # Nombre esperado del archivo de texto

    url = reverse('api_extract_text', kwargs={'file_id': file_id})
    response = authenticated_client.post(url)

    # Verificar el status code y mensaje básico
    assert response.status_code == status.HTTP_200_OK, f"Expected 200 OK, got {response.status_code}. Response data: {response.data}"
    assert response.data['message'] == "Texto extraído y guardado con éxito"
    assert 'text_file_url' in response.data['file']
    assert response.data['file']['text_file_url'] is not None

    # Verificar que se llamó a pdfplumber.open con la ruta correcta
    mock_pdf_open.assert_called_once_with(uploaded_file.file.path)
    # mock_content_file.assert_called_once_with("Texto extraído de la página.".encode('utf-8')) # <-- ELIMINADO

    # Verificar en la BD y en el storage que el archivo de texto existe
    uploaded_file.refresh_from_db()
    assert uploaded_file.text_file is not None
    assert uploaded_file.text_file.name is not None
    assert expected_text_filename in uploaded_file.text_file.name # Verificar que el nombre es correcto

    # Opcional: Leer el contenido del archivo guardado para verificarlo
    assert default_storage.exists(uploaded_file.text_file.name) # Comprobar existencia en storage
    with default_storage.open(uploaded_file.text_file.name, 'rb') as f: # Cambiar 'r' a 'rb'
        saved_content_bytes = f.read() # Leer como bytes
    saved_content = saved_content_bytes.decode('utf-8') # Decodificar usando UTF-8
    assert saved_content == "Texto extraído de la página."

    # Limpieza (ya no es estrictamente necesario si tmp_path_factory funciona bien)
    # if uploaded_file.text_file and default_storage.exists(uploaded_file.text_file.name):
    #      default_storage.delete(uploaded_file.text_file.name)



@patch('archivos.views.Presentation') # Mockear Presentation
# @patch('archivos.views.ContentFile') # <-- ELIMINADO
# def test_extract_text_pptx_success(mock_content_file, mock_presentation, authenticated_client, create_uploaded_file, test_user): # <-- mock_content_file ELIMINADO
def test_extract_text_pptx_success(mock_presentation, authenticated_client, create_uploaded_file, test_user):
    # ... (configuración del mock de Presentation igual que antes) ...
    mock_pres = MagicMock()
    mock_slide = MagicMock()
    mock_shape = MagicMock()
    mock_text_frame = MagicMock()
    mock_text_frame.text = "Texto de la diapositiva."
    mock_shape.text_frame = mock_text_frame
    mock_shape.has_text_frame = True
    mock_slide.shapes = [mock_shape]
    mock_pres.slides = [mock_slide]
    mock_presentation.return_value = mock_pres

    uploaded_file = create_uploaded_file(filename="extract_me.pptx")
    file_id = uploaded_file.id
    expected_text_filename = 'extract_me.txt' # Nombre esperado

    url = reverse('api_extract_text', kwargs={'file_id': file_id})
    response = authenticated_client.post(url)

    # Verificar status code y mensaje
    assert response.status_code == status.HTTP_200_OK, f"Expected 200 OK, got {response.status_code}. Response data: {response.data}"
    assert response.data['message'] == "Texto extraído y guardado con éxito"

    # Verificar llamada a Presentation
    mock_presentation.assert_called_once_with(uploaded_file.file.path)
    # mock_content_file.assert_called_once_with("Texto de la diapositiva.".encode('utf-8')) # <-- ELIMINADO

    # Verificar en BD y storage
    uploaded_file.refresh_from_db()
    assert uploaded_file.text_file is not None
    assert uploaded_file.text_file.name is not None
    assert expected_text_filename in uploaded_file.text_file.name

    # Opcional: Leer contenido
    assert default_storage.exists(uploaded_file.text_file.name)
    with default_storage.open(uploaded_file.text_file.name, 'rb') as f: # Cambiar 'r' a 'rb'
        saved_content_bytes = f.read() # Leer como bytes
    saved_content = saved_content_bytes.decode('utf-8') # Decodificar usando UTF-8
    assert saved_content == "Texto de la diapositiva."

    # Limpieza (opcional)
    # if uploaded_file.text_file and default_storage.exists(uploaded_file.text_file.name):
    #      default_storage.delete(uploaded_file.text_file.name)


def test_extract_text_unsupported_type(authenticated_client, create_uploaded_file):
    uploaded_file = create_uploaded_file(filename="image.jpg", content=b"jpeg_data")
    url = reverse('api_extract_text', kwargs={'file_id': uploaded_file.id})
    response = authenticated_client.post(url)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Tipo de archivo no soportado: '.jpg'" in response.data['message']

@patch('archivos.views.pdfplumber.open')
def test_extract_text_no_text_found(mock_pdf_open, authenticated_client, create_uploaded_file):
    # Simular que pdfplumber no extrae texto
    mock_pdf = MagicMock()
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "" # Sin texto
    mock_pdf.pages = [mock_page]
    mock_pdf_open.return_value.__enter__.return_value = mock_pdf

    uploaded_file = create_uploaded_file(filename="empty.pdf")
    url = reverse('api_extract_text', kwargs={'file_id': uploaded_file.id})
    response = authenticated_client.post(url)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "No se pudo extraer contenido de texto" in response.data['message']

@patch('archivos.views.pdfplumber.open')
def test_extract_text_extraction_error(mock_pdf_open, authenticated_client, create_uploaded_file):
    # Simular un error durante la extracción
    mock_pdf_open.side_effect = Exception("Error simulado de pdfplumber")

    uploaded_file = create_uploaded_file(filename="error.pdf")
    url = reverse('api_extract_text', kwargs={'file_id': uploaded_file.id})
    response = authenticated_client.post(url)

    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert "Error al procesar el archivo PDF: Error simulado de pdfplumber" in response.data['message']

# --- Tests para ReadTextView ---

def test_read_text_success(authenticated_client, create_uploaded_file, tmp_path):
    # Asegurarnos que MEDIA_ROOT apunta a un dir temporal para este test
    settings.MEDIA_ROOT = tmp_path
    expected_text = "Este es el contenido del archivo de texto."
    uploaded_file = create_uploaded_file(
        filename="readable.pdf",
        text_content=expected_text,
        extracted_data={"clave": "valor"}
    )
    file_id = uploaded_file.id

    url = reverse('api_read_text', kwargs={'file_id': file_id})
    response = authenticated_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data['text'] == expected_text
    assert response.data['extracted_data'] == {"clave": "valor"}

def test_read_text_not_extracted(authenticated_client, create_uploaded_file):
    # Crear archivo sin text_file asociado
    uploaded_file = create_uploaded_file(filename="no_text.pdf")
    url = reverse('api_read_text', kwargs={'file_id': uploaded_file.id})
    response = authenticated_client.get(url)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data['message'] == "No hay texto extraído para este archivo"

def test_read_text_file_not_found(authenticated_client):
    url = reverse('api_read_text', kwargs={'file_id': 9999})
    response = authenticated_client.get(url)
    assert response.status_code == status.HTTP_404_NOT_FOUND

# --- Tests para UserExtractedDataView ---

def test_get_extracted_data_success(authenticated_client, create_uploaded_file, test_user):
    # Archivo con datos
    create_uploaded_file(filename="data1.pdf", extracted_data={"id": 1, "info": "abc"})
    # Archivo sin datos
    create_uploaded_file(filename="data2.pdf", extracted_data={})
    # Archivo con otros datos
    create_uploaded_file(filename="data3.pptx", extracted_data={"id": 3, "detail": "xyz"})
    # Archivo de otro usuario (no debe aparecer)
    other_user = User.objects.create_user(username='otheruser', password='password123')
    other_file_obj = SimpleUploadedFile("other_data.pdf", b"content")
    UploadedFile.objects.create(user=other_user, file=other_file_obj, extracted_data={"id": 99})


    url = reverse('api_extracted_data')
    response = authenticated_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data['message'] == "Datos extraídos encontrados"
    assert response.data['count'] == 2 # Solo los que tienen datos no vacíos
    data_list = response.data['data']
    assert len(data_list) == 2
    # Verificar contenido (el orden puede variar)
    filenames = {item['filename'] for item in data_list}
    extracted_datas = {item['file_id']: item['extracted_data'] for item in data_list}
    assert "data1.pdf" in filenames
    assert "data3.pptx" in filenames
    assert "data2.pdf" not in filenames # Porque extracted_data estaba vacío
    assert extracted_datas[list(extracted_datas.keys())[0]] in [{"id": 1, "info": "abc"}, {"id": 3, "detail": "xyz"}]


def test_get_extracted_data_none(authenticated_client, create_uploaded_file):
    # Archivos sin datos o con datos vacíos
    create_uploaded_file(filename="nodata1.pdf", extracted_data=None)
    create_uploaded_file(filename="nodata2.pdf", extracted_data={})

    url = reverse('api_extracted_data')
    response = authenticated_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data['message'] == "No se encontraron datos extraídos para este usuario"
    assert response.data['count'] == 0
    assert len(response.data['data']) == 0

# --- Tests para UpdateExtractedDataView ---

def test_update_extracted_data_success(authenticated_client, create_uploaded_file):
    uploaded_file = create_uploaded_file(filename="update_me.pdf", extracted_data={"old": "data"})
    file_id = uploaded_file.id
    new_data = {"new": "info", "value": 123}

    url = reverse('update-extracted', kwargs={'file_id': file_id})
    response = authenticated_client.put(url, {'extracted_data': new_data}, format='json')

    assert response.status_code == status.HTTP_200_OK
    assert response.data['message'] == 'Datos actualizados con éxito'

    uploaded_file.refresh_from_db()
    assert uploaded_file.extracted_data == new_data

def test_update_extracted_data_clear(authenticated_client, create_uploaded_file):
    uploaded_file = create_uploaded_file(filename="clear_me.pdf", extracted_data={"some": "data"})
    file_id = uploaded_file.id

    url = reverse('update-extracted', kwargs={'file_id': file_id})
    response = authenticated_client.put(url, {'extracted_data': {}}, format='json') # Enviar dict vacío

    assert response.status_code == status.HTTP_200_OK
    uploaded_file.refresh_from_db()
    assert uploaded_file.extracted_data == {}

def test_update_extracted_data_file_not_found(authenticated_client):
    url = reverse('update-extracted', kwargs={'file_id': 9999})
    response = authenticated_client.put(url, {'extracted_data': {"a": 1}}, format='json')
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_update_extracted_data_wrong_user(authenticated_client, create_uploaded_file):
    other_user = User.objects.create_user(username='otheruser', password='password123')
    other_file_obj = SimpleUploadedFile("other_user_update.pdf", b"content")
    other_uploaded_file = UploadedFile.objects.create(user=other_user, file=other_file_obj, extracted_data={"original": True})

    url = reverse('update-extracted', kwargs={'file_id': other_uploaded_file.id})
    response = authenticated_client.put(url, {'extracted_data': {"hacked": True}}, format='json') # Como 'testuser'
    assert response.status_code == status.HTTP_404_NOT_FOUND
    other_uploaded_file.refresh_from_db()
    assert other_uploaded_file.extracted_data == {"original": True} # Verificar que no cambió


# --- Fixture opcional para limpiar MEDIA_ROOT (si no usas tmp_path) ---
# Esto puede ir en conftest.py para que aplique a todos los tests

# @pytest.fixture(scope='session', autouse=True)
# def cleanup_test_media(request):
#     """Limpia la carpeta MEDIA_ROOT después de la sesión de tests."""
#     media_root = settings.MEDIA_ROOT
#     # Define una función de finalización que se ejecutará después de todos los tests
#     def fin():
#         if settings.MEDIA_ROOT.startswith('/tmp') or 'test' in settings.MEDIA_ROOT: # Medida de seguridad
#              print(f"Cleaning up test media files in {media_root}...")
#              # Cuidado: esto borrará TODO dentro de MEDIA_ROOT configurado para tests
#              # import shutil
#              # if os.path.exists(media_root):
#              #     shutil.rmtree(media_root)
#         else:
#             print(f"Skipping cleanup: MEDIA_ROOT '{media_root}' doesn't look like a test directory.")
#     request.addfinalizer(fin)


# --- Opcional: Configurar MEDIA_ROOT temporal en conftest.py ---
# Crea un archivo archivos/tests/conftest.py

# import pytest
# import os
# from django.conf import settings

# @pytest.fixture(autouse=True)
# def use_tmp_media_root(tmp_path_factory, django_settings):
#     """Asegura que MEDIA_ROOT sea un directorio temporal para los tests."""
#     media_path = tmp_path_factory.mktemp("media", numbered=True)
#     django_settings.MEDIA_ROOT = str(media_path)
#     # Opcional: Crear subdirectorios si tu código los espera
#     # os.makedirs(os.path.join(media_path, 'uploads'), exist_ok=True)
#     return str(media_path)