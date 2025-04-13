from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer
from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings
from django.contrib.auth import get_user_model
from urllib.parse import urlencode
from rest_framework_simplejwt.tokens import RefreshToken # Importar para generar tokens
import logging
import uuid # Mantén este si lo usas en el Social Adapter

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Usuario registrado con éxito"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


logger = logging.getLogger(__name__)
User = get_user_model()

class CustomAccountAdapter(DefaultAccountAdapter):

    def get_login_redirect_url(self, request):
        """
        Sobrescribe la URL de redirección después de CUALQUIER login exitoso
        (manejado por allauth, incluyendo social) para añadir tokens JWT.
        """
        # URL base de tu frontend + ruta específica para manejar este callback
        # Asegúrate que '/auth/callback/' no exista ya para otra cosa.
        frontend_callback_url = getattr(settings, 'FRONTEND_CALLBACK_URL', f"{settings.FRONTEND_BASE_URL}/auth/callback/")

        # Verificamos si el usuario está autenticado en la petición
        if request.user.is_authenticated:
            try:
                # Generamos los tokens JWT para el usuario que acaba de iniciar sesión
                refresh = RefreshToken.for_user(request.user)
                access_token = str(refresh.access_token)

                # Preparamos los parámetros para la URL
                params = {
                    'access_token': access_token,
                }

                # Construimos la URL final con los parámetros codificados
                redirect_url = f"{frontend_callback_url}?{urlencode(params)}"
                logger.info(f"Redirecting logged in user to frontend with tokens: {frontend_callback_url}")
                return redirect_url
            except Exception as e:
                logger.error(f"Error generating JWT or redirect URL in AccountAdapter: {e}")
                # Si falla la generación de tokens, redirige a una página de error o login
                return getattr(settings, 'FRONTEND_LOGIN_URL', f"{settings.FRONTEND_BASE_URL}/login")

        else:
            # Si por alguna razón el usuario no está autenticado aquí, redirige a login
            logger.warning("get_login_redirect_url called but user is not authenticated.")
            return getattr(settings, 'FRONTEND_LOGIN_URL', f"{settings.FRONTEND_BASE_URL}/login")