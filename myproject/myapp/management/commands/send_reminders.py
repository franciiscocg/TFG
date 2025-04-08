from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from myapp.models import Fechas 
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Envía recordatorios de fechas que faltan un día'

    def handle(self, *args, **options):
        # Fecha de mañana
        tomorrow = timezone.now().date() + timedelta(days=1)
        
        # Filtra las fechas de mañana
        upcoming_dates = Fechas.objects.filter(
            fecha=tomorrow,
            asignatura__user__email__isnull=False
        ).select_related('asignatura__user')

        if not upcoming_dates:
            self.stdout.write(self.style.WARNING('No hay fechas para mañana.'))
            return

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

            try:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[event.asignatura.user.email],
                    html_message=html_message,
                    fail_silently=False,
                )
                self.stdout.write(self.style.SUCCESS(f"Correo enviado a {event.asignatura.user.email}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error al enviar correo a {event.asignatura.user.email}: {str(e)}"))