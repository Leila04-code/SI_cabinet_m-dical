from django.db import models
from datetime import date
# Ajoutez ceci AU DÉBUT de votre models.py (après les imports)

from django.contrib.auth.models import AbstractUser


# ===== MODÈLE UTILISATEUR PERSONNALISÉ =====
class User(AbstractUser):
    """
    Modèle utilisateur personnalisé qui étend le User de Django
    """
    ROLE_CHOICES = [
        ('PATIENT', 'Patient'),
        ('MEDECIN', 'Médecin'),
        ('RECEPTIONNISTE', 'Réceptionniste'),
        ('ADMIN', 'Administrateur'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='PATIENT')
    telephone = models.CharField(max_length=20, blank=True, null=True)
    date_naissance = models.DateField(blank=True, null=True)
    cin = models.CharField(max_length=20, blank=True, null=True, unique=True)
    
    # Lien vers les modèles existants (on les ajoutera après)
    # Ces champs seront remplis automatiquement lors de la création
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'


# ===== VOS MODÈLES EXISTANTS RESTENT INCHANGÉS =====
# Patient, Medecin, Employe, etc. restent comme avant


class Employe(models.Model):
    id_employe = models.AutoField(primary_key=True)
    nom_empl = models.CharField(max_length=100)
    prenom_empl = models.CharField(max_length=100)
    cin_empl = models.CharField(max_length=20)
    date_naissance = models.DateField()
    telephone = models.CharField(max_length=20)
    role = models.CharField(max_length=50, choices=[
        ('RECEPTIONNISTE', 'Réceptionniste'),
        ('SECRETAIRE', 'Secrétaire Médicale'),
        ('ADMIN', 'Administrateur'),
        ('INFIRMIER', 'Infirmier(ère)')
    ], default='RECEPTIONNISTE', null=True, blank=True)  # ← AJOUTEZ

    def __str__(self):
        return f"{self.nom_empl} {self.prenom_empl}"
    



class Patient(models.Model):
    id_patient = models.AutoField(primary_key=True)
    nom_patient = models.CharField(max_length=100)
    prenom_patient = models.CharField(max_length=100)
    sexe = models.CharField(max_length=10)
    cin = models.CharField(max_length=20,unique=True)
    adresse = models.CharField(max_length=200)
    date_naissance = models.DateField()
    telephone = models.CharField(max_length=20)
    situation_familiale = models.CharField(max_length=100)
    employe = models.ForeignKey(Employe, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.nom_patient} {self.prenom_patient}"


class OrganismeAssurance(models.Model):
    id_organisme = models.AutoField(primary_key=True)
    nom_org = models.CharField(max_length=100)
    type_org = models.CharField(max_length=100)

    def __str__(self):
        return self.nom_org


class PatientOrganisme(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    organisme = models.ForeignKey(OrganismeAssurance, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.patient} → {self.organisme}"


class Medecin(models.Model):
    id_med = models.AutoField(primary_key=True)
    nom_med = models.CharField(max_length=100)
    prenom_med = models.CharField(max_length=100)
    specialite_med = models.CharField(max_length=100)

    def __str__(self):
        return f"Dr {self.nom_med} {self.prenom_med}"

class Creneau(models.Model):
    medecin = models.ForeignKey(Medecin, on_delete=models.CASCADE)
    date = models.DateField()
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    libre = models.BooleanField(default=True)

    def __str__(self):
        status = "Libre" if self.libre else "Pris"
        return f"{self.medecin.nom_med} {self.medecin.prenom_med} - {self.date} {self.heure_debut}-{self.heure_fin} ({status})"
    

from django.core.exceptions import ValidationError
class RDV(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    medecin = models.ForeignKey(Medecin, on_delete=models.CASCADE)
    creneau = models.ForeignKey(Creneau, on_delete=models.CASCADE,null=True, blank=True)

    def __str__(self):
        return (
            f"RDV {self.patient} – "
            f"{self.medecin} – "
            f"{self.creneau.date} {self.creneau.heure_debut}"
        )
    def clean(self):
        if self.creneau.medecin != self.medecin:
            raise ValidationError("Ce créneau n'appartient pas à ce médecin.")


class Consultation(models.Model):
    id_cons = models.AutoField(primary_key=True)
    date_cons = models.DateField()
    diagnostic = models.TextField()
    prix_cons = models.FloatField()
    rdv = models.ForeignKey(RDV, on_delete=models.CASCADE)
    medecin = models.ForeignKey(Medecin, on_delete=models.CASCADE)
    consultation_initiale = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Consultation {self.id_cons} - {self.rdv.patient}"


class ActeMedical(models.Model):
    id_acte = models.AutoField(primary_key=True)
    nom_acte = models.CharField(max_length=100)
    prix_acte = models.FloatField()

    def __str__(self):
        return self.nom_acte



class ConsultationActe(models.Model):
    """Actes médicaux effectués lors d'une consultation"""
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE)
    acte = models.ForeignKey(ActeMedical, on_delete=models.CASCADE)
    quantite = models.IntegerField(default=1)
    prix_applique = models.FloatField(null=True, blank=True)

    def __str__(self):
        patient = self.consultation.rdv.patient
        return f"{self.acte.nom_acte} - {patient.nom_patient} {patient.prenom_patient}"

    def save(self, *args, **kwargs):
        if not self.prix_applique:
            self.prix_applique = self.acte.prix_acte
        super().save(*args, **kwargs)


class Facture(models.Model):
    id_facture = models.AutoField(primary_key=True)
    date_fact = models.DateField()
    type_facture = models.CharField(max_length=100)
    consultation = models.OneToOneField(Consultation, on_delete=models.CASCADE)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, null=True, blank=True)
    montant = models.FloatField()

    def calculer_montant(self):
        total = self.consultation.prix_cons
        for consultation_acte in self.consultation.consultationacte_set.all():
                total += consultation_acte.prix_applique * consultation_acte.quantite
        return total


    def __str__(self):
        return f"Facture {self.patient} – {self.type_facture}"

class DossierMedical(models.Model):
    id_dossier = models.AutoField(primary_key=True)
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE)

    def __str__(self):
        return f"Dossier de {self.patient}"


class Maladie(models.Model):
    id_maladie = models.AutoField(primary_key=True)
    nom_malad = models.CharField(max_length=100)
    

    def __str__(self):
        return self.nom_malad


class MaladieDossier(models.Model):
    dossier = models.ForeignKey(DossierMedical, on_delete=models.CASCADE)
    maladie = models.ForeignKey(Maladie, on_delete=models.CASCADE)
    duree_maladie_patient = models.CharField(max_length=100,null=True, blank=True)
    def __str__(self):
        return f"{self.maladie} → {self.dossier}"




class Vaccin(models.Model):
    id_vacc = models.AutoField(primary_key=True)
    nom_vacc = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)  # informations générales sur le vaccin
    # date recommandée pour le vaccin (optionnelle)
    date_recommandee = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.nom_vacc


class VaccinDossier(models.Model):
    dossier = models.ForeignKey(DossierMedical, on_delete=models.CASCADE)
    vaccin = models.ForeignKey(Vaccin, on_delete=models.CASCADE)
    # date de vaccination pour ce patient (optionnelle)
    date_vacc_patient= models.DateField(blank=True, null=True)

    def __str__(self):
        # Si la date est renseignée, on l'affiche sinon juste le vaccin
        if self.date_vacc_patient:
            return f"{self.vaccin.nom_vacc} ({self.date_vacc_patient}) → {self.dossier.patient.nom_patient}"
        return f"{self.vaccin.nom_vacc} → {self.dossier.patient.nom_patient}"

class Allergie(models.Model):
    id_allerg = models.AutoField(primary_key=True)
    nom_allerg = models.CharField(max_length=100)
    

    def __str__(self):
        return self.nom_allerg


class AllergieDossier(models.Model):
    dossier = models.ForeignKey(DossierMedical, on_delete=models.CASCADE)
    allergie = models.ForeignKey(Allergie, on_delete=models.CASCADE)
    precautions_patient = models.TextField(null=True, blank=True)  # spécifique au patient
    def __str__(self):
        return f"{self.allergie} → {self.dossier}"






# ===== MODÈLES CORRIGÉS (logique médicale correcte) =====

class Analyse(models.Model):
    id_analyse = models.AutoField(primary_key=True)
    nom_analyse = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.nom_analyse


class Ordonnance(models.Model):
    """Ordonnance de médicaments (peut être prescrite après les analyses)"""
    id_ordonnance = models.AutoField(primary_key=True)
    date_ord = models.DateField()
    medicaments = models.TextField()
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE)

    def __str__(self):
        patient = self.consultation.rdv.patient
        return f"Ordonnance de {patient.nom_patient} {patient.prenom_patient} ({self.date_ord})"


class OrdonnanceAnalyse(models.Model):
    """Prescription d'analyses (liée directement à la consultation)"""
    date_ord = models.DateField()
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE)
    analyse = models.ForeignKey(Analyse, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        patient = self.consultation.rdv.patient  # ← CORRIGÉ : consultation au lieu de ordonnance
        return f"{self.analyse} → {patient.nom_patient} {patient.prenom_patient} ({self.date_ord})"


class Radio(models.Model):
    id_radio = models.AutoField(primary_key=True)
    nom_rad = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.nom_rad


class OrdonnanceRadio(models.Model):
    """Prescription de radios (liée directement à la consultation)"""
    date_ord = models.DateField()
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE)  # ← CHANGÉ : consultation au lieu de ordonnance
    radio = models.ForeignKey(Radio, on_delete=models.CASCADE)

    def __str__(self):
        patient = self.consultation.rdv.patient  # ← CORRIGÉ
        return f"{self.radio} → {patient.nom_patient} {patient.prenom_patient} ({self.date_ord})"

class JourTravail(models.Model):
    medecin = models.ForeignKey(Medecin, on_delete=models.CASCADE)
    date = models.DateField()
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()

    def __str__(self):
        return f"{self.medecin} – {self.date} ({self.heure_debut}-{self.heure_fin})"
    
from datetime import datetime, timedelta
from django.db.models.signals import post_save
from django.dispatch import receiver




from datetime import datetime, timedelta, time

def generer_creneaux(medecin, date, debut, fin, duree=30):
    heure = debut
    duree = timedelta(minutes=duree)

    while heure < fin:
        Creneau.objects.create(
            medecin=medecin,
            date=date,
            heure_debut=heure,
            heure_fin=(datetime.combine(date, heure) + duree).time(),
            libre=True
        )
        heure = (datetime.combine(date, heure) + duree).time()


from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver

# ===== SIGNALS POUR GÉRER AUTOMATIQUEMENT LES CRÉNEAUX =====

@receiver(pre_save, sender=RDV)
def liberer_ancien_creneau(sender, instance, **kwargs):
    """
    Avant de modifier un RDV, libère l'ancien créneau si on change de créneau
    """
    if instance.pk:  # Si le RDV existe déjà (modification)
        try:
            ancien_rdv = RDV.objects.get(pk=instance.pk)
            # Si on change de créneau, libérer l'ancien
            if ancien_rdv.creneau and ancien_rdv.creneau != instance.creneau:
                ancien_rdv.creneau.libre = True
                ancien_rdv.creneau.save()
        except RDV.DoesNotExist:
            pass


@receiver(post_save, sender=RDV)
def marquer_creneau_pris(sender, instance, created, **kwargs):
    """
    Après la création ou modification d'un RDV, marque le créneau comme pris
    """
    if instance.creneau:
        instance.creneau.libre = False
        instance.creneau.save()


@receiver(post_delete, sender=RDV)
def liberer_creneau(sender, instance, **kwargs):
    """
    Quand un RDV est supprimé, libère le créneau
    """
    if instance.creneau:
        instance.creneau.libre = True
        instance.creneau.save()


@receiver(post_save, sender=JourTravail)
def generer_creneaux_automatiquement(sender, instance, created, **kwargs):
    if created:
        generer_creneaux(
            medecin=instance.medecin,
            date=instance.date,
            debut=instance.heure_debut,
            fin=instance.heure_fin,
            duree=30
        )

@receiver(post_delete, sender=JourTravail)
def supprimer_creneaux_automatiquement(sender, instance, **kwargs):
    Creneau.objects.filter(
        medecin=instance.medecin,
        date=instance.date
    ).delete()





# ===== MODIFIEZ VOS MODÈLES EXISTANTS =====

# Ajoutez ces champs à votre modèle Patient (s'ils n'existent pas déjà)
# La liaison se fait automatiquement via User.patient

# Ajoutez ces champs à votre modèle Medecin (s'ils n'existent pas déjà)  
# La liaison se fait automatiquement via User.medecin

# Ajoutez ces champs à votre modèle Employe (s'ils n'existent pas déjà)
# La liaison se fait automatiquement via User.employe
        

