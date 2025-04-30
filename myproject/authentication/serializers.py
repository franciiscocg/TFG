from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True},
        }
        
    def validate_email(self, value):
        """
        Comprueba si el correo electrónico ya existe (insensible a mayúsculas/minúsculas).
        """
        # Normaliza el email a minúsculas para la comparación y quita espacios extra
        normalized_email = value.lower().strip()
        # Comprueba si existe algún usuario con ese email (ignorando mayúsculas/minúsculas)
        if User.objects.filter(email__iexact=normalized_email).exists():
            # Si existe, lanza un error de validación
            raise serializers.ValidationError(
                _("Un usuario con esta dirección de correo electrónico ya existe.")
            )
        # Si no existe, devuelve el valor original (o normalizado)
        return value
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})
        return data

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
    
