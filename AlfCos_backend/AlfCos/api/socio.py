from ..models import Socio
from ..serializers import SocioSerializer
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser

class SocioViewSet(viewsets.ModelViewSet):
    queryset = Socio.objects.all()
    serializer_class = SocioSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (JSONParser, MultiPartParser, FormParser)  # Permitir subida de archivos

    def create(self, request, *args, **kwargs):
        try:
            # Extraer datos del formulario
            data = request.data
            foto = request.FILES.get('foto')  # Obtener la imagen si está presente
            print("Data:", data)  # Verifica los datos recibidos
            # Crear el socio
            socio = Socio.objects.create(
                nombre=data.get('nombre'),
                apellido=data.get('apellido'),
                dni=data.get('dni'),
                telefono=data.get('telefono'),
                c_postal=data.get('c_postal'),
                email=data.get('email'),
                direccion=data.get('direccion'),
                fecha_nacimiento=data.get('fecha_nacimiento'),
                pagado=data.get('pagado', True),
                sexo_id=data.get('sexo_id'),  # Relación con la tabla Sexo
                foto=foto  # Asignar la imagen
            )
        
            # Serializar y devolver la respuesta
            serializer = self.get_serializer(socio)
            return Response(serializer.data, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

    def update(self, request, *args, **kwargs):
        try:
            # Obtener el socio por su ID (pk)
            partial = kwargs.pop('partial', False)  # Permitir actualizaciones parciales
            instance = self.get_object()

            # Extraer datos del formulario
            data = request.data
            foto = request.FILES.get('foto')  # Obtener la imagen si está presente

            # Actualizar los campos del socio
            instance.nombre = data.get('nombre', instance.nombre)
            instance.apellido = data.get('apellido', instance.apellido)
            instance.dni = data.get('dni', instance.dni)
            instance.telefono = data.get('telefono', instance.telefono)
            instance.c_postal = data.get('c_postal', instance.c_postal)
            instance.email = data.get('email', instance.email)
            instance.direccion = data.get('direccion', instance.direccion)
            instance.fecha_nacimiento = data.get('fecha_nacimiento', instance.fecha_nacimiento)
            instance.pagado = data.get('pagado', instance.pagado)
            instance.sexo_id = data.get('sexo_id', instance.sexo_id)

            # Actualizar la foto si se envió una nueva
            if foto:
                instance.foto.delete(save=False)  # Eliminar la foto anterior si existe
                instance.foto = foto

            # Guardar los cambios
            instance.save()

            # Serializar y devolver la respuesta
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
        
    @action(detail=False, methods=['post'], url_path='filtrar')
    def buscarSocio(self, request):
        nombre = request.data.get('nombre')
        n_socio = request.data.get('n_socio')
        apellidos = request.data.get('apellidos')
        sexo = request.data.get('sexo')
        pagado = request.data.get('pagado')
        dni = request.data.get('dni')

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
        # Paginación manual si se reciben page y page_size
        page_size = int(request.data.get('page_size', 10))
        page_number = int(request.data.get('page', 1))
        total = socios.count()
        start = (page_number - 1) * page_size
        end = start + page_size
        items = socios[start:end]
        serializer = SocioSerializer(items, many=True)
        return Response({
            'count': total,
            'next': f"?page={page_number + 1}&page_size={page_size}" if end < total else None,
            'previous': f"?page={page_number - 1}&page_size={page_size}" if start > 0 else None,
            'results': serializer.data
        })

    @action(detail=False, methods=['get'], url_path='paginar')
    def paginar_socios(self, request):
        page_size = int(request.query_params.get('page_size', 10))
        page_number = int(request.query_params.get('page', 1))
        
        queryset = self.get_queryset()
        total = queryset.count()
        
        # Aplica paginación manual
        start = (page_number - 1) * page_size
        end = start + page_size
        items = queryset[start:end]
        
        serializer = SocioSerializer(items, many=True)
        
        return Response({
            'count': total,
            'next': f"?page={page_number + 1}&page_size={page_size}" if end < total else None,
            'previous': f"?page={page_number - 1}&page_size={page_size}" if start > 0 else None,
            'results': serializer.data
        })
