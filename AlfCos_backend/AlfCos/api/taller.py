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
    
    @action(detail=False, methods=['post'], url_path='inscribir')
    def inscribirSocio(self, request):
        id_taller = request.data.get('id_taller')
        n_socio = request.data.get('n_socio')
        try:
            socio = Socio.objects.get(n_socio=n_socio)
            taller = Taller.objects.get(n_taller=id_taller)
        except Socio.DoesNotExist:
            return Response({'error': 'Socio no encontrado'}, status=404)

        if Clase.objects.filter(taller=taller).count() >= taller.plazas:
            return Response({'error': 'No hay plazas disponibles'}, status=400)

        clase, created = Clase.objects.get_or_create(socio=socio, taller=taller)
        if not created:
            return Response({'error': 'El socio ya está inscrito en este taller'}, status=400)

        serializer = ClaseSerializer(clase)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='quitar')
    def quitarSocio(self, request):
        id_taller = request.data.get('id_taller')
        nombre = request.data.get('nombre')
        apellido = request.data.get('apellidos')
        try:
            socio = Socio.objects.get(nombre=nombre, apellido=apellido)
            taller = Taller.objects.get(n_taller=id_taller)
            clase = Clase.objects.get(socio=socio, taller=taller)
        except Socio.DoesNotExist:
            return Response({'error': 'Socio no encontrado'}, status=404)
        except Taller.DoesNotExist:
            return Response({'error': 'Taller no encontrado'}, status=404)
        except Clase.DoesNotExist:
            return Response({'error': 'El socio no está inscrito en este taller'}, status=400)

        clase.delete()
        return Response({'message': 'Socio eliminado del taller correctamente'})

    @action(detail=False, methods=['post'], url_path='listar-socios')
    def listarSocios(self, request):
        id_taller = request.data.get('id_taller')
        try:
            taller = Taller.objects.get(n_taller=id_taller)
        except Taller.DoesNotExist:
            return Response({'error': 'Taller no encontrado'}, status=404)

        clases = Clase.objects.filter(taller=taller)
        socios = [{'nombre': clase.socio.nombre, 'apellidos': clase.socio.apellido, 'fecha': f"{clase.fecha_inscripcion}"} for clase in clases]
        return Response(socios)

    def list(self, request, *args, **kwargs):
        talleres = Taller.objects.all()
        data = []
        for taller in talleres:
            plazas_ocupadas = Clase.objects.filter(taller=taller).count()
            plazas_libres = taller.plazas - plazas_ocupadas
            data.append({
                'n_taller': taller.n_taller,
                'nombre': taller.nombre,
                'hora_inicio': f"{taller.hora_inicio}",
                'hora_fin': taller.hora_fin,
                'dia': ', '.join([dia.dia for dia in taller.dia.all()]),
                'plazas_libres': plazas_libres
            })
        return Response(data)