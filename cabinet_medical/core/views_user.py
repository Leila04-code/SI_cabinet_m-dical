# core/views_user.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers_user import (
    UserSerializer, CreateUserSerializer, UpdateUserSerializer,
    ResetPasswordSerializer, RegisterStaffSerializer
)

User = get_user_model()

class IsAdminUser(object):
    """Permission pour vérifier que l'utilisateur est admin"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les utilisateurs"""
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateUserSerializer
        elif self.action in ['update', 'partial_update']:
            return UpdateUserSerializer
        return UserSerializer
    
    def list(self, request):
        users = User.objects.all().order_by('-date_joined')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur introuvable'}, status=status.HTTP_404_NOT_FOUND)
    
    def create(self, request):
        serializer = CreateUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
            serializer = UpdateUserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(UserSerializer(user).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur introuvable'}, status=status.HTTP_404_NOT_FOUND)
    
    def destroy(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
            
            if user.id == request.user.id:
                return Response(
                    {'error': 'Vous ne pouvez pas supprimer votre propre compte'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if user.role == 'ADMIN':
                return Response(
                    {'error': 'Impossible de supprimer un compte administrateur'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.delete()
            return Response({'message': 'Utilisateur supprimé avec succès'}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur introuvable'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['patch'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
            serializer = ResetPasswordSerializer(data=request.data)
            
            if serializer.is_valid():
                new_password = serializer.validated_data['new_password']
                user.set_password(new_password)
                user.save()
                return Response({
                    'message': 'Mot de passe réinitialisé avec succès',
                    'new_password': new_password
                })
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur introuvable'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['patch'], url_path='toggle-status')
    def toggle_status(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
            
            if user.id == request.user.id:
                return Response(
                    {'error': 'Vous ne pouvez pas désactiver votre propre compte'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.is_active = not user.is_active
            user.save()
            
            return Response({
                'message': f"Compte {'activé' if user.is_active else 'désactivé'}",
                'is_active': user.is_active
            })
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur introuvable'}, status=status.HTTP_404_NOT_FOUND)


class RegisterStaffView(APIView):
    """Vue pour l'inscription du personnel"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        serializer = RegisterStaffSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'user': UserSerializer(user).data,
                'message': f'{user.role} créé avec succès'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)