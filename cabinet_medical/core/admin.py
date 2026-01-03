from django.contrib import admin
from .models import (
    Employe,
    Patient,
    OrganismeAssurance,
    PatientOrganisme,
    RDV,
    Medecin,
    Consultation,
    Facture,
    ActeMedical,
    DossierMedical,
    Maladie,
    MaladieDossier,
    Vaccin,
    VaccinDossier,
    Allergie,
    AllergieDossier,
    Ordonnance,
    Analyse,
    OrdonnanceAnalyse,
    Radio,
    OrdonnanceRadio,
    Creneau,
    ConsultationActe
    
)

# ===== INLINES =====

class AllergieDossierInline(admin.TabularInline):
    model = AllergieDossier
    extra = 1


class MaladieDossierInline(admin.TabularInline):
    model = MaladieDossier
    extra = 1


class VaccinDossierInline(admin.TabularInline):
    model = VaccinDossier
    extra = 1


# ===== ADMIN POUR DOSSIER MEDICAL =====

@admin.register(DossierMedical)
class DossierMedicalAdmin(admin.ModelAdmin):
    list_display = ("id_dossier", "patient")
    inlines = [
        AllergieDossierInline,
        MaladieDossierInline,
        VaccinDossierInline
    ]


class MedecinAdmin(admin.ModelAdmin):
    list_display = ('nom_complet', 'specialite_med')

    def nom_complet(self, obj):
        return f"Dr {obj.nom_med} {obj.prenom_med}"

    nom_complet.short_description = 'Médecin'  # Titre de la colonne

admin.site.register(Medecin, MedecinAdmin)


class CreneauAdmin(admin.ModelAdmin):
    list_display = ('medecin', 'date', 'heure_debut', 'heure_fin', 'libre')
    list_filter = ('medecin', 'date', 'libre')
admin.site.register(Creneau,CreneauAdmin)


from .models import JourTravail
class JourTravailAdmin(admin.ModelAdmin):
    list_display = ('medecin', 'date', 'heure_debut', 'heure_fin')
    list_filter = ('medecin', 'date')
admin.site.register(JourTravail,JourTravailAdmin)


from .models import RDV


@admin.register(RDV)
class RDVAdmin(admin.ModelAdmin):

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "creneau":
            kwargs["queryset"] = Creneau.objects.filter(libre=True)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

admin.site.register(Employe)
admin.site.register(Patient)
admin.site.register(OrganismeAssurance)
admin.site.register(PatientOrganisme)
admin.site.register(ActeMedical)
admin.site.register(Maladie)
admin.site.register(MaladieDossier)
admin.site.register(Vaccin)
admin.site.register(VaccinDossier)
admin.site.register(Allergie)
admin.site.register(AllergieDossier)
admin.site.register(Analyse)
admin.site.register(Radio)

from django.contrib import admin

class OrdonnanceAnalyseInline(admin.TabularInline):
    model = OrdonnanceAnalyse
    extra = 2
    fields = ['analyse', 'date_ord']

class OrdonnanceRadioInline(admin.TabularInline):
    model = OrdonnanceRadio
    extra = 1
    fields = ['radio', 'date_ord']

# Vous pouvez ajouter les inlines soit dans Consultation soit dans Ordonnance




@admin.register(Ordonnance)
class OrdonnanceAdmin(admin.ModelAdmin):
    list_display = ['id_ordonnance', 'get_patient', 'date_ord', 'get_consultation_date']
    
    def get_patient(self, obj):
        patient = obj.consultation.rdv.patient
        return f"{patient.nom_patient} {patient.prenom_patient}"
    get_patient.short_description = 'Patient'
    
    def get_consultation_date(self, obj):
        return obj.consultation.date_cons
    get_consultation_date.short_description = 'Date consultation'


@admin.register(OrdonnanceAnalyse)
class OrdonnanceAnalyseAdmin(admin.ModelAdmin):
    list_display = ['get_patient', 'analyse', 'date_ord', 'get_consultation_date']
    list_filter = ['date_ord', 'analyse']
    date_hierarchy = 'date_ord'
    
    def get_patient(self, obj):
        patient = obj.consultation.rdv.patient  # ← CORRIGÉ
        return f"{patient.nom_patient} {patient.prenom_patient}"
    get_patient.short_description = 'Patient'
    
    def get_consultation_date(self, obj):
        return obj.consultation.date_cons  # ← CORRIGÉ
    get_consultation_date.short_description = 'Date consultation'


@admin.register(OrdonnanceRadio)
class OrdonnanceRadioAdmin(admin.ModelAdmin):
    list_display = ['get_patient', 'radio', 'date_ord', 'get_consultation_date']
    list_filter = ['date_ord', 'radio']
    date_hierarchy = 'date_ord'
    
    def get_patient(self, obj):
        patient = obj.consultation.rdv.patient  # ← CORRIGÉ
        return f"{patient.nom_patient} {patient.prenom_patient}"
    get_patient.short_description = 'Patient'
    
    def get_consultation_date(self, obj):
        return obj.consultation.date_cons  # ← CORRIGÉ
    get_consultation_date.short_description = 'Date consultation'

@admin.register(Facture)
class FactureAdmin(admin.ModelAdmin):
    list_display = ['get_patient', 'type_facture', 'montant']
    list_filter = ['type_facture', 'date_fact']
    date_hierarchy = 'date_fact'
    
    def get_patient(self, obj):
        patient = obj.consultation.rdv.patient
        return f"{patient.nom_patient} {patient.prenom_patient}"
    get_patient.short_description = 'Patient'




 # Enregistrement de ConsultationActe
@admin.register(ConsultationActe)
class ConsultationActeAdmin(admin.ModelAdmin):
    list_display = ['get_patient', 'acte', 'quantite', 'prix_applique', 'get_consultation_date']
    list_filter = ['acte', 'consultation__date_cons']
    search_fields = ['consultation__rdv__patient__nom_patient', 'consultation__rdv__patient__prenom_patient']
    
    def get_patient(self, obj):
        patient = obj.consultation.rdv.patient
        return f"{patient.nom_patient} {patient.prenom_patient}"
    get_patient.short_description = 'Patient'
    
    def get_consultation_date(self, obj):
        return obj.consultation.date_cons
    get_consultation_date.short_description = 'Date consultation'   


class ConsultationActeInline(admin.TabularInline):
    model = ConsultationActe
    extra = 1
    fields = ['acte', 'quantite', 'prix_applique']

  

@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ['id_cons', 'get_patient', 'date_cons', 'medecin']
    inlines = [ConsultationActeInline, OrdonnanceAnalyseInline, OrdonnanceRadioInline]
    search_fields = ['rdv__patient__nom_patient', 'rdv__patient__prenom_patient']   

    
    def get_patient(self, obj):
        return f"{obj.rdv.patient.nom_patient} {obj.rdv.patient.prenom_patient}"
    get_patient.short_description = 'Patient'