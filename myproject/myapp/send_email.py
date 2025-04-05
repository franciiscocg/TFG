from django.core.mail import send_mail
from django.conf import settings
from .models import Fechas
from datetime import datetime, timedelta

def send_date_reminders():
    tomorrow = datetime.now().date() + timedelta(days=1)
    upcoming_dates = Fechas.objects.filter(
        fecha=tomorrow,
        asignatura__user__email__isnull=False
    ).select_related('asignatura__user')

    for event in upcoming_dates:
        subject = f"Recordatorio: {event.titulo}"
        message = f"""
        Hola {event.asignatura.user.username},
        Te recordamos que mañana {tomorrow.strftime('%d/%m/%Y')} 
        es la fecha para "{event.titulo}" de {event.asignatura.nombre}.
        ¡Prepárate!
        """
        html_message = f"""
        <html>
            <body>
                <h2>Hola {event.asignatura.user.username}</h2>
                <p>Te recordamos que mañana <strong>{tomorrow.strftime('%d/%m/%Y')}</strong> 
                es la fecha para "<em>{event.titulo}</em>" de <strong>{event.asignatura.nombre}</strong>.</p>
                <p>¡Prepárate!</p>
            </body>
        </html>
        """

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[event.asignatura.user.email],
            html_message=html_message,  # Añade versión HTML
            fail_silently=False,
        )
        print(f"Correo enviado a {event.asignatura.user.email}")