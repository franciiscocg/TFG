from django.contrib import admin
from .models import Asignatura, Horario, Profesores, Fechas

admin.site.register(Asignatura)
admin.site.register(Horario)
admin.site.register(Profesores)
admin.site.register(Fechas)


