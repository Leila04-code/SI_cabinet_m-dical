# core/serializers_auth.py
# Créez ce nouveau fichier

from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Patient, Medecin, Employe

class UserSerializer(serializers.ModelSerializer):
    """Serializer pour afficher les informations utilisateur"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'full_name', 'role', 'telephone', 'date_naissance', 'cin'
        ]
        read_only_fields = ['id']
    
    def get_full_name(self, obj):
        return obj.full_name


class RegisterPatientSerializer(serializers.Serializer):
    """Serializer pour l'inscription des patients"""
    # Informations de compte
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    
    # Informations personnelles
    nom = serializers.CharField(max_length=100)
    prenom = serializers.CharField(max_length=100)
    cin = serializers.CharField(max_length=20)
    telephone = serializers.CharField(max_length=20)
    date_naissance = serializers.DateField()
    sexe = serializers.ChoiceField(choices=[('M', 'Masculin'), ('F', 'Féminin')])
    adresse = serializers.CharField(max_length=200, required=False, allow_blank=True)
    situation_familiale = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur existe déjà")
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé")
        return value
    
    def validate_cin(self, value):
        # ✅ IMPORTANT : Vérifier si un USER avec ce CIN existe (pas le Patient)
        if User.objects.filter(cin=value).exists():
            raise serializers.ValidationError(
                "Un compte en ligne existe déjà avec ce CIN. "
                "Essayez de vous connecter ou contactez la réception."
            )
        return value
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas"})
        return data
    
    def create(self, validated_data):
        from core.models import Patient, User
        
        # Retirer password_confirm
        validated_data.pop('password_confirm')
        
        # Extraire les données
        username = validated_data['username']
        email = validated_data['email']
        password = validated_data['password']
        nom = validated_data['nom']
        prenom = validated_data['prenom']
        cin = validated_data['cin']
        telephone = validated_data['telephone']
        date_naissance = validated_data['date_naissance']
        sexe = validated_data['sexe']
        adresse = validated_data.get('adresse', '')
        situation_familiale = validated_data.get('situation_familiale', 'Célibataire')
        
        # ✅ CHERCHER SI LE PATIENT EXISTE DÉJÀ (enregistré par réceptionniste)
        existing_patient = Patient.objects.filter(cin=cin).first()
        
        if existing_patient:
            print(f"✅ Patient existant trouvé: {existing_patient.prenom_patient} {existing_patient.nom_patient}")
            
            # ✅ Patient existe déjà → Créer UNIQUEMENT le User et le lier
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=existing_patient.prenom_patient,  # Utiliser les données existantes
                last_name=existing_patient.nom_patient,
                role='PATIENT',
                telephone=existing_patient.telephone,
                date_naissance=existing_patient.date_naissance,
                cin=cin
            )
            
            print(f"✅ Compte User créé pour patient existant ID: {existing_patient.id_patient}")
            
            # ✅ Mettre à jour l'email du patient si fourni
            if email and not existing_patient.telephone:
                existing_patient.telephone = telephone
            if adresse and not existing_patient.adresse:
                existing_patient.adresse = adresse
            existing_patient.save()
            
            return user
        
        else:
            print(f"✅ Nouveau patient: {prenom} {nom}")
            
            # ✅ Nouveau patient → Créer User ET Patient
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=prenom,
                last_name=nom,
                role='PATIENT',
                telephone=telephone,
                date_naissance=date_naissance,
                cin=cin
            )
            
            # Créer le patient
            patient = Patient.objects.create(
                nom_patient=nom,
                prenom_patient=prenom,
                cin=cin,
                telephone=telephone,
                date_naissance=date_naissance,
                sexe=sexe,
                adresse=adresse,
                situation_familiale=situation_familiale
            )
            
            print(f"✅ Nouveau patient créé ID: {patient.id_patient}")
            
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
                raise serializers.ValidationError("Ce compte a été désactivé")
            data['user'] = user
        else:
            raise serializers.ValidationError("Nom d'utilisateur et mot de passe requis")
        
        return data


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer pour changer le mot de passe"""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mot de passe actuel incorrect")
        return value
    
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Les mots de passe ne correspondent pas"})
        return data
    
    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user