# Generated by Django 5.1.6 on 2025-03-30 16:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("AlfCos", "0010_evento_n_asientos"),
    ]

    operations = [
        migrations.AlterField(
            model_name="asiento",
            name="fecha",
            field=models.DateField(blank=True, null=True),
        ),
    ]
