# core/serializers_user.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Medecin, Employe

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer pour afficher les informations utilisateur"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'telephone', 'date_naissance', 'cin', 
            'is_active', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class CreateUserSerializer(serializers.ModelSerializer):
    """Serializer pour créer un utilisateur"""
    password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = [
            'username', 'password', 'email', 'first_name', 'last_name',
            'role', 'telephone', 'date_naissance', 'cin', 'is_active'
        ]
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UpdateUserSerializer(serializers.ModelSerializer):
    """Serializer pour modifier un utilisateur"""
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'telephone', 'is_active']


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer pour réinitialiser le mot de passe"""
    new_password = serializers.CharField(min_length=6, write_only=True)


class RegisterStaffSerializer(serializers.Serializer):
    """Serializer pour inscrire un membre du personnel"""
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    role = serializers.ChoiceField(choices=['MEDECIN', 'RECEPTIONNISTE'])
    telephone = serializers.CharField(max_length=20)
    cin = serializers.CharField(max_length=20)
    is_active = serializers.BooleanField(default=True)
    specialite = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur existe déjà")
        return value
    
    def validate_cin(self, value):
        if User.objects.filter(cin=value).exists():
            raise serializers.ValidationError("Ce CIN est déjà utilisé")
        return value
    
    def create(self, validated_data):
        from django.db import transaction
        
        role = validated_data.get('role')
        specialite = validated_data.pop('specialite', '')
        
        with transaction.atomic():
            user = User.objects.create_user(
                username=validated_data['username'],
                password=validated_data['password'],
                email=validated_data['email'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                role=role,
                telephone=validated_data['telephone'],
                cin=validated_data['cin'],
                is_active=validated_data.get('is_active', True)
            )
            
            if role == 'MEDECIN':
                Medecin.objects.create(
                    nom_med=validated_data['last_name'],
                    prenom_med=validated_data['first_name'],
                    specialite_med=specialite,
                    telephone=validated_data['telephone'],
                    email=validated_data['email']
                )
            elif role == 'RECEPTIONNISTE':
                Employe.objects.create(
                    nom_empl=validated_data['last_name'],
                    prenom_empl=validated_data['first_name'],
                    type_empl='RECEPTIONNISTE',
                    cin_empl=validated_data['cin'],
                    telephone=validated_data['telephone'],
                    email=validated_data['email']
                )
            
            return user