// src/services/receptionService.js
import api from './api';

const receptionService = {
  // ===== RECHERCHE PATIENT =====
  searchPatientByCIN: (cin) => api.get(`patients/search-cin/?cin=${cin}`),
  searchPatientByName: (nom, prenom) => api.get(`patients/search-name/?nom=${nom}&prenom=${prenom}`),
  
  // ===== CRÉATION PATIENT + DOSSIER =====
  createPatientWithDossier: (patientData) => api.post('patients/create-with-dossier/', patientData),
  
  // ===== GESTION RDV =====
  getCreneauxDisponibles: (medecinId, date) => api.get(`creneaux/disponibles/?medecin=${medecinId}&date=${date}`),
  getJoursTravail: (medecinId) => api.get(`medecins/${medecinId}/jours-travail/`),
  createRDV: (rdvData) => api.post('rdvs/', rdvData),
  confirmerRDV: (rdvId) => api.patch(`rdvs/${rdvId}/confirmer/`),
  reserverRDV: (rdvId) => api.patch(`rdvs/${rdvId}/reserver/`),
  
  // ===== SALLE D'ATTENTE =====
  getSalleAttente: () => api.get('rdvs/salle-attente/'),
  marquerEnConsultation: (rdvId) => api.patch(`rdvs/${rdvId}/en-consultation/`),
  marquerTermine: (rdvId) => api.patch(`rdvs/${rdvId}/termine/`),
  
  // ===== VÉRIFICATION RÉVISION =====
  verifierRevision: (patientId, consultationId) => 
    api.get(`consultations/verifier-revision/?patient=${patientId}&consultation=${consultationId}`),
  
  // ===== FACTURATION =====
  genererFacture: (consultationId, data) => api.post(`factures/generer/`, {
    consultation: consultationId,
    ...data
  }),
  
  // ===== ASSURANCE =====
  createFicheAssurance: (data) => api.post('assurances/', data),
  
  // ===== STATISTIQUES RÉCEPTION =====
  getStatsJour: () => api.get('reception/stats-jour/'),
  getRDVAujourdhui: () => api.get('rdvs/aujourdhui/'),
};

export default receptionService;