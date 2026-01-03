from rest_framework import viewsets, filters,status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from datetime import datetime, timedelta
from .models import (
    Patient, Medecin, RDV, Creneau, Consultation,
    Employe, ActeMedical, ConsultationActe,
    Ordonnance, OrdonnanceAnalyse, OrdonnanceRadio,
    Analyse, Radio, DossierMedical, Facture,
    Maladie, MaladieDossier, Vaccin, VaccinDossier,  # ← AJOUTEZ CES IMPORTS
    Allergie, AllergieDossier,JourTravail                          # ← AJOUTEZ CES IMPORTS
)


from .serializers import (
    PatientSerializer, MedecinSerializer, RDVSerializer,
    CreneauSerializer, ConsultationSerializer, EmployeSerializer,
    ActeMedicalSerializer, ConsultationActeSerializer,
    OrdonnanceSerializer, OrdonnanceAnalyseSerializer, OrdonnanceRadioSerializer,
    AnalyseSerializer, RadioSerializer, DossierMedicalSerializer, FactureSerializer,
    MaladieSerializer, MaladieDossierSerializer,      # ← AJOUTEZ CES IMPORTS
    VaccinSerializer, VaccinDossierSerializer,        # ← AJOUTEZ CES IMPORTS
    AllergieSerializer, AllergieDossierSerializer ,JourTravailSerializer,FactureDetailSerializer   # ← AJOUTEZ CES IMPORTS
)

# Ajoutez ces imports en haut si pas déjà présents
from .models import OrganismeAssurance, PatientOrganisme
from .serializers import OrganismeAssuranceSerializer, PatientOrganismeSerializer

# Ajoutez ces ViewSets à la fin du fichier
class OrganismeAssuranceViewSet(viewsets.ModelViewSet):
    queryset = OrganismeAssurance.objects.all()
    serializer_class = OrganismeAssuranceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['nom_org', 'type_org']
    search_fields = ['nom_org']


class PatientOrganismeViewSet(viewsets.ModelViewSet):
    queryset = PatientOrganisme.objects.all()
    serializer_class = PatientOrganismeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['patient', 'organisme']

class EmployeViewSet(viewsets.ModelViewSet):
    queryset = Employe.objects.all()
    serializer_class = EmployeSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom_empl', 'prenom_empl', 'cin_empl']




class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    
    # ✅ AJOUTEZ CES LIGNES
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['cin', 'id_patient', 'nom_patient', 'prenom_patient']  # ← IMPORTANT
    search_fields = ['nom_patient', 'prenom_patient', 'cin', 'telephone']
    ordering_fields = ['nom_patient', 'date_naissance']
        
    @action(detail=False, methods=['get'], url_path='search-cin')
    def search_by_cin(self, request):
        """Recherche patient par CIN"""
        cin = request.query_params.get('cin', None)
        if not cin:
            return Response({'error': 'CIN requis'}, status=400)
        
        try:
            # Chercher dans la table Patient
            patients = Patient.objects.filter(cin=cin)
            serializer = self.get_serializer(patients, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    @action(detail=False, methods=['get'], url_path='search-name')
    def search_by_name(self, request):
        """Recherche patient par nom/prénom"""
        nom = request.query_params.get('nom', '')
        prenom = request.query_params.get('prenom', '')
        
        if not nom:
            return Response({'error': 'Nom requis'}, status=400)
        
        try:
            patients = Patient.objects.filter(
                nom__icontains=nom,
                prenom__icontains=prenom
            )
            serializer = self.get_serializer(patients, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    @action(detail=False, methods=['post'], url_path='create-with-dossier')
    def create_with_dossier(self, request):
        """Créer un patient avec son dossier médical vide"""
        try:
            # Créer le patient
            patient_serializer = self.get_serializer(data=request.data)
            patient_serializer.is_valid(raise_exception=True)
            patient = patient_serializer.save()
            
            # Créer le dossier médical vide
            DossierMedical.objects.create(
                patient=patient,
                poids=0,
                taille=0,
                tension_arterielle='',
                antecedents_medicaux='',
                antecedents_chirurgicaux='',
                antecedents_familiaux=''
            )
            
            return Response(patient_serializer.data, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class MedecinViewSet(viewsets.ModelViewSet):
    queryset = Medecin.objects.all()
    serializer_class = MedecinSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom_med', 'prenom_med', 'specialite_med']


class CreneauViewSet(viewsets.ModelViewSet):
    queryset = Creneau.objects.all()
    serializer_class = CreneauSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['medecin', 'date', 'libre']
    ordering_fields = ['date', 'heure_debut']
    
    @action(detail=False, methods=['get'])
    def libres(self, request):
        """Retourne uniquement les créneaux libres"""
        creneaux_libres = Creneau.objects.filter(libre=True)
        serializer = self.get_serializer(creneaux_libres, many=True)
        return Response(serializer.data)
    @action(detail=False, methods=['get'], url_path='disponibles')
    def disponibles(self, request):
        """Récupérer les créneaux disponibles pour un médecin et une date"""
        medecin_id = request.query_params.get('medecin')
        date = request.query_params.get('date')
        
        if not medecin_id or not date:
            return Response({'error': 'Médecin et date requis'}, status=400)
        
        try:
            creneaux = Creneau.objects.filter(
                medecin_id=medecin_id,
                date=date,
                libre=True
            )
            serializer = self.get_serializer(creneaux, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class RDVViewSet(viewsets.ModelViewSet):
    queryset = RDV.objects.all()
    serializer_class = RDVSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['patient', 'medecin', 'creneau__date']
    @action(detail=True, methods=['patch'], url_path='confirmer')
    def confirmer(self, request, pk=None):
        """Confirmer un RDV"""
        rdv = self.get_object()
        rdv.statut = 'CONFIRME'
        rdv.save()
        return Response({'status': 'RDV confirmé'})
    
    @action(detail=True, methods=['patch'], url_path='reserver')
    def reserver(self, request, pk=None):
        """Réserver un RDV"""
        rdv = self.get_object()
        rdv.statut = 'RESERVE'
        rdv.save()
        return Response({'status': 'RDV réservé'})
    
    @action(detail=True, methods=['patch'], url_path='en-consultation')
    def en_consultation(self, request, pk=None):
        """Marquer RDV en consultation"""
        rdv = self.get_object()
        rdv.statut = 'EN_CONSULTATION'
        rdv.save()
        return Response({'status': 'En consultation'})
    
    @action(detail=True, methods=['patch'], url_path='termine')
    def termine(self, request, pk=None):
        """Marquer RDV terminé"""
        rdv = self.get_object()
        rdv.statut = 'TERMINE'
        rdv.save()
        return Response({'status': 'Terminé'})
    
    @action(detail=False, methods=['get'], url_path='aujourdhui')
    def aujourdhui(self, request):
        """RDV du jour"""
        from datetime import date
        today = date.today()
        rdvs = RDV.objects.filter(creneau__date=today)
        serializer = self.get_serializer(rdvs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='salle-attente')
    def salle_attente(self, request):
        """Patients en salle d'attente"""
        rdvs = RDV.objects.filter(statut='CONFIRME')
        serializer = self.get_serializer(rdvs, many=True)
        return Response(serializer.data)

class ConsultationViewSet(viewsets.ModelViewSet):
    queryset = Consultation.objects.all()
    serializer_class = ConsultationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['medecin', 'date_cons', 'rdv__patient', 'rdv']  # ← AJOUTEZ 'rdv'
    search_fields = ['diagnostic', 'rdv__patient__nom_patient']


class ActeMedicalViewSet(viewsets.ModelViewSet):
    queryset = ActeMedical.objects.all()
    serializer_class = ActeMedicalSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nom_acte']


class ConsultationActeViewSet(viewsets.ModelViewSet):
    queryset = ConsultationActe.objects.all()
    serializer_class = ConsultationActeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['consultation', 'acte']


class AnalyseViewSet(viewsets.ModelViewSet):
    queryset = Analyse.objects.all()
    serializer_class = AnalyseSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nom_analyse']


class RadioViewSet(viewsets.ModelViewSet):
    queryset = Radio.objects.all()
    serializer_class = RadioSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nom_rad']


class OrdonnanceViewSet(viewsets.ModelViewSet):
    queryset = Ordonnance.objects.all()
    serializer_class = OrdonnanceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['consultation', 'date_ord']


class OrdonnanceAnalyseViewSet(viewsets.ModelViewSet):
    queryset = OrdonnanceAnalyse.objects.all()
    serializer_class = OrdonnanceAnalyseSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['consultation', 'analyse', 'date_ord']


class OrdonnanceRadioViewSet(viewsets.ModelViewSet):
    queryset = OrdonnanceRadio.objects.all()
    serializer_class = OrdonnanceRadioSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['consultation', 'radio', 'date_ord']


class DossierMedicalViewSet(viewsets.ModelViewSet):
    queryset = DossierMedical.objects.all()
    serializer_class = DossierMedicalSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['patient']


# Modifiez votre FactureViewSet dans views.py pour ajouter l'action detail

class FactureViewSet(viewsets.ModelViewSet):
    queryset = Facture.objects.all()
    serializer_class = FactureSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['consultation', 'type_facture', 'date_fact']
    
    @action(detail=True, methods=['get'], url_path='detail')
    def get_detail(self, request, pk=None):
        """
        Endpoint pour récupérer le détail complet d'une facture
        URL: /api/factures/{id}/detail/
        """
        try:
            facture = self.get_object()
            serializer = FactureDetailSerializer(facture)
            return Response(serializer.data)
        except Facture.DoesNotExist:
            return Response(
                {'error': 'Facture introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )






# Ajoutez ces ViewSets à la fin du fichier

class MaladieViewSet(viewsets.ModelViewSet):
    queryset = Maladie.objects.all()
    serializer_class = MaladieSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nom_malad']


class MaladieDossierViewSet(viewsets.ModelViewSet):
    queryset = MaladieDossier.objects.all()
    serializer_class = MaladieDossierSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['dossier', 'maladie']


class VaccinViewSet(viewsets.ModelViewSet):
    queryset = Vaccin.objects.all()
    serializer_class = VaccinSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nom_vacc']


class VaccinDossierViewSet(viewsets.ModelViewSet):
    queryset = VaccinDossier.objects.all()
    serializer_class = VaccinDossierSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['dossier', 'vaccin']


class AllergieViewSet(viewsets.ModelViewSet):
    queryset = Allergie.objects.all()
    serializer_class = AllergieSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nom_allerg']


class AllergieDossierViewSet(viewsets.ModelViewSet):
    queryset = AllergieDossier.objects.all()
    serializer_class = AllergieDossierSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['dossier', 'allergie']




class JourTravailViewSet(viewsets.ModelViewSet):
    queryset = JourTravail.objects.all()
    serializer_class = JourTravailSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['medecin', 'date']
    
    def create(self, request, *args, **kwargs):
        """
        Crée un jour de travail ET génère les créneaux de 30 minutes
        """
        try:
            # Valider les données
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Sauvegarder le jour de travail
            jour_travail = serializer.save()
            
            # Générer les créneaux manuellement
            heure = jour_travail.heure_debut
            date = jour_travail.date
            heure_fin = jour_travail.heure_fin
            duree_delta = timedelta(minutes=30)
            
            creneaux_crees = 0
            while heure < heure_fin:
                datetime_debut = datetime.combine(date, heure)
                datetime_fin = datetime_debut + duree_delta
                heure_fin_creneau = datetime_fin.time()
                
                # Ne pas créer de créneau si ça dépasse l'heure de fin
                if heure_fin_creneau > heure_fin:
                    break
                
                # Créer le créneau
                Creneau.objects.create(
                    medecin=jour_travail.medecin,
                    date=date,
                    heure_debut=heure,
                    heure_fin=heure_fin_creneau,
                    libre=True
                )
                
                creneaux_crees += 1
                heure = heure_fin_creneau
            
            # Préparer la réponse avec le nombre de créneaux créés
            response_data = serializer.data
            response_data['creneaux_crees'] = creneaux_crees
            
            headers = self.get_success_headers(serializer.data)
            return Response(
                response_data, 
                status=status.HTTP_201_CREATED, 
                headers=headers
            )
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, *args, **kwargs):
        """
        Modifie un jour de travail et régénère les créneaux
        """
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            # Supprimer les anciens créneaux LIBRES uniquement
            Creneau.objects.filter(
                medecin=instance.medecin,
                date=instance.date,
                libre=True
            ).delete()
            
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            # Régénérer les créneaux manuellement après modification
            jour_travail = serializer.instance
            heure = jour_travail.heure_debut
            date = jour_travail.date
            heure_fin = jour_travail.heure_fin
            duree_delta = timedelta(minutes=30)
            
            while heure < heure_fin:
                datetime_debut = datetime.combine(date, heure)
                datetime_fin = datetime_debut + duree_delta
                heure_fin_creneau = datetime_fin.time()
                
                if heure_fin_creneau > heure_fin:
                    break
                
                Creneau.objects.create(
                    medecin=jour_travail.medecin,
                    date=date,
                    heure_debut=heure,
                    heure_fin=heure_fin_creneau,
                    libre=True
                )
                
                heure = heure_fin_creneau
            
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def destroy(self, request, *args, **kwargs):
        """
        Supprime un jour de travail (les créneaux sont supprimés automatiquement par le signal)
        """
        try:
            instance = self.get_object()
            
            # Vérifier s'il y a des créneaux déjà réservés
            creneaux_pris = Creneau.objects.filter(
                medecin=instance.medecin,
                date=instance.date,
                libre=False
            ).count()
            
            if creneaux_pris > 0:
                return Response(
                    {
                        'error': f'Impossible de supprimer : {creneaux_pris} créneau(x) sont déjà réservé(s).',
                        'creneaux_pris': creneaux_pris
                    }, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        

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


# Ajoutez ces imports en haut si pas déjà présents
from .models import OrganismeAssurance, PatientOrganisme
from .serializers import OrganismeAssuranceSerializer, PatientOrganismeSerializer

# Ajoutez ces ViewSets à la fin du fichier
class OrganismeAssuranceViewSet(viewsets.ModelViewSet):
    queryset = OrganismeAssurance.objects.all()
    serializer_class = OrganismeAssuranceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['nom_org', 'type_org']
    search_fields = ['nom_org']


class PatientOrganismeViewSet(viewsets.ModelViewSet):
    queryset = PatientOrganisme.objects.all()
    serializer_class = PatientOrganismeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['patient', 'organisme']