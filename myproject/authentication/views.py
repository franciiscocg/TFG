from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer
from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
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
    
class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):

    def is_auto_signup_allowed(self, request, sociallogin):
        """
        Determina si se permite el auto-registro basado en la configuración global.
        Esto asegura que respetamos el setting SOCIALACCOUNT_AUTO_SIGNUP.
        """
        allow_signup = getattr(settings, 'SOCIALACCOUNT_AUTO_SIGNUP', False)
        logger.debug(f"CustomSocialAccountAdapter: is_auto_signup_allowed check. Setting SOCIALACCOUNT_AUTO_SIGNUP is {allow_signup}")
        return allow_signup

    def populate_user(self, request, sociallogin, data):
        """
        Rellena la instancia del usuario ('user') usando datos del 'sociallogin' y 'data'.
        Se llama durante el auto-registro (auto-signup).
        Aquí nos aseguramos de que el campo 'username' tenga un valor único y válido.
        """
        # Primero, llamamos al método original de la clase padre para que
        # rellene los datos básicos que sí puede obtener (email, first_name, last_name)
        user = super().populate_user(request, sociallogin, data)

        # Extraemos los datos que podríamos necesitar (ya poblados por super() o desde 'data')
        username = getattr(user, 'username', None) # Obtenemos el username si ya existe
        email = getattr(user, 'email', None)       # Obtenemos el email
        first_name = getattr(user, 'first_name', None)
        last_name = getattr(user, 'last_name', None)

        # --- Lógica para generar Username si está vacío ---
        # Comprobamos si el username está vacío o es None después de la población inicial
        if not username:
            logger.debug("Username is missing, attempting to generate one.")
            if email:
                # Intentar usar el prefijo del email como username inicial
                # Quitamos caracteres no alfanuméricos que no suelen permitirse en usernames
                username_prefix = email.split('@')[0]
                username = "".join(filter(str.isalnum, username_prefix))
                # Si después de filtrar queda vacío (email era raro), pasamos a otro método
                if not username:
                     logger.warning(f"Username from email prefix resulted in empty string for email: {email}")
                     username = None # Forzar a usar otro método
                else:
                     logger.debug(f"Generated username candidate from email prefix: {username}")

            # Si no pudimos obtener username del email, intentar con nombre/apellido
            if not username and first_name:
                 fname_clean = "".join(filter(str.isalnum, first_name.lower()))
                 if last_name:
                      lname_clean = "".join(filter(str.isalnum, last_name.lower()))
                      username = f"{fname_clean}.{lname_clean}"
                 else:
                      username = fname_clean
                 logger.debug(f"Generated username candidate from first/last name: {username}")


            # Si AÚN no tenemos username (email raro, sin nombre/apellido), usar UUID
            if not username:
                username = uuid.uuid4().hex[:15] # Usar los primeros 15 caracteres de un UUID
                logger.debug(f"Generated username candidate using UUID: {username}")

            # --- Asegurar Unicidad del Username ---
            # Comprobamos si el username generado ya existe en la BD
            # y añadimos un sufijo numérico si es necesario.
            original_username = username
            suffix = 1
            MAX_USERNAME_LEN = 150 # Límite estándar de Django User.username

            # Usamos un loop para encontrar un username único
            while User.objects.filter(username=username).exists():
                username = f"{original_username[:MAX_USERNAME_LEN-len(str(suffix))]}{suffix}" # Acortar base si es necesario
                suffix += 1
                # Medida de seguridad extrema: si los sufijos lo hacen demasiado largo
                if len(username) > MAX_USERNAME_LEN:
                    username = uuid.uuid4().hex[:15] # Volver a generar con UUID
                    logger.warning(f"Username became too long with suffix, regenerating with UUID: {username}")
                    # Re-chequear unicidad para el nuevo UUID (colisión muy improbable)
                    while User.objects.filter(username=username).exists():
                         username = uuid.uuid4().hex[:15]
                    break # Salir del loop si tuvimos que regenerar con UUID

            # Asignar el username final (único) al objeto user
            user.username = username
            logger.info(f"CustomSocialAccountAdapter: Populating user. Final unique username set to: {user.username}")
        else:
             logger.debug(f"Username already populated: {username}")
        # -------------------------------------------------

        return user # Devolver la instancia del usuario poblada

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