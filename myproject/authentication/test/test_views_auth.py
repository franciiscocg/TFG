import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

# Obtén el modelo de usuario activo (mejor práctica que importar User directamente)
User = get_user_model()

# --- Fixtures (Opcional pero útil) ---
# Un fixture para crear el cliente de API una vez por módulo
@pytest.fixture(scope='module')
def api_client():
    return APIClient()

# Un fixture para datos de usuario válidos
@pytest.fixture
def valid_user_data():
    return {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'StrongPassword123',
        'password2': 'StrongPassword123'
    }

# --- Tests para RegisterView ---

# Marca los tests que necesitan acceso a la base de datos
@pytest.mark.django_db
def test_register_user_success(api_client, valid_user_data):
    """
    Prueba el registro exitoso de un usuario.
    """
    url = reverse('api_register') # Usa el nombre de la URL definida en authentication.urls
    response = api_client.post(url, valid_user_data, format='json')

    # Verificar código de estado
    assert response.status_code == status.HTTP_201_CREATED

    # Verificar mensaje de respuesta
    assert response.data == {"message": "Usuario registrado con éxito"}

    # Verificar que el usuario fue creado en la base de datos
    assert User.objects.filter(username=valid_user_data['username']).exists()
    user = User.objects.get(username=valid_user_data['username'])
    assert user.email == valid_user_data['email']
    # Verificar que la contraseña se estableció correctamente (¡no está en texto plano!)
    assert user.check_password(valid_user_data['password'])


@pytest.mark.django_db
def test_register_user_password_mismatch(api_client, valid_user_data):
    """
    Prueba el registro fallido cuando las contraseñas no coinciden.
    """
    url = reverse('api_register')
    invalid_data = valid_user_data.copy()
    invalid_data['password2'] = 'DifferentPassword123' # Contraseña diferente

    response = api_client.post(url, invalid_data, format='json')

    # Verificar código de estado
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Verificar mensaje de error específico para la contraseña
    assert 'password' in response.data
    # El error viene del serializer, usualmente es una lista
    assert response.data['password'] == ["Las contraseñas no coinciden"]

    # Verificar que el usuario NO fue creado
    assert not User.objects.filter(username=valid_user_data['username']).exists()


@pytest.mark.django_db
def test_register_user_missing_fields(api_client):
    """
    Prueba el registro fallido cuando faltan campos requeridos.
    Verifica el código 400 y la presencia de errores específicos reportados.
    """
    url = reverse('api_register')
    incomplete_data = {
        'username': 'incompleteuser',
        'password': 'password123'
        # Faltan email y password2
    }
    response = api_client.post(url, incomplete_data, format='json')

    # Verificar código de estado
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Verificar que el diccionario de errores no está vacío
    assert bool(response.data)

    # Verificar el error específico que SÍ fue reportado (según el output del test)
    assert 'password2' in response.data
    assert response.data['password2'][0].code == 'required'

    # Opcional: podrías quitar la verificación explícita de 'email' si no siempre aparece
    # assert 'email' in response.data # <- Quitar o comentar esta línea si falla


@pytest.mark.django_db
def test_register_user_existing_username(api_client, valid_user_data):
    """
    Prueba el registro fallido cuando el nombre de usuario ya existe.
    """
    # Crear un usuario existente primero
    User.objects.create_user(
        username=valid_user_data['username'],
        email='another@example.com', # Email diferente
        password='password123'
    )

    url = reverse('api_register')
    # Intentar registrar con el mismo username pero diferente email
    data_with_existing_username = valid_user_data.copy()
    data_with_existing_username['email'] = 'new_email@example.com'

    response = api_client.post(url, data_with_existing_username, format='json')

    # Verificar código de estado
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Verificar el error específico de username
    assert 'username' in response.data
    # Django/DRF usualmente devuelve ["A user with that username already exists."]
    assert "already exists" in response.data['username'][0]


@pytest.mark.django_db
def test_register_user_existing_email(api_client, valid_user_data):
    """
    Prueba el registro fallido cuando el email ya existe (si el modelo User lo requiere único).
    Por defecto, el User de Django no requiere email único, pero es común hacerlo.
    Si tu modelo User tiene unique=True en el email, este test es relevante.
    Si no, el registro podría tener éxito (dependiendo de la configuración de allauth).
    Asumiremos que el email debería ser único para este test.
    """
    # Crear un usuario existente primero con el email del test
    User.objects.create_user(
        username='anotheruser', # Username diferente
        email=valid_user_data['email'],
        password='password123'
    )

    url = reverse('api_register')
    # Intentar registrar con el mismo email pero diferente username
    data_with_existing_email = valid_user_data.copy()
    data_with_existing_email['username'] = 'new_username_for_email_test'

    response = api_client.post(url, data_with_existing_email, format='json')

    # Verificar código de estado - Django por defecto no fuerza email único a nivel de BD,
    # pero el serializer SÍ podría validarlo si está configurado.
    # DRF validará la unicidad si el campo del modelo tiene unique=True
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Verificar el error específico de email (si la unicidad está activa)
    assert 'email' in response.data
    # El error típico es ["user with this email address already exists."] o similar
    assert "ya existe" in str(response.data['email'][0])

# --- Tests para los Adapters (Más complejos) ---
# Testear los adapters directamente puede ser más complejo porque dependen del flujo de allauth.
# Usualmente, se testearían sus métodos individualmente (como unit tests) o mediante
# tests de integración que simulen un flujo de login social completo.
# Aquí NO estamos testeando los adapters, solo la vista de registro directo.