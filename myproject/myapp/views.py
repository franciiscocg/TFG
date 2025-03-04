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
        "Analiza el siguiente texto y extrae la información relevante para generar un objeto JSON. "
        f"El texto es: [{get_text()}] "
        "Genera un objeto JSON con la siguiente estructura exacta, completando los campos con la información del texto: "
        f"{get_json_structure()} "
        "Incluye el nombre de la asignatura en 'asignatura.nombre', los horarios de clases (teoría o laboratorio) con sus días, horas y aulas en 'horarios', "
        "las fechas de exámenes en 'examenes', y cualquier fecha cuyo propósito no esté claro en 'fechas_desconocidas'. "
        "Asegúrate de que el JSON esté bien formateado con comillas dobles y sin errores de sintaxis. Devuelve solo el objeto JSON como salida."
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

def analyze_text(request):
    response = generate_response()
    try:
        # Intenta parsear la respuesta como JSON
        json_response = json.loads(response)
        return JsonResponse(json_response)
    except json.JSONDecodeError:
        # Si no es un JSON válido, retorna la respuesta como error
        return JsonResponse({"error": response}, status=500)