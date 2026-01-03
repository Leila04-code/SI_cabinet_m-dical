# core/views_auth.py
# Créez ce nouveau fichier

from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth import login, logout
from .serializers_auth import (
    UserSerializer, 
    RegisterPatientSerializer, 
    LoginSerializer,
    ChangePasswordSerializer
)

class RegisterView(APIView):
    """Vue pour l'inscription des patients"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterPatientSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Créer un token pour l'utilisateur
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'Inscription réussie ! Bienvenue sur notre plateforme.'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """Vue pour la connexion"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Créer ou récupérer le token
            token, created = Token.objects.get_or_create(user=user)
            
            # Connecter l'utilisateur (session)
            login(request, user)
            
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': f'Bienvenue {user.full_name} !'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """Vue pour la déconnexion"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Supprimer le token
            request.user.auth_token.delete()
        except Exception as e:
            pass
        
        # Déconnecter l'utilisateur
        logout(request)
        
        return Response({
            'message': 'Déconnexion réussie'
        }, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    """Vue pour obtenir l'utilisateur connecté"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class ChangePasswordView(APIView):
    """Vue pour changer le mot de passe"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Mot de passe modifié avec succès'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """Vue pour voir/modifier le profil utilisateur"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Obtenir les informations du profil"""
        user = request.user
        data = UserSerializer(user).data
        
        # Ajouter des infos supplémentaires selon le rôle
        if user.role == 'PATIENT':
            try:
                patient = Patient.objects.get(cin=user.cin)
                data['patient_id'] = patient.id_patient
                data['adresse'] = patient.adresse
                data['situation_familiale'] = patient.situation_familiale
            except Patient.DoesNotExist:
                pass
        
        elif user.role == 'MEDECIN':
            try:
                medecin = Medecin.objects.filter(
                    nom_med=user.last_name,
                    prenom_med=user.first_name
                ).first()
                if medecin:
                    data['medecin_id'] = medecin.id_med
                    data['specialite'] = medecin.specialite_med
            except Exception:
                pass
        
        return Response(data)
    
    def put(self, request):
        """Modifier le profil"""
        user = request.user
        
        # Champs modifiables
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.email = request.data.get('email', user.email)
        user.telephone = request.data.get('telephone', user.telephone)
        
        user.save()
        
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Profil mis à jour avec succès'
        })


# Import nécessaire pour UserProfileView
from .models import Patient, Medecin