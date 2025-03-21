from django.db import models

# Create your models here.
class Socio(models.Model):
    n_socio = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    dni = models.CharField(max_length=8)
    telefono = models.CharField(max_length=10)
    email = models.EmailField()
    direccion = models.CharField(max_length=100)
    fecha_nacimiento = models.DateField()
    pagado = models.BooleanField(default=True)
    sexo = models.CharField(max_length=1, default="M")
    foto = models.CharField(max_length=200, default="")
    c_postal = models.CharField(max_length=5, default="")
    strickes = models.IntegerField(default=0)

    def __str__(self):
        return self.nombre + " " + self.apellido
    
def get_socio_by_dni(dni):
    return Socio.objects.get(dni=dni)

def get_socio_by_id(id):
    return Socio.objects.get(n_socio=id)
