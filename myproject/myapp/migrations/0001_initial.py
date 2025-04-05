# Generated by Django 5.1.6 on 2025-04-05 13:35

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Asignatura',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=100)),
                ('grado', models.CharField(max_length=100)),
                ('departamento', models.CharField(max_length=100)),
                ('universidad', models.CharField(max_length=100)),
                ('condiciones_aprobado', models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Fechas',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titulo', models.CharField(max_length=100)),
                ('fecha', models.DateField()),
                ('asignatura', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='fechas', to='myapp.asignatura')),
            ],
        ),
        migrations.CreateModel(
            name='Horario',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('grupo', models.CharField(max_length=50)),
                ('tipo', models.CharField(choices=[('teoria', 'Teoría'), ('practica', 'Práctica'), ('tutoria', 'Tutoría')], max_length=20)),
                ('hora', models.CharField(max_length=20)),
                ('aula', models.CharField(max_length=50)),
                ('asignatura', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='horarios', to='myapp.asignatura')),
            ],
        ),
        migrations.CreateModel(
            name='Profesores',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=100)),
                ('despacho', models.CharField(blank=True, max_length=100)),
                ('enlace', models.URLField(blank=True)),
                ('asignatura', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='profesores', to='myapp.asignatura')),
                ('horario', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='profesor', to='myapp.horario')),
            ],
        ),
    ]
