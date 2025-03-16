from django.http import JsonResponse
import requests
import json
from django.conf import settings

# URL del servidor de Ollama
OLLAMA_API_URL = "http://localhost:11434/api/generate"

def get_json_structure():
    try:
        with open(settings.BASE_DIR / "myapp/files/json/JSON_ejemplo.json", "r", encoding="utf-8") as archivo:
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
    prompt = f"""Assistant, you need to fill in a JSON structure based on information from a provided text. The JSON has placeholders that should be replaced with data from the text. If a piece of information isn't found in the text, leave its placeholder unchanged.

- Maintain the exact formatting and case from the text for string values.
- Convert numeric words to numbers for numeric fields.
- Handle nested structures by filling in their respective fields.
- Output only the filled JSON as a valid JSON string.

Text: {get_text()}
JSON structure: {get_json_structure()}

Output only the filled JSON."""

    payload = {
        "model": "llama3.1:8b",
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