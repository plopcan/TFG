from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from ..models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = (
            "nombre", "n_socio", "password", "rol", "n_user"
        )
        read_only_fields = ("n_user",)

    def validate_password(self, value):
        """
        Encripta la contraseña antes de guardarla.
        """
        if value and not value.startswith('pbkdf2_'):  # Evita encriptar una contraseña ya encriptada
            return make_password(value)
        return value

    def create(self, validated_data):
        """
        Sobrescribe el método create para encriptar la contraseña.
        """
        validated_data['password'] = self.validate_password(validated_data.get('password'))
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Sobrescribe el método update para encriptar la contraseña si se actualiza.
        """
        if 'password' in validated_data:
            validated_data['password'] = self.validate_password(validated_data.get('password'))
        return super().update(instance, validated_data)