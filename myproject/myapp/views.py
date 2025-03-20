from django.http import JsonResponse
import requests
import json
from django.conf import settings

# URL del servidor de Ollama
OLLAMA_API_URL = "http://localhost:11434/api/generate"

def get_json_structure():
    try:
        with open(settings.BASE_DIR / "myapp/files/json/JSON_utilizar.json", "r", encoding="utf-8") as archivo:
            datos_json = json.load(archivo)
        return json.dumps(datos_json, ensure_ascii=False)
    except FileNotFoundError:
        return "{}"  # Retorna un JSON vacío como fallback

def get_text():
    try:
        with open(settings.BASE_DIR / "myapp/files/txt/result.txt", "r", encoding="utf-8") as archivo:
            return archivo.read()
    except FileNotFoundError:
        return ""  # Retorna string vacío como fallback

def generate_response_sumary():
    prompt = f"""Eres un asistente de IA avanzado diseñado para resumir textos relacionados con asignaturas universitarias, extrayendo solo la informacion relevante. A continuación, te proporcionaré un texto que describe una asignatura. Tu tarea es:

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

[{get_text()}]"""

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
    
def generate_response_json():
    prompt = f"""Eres un asistente de IA avanzado diseñado para transformar un texto resumido sobre una asignatura universitaria en un JSON estructurado. A continuación, te proporcionaré un texto resumido que contiene solo la información relevante para rellenar una estructura JSON. Tu tarea es:

1. Convertir el texto resumido en un JSON con la siguiente estructura:
   [{get_json_structure()}]

2. Si alguna información no está presente en el texto resumido, deja el campo correspondiente con la informacion mas probable , pero mantén la estructura JSON intacta.
3. Asegúrate de que las fechas estén en formato "YYYY-MM-DD" si se proporcionan, y convierte cualquier formato de texto (como "18 de marzo de 2023") a este estándar.
4. Proporciona solo el JSON como salida, sin explicaciones adicionales.

Ahora, por favor, procesa el siguiente texto resumido:

[{generate_response_sumary()}]"""

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
    
    
def analyze_text(request):
    response = generate_response_json()
    try:
        # Intenta parsear la respuesta como JSON
        json_response = json.loads(response)
        return JsonResponse(json_response, safe=False)  # Permite listas y otros tipos de datos
    except json.JSONDecodeError:
        # Si no es un JSON válido, retorna la respuesta como error
        return JsonResponse({"error": response}, status=500)
