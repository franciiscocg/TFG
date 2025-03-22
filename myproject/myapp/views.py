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
                "model": "gemma2:9b",
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
                "model": "gemma2:9b",
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