FROM python:3.10-slim

# Establecer variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=myproject.settings

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements.txt primero para aprovechar la caché de Docker
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Instalar dependencias adicionales para Google OAuth2
RUN pip install --no-cache-dir google-auth google-api-python-client

# Copiar el proyecto
COPY myproject/ .

# Crear directorio para archivos media si no existe
RUN mkdir -p media

# Exponer el puerto que utilizará Django
EXPOSE 8000

# Comando para ejecutar las migraciones y el servidor
CMD python manage.py migrate && python manage.py runserver 0.0.0.0:8000
