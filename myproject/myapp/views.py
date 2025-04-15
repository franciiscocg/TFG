from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
import requests
import json
from django.conf import settings
from archivos.models import UploadedFile
import re
from .models import Asignatura, Fechas, Horario, Profesores
from .serializers import AsignaturaSerializer
from django.core.mail import send_mail
from datetime import datetime, timedelta
from allauth.socialaccount.models import SocialToken, SocialApp
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


# URL del servidor de Ollama
OLLAMA_API_URL = "http://localhost:11434/api/generate"

class ExtractDatesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, file_id):
        file_obj = get_object_or_404(UploadedFile, id=file_id, user=request.user)
        if not file_obj.text_file:
            return Response({"message": "No hay texto extraído para procesar"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with open(file_obj.text_file.path, 'r', encoding='utf-8') as f:
                text_content = f.read()
        except Exception as e:
            return Response({"message": f"Error al leer el archivo de texto: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Obtener ambos modelos desde el request, con valores por defecto
        summary_model = request.data.get("summary_model", "gemma2:9b")
        json_model = request.data.get("json_model", "llama3.1:8b")
        
        # Validar los modelos
        valid_models = ["gemma2:9b", "llama3.1:8b"]
        if summary_model not in valid_models or json_model not in valid_models:
            return Response({"message": "Uno o ambos modelos no son válidos"}, status=status.HTTP_400_BAD_REQUEST)

        def get_json_structure():
            try:
                with open(settings.BASE_DIR / "myapp/files/json/JSON_utilizar.json", "r", encoding="utf-8") as archivo:
                    datos_json = json.load(archivo)
                return json.dumps(datos_json, ensure_ascii=False)
            except FileNotFoundError:
                return "{}"

        def generate_response_summary(text):
            prompt = f"""Eres un asistente de IA avanzado diseñado para resumir textos relacionados con asignaturas universitarias, extrayendo solo la información relevante. A continuación, te proporcionaré un texto que describe una asignatura. Tu tarea es:

1. Analizar el texto y resumirlo, incluyendo únicamente los siguientes tipos de información:
   - Nombre de la asignatura.
   - Nombre del grado al que pertenece.
   - Nombre del departamento responsable.
   - Nombre de la universidad.
   - Condiciones para aprobar (si se mencionan).
   - Fechas relevantes (como exámenes, inicio de prácticas, etc.) con su propósito o descripción.
   - Detalles de horarios (grupos, tipo de sesión, horas y aulas, si se especifican).
   - Nombre, despacho, enlace y horario de tutorías de los profesores (si se mencionan).

2. Descartar cualquier información no relevante para estos campos.

3. Proporciona el resumen como un texto plano, incluyendo solo los datos extraídos y omitiendo explicaciones adicionales.

Ahora, por favor, procesa el siguiente texto:

[{text}]"""

            payload = {
                "model": summary_model,  # Usar el modelo para el resumen
                "prompt": prompt,
                "stream": False
            }

            try:
                response = requests.post(OLLAMA_API_URL, json=payload)
                if response.status_code == 200:
                    resultado = response.json()
                    return resultado["response"]
                else:
                    return f"Error: {response.status_code} - {response.text}"
            except Exception as e:
                return f"Error al conectar con Ollama: {str(e)}"

        def generate_response_json(summary):
            prompt = f"""Eres un asistente de IA avanzado diseñado para transformar un texto resumido sobre una asignatura universitaria en un JSON estructurado. A continuación, te proporcionaré un texto resumido que contiene solo la información relevante para rellenar una estructura JSON. Tu tarea es:

1. Convertir el texto resumido en un JSON con la siguiente estructura:
   [{get_json_structure()}]

2. Si alguna información no está presente en el texto resumido, deja el campo correspondiente con la información más probable, pero mantén la estructura JSON intacta.
3. Asegúrate de que las fechas estén en formato "YYYY-MM-DD" si se proporcionan, y convierte cualquier formato de texto (como "18 de marzo de 2023") a este estándar.
4. Proporciona solo el JSON como salida, sin explicaciones adicionales.

Ahora, por favor, procesa el siguiente texto resumido:

[{summary}]"""

            payload = {
                "model": json_model,  # Usar el modelo para el JSON
                "prompt": prompt,
                "stream": False
            }

            try:
                response = requests.post(OLLAMA_API_URL, json=payload)
                if response.status_code == 200:
                    resultado = response.json()
                    raw_response = resultado["response"]
                    cleaned_response = re.sub(r'^```json\s*|\s*```$', '', raw_response, flags=re.MULTILINE).strip()
                    return cleaned_response
                else:
                    return f"Error: {response.status_code} - {response.text}"
            except Exception as e:
                return f"Error al conectar con Ollama: {str(e)}"

        # Procesar el texto
        summary = generate_response_summary(text_content)
        if summary.startswith("Error"):
            return Response({"error": summary}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        json_response = generate_response_json(summary)
        try:
            json_data = json.loads(json_response)
            file_obj.extracted_data = json_data
            file_obj.save()
            return Response(json_data, status=status.HTTP_200_OK)
        except json.JSONDecodeError as e:
            return Response({"error": f"Formato JSON inválido: {json_response}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ProcessExtractedDataView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, file_id):
        # Obtener el archivo subido asociado al usuario autenticado
        file_obj = get_object_or_404(UploadedFile, id=file_id, user=request.user)

        # Verificar si hay extracted_data
        extracted_data = file_obj.extracted_data
        if not extracted_data or not isinstance(extracted_data, list):
            return Response({
                "message": "No hay datos extraídos válidos para procesar",
                "extracted_data": extracted_data  # Para depuración
            }, status=status.HTTP_400_BAD_REQUEST)

        # Procesar cada elemento en extracted_data
        for data in extracted_data:
            if not isinstance(data, dict):
                continue  # Saltar si no es un diccionario

            # Crear o actualizar la asignatura
            asignatura_data = data.get("asignatura") or {}
            if not isinstance(asignatura_data, dict):
                asignatura_data = {}
            asignatura, _ = Asignatura.objects.get_or_create(
                nombre=asignatura_data.get("nombre", ""),
                defaults={
                    "grado": asignatura_data.get("grado", ""),
                    "departamento": asignatura_data.get("departamento", ""),
                    "universidad": asignatura_data.get("universidad", ""),
                    "condiciones_aprobado": asignatura_data.get("condiciones_aprobado", ""),
                    "user": request.user 
                }
            )

            # Crear fechas asociadas a la asignatura (evitar duplicados)
            fechas_data = data.get("fechas") or []
            for fecha in fechas_data:
                if not isinstance(fecha, dict):
                    continue
                Fechas.objects.get_or_create(
                    asignatura=asignatura,
                    titulo=fecha.get("titulo", ""),
                    fecha=fecha.get("fecha", ""),
                )

            # Crear horarios asociados a la asignatura (evitar duplicados)
            horarios_data = data.get("horarios") or []
            for horario in horarios_data:
                if not isinstance(horario, dict):
                    continue
                Horario.objects.get_or_create(
                    asignatura=asignatura,
                    grupo=horario.get("grupo", ""),
                    tipo=horario.get("tipo", "teoria"),
                    hora=horario.get("hora", ""),
                    aula=horario.get("aula", "")
                )

            # Crear profesores asociados a la asignatura (evitar duplicados)
            profesores_data = data.get("profesores") or []
            for profesor in profesores_data:
                if not isinstance(profesor, dict):
                    continue
                # Si hay un horario asociado al profesor, lo creamos o buscamos
                horario_obj = None
                horario_data = profesor.get("horario")
                if isinstance(horario_data, dict):
                    horario_obj, _ = Horario.objects.get_or_create(
                        asignatura=asignatura,
                        grupo=horario_data.get("grupo", ""),
                        tipo=horario_data.get("tipo", "teoria"),
                        hora=horario_data.get("hora", ""),
                        aula=horario_data.get("aula", "")
                    )

                # Crear o obtener el profesor
                profesor_obj, created = Profesores.objects.get_or_create(
                    nombre=profesor.get("nombre", ""),
                    asignatura=asignatura,
                    defaults={
                        "despacho": profesor.get("despacho", ""),
                        "enlace": profesor.get("enlace", ""),
                        "horario": horario_obj
                    }
                )
                # Si ya existe, actualizar campos opcionales si no están vacíos
                if not created:
                    if profesor.get("despacho") and profesor_obj.despacho != profesor.get("despacho"):
                        profesor_obj.despacho = profesor.get("despacho")
                    if profesor.get("enlace") and profesor_obj.enlace != profesor.get("enlace"):
                        profesor_obj.enlace = profesor.get("enlace")
                    if horario_obj and profesor_obj.horario != horario_obj:
                        profesor_obj.horario = horario_obj
                    profesor_obj.save()

        # Serializar el archivo actualizado
        return Response({
            "message": "Datos extraídos procesados y guardados en la base de datos con éxito",
        }, status=status.HTTP_200_OK)
        

class GetUserCalendarDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            
            asignaturas = Asignatura.objects.filter(user=request.user)

            # Preparar los datos para el calendario
            data = []
            for asignatura in asignaturas:
                fechas = Fechas.objects.filter(asignatura=asignatura)
                horarios = Horario.objects.filter(asignatura=asignatura)
                profesores = Profesores.objects.filter(asignatura=asignatura)

                asignatura_data = {
                    "nombre": asignatura.nombre,
                    "grado": asignatura.grado,
                    "departamento": asignatura.departamento,
                    "universidad": asignatura.universidad,
                    "condiciones_aprobado": asignatura.condiciones_aprobado,
                }

                fechas_data = [
                    {"titulo": fecha.titulo, "fecha": fecha.fecha.strftime("%Y-%m-%d")}
                    for fecha in fechas
                ]

                horarios_data = [
                    {
                        "grupo": horario.grupo,
                        "tipo": horario.tipo,
                        "hora": horario.hora,
                        "aula": horario.aula,
                    }
                    for horario in horarios
                ]

                profesores_data = [
                    {
                        "nombre": profesor.nombre,
                        "despacho": profesor.despacho,
                        "enlace": profesor.enlace,
                        "horario": {
                            "grupo": profesor.horario.grupo,
                            "tipo": profesor.horario.tipo,
                            "hora": profesor.horario.hora,
                            "aula": profesor.horario.aula,
                        } if profesor.horario else None
                    }
                    for profesor in profesores
                ]

                # Intentar vincular con un UploadedFile (opcional, para mantener filename y file_id)
                uploaded_file = UploadedFile.objects.filter(user=request.user).first()
                data.append({
                    "asignatura": asignatura_data,
                    "fechas": fechas_data,
                    "horarios": horarios_data,
                    "profesores": profesores_data,
                    "file_id": uploaded_file.id if uploaded_file else None,
                    "filename": uploaded_file.file.name.split('/')[-1] if uploaded_file else "Desconocido",
                })

            return Response({
                "message": "Datos obtenidos con éxito",
                "data": data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "message": f"Error al obtener los datos: {str(e)}",
                "data": []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
class AsignaturaUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, nombre):
        try:
            asignatura = get_object_or_404(Asignatura, nombre=nombre)
            data = request.data

            # Actualizar datos básicos de la asignatura
            asignatura_serializer = AsignaturaSerializer(asignatura, data=data['asignatura'], partial=True)
            if asignatura_serializer.is_valid():
                asignatura_serializer.save()

            # Actualizar horarios (eliminar y recrear)
            if 'horarios' in data:
                Horario.objects.filter(asignatura=asignatura).delete()
                for horario_data in data['horarios']:
                    Horario.objects.create(asignatura=asignatura, **horario_data)

            # Actualizar fechas (eliminar y recrear)
            if 'fechas' in data:
                Fechas.objects.filter(asignatura=asignatura).delete()
                for fecha_data in data['fechas']:
                    Fechas.objects.create(asignatura=asignatura, **fecha_data)

            # Actualizar profesores (eliminar y recrear)
            if 'profesores' in data:
                Profesores.objects.filter(asignatura=asignatura).delete()
                for profesor_data in data['profesores']:
                    horario_data = profesor_data.pop('horario', None)
                    horario = None
                    if horario_data:
                        horario = Horario.objects.create(asignatura=asignatura, **horario_data)
                    Profesores.objects.create(asignatura=asignatura, horario=horario, **profesor_data)

            return Response({
                "message": "Asignatura actualizada con éxito"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "message": f"Error al actualizar la asignatura: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)
            
class AsignaturaDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, nombre):
        try:
            asignatura = get_object_or_404(Asignatura, nombre=nombre)
            asignatura.delete()  # Esto elimina la asignatura y todo lo relacionado gracias a on_delete=models.CASCADE
            return Response({
                "message": "Asignatura eliminada con éxito"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "message": f"Error al eliminar la asignatura: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)
            
            
class SendDateRemindersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tomorrow = datetime.now().date() + timedelta(days=1)
        
        # Filtra las fechas de mañana solo para el usuario autenticado
        upcoming_dates = Fechas.objects.filter(
            fecha=tomorrow,
            asignatura__user=request.user,
        ).select_related('asignatura')

        if not upcoming_dates:
            return Response({"message": "No hay fechas para mañana."}, status=status.HTTP_200_OK)

        # Construye el contenido del correo
        subject = "StudySift"
        message = f"Hola {request.user.username},\n\nTe recordamos que para mañana {tomorrow.strftime('%d/%m/%Y')}:\n\n"
        html_message = f"""
        <html>
            <body>
                <h2>Hola {request.user.username}</h2>
                <p>Te recordamos que para mañana <strong>{tomorrow.strftime('%d/%m/%Y')}</strong>:</p>
                <ul>
        """

        for event in upcoming_dates:
            message += f"- '{event.titulo}' de {event.asignatura.nombre}\n"
            html_message += f"<li>'<em>{event.titulo}</em>' de <strong>{event.asignatura.nombre}</strong></li>"

        message += "\n¡Prepárate!"
        html_message += """
                </ul>
                <p>¡Prepárate!</p>
            </body>
        </html>
        """

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[request.user.email],
                html_message=html_message,
                fail_silently=False,
            )
            return Response({"message": "Correo enviado exitosamente"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": f"Error al enviar correo: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class ExportToGoogleCalendarView(APIView):
    permission_classes = [IsAuthenticated] # Solo usuarios logueados

    def post(self, request, *args, **kwargs):
        user = request.user
        # Asume que recibes las fechas/eventos en el cuerpo de la solicitud
        # Ejemplo: {'summary': 'Mi Evento desde App', 'start_date': '2025-05-10', 'end_date': '2025-05-11'}
        event_data = request.data
        if not all(k in event_data for k in ['summary', 'start_date', 'end_date']):
             return Response({'error': 'Faltan datos del evento (summary, start_date, end_date)'}, status=400)

        try:
            # --- Obtener credenciales de Google del usuario ---
            google_app = SocialApp.objects.get(provider='google')
            social_token = SocialToken.objects.get(account__user=user, account__provider='google')

            # Verificar si el token de acceso ha expirado (allauth no lo hace autom.)
            # Si necesitas manejar la expiración y el refresh token, la lógica es más compleja
            # Por simplicidad, asumimos que el token es válido o usamos google-auth para manejarlo mejor

            credentials = Credentials(
                token=social_token.token,
                refresh_token=social_token.token_secret, # allauth guarda refresh token aquí
                token_uri='https://oauth2.googleapis.com/token',
                client_id=google_app.client_id,
                client_secret=google_app.secret,
                scopes=['https://www.googleapis.com/auth/calendar.events'] # Asegúrate que los scopes coincidan
            )

            # --- Crear el evento en Google Calendar ---
            service = build('calendar', 'v3', credentials=credentials)

            event = {
                'summary': event_data['summary'],
                'description': event_data.get('description', ''), # Descripción opcional
                'start': {
                    # Google Calendar API espera formato ISO (con hora/zona horaria)
                    # Ajusta esto según cómo almacenas tus fechas
                    'date': event_data['start_date'], # Para eventos de día completo
                    # 'dateTime': '2025-05-10T09:00:00-07:00', # Para eventos con hora específica
                    # 'timeZone': 'America/Los_Angeles', # Opcional si usas dateTime
                },
                'end': {
                    'date': event_data['end_date'], # Para eventos de día completo
                    # 'dateTime': '2025-05-10T17:00:00-07:00',
                    # 'timeZone': 'America/Los_Angeles',
                },
                # Puedes añadir más campos: recurrence, attendees, etc.
            }

            created_event = service.events().insert(calendarId='primary', body=event).execute()
            print(f"Evento creado: {created_event.get('htmlLink')}")

            return Response({'success': True, 'message': 'Evento exportado a Google Calendar', 'event_link': created_event.get('htmlLink')})

        except SocialToken.DoesNotExist:
            return Response({'error': 'El usuario no ha vinculado su cuenta de Google.'}, status=400)
        except HttpError as error:
            print(f'Ocurrió un error con Google Calendar API: {error}')
            # Podrías intentar refrescar el token aquí si el error es de autenticación
            return Response({'error': f'Error al exportar a Google Calendar: {error}'}, status=500)
        except Exception as e:
             print(f'Ocurrió un error inesperado: {e}')
             return Response({'error': 'Ocurrió un error inesperado en el servidor.'}, status=500)