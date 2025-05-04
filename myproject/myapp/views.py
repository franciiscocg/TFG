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
import os
from rest_framework.exceptions import ValidationError
from django.core.exceptions import ObjectDoesNotExist
from google import genai
from google.genai import types



# URL del servidor de Ollama

OLLAMA_API_URL = os.environ.get('OLLAMA_API_URL') + "/api/generate"

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

        # Obtener parámetros desde el request
        model_mode = request.data.get("model_mode", "local")
        summary_model = request.data.get("summary_model", "gemma2:9b")
        json_model = request.data.get("json_model", "gemma2:9b")

        # Validar los modelos si el modo es local
        if model_mode == "local":
            valid_models = ["gemma2:9b", "llama3.1:8b"]
            if summary_model not in valid_models or json_model not in valid_models:
                return Response({"message": "Uno o ambos modelos no son válidos"}, status=status.HTTP_400_BAD_REQUEST)

        def generate_gemini_response(text):
            try:
                client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
                model = "gemini-2.5-flash-preview-04-17"
                contents = [
                    types.Content(
                        role="user",
                        parts=[types.Part.from_text(text=text)],
                    ),
                ]
                generate_content_config = types.GenerateContentConfig(
                    response_mime_type="application/json",  # Cambiado a JSON para forzar formato correcto
                    system_instruction=[
                        types.Part.from_text(text=f"""Actúa como un experto en extracción y estructuración de información a partir de documentos académicos (guías docentes, syllabus, etc.). Tu tarea es analizar el texto proporcionado y generar un único objeto JSON que contenga la información relevante sobre la asignatura, siguiendo estrictamente la estructura especificada.
                                             **Estructura JSON Requerida:**
                                             {get_json_structure()}
                                             Asegúrate de que el JSON sea sintácticamente correcto, sin comas adicionales ni errores de formato."""),
                    ],
                )

                response_text = ""
                for chunk in client.models.generate_content_stream(
                    model=model,
                    contents=contents,
                    config=generate_content_config,
                ):
                    response_text += chunk.text

                return response_text
            except Exception as e:
                return f"Error al conectar con Gemini API: {str(e)}"

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
                "model": summary_model,
                "prompt": prompt,
                "stream": False
            }

            try:
                response = requests.post(OLLAMA_API_URL, json=payload)
                response.raise_for_status()
                return response.json()["response"]
            except Exception as e:
                return f"Error al conectar con Ollama: {str(e)}"

        def clean_json_string(json_string):
            # Eliminar bloques de código Markdown
            json_string = re.sub(r'^```json\s*|\s*```$', '', json_string, flags=re.MULTILINE).strip()
            # Eliminar comas finales antes de corchetes o llaves
            json_string = re.sub(r',\s*([\]\}])', r'\1', json_string)
            # Reemplazar comillas simples por dobles (si el modelo las usa)
            json_string = json_string.replace("'", '"')
            # Asegurar que el string sea UTF-8 válido
            json_string = json_string.encode('utf-8').decode('utf-8')
            # Asegurar que el string termine correctamente
            json_string = json_string.strip()
            return json_string

        def generate_response_json(summary):
            prompt = f"""Eres un asistente de IA avanzado diseñado para transformar un texto resumido sobre una asignatura universitaria en un JSON estructurado. A continuación, te proporcionaré un texto resumido que contiene solo la información relevante para rellenar una estructura JSON. Tu tarea es:

            1. Convertir el texto resumido en un JSON con la siguiente estructura:
               {get_json_structure()}

            2. Si alguna información no está presente en el texto resumido, deja el campo correspondiente con la información más probable, pero mantén la estructura JSON intacta.
            3. Asegúrate de que las fechas estén en formato "YYYY-MM-DD" si se proporcionan, y convierte cualquier formato de texto (como "18 de marzo de 2023") a este estándar.
            4. Proporciona solo el JSON como salida, sin explicaciones adicionales, y asegúrate de que sea sintácticamente correcto, sin comas adicionales ni errores de formato.

            Ahora, por favor, procesa el siguiente texto resumido:

            [{summary}]"""

            payload = {
                "model": json_model,
                "prompt": prompt,
                "stream": False
            }

            try:
                response = requests.post(OLLAMA_API_URL, json=payload)
                response.raise_for_status()
                raw_response = response.json()["response"]
                cleaned_response = clean_json_string(raw_response)
                # Validar el JSON antes de devolverlo
                json.loads(cleaned_response)  # Esto lanzará un error si el JSON es inválido
                return cleaned_response
            except json.JSONDecodeError as e:
                return f"Error: JSON inválido generado: {cleaned_response}"
            except Exception as e:
                return f"Error al conectar con Ollama: {str(e)}"

        # Procesar según el modo
        if model_mode == "api":
            json_response = generate_gemini_response(text_content)
            json_data = json.loads(clean_json_string(json_response))
            file_obj.extracted_data = json_data
            file_obj.save()
            return Response(json_data, status=status.HTTP_200_OK)
        else:
            summary = generate_response_summary(text_content)
            if summary.startswith("Error"):
                return Response({"error": summary}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            json_response = generate_response_json(summary)
            if json_response.startswith("Error"):
                return Response({"error": json_response}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
        if not extracted_data:
            return Response({
                "message": "No hay datos extraídos válidos para procesar",
                "extracted_data": extracted_data  # Para depuración
            }, status=status.HTTP_400_BAD_REQUEST)

        # Normalizar extracted_data como una lista
        if isinstance(extracted_data, dict):
            data_list = [extracted_data]  # Convertir objeto en lista de un solo elemento
        elif isinstance(extracted_data, list):
            data_list = extracted_data
        else:
            return Response({
                "message": "Formato de datos extraídos no válido",
                "extracted_data": extracted_data
            }, status=status.HTTP_400_BAD_REQUEST)

        # Procesar cada elemento en data_list
        for data in data_list:
            if not isinstance(data, dict):
                continue 
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
                    fecha=fecha.get("fecha", "")
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
                    aula=horario.get("aula", ""),
                    dia=horario.get("dia", "Lunes")
                    
                )

            # Crear profesores asociados a la asignatura (evitar duplicados)
            profesores_data = data.get("profesores") or []
            for profesor in profesores_data:
                if not isinstance(profesor, dict):
                    continue
                # Manejar el campo horario del profesor
                horario_obj = None
                horario_data = profesor.get("horario")
                if isinstance(horario_data, dict):  # Verificar si es un diccionario válido
                    horario_obj, _ = Horario.objects.get_or_create(
                        asignatura=asignatura,
                        grupo=horario_data.get("grupo", ""),
                        tipo=horario_data.get("tipo", "teoria"),
                        hora=horario_data.get("hora", ""),
                        aula=horario_data.get("aula", ""),
                    )
                # Si horario es null o una cadena vacía, horario_obj sigue siendo None

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
                    if horario_obj is not None and profesor_obj.horario != horario_obj:
                        profesor_obj.horario = horario_obj
                    elif horario_data is None and profesor_obj.horario is not None:
                        profesor_obj.horario = None  # Permitir actualizar a null
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
                        "dia": horario.dia,
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
                            "dia": profesor.horario.dia,
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
            asignatura = get_object_or_404(Asignatura, nombre=nombre, user=request.user)
        
        except ObjectDoesNotExist:
            # If you want DRF's default 404 handling, you could re-raise Http404
            # raise Http404
            # Or return a custom 404 response directly
                return Response(
                 {"message": f"Asignatura '{nombre}' no encontrada para este usuario."},
                 status=status.HTTP_404_NOT_FOUND
                )
        try:        
            data = request.data
            asignatura_data = data.get('asignatura')
            if asignatura_data is None:
                raise ValidationError({"asignatura": ["Este campo es requerido."]})
            # Actualizar datos básicos de la asignatura
            asignatura_serializer = AsignaturaSerializer(asignatura, data=asignatura_data, partial=True)
            asignatura_serializer.is_valid(raise_exception=True) # Raise ValidationError if invalid
            asignatura_serializer.save()

            # Actualizar horarios (eliminar y recrear)
            if 'horarios' in data:
                    # Check if data['horarios'] is a list
                    if not isinstance(data['horarios'], list):
                         raise ValidationError({"horarios": ["Se esperaba una lista de objetos."]})
                    Horario.objects.filter(asignatura=asignatura).delete()
                    for horario_data in data['horarios']:
                         # Add validation for horario_data if necessary
                        Horario.objects.create(asignatura=asignatura, **horario_data)

            # Actualizar fechas (eliminar y recrear)
            if 'fechas' in data:
                    if not isinstance(data['fechas'], list):
                        raise ValidationError({"fechas": ["Se esperaba una lista de objetos."]})
                    Fechas.objects.filter(asignatura=asignatura).delete()
                    for fecha_data in data['fechas']:
                        # Add validation for fecha_data if necessary
                        Fechas.objects.create(asignatura=asignatura, **fecha_data)

            # Actualizar profesores (eliminar y recrear)
            if 'profesores' in data:
                    if not isinstance(data['profesores'], list):
                        raise ValidationError({"profesores": ["Se esperaba una lista de objetos."]})
                    Profesores.objects.filter(asignatura=asignatura).delete()
                    for profesor_data in data['profesores']:
                        # Add validation for profesor_data if necessary
                        horario_data = profesor_data.pop('horario', None)
                        horario = None
                        if horario_data:
                            horario = Horario.objects.create(asignatura=asignatura, **horario_data)
                        Profesores.objects.create(asignatura=asignatura, horario=horario, **profesor_data)
                        
            return Response({
                "message": "Asignatura actualizada con éxito"
            }, status=status.HTTP_200_OK)
            
            # Catch specific errors related to data processing/validation
        except ValidationError as e:
            return Response({
                "message": "Error de validación.",
                "errors": e.detail
            }, status=status.HTTP_400_BAD_REQUEST)
        except (KeyError, TypeError, ValueError) as e:
            return Response({
                "message": "Error en el formato o tipo de los datos proporcionados.",
                "error_detail": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e: # Catch *really* unexpected processing errors
            # Log the full traceback here for debugging
            import traceback
            traceback.print_exc()
            return Response({
                "message": "Error interno grave durante el procesamiento.",
                "error_detail": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e: # Catch truly unexpected errors (e.g., DB connection issues)
             # Log the error
            return Response({
                "message": "Error inesperado en el servidor."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
class AsignaturaDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, nombre):
        # get_object_or_404 will raise Http404 if not found.
        # DRF's default exception handler will turn this into a 404 response.
        asignatura = get_object_or_404(Asignatura, nombre=nombre, user=request.user)
        try:
            asignatura.delete() # This operation itself could potentially fail (rarely)
            return Response({
                "message": "Asignatura eliminada con éxito"
            }, status=status.HTTP_200_OK)
        except Exception as e: # Catch unexpected errors during the delete operation itself
            # Log the error for debugging
            return Response({
                "message": f"Error interno al intentar eliminar la asignatura: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
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
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        event_data = request.data

        # Validate required fields
        if not all(k in event_data for k in ['summary', 'start_date', 'end_date']):
            return Response(
                {'error': 'Faltan datos del evento (summary, start_date, end_date)'},
                status=400
            )

        try:
            # Get Google credentials
            google_app = SocialApp.objects.get(provider='google')
            social_token = SocialToken.objects.get(account__user=user, account__provider='google')

            credentials = Credentials(
                token=social_token.token,
                refresh_token=social_token.token_secret,
                token_uri='https://oauth2.googleapis.com/token',
                client_id=google_app.client_id,
                client_secret=google_app.secret,
                scopes=['https://www.googleapis.com/auth/calendar.events']
            )

            # Build Google Calendar service
            service = build('calendar', 'v3', credentials=credentials)

            # Prepare event data
            event = {
                'summary': event_data['summary'],
                'description': event_data.get('description', ''),
                'start': {
                    'date': event_data['start_date'],
                },
                'end': {
                    'date': event_data['end_date'],
                },
                # Optionally, store a unique ID in extendedProperties for precise matching
                'extendedProperties': {
                    'private': {
                        'studySiftEventId': event_data.get('event_id', f"{event_data['summary']}_{event_data['start_date']}"),
                    }
                }
            }

            # Search for existing events on the same date
            start_date = event_data['start_date']
            end_date = event_data['end_date']
            calendar_id = 'primary'

            # Query events in the date range
            time_min = f"{start_date}T00:00:00Z"
            time_max = f"{end_date}T23:59:59Z"
            events_result = service.events().list(
                calendarId=calendar_id,
                timeMin=time_min,
                timeMax=time_max,
                q=event_data['summary'],  # Search by summary
                singleEvents=True,
                orderBy='startTime'
            ).execute()

            existing_events = events_result.get('items', [])

            # Check if an event matches (by summary and date, or by studySiftEventId)
            matching_event = None
            for existing_event in existing_events:
                existing_start = existing_event.get('start', {}).get('date')
                existing_summary = existing_event.get('summary', '')
                existing_event_id = (
                    existing_event.get('extendedProperties', {})
                    .get('private', {})
                    .get('studySiftEventId', '')
                )

                if (
                    existing_start == start_date and
                    (
                        existing_summary == event_data['summary'] or
                        existing_event_id == event_data.get('event_id', f"{event_data['summary']}_{start_date}")
                    )
                ):
                    matching_event = existing_event
                    break

            if matching_event:
                # Update existing event
                event_id = matching_event['id']
                updated_event = service.events().update(
                    calendarId=calendar_id,
                    eventId=event_id,
                    body=event
                ).execute()
                print(f"Evento actualizado: {updated_event.get('htmlLink')}")
                return Response({
                    'success': True,
                    'message': 'Evento actualizado en Google Calendar',
                    'event_link': updated_event.get('htmlLink')
                })
            else:
                # Create new event
                created_event = service.events().insert(
                    calendarId=calendar_id,
                    body=event
                ).execute()
                print(f"Evento creado: {created_event.get('htmlLink')}")
                return Response({
                    'success': True,
                    'message': 'Evento exportado a Google Calendar',
                    'event_link': created_event.get('htmlLink')
                })

        except SocialToken.DoesNotExist:
            return Response(
                {'error': 'El usuario no ha vinculado su cuenta de Google.'},
                status=400
            )
        except HttpError as error:
            print(f'Ocurrió un error con Google Calendar API: {error}')
            return Response(
                {'error': f'Error al exportar a Google Calendar: {error}'},
                status=500
            )
        except Exception as e:
            print(f'Ocurrió un error inesperado: {e}')
            return Response(
                {'error': 'Ocurrió un error inesperado en el servidor.'},
                status=500
            )
            
