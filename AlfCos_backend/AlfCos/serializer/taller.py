from rest_framework import serializers
from ..models import Taller, Dia

class TallerSerializer(serializers.ModelSerializer):
    dia = serializers.PrimaryKeyRelatedField(many=True, queryset=Dia.objects.all())

    class Meta:
        model = Taller
        fields = ('n_taller', 'nombre', 'descripcion', 'monitor', 'hora_inicio', 'hora_fin', 'plazas', 'dia')
        read_only_fields = ('n_taller',)
        depth = 1
        extra_kwargs = {
            "dia": {'required': False},
        }
