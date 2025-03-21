from django.db import models

from .socio import Socio

class Usuario(models.Model):
    n_socio = models.OneToOneField(Socio, on_delete=models.SET_NULL, null=True)  # Clave foránea y primaria
    nombre = models.CharField(max_length=50)
    rol = models.CharField(max_length=50)
    password = models.CharField(max_length=50)
    n_user = models.AutoField(primary_key=True)

    def __str__(self):
        return self.nombre