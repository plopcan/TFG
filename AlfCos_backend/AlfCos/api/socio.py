from ..models import Socio
from ..serializers import SocioSerializer
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q

class SocioViewSet(viewsets.ModelViewSet):
    queryset = Socio.objects.all()
    serializer_class = SocioSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='filtrar')
    def buscarSocio(self, request):
        nombre = request.query_params.get('nombre')
        n_socio = request.query_params.get('n_socio')
        apellidos = request.query_params.get('apellidos')
        sexo = request.query_params.get('sexo')
        pagado = request.query_params.get('pagado')
        dni = request.query_params.get('dni')

        # Construir la consulta dinámica
        query = Q()
        if nombre:
            query &= Q(nombre__icontains=nombre)
        if n_socio:
            query &= Q(n_socio=n_socio)
        if apellidos:
            query &= Q(apellido__icontains=apellidos)
        if sexo:
            query &= Q(sexo=sexo)
        if pagado:
            query &= Q(pagado=pagado)
        if dni:
            query &= Q(dni=dni)

        socios = Socio.objects.filter(query)
        serializer = SocioSerializer(socios, many=True)
        return Response(serializer.data)
