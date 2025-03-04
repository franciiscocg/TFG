from django.http import JsonResponse
import requests
import json
from django.conf import settings

# URL del servidor de Ollama
OLLAMA_API_URL = "http://localhost:11434/api/generate"

def get_json_structure():
    try:
        with open(settings.BASE_DIR / "myapp/files/json/JSON_ejemplo_minimo.json", "r", encoding="utf-8") as archivo:
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

def generate_response():
    prompt = (
        "Lee el siguiente texto y haz un resumen breve en texto plano que incluya las fechas y los elementos más importantes. "
        "El texto es:" + get_text() +
        "Enfócate en identificar el nombre de la asignatura, los horarios de clases con días, horas y aulas, "
        "las fechas de exámenes, y cualquier otra fecha mencionada. "
        "Devuelve solo el resumen en texto plano, sin comentarios adicionales."
    )
    payload = {
        "model": "deepseek-r1:7b",
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
    prompt = """Extrae la información clave del siguiente texto y rellena un JSON con la siguiente estructura:

{
  "asignatura": {
    "nombre": ""
  },
  "horarios": [
    {
      "tipo": "",
      "dia": "",
      "hora": "",
      "aula": ""
    }
  ],
  "examenes": [
    {
      "fecha": ""
    }
  ],
  "fechas_desconocidas": [
    ""
  ]
}

Instrucciones:
- Extrae el nombre de la asignatura y colócalo en "nombre".
- Extrae los horarios de clase, indicando "tipo" (por ejemplo, "teoría" o "práctica"), "dia" (día de la semana), "hora" (rango horario) y "aula" (número de aula). Si hay varios horarios, agrégalos como objetos dentro del array "horarios".
- Extrae las fechas de exámenes y agrégalas dentro del array "examenes".
- Si hay fechas mencionadas en el texto pero no se pueden clasificar claramente como horarios o exámenes, inclúyelas en "fechas_desconocidas".
- Devuelve solo el JSON final sin explicaciones adicionales.

Texto de entrada:
{"error": "<think>\nOkay, I need to help the user create a brief summary of the provided academic course information. The user wants me to focus on identifying key elements like the assignment name, class schedules with days, times, and locations, exam dates, and any other important dates.\n\nFirst, I'll start by extracting the assignment name. Looking at the text, it mentions \"Complementos de Bases de Datos\" which translates to \"plements of Database Basics.\" That's clear enough.\n\nNext, I need to find the class schedule information. Scanning through the data, there are two groups listed: Grupo 1 and Grupo 2. Each has their own meeting times and locations. Grupo 1 meets on Mondays from 10:40 to 12:30 and Tuesdays from 12:40 to 14:30 in room A2.14. Grupo 2 is on Mondays from 17:40 to 19:30 and Tuesdays from 15:30 to 17:20 in H1.10.\n\nThen, I look for exam dates. The text mentions two tests (EXA1 and EXA2) scheduled for March 18th and May 13th. There's also an assignment component (TCL) with a maximum of 2 points and a project worth 6 points each.\n\nI should note the deadlines or submission dates, but in this case, I only see information about the projects being submitted up to the third call. The user didn't mention specific dates for project submissions beyond that, so I won't include those unless explicitly stated.\n\nLastly, there's an evaluation section with continuous evaluation and ordinary evaluation details. For continuous evaluation, students need at least 4 points in each part (tests, assignments, etc.), but since the user asked to avoid extra comments, I'll just mention it briefly.\n\nPutting this all together, I'll structure the summary with sections for the course name, schedule details, exam dates, and evaluations as outlined. I'll make sure to present everything clearly without adding any additional information or explanations beyond what's required.\n</think>\n\n**Asignatura:** Complementos de Bases de Datos (Mplements de Bases de Dades)  \n**Fecha de inscripci\u00f3n en grupo laboratorio:** 11 de febrero.  \n\n**Horarios y grupos:**\n- **Grupo 1:** Martes aulas F1.32, F1.33-A2.14; Mi\u00e9rcoles 10:40-12:30 y 12:40-14:30.  \n- **Grupo 2:**Martes aula H1.10, F1.30, F1.33; Mi\u00e9rcoles 15:30-17:20 y 17:40-19:30.  \n\n**Pruebas ex\u00f3menes:**\n- **EXA1:** 18 de marzo.  \n- **EXA2:** 13 de mayo.  \n\n**Tareas principales:**\n- **Tarea de aprendizaje en grupo (TAL):** M\u00e1ximo de 2 puntos.  \n- **Proyecto:** 6 puntos, con restricciones en la entrega hasta la Tercera Convocatoria."}


"""
    payload = {
        "model": "deepseek-r1:7b",
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
    response = generate_response()
    response = generate_response_json()
    try:
        # Intenta parsear la respuesta como JSON
        json_response = json.loads(response)
        return JsonResponse(json_response)
    except json.JSONDecodeError:
        # Si no es un JSON válido, retorna la respuesta como error
        return JsonResponse({"error": response}, status=500)