from datetime import datetime
import calendar
meses = {
    'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6,
    'julio': 7, 'agosto': 8, 'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
    }


now_dt = datetime.now()

def tomarFecha(dia, mes, anio):
    if any([dia, mes, anio]):
            try:
                fecha_anio = int(anio) if anio else now_dt.year
                fecha_mes = meses.get(str(mes).lower(), now_dt.month) if mes else now_dt.month
                fecha_dia = int(dia) if dia else now_dt.day
                fecha = datetime(fecha_anio, fecha_mes, fecha_dia)
            except Exception:
                fecha = None

            return fecha
