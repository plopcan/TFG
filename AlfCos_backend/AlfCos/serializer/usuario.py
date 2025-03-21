from rest_framework import serializers
from ..models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = (
            "nombre", "n_socio", "password", "rol"
        )