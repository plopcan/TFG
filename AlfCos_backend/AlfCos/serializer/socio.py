from rest_framework import serializers
from ..models import *

class SocioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Socio
        fields = (
            "n_socio", "nombre", "apellido", "dni", "telefono", "email", "direccion", 
            "fecha_nacimiento", "pagado", "sexo", "foto", "c_postal", "strickes"
        )
        read_only_fields = ("n_socio",)  # Solo n_socio es de solo lectura
        extra_kwargs = {
            "email": {"required": False},
            "fecha_nacimiento": {"required": False},
            "foto": {"required": False},
        }
