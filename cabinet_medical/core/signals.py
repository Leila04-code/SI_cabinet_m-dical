from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import datetime, timedelta

from .models import JourTravail, Creneau


def generer_creneaux(medecin, date, debut, fin, duree=30):
    heure = debut
    duree = timedelta(minutes=duree)

    while heure < fin:
        heure_fin = (datetime.combine(date, heure) + duree).time()

        if heure_fin > fin:
            break

        Creneau.objects.get_or_create(
            medecin=medecin,
            date=date,
            heure_debut=heure,
            heure_fin=heure_fin,
            defaults={'libre': True}
        )

        heure = heure_fin


@receiver(post_save, sender=JourTravail)
def creer_creneaux_jour_travail(sender, instance, created, **kwargs):
    if created:
        generer_creneaux(
            medecin=instance.medecin,
            date=instance.date,
            debut=instance.heure_debut,
            fin=instance.heure_fin,
            duree=30
        )
