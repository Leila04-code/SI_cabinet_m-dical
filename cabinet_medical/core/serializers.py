from rest_framework import serializers
from .models import (
    Patient, Medecin, RDV, Creneau, Consultation,
    Employe, ActeMedical, ConsultationActe,
    Ordonnance, OrdonnanceAnalyse, OrdonnanceRadio,
    Analyse, Radio, DossierMedical, Facture, Maladie, MaladieDossier,        
    Vaccin, VaccinDossier,             
    Allergie, AllergieDossier,JourTravail,OrganismeAssurance,PatientOrganisme
)



class EmployeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employe
        fields = '__all__'


class PatientSerializer(serializers.ModelSerializer):
    employe_nom = serializers.CharField(source='employe.nom_empl', read_only=True)
    
    class Meta:
        model = Patient
        fields = '__all__'


class MedecinSerializer(serializers.ModelSerializer):
    nom_complet = serializers.SerializerMethodField()
    
    class Meta:
        model = Medecin
        fields = '__all__'
    
    def get_nom_complet(self, obj):
        return f"Dr {obj.nom_med} {obj.prenom_med}"


class CreneauSerializer(serializers.ModelSerializer):
    medecin_nom = serializers.CharField(source='medecin.nom_med', read_only=True)
    medecin_prenom = serializers.CharField(source='medecin.prenom_med', read_only=True)
    
    class Meta:
        model = Creneau
        fields = '__all__'


class RDVSerializer(serializers.ModelSerializer):
    patient_nom = serializers.CharField(source='patient.nom_patient', read_only=True)
    patient_prenom = serializers.CharField(source='patient.prenom_patient', read_only=True)
    medecin_nom = serializers.CharField(source='medecin.nom_med', read_only=True)
    medecin_prenom = serializers.CharField(source='medecin.prenom_med', read_only=True)
    medecin_specialite = serializers.CharField(source='medecin.specialite_med', read_only=True)
    creneau_details = CreneauSerializer(source='creneau', read_only=True)
    
    class Meta:
        model = RDV
        fields = '__all__'


class ConsultationActeSerializer(serializers.ModelSerializer):
    acte_nom = serializers.CharField(source='acte.nom_acte', read_only=True)
    
    class Meta:
        model = ConsultationActe
        fields = '__all__'


class ConsultationSerializer(serializers.ModelSerializer):
    patient_nom = serializers.CharField(source='rdv.patient.nom_patient', read_only=True)
    patient_prenom = serializers.CharField(source='rdv.patient.prenom_patient', read_only=True)
    medecin_nom = serializers.CharField(source='medecin.nom_med', read_only=True)
    medecin_prenom = serializers.CharField(source='medecin.prenom_med', read_only=True)
    medecin_specialite = serializers.CharField(source='medecin.specialite_med', read_only=True)
    actes_list = ConsultationActeSerializer(source='consultationacte_set', many=True, read_only=True)
    
    class Meta:
        model = Consultation
        fields = '__all__'

class ActeMedicalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActeMedical
        fields = '__all__'


class AnalyseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analyse
        fields = '__all__'


class RadioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Radio
        fields = '__all__'


class OrdonnanceAnalyseSerializer(serializers.ModelSerializer):
    analyse_nom = serializers.CharField(source='analyse.nom_analyse', read_only=True)
    patient_nom = serializers.CharField(source='consultation.rdv.patient.nom_patient', read_only=True)
    medecin_nom = serializers.CharField(source='consultation.medecin.nom_med', read_only=True)
    medecin_specialite = serializers.CharField(source='consultation.medecin.specialite_med', read_only=True) 
    class Meta:
        model = OrdonnanceAnalyse
        fields = '__all__'


class OrdonnanceRadioSerializer(serializers.ModelSerializer):
    radio_nom = serializers.CharField(source='radio.nom_rad', read_only=True)
    patient_nom = serializers.CharField(source='consultation.rdv.patient.nom_patient', read_only=True)
    medecin_nom = serializers.CharField(source='consultation.medecin.nom_med', read_only=True)
    medecin_specialite = serializers.CharField(source='consultation.medecin.specialite_med', read_only=True) 
    class Meta:
        model = OrdonnanceRadio
        fields = '__all__'


class OrdonnanceSerializer(serializers.ModelSerializer):
    patient_nom = serializers.CharField(source='consultation.rdv.patient.nom_patient', read_only=True)
    medecin_nom = serializers.CharField(source='consultation.medecin.nom_med', read_only=True)
    medecin_specialite = serializers.CharField(source='consultation.medecin.specialite_med', read_only=True)
    class Meta:
        model = Ordonnance
        fields = '__all__'


class DossierMedicalSerializer(serializers.ModelSerializer):
    patient_nom = serializers.CharField(source='patient.nom_patient', read_only=True)
    patient_prenom = serializers.CharField(source='patient.prenom_patient', read_only=True)
    
    class Meta:
        model = DossierMedical
        fields = '__all__'




class FactureSerializer(serializers.ModelSerializer):
    patient_nom = serializers.CharField(source='consultation.rdv.patient.nom_patient', read_only=True)
    patient_prenom = serializers.CharField(source='consultation.rdv.patient.prenom_patient', read_only=True)
    medecin_nom = serializers.CharField(source='consultation.medecin.nom_med', read_only=True)
    medecin_prenom = serializers.CharField(source='consultation.medecin.prenom_med', read_only=True)
    montant_calcule = serializers.SerializerMethodField()
    
    class Meta:
        model = Facture
        fields = '__all__'
    
    def get_montant_calcule(self, obj):
        return obj.calculer_montant()
    


# Ajoutez ces serializers dans votre fichiers serializers.py

class FactureDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour une facture avec tous les actes médicaux"""
    
    # Informations patient
    patient_nom = serializers.CharField(source='consultation.rdv.patient.nom_patient', read_only=True)
    patient_prenom = serializers.CharField(source='consultation.rdv.patient.prenom_patient', read_only=True)
    # Ajoutez ces deux lignes :
    medecin_nom = serializers.CharField(source='consultation.medecin.nom_med', read_only=True)
    medecin_prenom = serializers.CharField(source='consultation.medecin.prenom_med', read_only=True)
    
    # Informations consultation
    prix_consultation = serializers.FloatField(source='consultation.prix_cons', read_only=True)
    date_consultation = serializers.DateField(source='consultation.date_cons', read_only=True)
    
    # Actes médicaux avec détails
    actes_medicaux = serializers.SerializerMethodField()
    
    # Montant total calculé
    montant_total = serializers.SerializerMethodField()
    
    class Meta:
        model = Facture
        fields = [
            'id_facture',
            'date_fact',
            'type_facture',
            'patient_nom',
            'patient_prenom',
            'medecin_nom',        # ← Ajoutez
            'medecin_prenom', 
            'prix_consultation',
            'date_consultation',
            'actes_medicaux',
            'montant',
            'montant_total'
        ]
    
    def get_actes_medicaux(self, obj):
        """Récupère tous les actes médicaux de la consultation"""
        consultation = obj.consultation
        actes = ConsultationActe.objects.filter(consultation=consultation)
        
        return [{
            'id': acte.id,
            'nom_acte': acte.acte.nom_acte,
            'prix_unitaire': acte.prix_applique,
            'quantite': acte.quantite,
            'prix_total': acte.prix_applique * acte.quantite
        } for acte in actes]
    
    def get_montant_total(self, obj):
        """Calcule le montant total (consultation + actes)"""
        return obj.calculer_montant()
    
# Ajoutez ces serializers à la fin du fichier

class OrganismeAssuranceSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganismeAssurance
        fields = '__all__'


class PatientOrganismeSerializer(serializers.ModelSerializer):
    organisme_nom = serializers.CharField(source='organisme.nom_org', read_only=True)
    organisme_type = serializers.CharField(source='organisme.type_org', read_only=True)
    
    class Meta:
        model = PatientOrganisme
        fields = '__all__'

class MaladieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Maladie
        fields = '__all__'


class MaladieDossierSerializer(serializers.ModelSerializer):
    maladie_nom = serializers.CharField(source='maladie.nom_malad', read_only=True)
    
    class Meta:
        model = MaladieDossier
        fields = '__all__'


class VaccinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vaccin
        fields = '__all__'


class VaccinDossierSerializer(serializers.ModelSerializer):
    vaccin_nom = serializers.CharField(source='vaccin.nom_vacc', read_only=True)
    
    class Meta:
        model = VaccinDossier
        fields = '__all__'


class AllergieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergie
        fields = '__all__'


class AllergieDossierSerializer(serializers.ModelSerializer):
    allergie_nom = serializers.CharField(source='allergie.nom_allerg', read_only=True)
    
    class Meta:
        model = AllergieDossier
        fields = '__all__'

# Ajoutez ceci dans votre serializers.py


class JourTravailSerializer(serializers.ModelSerializer):
    medecin_nom = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = JourTravail
        fields = ['id', 'medecin', 'medecin_nom', 'date', 'heure_debut', 'heure_fin']
        
    def get_medecin_nom(self, obj):
        """Retourne le nom complet du médecin"""
        return f"Dr {obj.medecin.nom_med} {obj.medecin.prenom_med}"
    
# ===== Dans serializers.py =====


from django.contrib.auth import authenticate
from .models import User, Patient

class UserSerializer(serializers.ModelSerializer):
    """Serializer pour afficher les informations utilisateur"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'telephone', 'date_naissance', 'cin']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription des patients"""
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'telephone', 'date_naissance', 'cin']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        
        # Créer l'utilisateur
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role='PATIENT',
            telephone=validated_data.get('telephone', ''),
            date_naissance=validated_data.get('date_naissance'),
            cin=validated_data.get('cin', '')
        )
        
        # Créer automatiquement un Patient lié
        patient = Patient.objects.create(
            nom_patient=user.last_name,
            prenom_patient=user.first_name,
            cin=user.cin,
            telephone=user.telephone,
            date_naissance=user.date_naissance,
            sexe='Non spécifié',
            adresse='',
            situation_familiale='Non spécifié'
        )
        
        # Lier le patient à l'utilisateur
        user.patient = patient
        user.save()
        
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer pour la connexion"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError("Identifiants incorrects")
            if not user.is_active:
                raise serializers.ValidationError("Compte désactivé")
            data['user'] = user
        else:
            raise serializers.ValidationError("Username et password requis")
        
        return data


