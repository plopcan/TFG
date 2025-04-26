from rest_framework import serializers
from ..models import *

class SocioSerializer(serializers.ModelSerializer):
    sexo_id = serializers.IntegerField()  # Campo para aceptar el ID del sexo
    sexo = serializers.CharField(source='sexo.nombre', read_only=True)  # Campo de solo lectura para devolver el nombre del sexo

    class Meta:
        model = Socio
        fields = (
            "n_socio", "nombre", "apellido", "dni", "telefono", "email", "direccion", 
            "fecha_nacimiento", "pagado", "sexo", "sexo_id", "foto", "c_postal", "strickes"
        )
        read_only_fields = ("n_socio",)  # Solo n_socio es de solo lectura
        extra_kwargs = {
            "email": {"required": False},
            "fecha_nacimiento": {"required": False},
            "foto": {"required": False},
        }
        foto = serializers.ImageField(use_url=True)

    def create(self, validated_data):
        # Extrae el sexo_id de los datos validados
        sexo_id = validated_data.pop('sexo_id', None)
        if not sexo_id:
            raise serializers.ValidationError({"sexo_id": "Este campo es requerido."})

        # Busca el Sexo correspondiente
        try:
            sexo = Sexo.objects.get(id=sexo_id)
        except Sexo.DoesNotExist:
            raise serializers.ValidationError({"sexo_id": "El sexo proporcionado no existe."})

        # Asigna el sexo al validated_data y crea la instancia
        validated_data['sexo'] = sexo
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Extrae el sexo_id de los datos validados
        sexo_id = validated_data.pop('sexo_id', None)
        if sexo_id:
            # Busca el Sexo correspondiente
            try:
                sexo = Sexo.objects.get(id=sexo_id)
            except Sexo.DoesNotExist:
                raise serializers.ValidationError({"sexo_id": "El sexo proporcionado no existe."})

            # Asigna el sexo al instance
            instance.sexo = sexo

        # Actualiza el resto de los campos
        return super().update(instance, validated_data)
