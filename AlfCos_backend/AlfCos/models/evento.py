from django.db import models

from .tipoEvento import TipoEvento

# Create your models here.
class Evento(models.Model):
    id_evento = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)
    descripcion = models.CharField(max_length=200)
    fecha_ini = models.DateField()
    fecha_fin = models.DateField()
    num_grupos = models.IntegerField(default=0)
    n_asientos = models.IntegerField(default=0)
    precio = models.DecimalField(max_digits=10, decimal_places=2) 
    tipo = models.ForeignKey(TipoEvento, on_delete=models.CASCADE)

    def __str__(self):
        return self.nombre + ": " + self.fecha_ini + " - " + self.fecha_fin
    
