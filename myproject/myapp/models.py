from django.db import models
from django.contrib.auth.models import User


class Asignatura(models.Model):
    nombre = models.CharField(max_length=100,null=True, blank=True)
    grado = models.CharField(max_length=100,null=True, blank=True)
    departamento = models.CharField(max_length=100,null=True, blank=True)
    universidad = models.CharField(max_length=100,null=True, blank=True)
    condiciones_aprobado = models.TextField(max_length=200,null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='asignaturas') 
    


class Horario(models.Model):
    TIPO_CHOICES = [
        ('teoria', 'Teoría'),
        ('practica', 'Práctica'),
        ('tutoria', 'Tutoría'),
    ]
    SEMANA_CHOICES = [
        ('Lunes', 'Lunes'),
        ('Martes', 'Martes'),
        ('Miércoles', 'Miércoles'),
        ('Jueves', 'Jueves'),
        ('Viernes', 'Viernes'),
        ('Sábado', 'Sábado'),
        ('Domingo', 'Domingo'),
    ]
        
    asignatura = models.ForeignKey(Asignatura, on_delete=models.CASCADE, related_name='horarios')
    grupo = models.CharField(max_length=50,null=True, blank=True)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    hora = models.CharField(max_length=20,null=True, blank=True) 
    aula = models.CharField(max_length=50,null=True, blank=True)
    dia = models.CharField(max_length=20,choices=SEMANA_CHOICES)  

class Profesores(models.Model):
    nombre = models.CharField(max_length=100,null=True, blank=True)
    asignatura = models.ForeignKey(Asignatura, on_delete=models.CASCADE, related_name='profesores')
    despacho = models.CharField(max_length=100, null=True, blank=True)
    enlace = models.URLField(null=True, blank=True)
    horario = models.OneToOneField(Horario, on_delete=models.SET_NULL, null=True, blank=True, related_name='profesor')
    
class Fechas(models.Model):
    asignatura = models.ForeignKey(Asignatura, on_delete=models.CASCADE, related_name='fechas')
    titulo = models.CharField(max_length=100,null=True, blank=True)
    fecha = models.DateField(null=True, blank=True)