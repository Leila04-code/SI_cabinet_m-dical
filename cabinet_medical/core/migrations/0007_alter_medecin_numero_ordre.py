from django.db import migrations, models

def set_default_numero_ordre(apps, schema_editor):
    Medecin = apps.get_model('core', 'Medecin')
    # Mettre une chaîne vide pour les médecins qui n'ont pas de numéro d'ordre
    Medecin.objects.filter(numero_ordre__isnull=True).update(numero_ordre='')

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_employe_adresse_employe_date_embauche_employe_email_and_more'),
    ]

    operations = [
        # D'abord, on met des valeurs par défaut
        migrations.RunPython(set_default_numero_ordre, reverse_code=migrations.RunPython.noop),
        # Ensuite, on modifie le champ
        migrations.AlterField(
            model_name='medecin',
            name='numero_ordre',
            field=models.CharField(max_length=50, blank=True, null=True),
        ),
    ]
