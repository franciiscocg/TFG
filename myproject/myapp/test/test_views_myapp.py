import pytest
import json
from unittest.mock import patch, MagicMock, mock_open as mock_open_lib
from datetime import date, datetime, timedelta

from django.urls import reverse
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings
from rest_framework.test import APIClient
from rest_framework import status


# Tus modelos y los necesarios
from myapp.models import Asignatura, Horario, Profesores, Fechas
from archivos.models import UploadedFile # Ajusta la ruta si es necesario
from allauth.socialaccount.models import SocialToken, SocialApp


# --- Fixtures ---

@pytest.fixture
def api_client():
    """Fixture para crear un cliente de API de DRF."""
    return APIClient()

@pytest.fixture
def test_user(db):
    """Fixture para un usuario estándar."""
    user = User.objects.create_user(username='testuser', password='password123', email='test@example.com')
    return user

@pytest.fixture
def authenticated_client(api_client, test_user):
    """Fixture para un cliente de API autenticado con test_user."""
    api_client.force_authenticate(user=test_user)
    return api_client

@pytest.fixture
def uploaded_file_no_text(db, test_user):
    """Fixture para un UploadedFile sin archivo de texto asociado."""
    return UploadedFile.objects.create(
        user=test_user,
        file=SimpleUploadedFile("dummy.pdf", b"pdfcontent")
    )

@pytest.fixture
def uploaded_file_with_text(db, test_user, tmp_path):
    """Fixture para un UploadedFile con un archivo de texto temporal asociado."""
    file_content = b"Contenido de prueba para la asignatura X."
    # Crear un archivo temporal real usando tmp_path (fixture de pytest)
    d = tmp_path / "sub"
    d.mkdir()
    p = d / "test_file.txt"
    p.write_bytes(file_content)

    # Crear una instancia de SimpleUploadedFile para el campo text_file
    # Ojo: El campo FileField guarda la *ruta* al archivo.
    # Para que el test funcione, guardamos la ruta real de tmp_path.
    text_file_name_rel = "test_files/test_file.txt" # Ruta relativa como la guardaría Django
    up_file = SimpleUploadedFile(p.name, p.read_bytes(), content_type="text/plain")

    uploaded_obj = UploadedFile.objects.create(
        user=test_user,
        file=SimpleUploadedFile("original.pdf", b"pdfcontent"),
        # text_file=up_file # Esto no guarda la ruta correcta para el test
    )
    # Asignar manualmente la ruta del archivo temporal al campo
    uploaded_obj.text_file.name = str(p) # Usamos la ruta absoluta del archivo temporal
    uploaded_obj.save()
    return uploaded_obj


@pytest.fixture
def uploaded_file_with_extracted_data(db, test_user):
    """Fixture para un UploadedFile con datos JSON ya extraídos."""
    extracted_json = [
        {
            "asignatura": {
                "nombre": "Algebra Lineal",
                "grado": "Matematicas",
                "departamento": "Algebra",
                "universidad": "UniTest",
                "condiciones_aprobado": "Examen 70%, Practicas 30%"
            },
            "fechas": [
                {"titulo": "Parcial 1", "fecha": "2025-10-20"},
                {"titulo": "Parcial 2", "fecha": "2025-12-15"}
            ],
            "horarios": [
                {"grupo": "T1", "tipo": "teoria", "hora": "10-12", "aula": "A01", "dia": "Lunes"},
                {"grupo": "P1", "tipo": "practica", "hora": "10-12", "aula": "L1", "dia": "Jueves"}
            ],
            "profesores": [
                {
                    "nombre": "Prof. Gauss", "despacho": "D1", "enlace": "http://gauss.test",
                    "horario": {"grupo": "", "tipo": "tutoria", "hora": "16-17", "aula": "D1", "dia": "Martes"}
                }
            ]
        }
    ]
    return UploadedFile.objects.create(
        user=test_user,
        file=SimpleUploadedFile("dummy2.pdf", b"pdfcontent"),
        extracted_data=extracted_json
    )

@pytest.fixture
def asignatura_existente(db, test_user):
    """Fixture para una asignatura existente con algunos datos relacionados."""
    asignatura = Asignatura.objects.create(
        user=test_user, nombre="Calculo Existente", grado="Fisica", universidad="UniTest"
    )
    Horario.objects.create(asignatura=asignatura, tipo="teoria", dia="Lunes", hora="9-11")
    Fechas.objects.create(asignatura=asignatura, titulo="Examen Viejo", fecha=date(2024, 1, 1))
    return asignatura

@pytest.fixture
def fecha_manana(db, test_user, asignatura_existente):
    """Fixture para una fecha importante mañana."""
    manana = datetime.now().date() + timedelta(days=1)
    return Fechas.objects.create(
        asignatura=asignatura_existente,
        titulo="Entrega Importante",
        fecha=manana
    )

@pytest.fixture
def google_social_app(db):
    """Fixture para simular la SocialApp de Google."""
    return SocialApp.objects.create(
        provider='google',
        name='GoogleTestApp',
        client_id='test_client_id',
        secret='test_secret'
    )

@pytest.fixture
def google_social_token(db, test_user, google_social_app):
    """Fixture para simular el SocialToken de Google para el usuario."""
    # Necesitamos crear un SocialAccount primero
    from allauth.socialaccount.models import SocialAccount
    social_account = SocialAccount.objects.create(
        user=test_user,
        provider='google',
        uid='123456789'
    )
    return SocialToken.objects.create(
        app=google_social_app,
        account=social_account,
        token='dummy_google_token',
        token_secret='dummy_google_refresh_token' # Guardar el refresh token aquí si lo usas
    )


# -----------------------------------
# Tests para GetUserCalendarDataView
# -----------------------------------
@pytest.mark.django_db
class TestGetUserCalendarDataView:

    def test_get_data_success(self, authenticated_client, asignatura_existente, test_user):
        """Verifica obtener los datos del calendario del usuario."""
        url = reverse('get_user_calendar_data')
        # Crear más datos para asignatura_existente si es necesario probar más
        Horario.objects.create(asignatura=asignatura_existente, tipo="practica", dia="Miercoles", hora="15-17", aula="L2")
        Profesores.objects.create(asignatura=asignatura_existente, nombre="Prof. Newton", despacho="D2")

        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "Datos obtenidos con éxito" in response.data.get("message", "")
        assert isinstance(response.data.get("data"), list)
        assert len(response.data["data"]) == 1 # Solo la asignatura_existente

        asig_data = response.data["data"][0]
        assert asig_data["asignatura"]["nombre"] == "Calculo Existente"
        assert len(asig_data["horarios"]) == 2 # Los dos horarios creados
        assert len(asig_data["fechas"]) == 1
        assert len(asig_data["profesores"]) == 1

    def test_get_data_no_asignaturas(self, authenticated_client, test_user):
        """Verifica respuesta si el usuario no tiene asignaturas."""
        url = reverse('get_user_calendar_data')
        # Asegurarse que test_user no tiene asignaturas
        Asignatura.objects.filter(user=test_user).delete()

        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data.get("data"), list)
        assert len(response.data["data"]) == 0

    def test_get_data_unauthenticated(self, api_client):
        url = reverse('get_user_calendar_data')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# -----------------------------------
# Tests para AsignaturaUpdateView
# -----------------------------------
@pytest.mark.django_db
class TestAsignaturaUpdateView:

    def test_update_asignatura_success(self, authenticated_client, asignatura_existente):
        """Verifica la actualización exitosa de una asignatura."""
        url = reverse('asignatura-update', kwargs={'nombre': asignatura_existente.nombre})

        # Datos nuevos para actualizar
        new_data = {
            "asignatura": {
                "nombre": "Calculo Existente", # No cambiamos el nombre aquí, se usa en URL
                "grado": "Fisica Actualizada",
                "condiciones_aprobado": "Solo examen final."
            },
            "horarios": [
                {"grupo": "T_NEW", "tipo": "teoria", "hora": "8-10", "aula": "A1_NEW", "dia": "Martes"}
            ],
            "fechas": [
                {"titulo": "Examen Nuevo", "fecha": "2025-11-01"}
            ],
            "profesores": [
                {"nombre": "Prof. Einstein", "despacho": "E1", "enlace": None, "horario": None}
            ]
        }

        # Estado inicial
        assert asignatura_existente.grado == "Fisica"
        assert asignatura_existente.horarios.count() == 1
        assert asignatura_existente.fechas.count() == 1
        assert asignatura_existente.profesores.count() == 0

        response = authenticated_client.put(url, new_data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert "Asignatura actualizada con éxito" in response.data.get("message", "")

        # Verificar estado de la BD
        asignatura_existente.refresh_from_db()
        assert asignatura_existente.grado == "Fisica Actualizada"
        assert asignatura_existente.condiciones_aprobado == "Solo examen final."
        # Los relacionados se borran y recrean
        assert asignatura_existente.horarios.count() == 1
        assert asignatura_existente.horarios.first().grupo == "T_NEW"
        assert asignatura_existente.fechas.count() == 1
        assert asignatura_existente.fechas.first().titulo == "Examen Nuevo"
        assert asignatura_existente.profesores.count() == 1
        assert asignatura_existente.profesores.first().nombre == "Prof. Einstein"

    def test_update_asignatura_not_found(self, authenticated_client):
            """
            Verifica respuesta 404 si la asignatura a actualizar no existe.
            NOTA: Este test falla actualmente devolviendo 400. Requiere
            depuración en la vista/urls/middleware para entender por qué
            get_object_or_404 no resulta en un 404.
            """
            url = reverse('asignatura-update', kwargs={'nombre': "NombreInexistente"})
            # Enviar una estructura mínima para intentar evitar errores 400 prematuros
            minimal_data = {"asignatura": {}}
            response = authenticated_client.put(url, minimal_data, format='json')
            # Se mantiene la aserción esperando 404, aunque falle por ahora.
            assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_asignatura_unauthenticated(self, api_client, asignatura_existente):
        url = reverse('asignatura-update', kwargs={'nombre': asignatura_existente.nombre})
        response = api_client.put(url, {}, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# -----------------------------------
# Tests para AsignaturaDeleteView
# -----------------------------------
@pytest.mark.django_db
class TestAsignaturaDeleteView:

    def test_delete_asignatura_success(self, authenticated_client, asignatura_existente):
        """Verifica el borrado exitoso de una asignatura y sus dependencias."""
        url = reverse('asignatura-delete', kwargs={'nombre': asignatura_existente.nombre})
        asignatura_id = asignatura_existente.id
        horario_id = asignatura_existente.horarios.first().id
        fecha_id = asignatura_existente.fechas.first().id

        # Verificar que existen antes de borrar
        assert Asignatura.objects.filter(id=asignatura_id).exists()
        assert Horario.objects.filter(id=horario_id).exists()
        assert Fechas.objects.filter(id=fecha_id).exists()

        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_200_OK
        assert "Asignatura eliminada con éxito" in response.data.get("message", "")

        # Verificar que se borraron (CASCADE)
        assert not Asignatura.objects.filter(id=asignatura_id).exists()
        assert not Horario.objects.filter(id=horario_id).exists()
        assert not Fechas.objects.filter(id=fecha_id).exists()

    def test_delete_asignatura_not_found(self, authenticated_client):
        """
        Verifica respuesta 404 si la asignatura a borrar no existe.
        NOTA: Este test falla actualmente devolviendo 400. Requiere
        depuración en la vista/urls/middleware para entender por qué
        get_object_or_404 no resulta en un 404.
        """
        url = reverse('asignatura-delete', kwargs={'nombre': "NombreInexistente"})
        response = authenticated_client.delete(url)
        # Se mantiene la aserción esperando 404, aunque falle por ahora.
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_asignatura_unauthenticated(self, api_client, asignatura_existente):
        url = reverse('asignatura-delete', kwargs={'nombre': asignatura_existente.nombre})
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# -----------------------------------
# Tests para SendDateRemindersView
# -----------------------------------
@pytest.mark.django_db
class TestSendDateRemindersView:

    # Mockear la función send_mail que se usa en la vista
    @patch('myapp.views.send_mail')
    def test_send_reminders_success(self, mock_send_mail, authenticated_client, fecha_manana, test_user):
        """Verifica que se envía correo si hay fechas mañana."""
        url = reverse('send_reminders')
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "Correo enviado exitosamente" in response.data.get("message", "")

        # Verificar que send_mail fue llamado una vez
        mock_send_mail.assert_called_once()

        # Verificar argumentos de send_mail (opcional pero bueno)
        call_args, call_kwargs = mock_send_mail.call_args
        assert call_kwargs['subject'] == "StudySift"
        assert f"Hola {test_user.username}" in call_kwargs['message']
        assert f"Hola {test_user.username}" in call_kwargs['html_message']
        assert f"mañana {fecha_manana.fecha.strftime('%d/%m/%Y')}" in call_kwargs['message']
        assert f"<li>'<em>{fecha_manana.titulo}</em>' de <strong>{fecha_manana.asignatura.nombre}</strong></li>" in call_kwargs['html_message']
        assert call_kwargs['recipient_list'] == [test_user.email]
        assert call_kwargs['from_email'] == settings.DEFAULT_FROM_EMAIL

    @patch('myapp.views.send_mail')
    def test_send_reminders_no_dates(self, mock_send_mail, authenticated_client, asignatura_existente):
        """Verifica que no se envía correo si no hay fechas mañana."""
        url = reverse('send_reminders')
        # Asegurarse que no hay fechas para mañana
        manana = datetime.now().date() + timedelta(days=1)
        Fechas.objects.filter(asignatura__user=asignatura_existente.user, fecha=manana).delete()

        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "No hay fechas para mañana" in response.data.get("message", "")

        # Verificar que send_mail NO fue llamado
        mock_send_mail.assert_not_called()

    def test_send_reminders_unauthenticated(self, api_client):
        url = reverse('send_reminders')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @patch('myapp.views.send_mail')
    def test_send_reminders_mail_error(self, mock_send_mail, authenticated_client, fecha_manana):
        """Verifica manejo de error si send_mail falla."""
        url = reverse('send_reminders')
        # Simular excepción al llamar a send_mail
        mock_send_mail.side_effect = Exception("SMTP Error")

        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "Error al enviar correo: SMTP Error" in response.data.get("message", "")
        mock_send_mail.assert_called_once() # Se intentó llamar


# -----------------------------------
# Tests para ExportToGoogleCalendarView
# (Estos son más complejos por el mocking de la API de Google)
# -----------------------------------
@pytest.mark.django_db
class TestExportToGoogleCalendarView:

    # Mockear dependencias clave: SocialToken, SocialApp, build (googleapiclient)
    @patch('myapp.views.build') # Mockear el constructor del servicio de Google
    @patch('allauth.socialaccount.models.SocialToken.objects.get')
    @patch('allauth.socialaccount.models.SocialApp.objects.get')
    def test_export_new_event_success(self, mock_socialapp_get, mock_socialtoken_get, mock_google_build,
                                    authenticated_client, test_user, google_social_app, google_social_token):
        """Verifica la exportación exitosa de un nuevo evento a Google Calendar."""
        url = reverse('export-google-calendar')

        # Configurar mocks
        mock_socialapp_get.return_value = google_social_app
        mock_socialtoken_get.return_value = google_social_token

        # Mock del servicio de Google Calendar y sus métodos
        mock_service = MagicMock()
        mock_events = MagicMock()
        mock_list_result = MagicMock()
        mock_insert_result = MagicMock()

        # Simular que no se encuentran eventos existentes
        mock_list_result.execute.return_value = {'items': []}
        # Simular respuesta de inserción exitosa
        mock_insert_result.execute.return_value = {'htmlLink': 'http://google.calendar/event_link', 'id': 'event123'}

        mock_events.list.return_value = mock_list_result
        mock_events.insert.return_value = mock_insert_result
        mock_service.events.return_value = mock_events
        mock_google_build.return_value = mock_service # build() devuelve el servicio mockeado

        # Datos del evento a exportar
        event_data = {
            'summary': 'Examen Final Test',
            'description': 'Descripción del examen',
            'start_date': '2025-06-20',
            'end_date': '2025-06-21', # Google Calendar usa fecha final exclusiva para eventos de día completo
            'event_id': 'unique_event_1' # ID opcional
        }

        response = authenticated_client.post(url, event_data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data.get('success') is True
        assert 'Evento exportado' in response.data.get('message', '')
        assert response.data.get('event_link') == 'http://google.calendar/event_link'

        # Verificar llamadas a mocks
        mock_socialapp_get.assert_called_once_with(provider='google')
        mock_socialtoken_get.assert_called_once_with(account__user=test_user, account__provider='google')
        mock_google_build.assert_called_once() # Se podría verificar args como ('calendar', 'v3', ...)
        mock_service.events().list.assert_called_once() # Verificar búsqueda de duplicados
        mock_service.events().insert.assert_called_once() # Verificar llamada a insert
        mock_service.events().update.assert_not_called() # No se debe llamar a update

    @patch('myapp.views.build')
    @patch('allauth.socialaccount.models.SocialToken.objects.get')
    @patch('allauth.socialaccount.models.SocialApp.objects.get')
    def test_export_update_event_success(self, mock_socialapp_get, mock_socialtoken_get, mock_google_build,
                                        authenticated_client, test_user, google_social_app, google_social_token):
        """Verifica la actualización de un evento existente en Google Calendar."""
        url = reverse('export-google-calendar')

        # Mocks básicos
        mock_socialapp_get.return_value = google_social_app
        mock_socialtoken_get.return_value = google_social_token
        mock_service = MagicMock()
        mock_events = MagicMock()
        mock_list_result = MagicMock()
        mock_update_result = MagicMock()
        mock_google_build.return_value = mock_service
        mock_service.events.return_value = mock_events
        mock_events.list.return_value = mock_list_result
        mock_events.update.return_value = mock_update_result

        # Datos del evento
        event_data = {'summary': 'Examen Repetido', 'start_date': '2025-07-10', 'end_date': '2025-07-11'}

        # Simular que se encuentra un evento existente
        existing_event_google = {
            'id': 'existing_event_456',
            'summary': 'Examen Repetido',
            'start': {'date': '2025-07-10'},
            'end': {'date': '2025-07-11'}
            # Podría tener extendedProperties si lo usas para buscar
        }
        mock_list_result.execute.return_value = {'items': [existing_event_google]}
        # Simular respuesta de actualización exitosa
        mock_update_result.execute.return_value = {'htmlLink': 'http://google.calendar/updated_link', 'id': 'existing_event_456'}

        response = authenticated_client.post(url, event_data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data.get('success') is True
        assert 'Evento actualizado' in response.data.get('message', '')
        assert response.data.get('event_link') == 'http://google.calendar/updated_link'

        # Verificar llamadas
        mock_service.events().list.assert_called_once()
        mock_service.events().update.assert_called_once() # Se llama a update
        # Verificar que el body de update sea correcto es más avanzado
        update_call_args, update_call_kwargs = mock_service.events().update.call_args
        assert update_call_kwargs['eventId'] == 'existing_event_456'
        assert update_call_kwargs['body']['summary'] == 'Examen Repetido'
        mock_service.events().insert.assert_not_called() # No se llama a insert

    def test_export_missing_data(self, authenticated_client, google_social_token): # Necesita token para pasar la auth
        """Verifica error 400 si faltan datos del evento."""
        url = reverse('export-google-calendar')
        invalid_data = {'summary': 'Incompleto'} # Falta start_date, end_date
        response = authenticated_client.post(url, invalid_data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'Faltan datos del evento' in response.data.get('error', '')


    @patch('allauth.socialaccount.models.SocialToken.objects.get')
    def test_export_no_google_token(self, mock_socialtoken_get, authenticated_client, test_user, google_social_app): # <- Añadir google_social_app
        """Verifica error 400 si el usuario no tiene token de Google."""
        # Ahora google_social_app existe gracias a la fixture
        url = reverse('export-google-calendar')
        mock_socialtoken_get.side_effect = SocialToken.DoesNotExist

        event_data = {'summary': 'Test', 'start_date': '2025-08-01', 'end_date': '2025-08-02'}
        response = authenticated_client.post(url, event_data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST # Ahora debería ser 400
        assert 'no ha vinculado su cuenta de Google' in response.data.get('error', '')

    # Faltarían tests para errores de la API de Google (HttpError), etc.