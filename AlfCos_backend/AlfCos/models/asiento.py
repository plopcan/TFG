from django.db import models

from AlfCos_backend.AlfCos.models.evento import Socio


# Create your models here.
class Asiento(models.Model):
    id_evento = models.IntegerField()
    nombre = models.CharField(max_length=50)
    n_asiento = models.IntegerField()
    fecha = models.DateField()
    n_grupo = models.IntegerField()
    n_socio = models.ForeignKey(Socio, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        unique_together = (('id_evento', 'n_grupo', 'n_asiento'),)
        primary_key = ('id_evento', 'n_grupo', 'n_asiento')

    def __str__(self):
        return self.nombre + ": " + str(self.fecha)

