// src/services/api.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===== SERVICES PATIENTS =====
export const patientService = {
  getAll: () => api.get('patients/'),
  getById: (id) => api.get(`patients/${id}/`),
  create: (data) => api.post('patients/', data),
  update: (id, data) => api.put(`patients/${id}/`, data),
  delete: (id) => api.delete(`patients/${id}/`),
  searchByCIN: (cin) => api.get(`patients/search-cin/?cin=${cin}`),
  searchByName: (nom, prenom) => api.get(`patients/search-name/?nom=${nom}&prenom=${prenom || ''}`),
};

// ===== SERVICES MÉDECINS =====
export const medecinService = {
  getAll: () => api.get('medecins/'),
  getById: (id) => api.get(`medecins/${id}/`),
  create: (data) => api.post('medecins/', data),
  update: (id, data) => api.put(`medecins/${id}/`, data),
  delete: (id) => api.delete(`medecins/${id}/`),
  getJoursTravail: (id) => api.get(`medecins/${id}/jours-travail/`),
  getSpecialites: () => api.get('medecins/specialites/'),
};

// ===== SERVICES CRÉNEAUX =====
export const creneauService = {
  getAll: () => api.get('creneaux/'),
  getLibres: () => api.get('creneaux/libres/'),
  getById: (id) => api.get(`creneaux/${id}/`),
  getDisponibles: (medecinId, date) => api.get(`creneaux/disponibles/?medecin=${medecinId}&date=${date}`),
};

// ===== SERVICES RDV =====
export const rdvService = {
  getAll: () => api.get('rdvs/'),
  getById: (id) => api.get(`rdvs/${id}/`),
  create: (data) => api.post('rdvs/', data),
  update: (id, data) => api.put(`rdvs/${id}/`, data),
  delete: (id) => api.delete(`rdvs/${id}/`),
  confirmer: (id) => api.patch(`rdvs/${id}/confirmer/`),
  reserver: (id) => api.patch(`rdvs/${id}/reserver/`),
  annuler: (id) => api.patch(`rdvs/${id}/annuler/`),
  marquerEnConsultation: (id) => api.patch(`rdvs/${id}/en-consultation/`),
  marquerTermine: (id) => api.patch(`rdvs/${id}/termine/`),
  getAujourdhui: () => api.get('rdvs/aujourdhui/'),
  getSalleAttente: () => api.get('rdvs/salle-attente/'),
};

// ===== SERVICES CONSULTATIONS =====
export const consultationService = {
  getAll: () => api.get('consultations/'),
  getById: (id) => api.get(`consultations/${id}/`),
  create: (data) => api.post('consultations/', data),
  update: (id, data) => api.put(`consultations/${id}/`, data),
  delete: (id) => api.delete(`consultations/${id}/`),
  verifierRevision: (patientId, consultationId) => 
    api.get(`consultations/verifier-revision/?patient=${patientId}&consultation=${consultationId || ''}`),
};

// ===== SERVICES ANALYSES =====
export const analyseService = {
  getAll: () => api.get('analyses/'),
  getById: (id) => api.get(`analyses/${id}/`),
  create: (data) => api.post('analyses/', data),
  update: (id, data) => api.put(`analyses/${id}/`, data),
  delete: (id) => api.delete(`analyses/${id}/`),
};

// ===== SERVICES RADIOS =====
export const radioService = {
  getAll: () => api.get('radios/'),
  getById: (id) => api.get(`radios/${id}/`),
  create: (data) => api.post('radios/', data),
  update: (id, data) => api.put(`radios/${id}/`, data),
  delete: (id) => api.delete(`radios/${id}/`),
};

// ===== SERVICES FACTURES =====
export const factureService = {
  getAll: () => api.get('factures/'),
  getById: (id) => api.get(`factures/${id}/`),
  create: (data) => api.post('factures/', data),
  generer: (consultationId, data) => api.post(`factures/generer/`, {
    consultation: consultationId,
    ...data
  }),
  imprimer: (id) => api.get(`factures/${id}/imprimer/`),
};

// ===== SERVICES DOSSIERS MÉDICAUX =====
export const dossierService = {
  getAll: () => api.get('dossiers/'),
  getById: (id) => api.get(`dossiers/${id}/`),
  getByPatient: (patientId) => api.get(`dossiers/patient/${patientId}/`),
  create: (data) => api.post('dossiers/', data),
  update: (id, data) => api.put(`dossiers/${id}/`, data),
};

// ===== SERVICES ORDONNANCES =====
export const ordonnanceService = {
  getAll: () => api.get('ordonnances/'),
  getById: (id) => api.get(`ordonnances/${id}/`),
  create: (data) => api.post('ordonnances/', data),
  update: (id, data) => api.put(`ordonnances/${id}/`, data),
  delete: (id) => api.delete(`ordonnances/${id}/`),
};

// ===== SERVICES MALADIES =====
export const maladieService = {
  getAll: () => api.get('maladies/'),
  getById: (id) => api.get(`maladies/${id}/`),
  create: (data) => api.post('maladies/', data),
  update: (id, data) => api.put(`maladies/${id}/`, data),
  delete: (id) => api.delete(`maladies/${id}/`),
};

// ===== SERVICES VACCINS =====
export const vaccinService = {
  getAll: () => api.get('vaccins/'),
  getById: (id) => api.get(`vaccins/${id}/`),
  create: (data) => api.post('vaccins/', data),
  update: (id, data) => api.put(`vaccins/${id}/`, data),
  delete: (id) => api.delete(`vaccins/${id}/`),
};

// ===== SERVICES ALLERGIES =====
export const allergieService = {
  getAll: () => api.get('allergies/'),
  getById: (id) => api.get(`allergies/${id}/`),
  create: (data) => api.post('allergies/', data),
  update: (id, data) => api.put(`allergies/${id}/`, data),
  delete: (id) => api.delete(`allergies/${id}/`),
};

// ===== SERVICES EMPLOYÉS =====
export const employeService = {
  getAll: () => api.get('employes/'),
  getById: (id) => api.get(`employes/${id}/`),
  create: (data) => api.post('employes/', data),
  update: (id, data) => api.put(`employes/${id}/`, data),
  delete: (id) => api.delete(`employes/${id}/`),
};

// ===== SERVICES JOURS DE TRAVAIL =====
export const jourTravailService = {
  getAll: () => api.get('jours-travail/'),
  getById: (id) => api.get(`jours-travail/${id}/`),
  create: (data) => api.post('jours-travail/', data),
  update: (id, data) => api.put(`jours-travail/${id}/`, data),
  delete: (id) => api.delete(`jours-travail/${id}/`),
  getByMedecin: (medecinId) => api.get(`jours-travail/medecin/${medecinId}/`),
};

// ===== SERVICES ACTES MÉDICAUX =====
export const acteService = {
  getAll: () => api.get('actes/'),
  getById: (id) => api.get(`actes/${id}/`),
  create: (data) => api.post('actes/', data),
  update: (id, data) => api.put(`actes/${id}/`, data),
  delete: (id) => api.delete(`actes/${id}/`),
};

// ===== SERVICES ASSURANCE =====
export const assuranceService = {
  getAll: () => api.get('assurances/'),
  getById: (id) => api.get(`assurances/${id}/`),
  create: (data) => api.post('assurances/', data),
  update: (id, data) => api.put(`assurances/${id}/`, data),
  delete: (id) => api.delete(`assurances/${id}/`),
  getByPatient: (patientId) => api.get(`assurances/patient/${patientId}/`),
};

// ===== SERVICES RÉCEPTION (SPÉCIFIQUES) =====
export const receptionService = {
  // Statistiques
  getStatsJour: () => api.get('reception/stats-jour/'),
  
  // Création patient avec dossier
  createPatientWithDossier: (data) => api.post('patients/create-with-dossier/', data),
  
  // Gestion complète des RDV (réutilise rdvService)
  ...rdvService,
};

export default api;