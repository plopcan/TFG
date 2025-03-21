from ..serializer.clase import ClaseSerializer
from ..models.clase import Clase
from ..models.socio import Socio
from ..models import Taller
from ..serializers import TallerSerializer
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q

class TallerViewSet(viewsets.ModelViewSet):
    queryset = Taller.objects.all()
    serializer_class = TallerSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='filtrar')
    def buscarTaller(self, request):
        nombre = request.query_params.get('nombre')
        n_taller = request.query_params.get('n_taller')
        monitor = request.query_params.get('monitor')
        dia = request.query_params.get('dia')
        plazas = request.query_params.get('plazas')

        # Construir la consulta dinámica
        query = Q()
        if nombre:
            query &= Q(nombre__icontains=nombre)
        if n_taller:
            query &= Q(n_taller=n_taller)
        if monitor:
            query &= Q(monitor__icontains=monitor)
        if dia:
            query &= Q(dia__icontains=dia)
        if plazas:
            query &= Q(plazas=plazas)

        Tallers = Taller.objects.filter(query)
        serializer = TallerSerializer(Tallers, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='inscribir')
    def inscribirSocio(self, request):
        taller = request.query_params.get()
        n_socio = request.query_params.get('n_socio')
        try:
            socio = Socio.objects.get(pk=n_socio)
        except Socio.DoesNotExist:
            return Response({'error': 'Socio no encontrado'}, status=404)

        if Clase.objects.filter(taller=taller).count() >= taller.plazas:
            return Response({'error': 'No hay plazas disponibles'}, status=400)

        clase, created = Clase.objects.get_or_create(socio=socio, taller=taller)
        if not created:
            return Response({'error': 'El socio ya está inscrito en este taller'}, status=400)

        serializer = ClaseSerializer(clase)
        return Response(serializer.data)
