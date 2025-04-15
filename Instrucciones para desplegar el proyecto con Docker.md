# Instrucciones para desplegar el proyecto con Docker

Este documento proporciona instrucciones detalladas para desplegar el proyecto TFG completo (backend Django + frontend React) utilizando Docker y Docker Compose.

## Requisitos previos

Antes de comenzar, asegúrate de tener instalado:

1. [Docker](https://docs.docker.com/get-docker/)
2. [Docker Compose](https://docs.docker.com/compose/install/)

## Estructura de archivos Docker

Se han creado tres archivos principales para facilitar el despliegue:

1. `Dockerfile` (en la raíz del proyecto): Define la imagen para el backend Django.
2. `frontend/Dockerfile` (en el directorio frontend): Define la imagen para el frontend React.
3. `docker-compose.yml` (en la raíz del proyecto): Configura ambos servicios, sus volúmenes, puertos y la comunicación entre ellos.

## Pasos para desplegar la aplicación fullstack

### 1. Clonar el repositorio (si aún no lo has hecho)

```bash
git clone https://github.com/franciiscocg/TFG.git
cd TFG
```

### 2. Construir y levantar los contenedores

```bash
docker-compose up --build
```

Este comando construirá las imágenes Docker para el backend y el frontend según las especificaciones de los Dockerfiles y levantará los contenedores. La opción `--build` asegura que las imágenes se construyan antes de iniciar los contenedores.

### 3. Acceder a la aplicación

Una vez que los contenedores estén en funcionamiento, puedes acceder a:

- **Frontend (React)**: http://localhost:3000
- **Backend (Django API)**: http://localhost:8000

## Comunicación entre servicios

El frontend está configurado para comunicarse con el backend a través de la red interna de Docker. En el entorno de desarrollo, las solicitudes API desde el frontend al backend se redirigen automáticamente gracias a la configuración de proxy en el `package.json` del frontend y la configuración de red en `docker-compose.yml`.

## Comandos útiles

### Ver los logs de la aplicación

```bash
# Ver logs de ambos servicios
docker-compose logs -f

# Ver logs solo del backend
docker-compose logs -f backend

# Ver logs solo del frontend
docker-compose logs -f frontend
```

### Detener los contenedores

```bash
docker-compose down
```

### Ejecutar comandos específicos

```bash
# Ejecutar comandos en el backend
docker-compose exec backend python manage.py [comando]

# Ejecutar comandos en el frontend
docker-compose exec frontend npm [comando]
```

Ejemplos:
- Crear un superusuario: `docker-compose exec backend python manage.py createsuperuser`
- Instalar una nueva dependencia en el frontend: `docker-compose exec frontend npm install [paquete]`

## Desarrollo y producción

### Modo desarrollo

La configuración actual está optimizada para desarrollo, con:
- Volúmenes montados para reflejar cambios en tiempo real
- DEBUG=True en el backend
- Servidor de desarrollo de React en el frontend

### Preparación para producción

Para un entorno de producción, considera realizar los siguientes ajustes:

1. En el backend:
   - Modificar `DEBUG=False` en las variables de entorno
   - Configurar una base de datos PostgreSQL en lugar de SQLite
   - Configurar HTTPS con certificados SSL

2. En el frontend:
   - El Dockerfile ya está configurado para construir la aplicación en modo producción
   - Considera utilizar un servidor web como Nginx para servir los archivos estáticos

## Solución de problemas

### Problemas de conexión entre frontend y backend

Si el frontend no puede conectarse al backend:
1. Verifica que ambos contenedores estén ejecutándose: `docker-compose ps`
2. Comprueba los logs para errores: `docker-compose logs -f`
3. Asegúrate de que CORS esté correctamente configurado en el backend

### Errores de dependencias

Si encuentras errores relacionados con dependencias faltantes:
1. Para el backend: Añade las dependencias a `requirements.txt` y reconstruye: `docker-compose up --build backend`
2. Para el frontend: Añade las dependencias a `package.json` y reconstruye: `docker-compose up --build frontend`
