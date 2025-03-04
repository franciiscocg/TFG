import requests
import json


# URL del servidor de Ollama (por defecto en localhost:11434)
OLLAMA_API_URL = "http://localhost:11434/api/generate"

def estructura_json():
    with open("myapp/files/json/JSON_ejemplo.json", "r", encoding="utf-8") as archivo:
        datos_json = json.load(archivo)
    # Convertir el contenido JSON a una cadena para incluirlo en el prompt
    return json.dumps(datos_json, ensure_ascii=False)

def texto():
    with open("myapp/files/txt/result.txt", "r", encoding="utf-8") as archivo:
        return archivo.read() 
        
# Función para enviar una solicitud al modelo
def generar_respuesta():
    # Datos de la solicitud
    prompt= "Analiza el siguiente texto y extrae la información relevante para generar un objeto JSON. El texto es: [" + texto() + "] Genera un objeto JSON con la siguiente estructura exacta, completando los campos con la información del texto. Usa los valores de esta plantilla como guía y reemplázalos con los datos extraídos del texto. Si falta información en el texto, usa valores razonables basados en el contexto o déjalos como están si no se pueden deducir: " + estructura_json() + "Asegúrate de que el JSON esté bien formateado con comillas dobles y sin errores de sintaxis. Devuelve solo el objeto JSON como salida."
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
            print(f"Error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Error al conectar con Ollama: {e}")
        return None

if __name__ == "__main__":
    respuesta = generar_respuesta()
    print(respuesta)