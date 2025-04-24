import time
import subprocess
from datetime import datetime

def run_command():
    try:
        result = subprocess.run(
            ["python", "manage.py", "send_reminders"], 
            capture_output=True, 
            text=True,
            cwd="/app"
        )

    except Exception as e:
        return False

def main():
    while True:
        now = datetime.now()
        # Ejecutar el comando a las 00:00 todos los días
        if now.hour == 7 and now.minute == 0:
            success = run_command()
            time.sleep(60)
        else:
            time.sleep(30)

if __name__ == "__main__":
    main()
