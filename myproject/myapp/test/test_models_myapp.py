import pytest
from django.contrib.auth.models import User
from datetime import date
from myapp.models import Asignatura, Horario, Profesores, Fechas # Asegúrate que la importación sea correcta según tu estructura

# --- Fixtures ---
# Usamos fixtures para crear datos de prueba reutilizables

@pytest.fixture
def test_user(db):
    """Fixture para crear un usuario de prueba."""
    user = User.objects.create_user(username='testuser', password='password123', email='test@example.com')
    return user

@pytest.fixture
def test_asignatura(db, test_user):
    """Fixture para crear una asignatura de prueba asociada a un usuario."""
    asignatura = Asignatura.objects.create(
        nombre="Cálculo I",
        grado="Ingeniería Informática",
        departamento="Matemáticas",
        universidad="Universidad Ficticia",
        condiciones_aprobado="Examen final y prácticas.",
        user=test_user
    )
    return asignatura

@pytest.fixture
def test_horario_teoria(db, test_asignatura):
    """Fixture para crear un horario de teoría de prueba."""
    horario = Horario.objects.create(
        asignatura=test_asignatura,
        grupo="Grupo A",
        tipo="teoria",
        hora="10:00-12:00",
        aula="Aula 101",
        dia="Lunes"
    )
    return horario

@pytest.fixture
def test_horario_tutoria(db, test_asignatura):
    """Fixture para crear un horario de tutoría de prueba."""
    horario = Horario.objects.create(
        asignatura=test_asignatura,
        tipo="tutoria",
        hora="16:00-17:00",
        aula="Despacho Prof.",
        dia="Miércoles"
    )
    return horario


# --- Tests ---

@pytest.mark.django_db # Marca para indicar que el test necesita acceso a la BD
def test_crear_usuario(test_user):
    """Verifica que el fixture de usuario funciona."""
    assert User.objects.count() == 1
    assert test_user.username == 'testuser'
    assert test_user.email == 'test@example.com'

@pytest.mark.django_db
def test_crear_asignatura(test_asignatura, test_user):
    """Verifica la creación de una Asignatura y su relación con User."""
    assert Asignatura.objects.count() == 1
    assert test_asignatura.nombre == "Cálculo I"
    assert test_asignatura.grado == "Ingeniería Informática"
    assert test_asignatura.user == test_user
    # Verificar el related_name
    assert test_user.asignaturas.count() == 1
    assert test_user.asignaturas.first() == test_asignatura

@pytest.mark.django_db
def test_crear_horario(test_horario_teoria, test_asignatura):
    """Verifica la creación de un Horario y su relación con Asignatura."""
    assert Horario.objects.count() == 1
    assert test_horario_teoria.asignatura == test_asignatura
    assert test_horario_teoria.grupo == "Grupo A"
    assert test_horario_teoria.tipo == "teoria"
    assert test_horario_teoria.dia == "Lunes"
    # Verificar el related_name
    assert test_asignatura.horarios.count() == 1
    assert test_asignatura.horarios.first() == test_horario_teoria

@pytest.mark.django_db
def test_crear_profesor_sin_horario(db, test_asignatura):
    """Verifica la creación de un Profesor sin Horario asociado."""
    profesor = Profesores.objects.create(
        nombre="Dr. Alan Turing",
        asignatura=test_asignatura,
        despacho="D-007",
        enlace="http://example.com/turing"
        # No se especifica horario, debe ser None por defecto (null=True)
    )
    assert Profesores.objects.count() == 1
    assert profesor.asignatura == test_asignatura
    assert profesor.nombre == "Dr. Alan Turing"
    assert profesor.horario is None
    # Verificar el related_name
    assert test_asignatura.profesores.count() == 1
    assert test_asignatura.profesores.first() == profesor

@pytest.mark.django_db
def test_crear_profesor_con_horario(db, test_asignatura, test_horario_tutoria):
    """Verifica la creación de un Profesor con un Horario (OneToOne)."""
    profesor = Profesores.objects.create(
        nombre="Dra. Ada Lovelace",
        asignatura=test_asignatura,
        despacho="D-101",
        horario=test_horario_tutoria # Asociamos el horario de tutoría
    )
    assert Profesores.objects.count() == 1
    assert profesor.asignatura == test_asignatura
    assert profesor.horario == test_horario_tutoria
    # Verificar el related_name inverso (OneToOne)
    assert hasattr(test_horario_tutoria, 'profesor')
    assert test_horario_tutoria.profesor == profesor

@pytest.mark.django_db
def test_crear_fecha(db, test_asignatura):
    """Verifica la creación de una Fecha y su relación con Asignatura."""
    fecha_evento = date(2025, 6, 15)
    fecha = Fechas.objects.create(
        asignatura=test_asignatura,
        titulo="Examen Parcial 1",
        fecha=fecha_evento
    )
    assert Fechas.objects.count() == 1
    assert fecha.asignatura == test_asignatura
    assert fecha.titulo == "Examen Parcial 1"
    assert fecha.fecha == fecha_evento
    # Verificar el related_name
    assert test_asignatura.fechas.count() == 1
    assert test_asignatura.fechas.first() == fecha

@pytest.mark.django_db
def test_profesor_horario_set_null_on_delete(db, test_asignatura, test_horario_tutoria):
    """Verifica que al borrar un Horario, el campo horario del Profesor se pone a NULL."""
    profesor = Profesores.objects.create(
        nombre="Dra. Grace Hopper",
        asignatura=test_asignatura,
        horario=test_horario_tutoria
    )
    assert profesor.horario == test_horario_tutoria

    # Borramos el horario
    test_horario_tutoria.delete()

    # Refrescamos el objeto profesor desde la base de datos
    profesor.refresh_from_db()

    # Verificamos que el campo horario ahora es None
    assert profesor.horario is None
    assert Profesores.objects.count() == 1 # El profesor no se borra

@pytest.mark.django_db
def test_asignatura_cascade_delete(test_asignatura, test_horario_teoria, test_user):
    """Verifica que al borrar una Asignatura, sus Horarios, Profesores y Fechas se borran (CASCADE)."""
    # Crear objetos relacionados
    fecha_evento = date(2025, 5, 20)
    Fechas.objects.create(asignatura=test_asignatura, titulo="Entrega Práctica", fecha=fecha_evento)
    Profesores.objects.create(nombre="Prof. Test", asignatura=test_asignatura)

    assert Asignatura.objects.count() == 1
    assert Horario.objects.count() == 1
    assert Fechas.objects.count() == 1
    assert Profesores.objects.count() == 1

    # Borrar la asignatura
    test_asignatura.delete()

    # Verificar que todo lo relacionado se ha borrado
    assert Asignatura.objects.count() == 0
    assert Horario.objects.count() == 0
    assert Fechas.objects.count() == 0
    assert Profesores.objects.count() == 0
    assert User.objects.count() == 1 # El usuario no debe borrarse