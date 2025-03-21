from rest_framework import routers


from .api import *

router = routers.DefaultRouter()
router.register("socios", SocioViewSet, 'socios')
router.register("pruebas", PruebaViewSet, 'pruebas')
router.register("usuarios", UsuarioViewSet, 'usuarios')
router.register("talleres", TallerViewSet, 'talleres')

urlpatterns = router.urls