from django.db import models

from .evento import Evento

from .cuentas import Cuenta

class CuentaEvento(models.Model):
    evento = models.ForeignKey(Evento, on_delete=models.CASCADE)
    cuenta = models.ForeignKey(Cuenta, on_delete=models.CASCADE)
    fecha = models.DateTimeField()

    class Meta:
        unique_together = ('evento', 'cuenta', 'fecha')