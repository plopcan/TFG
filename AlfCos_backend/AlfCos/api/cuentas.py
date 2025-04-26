from ..models import Cuenta, Cuota, CuentaEvento, Socio, Evento
from ..serializers import CuentaSerializer
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.utils.timezone import now
from django.template.loader import render_to_string
from django.http import HttpResponse
from xhtml2pdf import pisa
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser

class CuentaViewSet(viewsets.ModelViewSet):
    queryset = Cuenta.objects.all()
    serializer_class = CuentaSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def perform_create(self, serializer):
        # Guarda la cuenta
        cuenta = serializer.save()

        # Obtén los datos adicionales del request
        n_socio = self.request.data.get('n_socio')
        print("n_socio", n_socio)
        id_evento = self.request.data.get('id_evento')

        # Crea una Cuota si el tipo es 'cuota'
        if cuenta.tipo.tipo == 'Cuota':
            if not n_socio:
                raise ValueError("El campo 'n_socio' es requerido para crear una cuota.")
            try:
                socio = Socio.objects.get(n_socio=n_socio)
                Cuota.objects.create(cuenta=cuenta, socio=socio, fecha=now())
            except Socio.DoesNotExist:
                raise ValueError("El socio con n_socio proporcionado no existe.")

        # Crea una CuentaEvento si el tipo es 'cuenta_evento'
        elif cuenta.tipo.tipo == 'CuentaEvento':
            if not id_evento:
                raise ValueError("El campo 'id_evento' es requerido para crear una cuenta de evento.")
            try:
                evento = Evento.objects.get(id_evento=id_evento)
                CuentaEvento.objects.create(cuenta=cuenta, evento=evento, fecha=now())
            except Evento.DoesNotExist:
                raise ValueError("El evento con id_evento proporcionado no existe.")

    @action(detail=False, methods=['post'], url_path='filtrar')
    def buscarCuenta(self, request):
        n_socio = request.data.get('n_socio')
        cantidad = request.data.get('cantidad')
        fecha = request.data.get('fecha')
        cuenta = request.data.get('id_cuenta')
        # Construir la consulta dinámica
        query = Q()
        if n_socio:
            query &= Q(n_socio=n_socio)
        if cantidad:
            query &= Q(cantidad=cantidad)
        if fecha:
            query &= Q(fecha=fecha)
        if cuenta:
            query &= Q(id_cuenta=cuenta)

        cuentas = Cuenta.objects.filter(query)
        serializer = CuentaSerializer(cuentas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='filtrar_por_fecha')
    def filtrar_por_fecha(self, request):
        usuario = request.user
        year = request.query_params.get('year')
        month = request.query_params.get('month')

        query = Q(usuario=usuario)
        if year:
            query &= Q(fecha__year=year)
        if month:
            query &= Q(fecha__month=month)

        cuentas = Cuenta.objects.filter(query)
        serializer = CuentaSerializer(cuentas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='anular')
    def anular_cuenta(self, request):
        try:
            cuenta = Cuenta.objects.get(id_cuenta= request.data.get('id_cuenta'))
            if cuenta.anulada:
                return Response({"detail": "La cuenta ya está anulada."}, status=400)
            cuenta.anulada = True
            cuenta.save()
            return Response({"detail": "La cuenta ha sido anulada exitosamente."})
        except Cuenta.DoesNotExist:
            return Response({"detail": "La cuenta no existe."}, status=404)

    @action(detail=False, methods=['post'], url_path='get_cuota')
    def getCuota(self, request):
        id_cuenta = request.data.get('id_cuenta')
        if not id_cuenta:
            return Response({"detail": "El campo 'id_cuenta' es requerido."}, status=400)
        try:
            cuenta = Cuenta.objects.get(id_cuenta=id_cuenta)
            cuota = Cuota.objects.get(cuenta=cuenta)
            data = {
                "cuenta": CuentaSerializer(cuenta).data,
                "n_socio": cuota.socio.n_socio
            }
            print(data)
            return Response(data)
        except Cuenta.DoesNotExist:
            return Response({"detail": "La cuenta no existe."}, status=404)
        except Cuota.DoesNotExist:
            return Response({"detail": "No se encontró una cuota asociada a esta cuenta."}, status=404)

    @action(detail=False, methods=['post'], url_path='get_cuenta_evento')
    def getCuentaEvento(self, request):
        id_cuenta = request.data.get('id_cuenta')
        if not id_cuenta:
            return Response({"detail": "El campo 'id_cuenta' es requerido."}, status=400)
        try:
            cuenta = Cuenta.objects.get(id_cuenta=id_cuenta)
            cuenta_evento = CuentaEvento.objects.get(cuenta=cuenta)
            data = {
                "cuenta": CuentaSerializer(cuenta).data,
                "id_evento": cuenta_evento.evento.id_evento
            }
            return Response(data)
        except Cuenta.DoesNotExist:
            return Response({"detail": "La cuenta no existe."}, status=404)
        except CuentaEvento.DoesNotExist:
            return Response({"detail": "No se encontró una cuenta de evento asociada a esta cuenta."}, status=404)

    @action(detail=False, methods=['get'], url_path='paginar')
    def paginar_cuentas(self, request):
        queryset = self.get_queryset()
        paginator = PageNumberPagination()
        paginator.page_size = 10  # Número de elementos por página
        result_page = paginator.paginate_queryset(queryset, request)
        serializer = CuentaSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @action(detail=False, methods=['get'], url_path='descargar_pdf')
    def descargar_pdf(self, request):
        print("Descargando PDF")
        cuentas = Cuenta.objects.all()  # Fetch all accounts
        html_string = render_to_string('cuentas.html', {'cuentas': cuentas})  # Render template with accounts
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="cuentas.pdf"'

        # Generate PDF using xhtml2pdf
        pisa_status = pisa.CreatePDF(html_string, dest=response)
        if pisa_status.err:
            return HttpResponse("Error al generar el PDF", status=500)
        
        return response

