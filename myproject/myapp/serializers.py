from rest_framework import serializers
from .models import Asignatura, Horario, Profesores, Fechas

# Serializers
class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = ['grupo', 'tipo', 'hora', 'aula']

class ProfesorSerializer(serializers.ModelSerializer):
    horario = HorarioSerializer(required=False, allow_null=True)

    class Meta:
        model = Profesores
        fields = ['nombre', 'despacho', 'enlace', 'horario']

class FechaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fechas
        fields = ['titulo', 'fecha']

class AsignaturaSerializer(serializers.ModelSerializer):
    horarios = HorarioSerializer(many=True, required=False)
    profesores = ProfesorSerializer(many=True, required=False)
    fechas = FechaSerializer(many=True, required=False)

    class Meta:
        model = Asignatura
        fields = ['nombre', 'grado', 'departamento', 'universidad', 'condiciones_aprobado', 
                 'horarios', 'profesores', 'fechas']