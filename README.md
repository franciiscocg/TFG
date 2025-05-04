# StudySift

Esta aplicación permite a los usuarios autenticarse, subir archivos PDF y PowerPoint, extraer texto de ellos y almacenar datos estructurados extraídos de los documentos. Está construida con Django REST Framework en el backend y React en el frontend.

## Estructura del Proyecto

```
myproject/
├── archivos/                  # Aplicación para gestión de archivos PDF
│   ├── migrations/            # Migraciones de la base de datos
│   ├── admin.py               # Configuración del panel de administración
│   ├── models.py              # Modelos de datos para archivos
│   ├── serializers.py         # Serializadores para la API REST
│   ├── urls.py                # Rutas de la API para archivos
│   └── views.py               # Vistas y lógica de negocio
├── authentication/            # Aplicación para autenticación de usuarios
│   ├── serializers.py         # Serializadores para registro y autenticación
│   ├── urls.py                # Rutas de la API para autenticación
│   └── views.py               # Adaptadores personalizados y vistas
├── frontend/                  # Aplicación React para el frontend
│   ├── node_modules/          # Dependencias de Node.js
│   ├── .gitignore             # Archivos ignorados por Git
│   └── Dockerfile             # Configuración para Docker
├── media/uploads/             # Archivos subidos
│   └── <user>/                # Carpeta que contiene los archivos del usuario
│        ├── pdf/              # Archivos PDF y PPTX para la extraccion
│        └── txt/              # Archivos TXT de la extraccion del PDF
├── myapp/                     # Aplicacion core del proyecto
│   ├── files/                 # Archivos usados y guardados para probar la IA
│   │    ├── json/             # Archivos json generados y usados por la IA
│   │    ├── pdf/              # Archivos pdf usados por la IA
│   │    └── txt/              # Archivos txt generados y usador por la IA
│   ├── management/            # Llamada para enviar recordatorios (mensajes de correo)
│   ├── migrations/            # Migraciones de la base de datos
│   ├── __init__.py            # Inicialización del paquete
│   ├── admin.py               # Configuración del panel de administración
│   ├── models.py              # Modelos de datos para asignaturas, horarios, profesores y fechas
│   ├── serializers.py         # Serializadores para la API REST
│   ├── urls.py                # Rutas de la API para myapp
│   └── views.py               # Vistas y lógica de negocio
├── myproject/                 # Directorio del proyecto
│   ├── __init__.py            # Inicialización del paquete
│   ├── asgi.py                # Punto de entrada ASGI
│   ├── settings.py            # Configuracion del proyecto
│   ├── urls.py                # Rutas de la API del proyecto
│   └── wsgi.py                # Punto de entrada WSGI
├── .env                       # Variables de entorno
├── db.sqlite                  # Base de datos para el desarrollo
├── manage.py                  # Punto de entrada Djanjo
├── reminder_service.py        # Script de recordatorio automatico
└── sonar-project.properties   # Configuracion SonarQube
```

## Características Principales

### Autenticación de Usuarios

- **Registro tradicional**: Los usuarios pueden registrarse con nombre de usuario, correo electrónico y contraseña.
- **Autenticación social**: Integración con Google OAuth2 para inicio de sesión con cuentas de Google.
- **Tokens JWT**: Generación de tokens JWT para autenticación en la API REST.
- **Adaptadores personalizados**: Personalización del comportamiento de django-allauth para manejar nombres de usuario y redirecciones.

### Gestión de Archivos PDF

- **Carga de archivos**: Los usuarios pueden subir archivos pdf y pptx (máximo 5MB).
- **Listado paginado**: Visualización paginada de los archivos subidos por el usuario.
- **Eliminación de archivos**: Posibilidad de eliminar archivos subidos.

### Procesamiento de Documentos

- **Extracción de texto**: Extracción automática del texto contenido en los PDF utilizando pdfplumber.
- **Almacenamiento de texto**: El texto extraído se guarda en archivos TXT asociados a los PDF originales.
- **Datos estructurados**: Capacidad para almacenar y actualizar datos estructurados extraídos de los documentos en formato JSON.

### API REST

La API REST proporciona los siguientes endpoints principales:

**Autenticación y Gestión de Usuarios:**

*   `POST /api/register/`: Registrar un nuevo usuario.
*   `POST /api/token/`: Obtener token JWT (login con username/password).
*   `/api/auth/`: Endpoints proporcionados por `dj_rest_auth` para login, logout, gestión de usuario, cambio/reseteo de contraseña.
*   `/accounts/`: Endpoints proporcionados por `django-allauth` para flujos de autenticación social (ej. `GET /accounts/google/login/`).

**Gestión de Archivos:**

*   `POST /api/upload/`: Subir un nuevo archivo (PDF o PPTX).
*   `GET /api/upload/list/`: Listar archivos subidos por el usuario (paginado).
*   `DELETE /api/upload/delete/<int:file_id>/`: Eliminar un archivo específico.
*   `POST /api/upload/<int:file_id>/extract/`: Extraer texto del archivo especificado.
*   `GET /api/upload/<int:file_id>/text/`: Obtener el texto previamente extraído de un archivo.
*   `GET /api/upload/extracted/`: Obtener los datos estructurados (JSON) de todos los archivos del usuario.
*   `PUT /api/upload/<int:file_id>/update-extracted/`: Actualizar los datos estructurados (JSON) de un archivo específico.

**Procesamiento IA y Gestión Académica:**

*   `POST /api/ai/<int:file_id>/dates/`: Iniciar la extracción de datos estructurados (asignatura, fechas, horarios, profesores) usando IA (Ollama).
*   `POST /api/ai/<int:file_id>/process-extracted-data/`: Procesar los datos extraídos por IA y guardarlos en la base de datos.
*   `GET /api/ai/calendar/data/`: Obtener todos los datos académicos del usuario para el calendario.
*   `PUT /api/ai/asignaturas/<str:nombre>/`: Actualizar los detalles de una asignatura y sus datos relacionados (fechas, horarios, profesores).
*   `DELETE /api/ai/asignaturas/<str:nombre>/delete/`: Eliminar una asignatura y todos sus datos relacionados.
*   `POST /api/ai/send-reminders/`: Disparar manualmente el envío de recordatorios por correo.
*   `POST /api/ai/export-google-calendar/`: Exportar fechas importantes a Google Calendar.

**Administración:**

*   `GET /admin/`: Interfaz de administración de Django (requiere superusuario).


## Tecnologías Utilizadas

- **Backend**:
  - Django 4.x
  - Django REST Framework
  - django-allauth (autenticación social)
  - pdfplumber (procesamiento de PDF)
  - SimpleJWT (tokens JWT)

- **Frontend**:
  - React
  - Axios y Fetch (peticiones HTTP)
  - React Router (navegación)

## Configuración y Despliegue

### Requisitos Previos

- Python 3.8+
- Node.js 14+
- npm o yarn

### Configuración del Backend

1. Clonar el repositorio:
   ```
   git clone https://github.com/franciiscocg/TFG.git
   cd myproject
   ```

2. Crear y activar un entorno virtual:
   ```
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```

3. Instalar dependencias:
   ```
   pip install -r requirements.txt
   ```

4. Configurar variables de entorno:
   - Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:
     ```
      # Google OAuth 2
      SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = 
      SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = 
      
      # Django Core
      DJANGO_SECRET_KEY='' 
      DJANGO_DEBUG=True
      DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
      
      # Base de datos (Ejemplo para SQLite, ajusta si usas otra)
      DJANGO_DB_ENGINE=django.db.backends.sqlite3
      DJANGO_DB_NAME=db.sqlite3
      # DJANGO_DB_USER=tu_usuario_db
      # DJANGO_DB_PASSWORD=tu_password_db
      # DJANGO_DB_HOST=localhost
      # DJANGO_DB_PORT=5432 # Para PostgreSQL
      
      # CORS
      DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:3000
      
      # Email (MailerSend)
      MAILERSEND_API_TOKEN='' # ¡Tu API Token real!
      MAILERSEND_SENDER_DOMAIN='' # Tu dominio de MailerSend
      DJANGO_DEFAULT_FROM_EMAIL=''
      DJANGO_SERVER_EMAIL=''
      
      # allauth / dj-rest-auth
      DJANGO_LOGIN_REDIRECT_URL=/ 
      
      #URLs
      DJANGO_FRONTEND_BASE_URL=http://localhost:3000
      REACT_APP_BACKEND_URL=http://localhost:8000
      OLLAMA_API_URL=http://localhost:11434
      
      GEMINI_API_KEY=
     ```

5. Aplicar migraciones:
   ```
   python manage.py makemigrations
   python manage.py migrate
   ```

6. Iniciar el servidor:
   ```
   python manage.py runserver
   ```

### Configuración del Frontend

1. Navegar al directorio del frontend:
   ```
   cd frontend
   ```

2. Instalar dependencias:
   ```
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```
   npm start
   ```

## Uso de la Aplicación

1. **Autenticación**:
   - Regístrate con correo y contraseña o utiliza tu cuenta de Google.

2. **Gestión de archivos**:
   - Sube archivos PDF desde la interfaz principal.
   - Visualiza la lista de tus archivos subidos.
   - Elimina archivos que ya no necesites.

3. **Procesamiento de documentos**:
   - Selecciona un archivo y extrae su texto.
   - Visualiza el texto extraído.
   - Almacena datos estructurados extraídos del documento.
   - Consulta y actualiza los datos extraídos.

## Contribución

Si deseas contribuir a este proyecto, por favor:

1. Haz un fork del repositorio.
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit (`git commit -am 'Añadir nueva funcionalidad'`).
4. Sube los cambios a tu fork (`git push origin feature/nueva-funcionalidad`).
5. Crea un Pull Request.

## Licencia

Este proyecto está licenciado bajo MIT.
