import pytest
from django.contrib.auth.models import User
from datetime import date
from myapp.models import Asignatura, Horario, Profesores, Fechas
from myapp.serializers import (
    AsignaturaSerializer,
    HorarioSerializer,
    ProfesorSerializer,
    FechaSerializer
)

# --- Reutilizar o Redefinir Fixtures ---
# (Si este archivo está separado de test_models.py, copia las fixtures aquí)
# Asegúrate de que las fixtures creen los objetos necesarios en la BD de prueba.

@pytest.fixture
def test_user(db):
    user = User.objects.create_user(username='testuser', password='password123', email='test@example.com')
    return user

@pytest.fixture
def test_asignatura(db, test_user):
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
def test_horario_practica(db, test_asignatura):
    horario = Horario.objects.create(
        asignatura=test_asignatura,
        grupo="Grupo B",
        tipo="practica",
        hora="12:00-14:00",
        aula="Lab 2",
        dia="Martes"
    )
    return horario


@pytest.fixture
def test_horario_tutoria(db, test_asignatura):
    horario = Horario.objects.create(
        asignatura=test_asignatura,
        tipo="tutoria", # Sin grupo, sin aula específica
        hora="16:00-17:00",
        dia="Miércoles"
    )
    return horario

@pytest.fixture
def test_profesor_con_horario(db, test_asignatura, test_horario_tutoria):
    profesor = Profesores.objects.create(
        nombre="Dra. Ada Lovelace",
        asignatura=test_asignatura,
        despacho="D-101",
        enlace="http://example.com/ada",
        horario=test_horario_tutoria # Horario de tutoría asociado
    )
    return profesor

@pytest.fixture
def test_profesor_sin_horario(db, test_asignatura):
    profesor = Profesores.objects.create(
        nombre="Dr. Alan Turing",
        asignatura=test_asignatura,
        despacho="D-007",
        # Sin enlace, sin horario
    )
    return profesor


@pytest.fixture
def test_fecha_examen(db, test_asignatura):
    fecha_obj = Fechas.objects.create(
        asignatura=test_asignatura,
        titulo="Examen Parcial 1",
        fecha=date(2025, 6, 15)
    )
    return fecha_obj

@pytest.fixture
def test_fecha_entrega(db, test_asignatura):
    fecha_obj = Fechas.objects.create(
        asignatura=test_asignatura,
        titulo="Entrega Práctica Final",
        fecha=date(2025, 7, 1)
    )
    return fecha_obj

# --- Tests para Serializers ---

@pytest.mark.django_db
def test_horario_serializer(test_horario_teoria):
    """Verifica la serialización de un objeto Horario."""
    serializer = HorarioSerializer(instance=test_horario_teoria)
    expected_data = {
        'grupo': 'Grupo A',
        'tipo': 'teoria',
        'hora': '10:00-12:00',
        'aula': 'Aula 101'
        # 'dia' no está incluido en el serializer, así que no debe aparecer
        # 'asignatura' tampoco está
    }
    assert serializer.data == expected_data

@pytest.mark.django_db
def test_fecha_serializer(test_fecha_examen):
    """Verifica la serialización de un objeto Fechas."""
    serializer = FechaSerializer(instance=test_fecha_examen)
    expected_data = {
        'titulo': 'Examen Parcial 1',
        'fecha': '2025-06-15' # Verifica el formato YYYY-MM-DD
    }
    assert serializer.data == expected_data

@pytest.mark.django_db
def test_profesor_serializer_con_horario(test_profesor_con_horario, test_horario_tutoria):
    """Verifica la serialización de un Profesor con Horario anidado."""
    serializer = ProfesorSerializer(instance=test_profesor_con_horario)

    # Serializamos el horario por separado para comparar
    horario_serializer = HorarioSerializer(instance=test_horario_tutoria)

    expected_data = {
        'nombre': 'Dra. Ada Lovelace',
        'despacho': 'D-101',
        'enlace': 'http://example.com/ada',
        'horario': horario_serializer.data # El horario anidado serializado
    }
    assert serializer.data == expected_data

@pytest.mark.django_db
def test_profesor_serializer_sin_horario(test_profesor_sin_horario):
    """Verifica la serialización de un Profesor sin Horario anidado (debe ser null)."""
    serializer = ProfesorSerializer(instance=test_profesor_sin_horario)
    expected_data = {
        'nombre': 'Dr. Alan Turing',
        'despacho': 'D-007',
        'enlace': None, # El enlace es null/blank en el modelo
        'horario': None # El horario es null porque no se asoció
    }
    assert serializer.data == expected_data
    # Verifica que el campo 'horario' existe y es None
    assert 'horario' in serializer.data
    assert serializer.data['horario'] is None

@pytest.mark.django_db
def test_asignatura_serializer_completa(
    test_asignatura, test_horario_teoria, test_horario_practica,
    test_profesor_con_horario, test_profesor_sin_horario,
    test_fecha_examen, test_fecha_entrega, test_horario_tutoria # Asegúrate que este argumento está
    ):
    """Verifica la serialización completa de Asignatura con listas anidadas."""

    serializer = AsignaturaSerializer(instance=test_asignatura)

    # Serialización esperada de los objetos anidados
    horario_teoria_data = HorarioSerializer(instance=test_horario_teoria).data
    horario_practica_data = HorarioSerializer(instance=test_horario_practica).data
    test_horario_tutoria_data = HorarioSerializer(instance=test_horario_tutoria).data # Necesario para la comparación
    profesor_con_horario_data = ProfesorSerializer(instance=test_profesor_con_horario).data
    profesor_sin_horario_data = ProfesorSerializer(instance=test_profesor_sin_horario).data
    fecha_examen_data = FechaSerializer(instance=test_fecha_examen).data
    fecha_entrega_data = FechaSerializer(instance=test_fecha_entrega).data

    expected_data = {
        'nombre': 'Cálculo I',
        'grado': 'Ingeniería Informática',
        'departamento': 'Matemáticas',
        'universidad': 'Universidad Ficticia',
        'condiciones_aprobado': 'Examen final y prácticas.',
        'horarios': [horario_teoria_data, horario_practica_data, test_horario_tutoria_data], # Espera los 3
        'profesores': [profesor_con_horario_data, profesor_sin_horario_data],
        'fechas': [fecha_examen_data, fecha_entrega_data]
    }

    # --- Comprobaciones ---
    assert serializer.data['nombre'] == expected_data['nombre']
    assert serializer.data['grado'] == expected_data['grado']
    assert serializer.data['departamento'] == expected_data['departamento']
    assert serializer.data['universidad'] == expected_data['universidad']
    assert serializer.data['condiciones_aprobado'] == expected_data['condiciones_aprobado']

    # --- Comparación de listas anidadas (Opción: Ordenar y comparar) ---

    # Función auxiliar para ordenar diccionarios (para consistencia si hiciera falta)
    # def sort_dict(d):
    #     return dict(sorted(d.items()))

    # Comparar Horarios (ordenando por 'hora' o 'tipo' si es necesario, o si el orden es estable, comparar directo)
    # Usaremos comparación de sets si los diccionarios internos son simples (sin otros dicts)
    def dict_to_tuple(d):
         return tuple(sorted(d.items())) # Esta funciona para horarios y fechas

    obtained_horarios_set = set(map(dict_to_tuple, serializer.data['horarios']))
    expected_horarios_set = set(map(dict_to_tuple, expected_data['horarios']))
    assert obtained_horarios_set == expected_horarios_set
    assert len(serializer.data['horarios']) == 3

    # Comparar Profesores (ordenando por 'nombre' antes de comparar listas)
    obtained_profesores_list = sorted(serializer.data['profesores'], key=lambda p: p.get('nombre', ''))
    expected_profesores_list = sorted(expected_data['profesores'], key=lambda p: p.get('nombre', ''))
    # Ahora compara las listas ordenadas directamente
    # NOTA: Esto asume que el contenido de cada diccionario de profesor es exactamente igual.
    # Si hay floats o estructuras complejas, la comparación directa puede fallar.
    assert obtained_profesores_list == expected_profesores_list
    assert len(serializer.data['profesores']) == 2


    # Comparar Fechas (usando sets o ordenando por 'fecha' o 'titulo')
    obtained_fechas_set = set(map(dict_to_tuple, serializer.data['fechas']))
    expected_fechas_set = set(map(dict_to_tuple, expected_data['fechas']))
    assert obtained_fechas_set == expected_fechas_set
    assert len(serializer.data['fechas']) == 2


# --- Opcional: Tests de Validación/Deserialización ---
# Estos serializers parecen más orientados a la salida, pero podemos añadir un test básico.

def test_horario_serializer_validacion_valida():
    """Verifica que datos válidos pasan la validación del HorarioSerializer."""
    valid_data = {
        'grupo': 'Grupo C',
        'tipo': 'practica', # Debe ser uno de los choices del modelo Horario
        'hora': '09:00-11:00',
        'aula': 'Lab 3'
    }
    serializer = HorarioSerializer(data=valid_data)
    assert serializer.is_valid()
    assert serializer.validated_data == valid_data

def test_horario_serializer_validacion_invalida():
    """Verifica que datos inválidos (tipo incorrecto) fallan la validación."""
    invalid_data = {
        'grupo': 'Grupo D',
        'tipo': 'INVALID_TYPE', # Este tipo no está en los choices
        'hora': '15:00-17:00',
        'aula': 'Aula Magna'
    }
    serializer = HorarioSerializer(data=invalid_data)
    assert not serializer.is_valid()
    # Verifica que el error está en el campo 'tipo'
    assert 'tipo' in serializer.errors
    # print(serializer.errors) # Descomenta para ver la estructura del error
