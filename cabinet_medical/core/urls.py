from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, LoginView, LogoutView, CurrentUserView
from .views import (
    PatientViewSet, MedecinViewSet, RDVViewSet,
    CreneauViewSet, ConsultationViewSet, EmployeViewSet,
    ActeMedicalViewSet, ConsultationActeViewSet,
    OrdonnanceViewSet, OrdonnanceAnalyseViewSet, OrdonnanceRadioViewSet,
    AnalyseViewSet, RadioViewSet, DossierMedicalViewSet, FactureViewSet,MaladieViewSet, MaladieDossierViewSet,
    VaccinViewSet, VaccinDossierViewSet,
    AllergieViewSet, AllergieDossierViewSet,PatientViewSet, MedecinViewSet,
    JourTravailViewSet, OrganismeAssuranceViewSet,
    PatientOrganismeViewSet
)

from .views_auth import (

    ChangePasswordView,
    UserProfileView
)
from .views_user import UserViewSet, RegisterStaffView

router = DefaultRouter()
router.register(r'employes', EmployeViewSet, basename='employe')
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'medecins', MedecinViewSet, basename='medecin')
router.register(r'creneaux', CreneauViewSet, basename='creneau')
router.register(r'rdvs', RDVViewSet, basename='rdv')
router.register(r'consultations', ConsultationViewSet, basename='consultation')
router.register(r'actes', ActeMedicalViewSet, basename='acte')
router.register(r'consultation-actes', ConsultationActeViewSet, basename='consultation-acte')
router.register(r'analyses', AnalyseViewSet, basename='analyse')
router.register(r'radios', RadioViewSet, basename='radio')
router.register(r'ordonnances', OrdonnanceViewSet, basename='ordonnance')
router.register(r'ordonnance-analyses', OrdonnanceAnalyseViewSet, basename='ordonnance-analyse')
router.register(r'ordonnance-radios', OrdonnanceRadioViewSet, basename='ordonnance-radio')
router.register(r'dossiers', DossierMedicalViewSet, basename='dossier')
router.register(r'factures', FactureViewSet, basename='facture')
#admin
router.register(r'patients', PatientViewSet)
router.register(r'medecins', MedecinViewSet)
router.register(r'employes', EmployeViewSet)
router.register(r'rdv', RDVViewSet)
router.register(r'consultations', ConsultationViewSet)
router.register(r'factures', FactureViewSet)
router.register(r'jours-travail', JourTravailViewSet)
router.register(r'users', UserViewSet)
# Ajoutez ces routes
router.register(r'maladies', MaladieViewSet, basename='maladie')
router.register(r'maladie-dossiers', MaladieDossierViewSet, basename='maladie-dossier')
router.register(r'vaccins', VaccinViewSet, basename='vaccin')
router.register(r'vaccin-dossiers', VaccinDossierViewSet, basename='vaccin-dossier')
router.register(r'allergies', AllergieViewSet, basename='allergie')
router.register(r'allergie-dossiers', AllergieDossierViewSet, basename='allergie-dossier')
router.register(r'jours-travail', JourTravailViewSet, basename='jour-travail')
router.register(r'organismes', OrganismeAssuranceViewSet, basename='organisme')
router.register(r'patient-organismes', PatientOrganismeViewSet, basename='patient-organisme')
# Ajoutez cette ligne
router.register(r'users', UserViewSet, basename='user')
urlpatterns = [
    path('', include(router.urls)),
    # Routes d'authentification
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', CurrentUserView.as_view(), name='current-user'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('auth/profile/', UserProfileView.as_view(), name='user-profile'),
    path('auth/register-staff/', RegisterStaffView.as_view(), name='register-staff'),
]








