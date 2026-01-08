import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Services pour chaque modèle
// Dans votre src/services/api.js
// Remplacez TOUTE la section patientService par ceci :

export const patientService = {
  getAll: () => api.get('patients/'),
  getById: (id) => api.get(`patients/${id}/`),
  create: (data) => api.post('patients/', data),
  update: (id, data) => api.put(`patients/${id}/`, data),
  delete: (id) => api.delete(`patients/${id}/`),
  
  // ✅ AJOUTEZ CES FONCTIONS
  searchByCIN: (cin) => api.get(`patients/search-cin/?cin=${cin}`),
  searchByName: (nom, prenom) => api.get(`patients/search-name/?nom=${nom}&prenom=${prenom || ''}`),
  createWithDossier: (data) => api.post('patients/create-with-dossier/', data),
};

export const medecinService = {
  getAll: () => api.get('medecins/'),
  getById: (id) => api.get(`medecins/${id}/`),
  create: (data) => api.post('medecins/', data),
  update: (id, data) => api.put(`medecins/${id}/`, data),
  delete: (id) => api.delete(`medecins/${id}/`),
};

export const creneauService = {
  getAll: () => api.get('creneaux/'),
  getLibres: () => api.get('creneaux/libres/'),
  getById: (id) => api.get(`creneaux/${id}/`),
  getDisponibles: (medecinId, date) => api.get(`creneaux/disponibles/?medecin=${medecinId}&date=${date}`),
  confirmer: (id) => api.patch(`rdvs/${id}/confirmer/`),
  reserver: (id) => api.patch(`rdvs/${id}/reserver/`),
  annuler: (id) => api.patch(`rdvs/${id}/annuler/`),
  marquerEnConsultation: (id) => api.patch(`rdvs/${id}/en-consultation/`),
  marquerTermine: (id) => api.patch(`rdvs/${id}/termine/`),  // ← CETTE LIGNE
  
  aujourdhui: () => api.get('rdvs/aujourdhui/'),
  salle_attente: () => api.get('rdvs/salle-attente/'),
};

export const rdvService = {
  getAll: () => api.get('rdvs/'),
  getById: (id) => api.get(`rdvs/${id}/`),
  create: (data) => api.post('rdvs/', data),
  update: (id, data) => api.put(`rdvs/${id}/`, data),
  delete: (id) => api.delete(`rdvs/${id}/`),
  confirmer: (id) => api.patch(`rdvs/${id}/confirmer/`),
  marquerEnConsultation: (id) => api.patch(`rdvs/${id}/en-consultation/`),
  marquerTermine: (id) => api.patch(`rdvs/${id}/termine/`),
  reserver: (id) => api.patch(`rdvs/${id}/reserver/`),
  annuler: (id) => api.patch(`rdvs/${id}/annuler/`),
  
  aujourdhui: () => api.get('rdvs/aujourdhui/'),
  salle_attente: () => api.get('rdvs/salle-attente/'),
};

export const consultationService = {
  getAll: () => api.get('consultations/'),
  getById: (id) => api.get(`consultations/${id}/`),
  create: (data) => api.post('consultations/', data),
  update: (id, data) => api.put(`consultations/${id}/`, data),
  delete: (id) => api.delete(`consultations/${id}/`),
};

export const analyseService = {
  getAll: () => api.get('analyses/'),
  getById: (id) => api.get(`analyses/${id}/`),
};

export const radioService = {
  getAll: () => api.get('radios/'),
  getById: (id) => api.get(`radios/${id}/`),
};

export const factureService = {
  getAll: () => api.get('factures/'),
  getById: (id) => api.get(`factures/${id}/`),
  create: (data) => api.post('factures/', data),
};

export default api;