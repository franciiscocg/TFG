from django.db import models

class Fechas(models.Model):
    titulo = models.CharField(max_length=100)
    fecha = models.DateField()

class Asignatura(models.Model):
    nombre = models.CharField(max_length=100)
    grado = models.CharField(max_length=100)
    departamento = models.CharField(max_length=100)
    universidad = models.CharField(max_length=100)
    condiciones_aprobado = models.TextField(blank=True)


class Horario(models.Model):
    TIPO_CHOICES = [
        ('teoria', 'Teoría'),
        ('practica', 'Práctica'),
        ('tutoria', 'Tutoría'),
    ]
    asignatura = models.ForeignKey(Asignatura, on_delete=models.CASCADE, related_name='horarios')
    grupo = models.CharField(max_length=50)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    hora = models.CharField(max_length=20)  # Ejemplo: "10:40-12:30"
    aula = models.CharField(max_length=50)

class Profesores(models.Model):
    nombre = models.CharField(max_length=100)
    asignatura = models.ForeignKey(Asignatura, on_delete=models.CASCADE, related_name='profesores')
    despacho = models.CharField(max_length=100, blank=True)
    enlace = models.URLField(blank=True)
    horario = models.OneToOneField(Horario, on_delete=models.SET_NULL, null=True, blank=True, related_name='profesor')
