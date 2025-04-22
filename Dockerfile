FROM python:alpine

# Establecer variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=myproject.settings

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apk update && apk add --no-cache \
    postgresql-dev \
    gcc \
    musl-dev \
    dcron \
    && rm -rf /var/cache/apk/*

# Copiar requirements.txt primero para aprovechar la caché de Docker
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el proyecto
COPY myproject/ .

COPY ../myproject/.env ./

# Recordatorios cron
RUN touch /var/log/cron.log
COPY django-cron /etc/crontabs/root
RUN chmod 0644 /etc/crontabs/root

# Crear directorio para archivos media si no existe
RUN mkdir -p media

# Exponer el puerto que utilizará Django
EXPOSE 8000

# Comando para ejecutar las migraciones y el servidor
CMD python manage.py migrate && crond -b -l 8 -L /var/log/cron.log && python manage.py runserver 0.0.0.0:8000
