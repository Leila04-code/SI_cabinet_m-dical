// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// ===== AUTHENTIFICATION =====
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import authService from './services/authService';

// ===== DASHBOARDS PAR RÔLE =====
import DashboardPatient from './pages/DashboardPatient';
import DashboardMedecin from './pages/DashboardMedecin';

// ===== PAGES PATIENT =====
import MesRendezVous from './pages/patient/MesRendezVous';
import PrendreRDV from './pages/patient/PrendreRDV';
import MonDossier from './pages/patient/MonDossier';
import MonProfil from './pages/patient/MonProfil';

// ===== PAGES RÉCEPTIONNISTE =====
import ReceptionDashboard from './pages/ReceptionDashboard';
import AccueilPatient from './pages/AccueilPatient';
import SalleAttente from './pages/SalleAttente';
import FacturationPatient from './pages/FacturationPatient';

// ===== PAGES ADMIN/RÉCEPTIONNISTE =====
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Medecins from './pages/Medecins';
import RDV from './pages/RDV';
import Consultations from './pages/Consultations';
import Factures from './pages/Factures';
import DossiersMedicaux from './pages/DossiersMedicaux';
import Ordonnances from './pages/Ordonnances';
import Maladies from './pages/Maladies';
import Vaccins from './pages/Vaccins';
import Allergies from './pages/Allergies';
import Employes from './pages/Employes';
import JoursTravail from './pages/JoursTravail';
import Actes from './pages/Actes';
// En haut de App.js, avec vos autres imports

import GestionPersonnel from './pages/admin/GestionPersonnel';
// ===== THÈME =====


import MesHoraires from './pages/medecin/MesHoraires';
import ConsultationPatient from './pages/medecin/ConsultationPatient';


const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

// ===== COMPOSANT DE REDIRECTION INTELLIGENTE =====
function SmartRedirect() {
  const user = authService.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Rediriger selon le rôle
  switch(user.role) {
    case 'PATIENT':
      return <Navigate to="/dashboard/patient" replace />;
    case 'MEDECIN':
      return <Navigate to="/dashboard/medecin" replace />;
    case 'RECEPTIONNISTE':
      return <Navigate to="/admin/reception" replace />;
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        
        <Routes>
          {/* ===== PAGE D'ACCUEIL - SÉLECTION RÔLE ===== */}
          <Route path="/" element={<LandingPage />} />
          
          {/* ===== ROUTES PUBLIQUES ===== */}
          <Route path="/login/:type" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* ===== REDIRECTION SI DÉJÀ CONNECTÉ ===== */}
          <Route path="/dashboard" element={<SmartRedirect />} />
          
          {/* ===== DASHBOARD PATIENT ===== */}
          <Route
            path="/dashboard/patient"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <DashboardPatient />
              </ProtectedRoute>
            }
          />
          
          {/* ===== ROUTES PATIENT ===== */}
          <Route
            path="/patient/mes-rdv"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <MesRendezVous />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/patient/prendre-rdv"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PrendreRDV />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/patient/mon-dossier"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <MonDossier />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/patient/profil" 
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <MonProfil />
              </ProtectedRoute>
            }
          />
          
          {/* ===== DASHBOARD MÉDECIN ===== */}
          <Route
            path="/dashboard/medecin"
            element={
              <ProtectedRoute allowedRoles={['MEDECIN']}>
                <DashboardMedecin />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/medecin/horaires" 
            element={
              <ProtectedRoute allowedRoles={['MEDECIN']}>
                <MesHoraires />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/medecin/horaires" 
            element={<ProtectedRoute allowedRoles={['MEDECIN']}><MesHoraires /></ProtectedRoute>} 
          />
          <Route 
            path="/medecin/consultation/:rdvId" 
            element={<ProtectedRoute allowedRoles={['MEDECIN']}><ConsultationPatient /></ProtectedRoute>} 
          />
          {/* ===== INTERFACE ADMIN/RÉCEPTIONNISTE ===== */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONNISTE']}>
                <Layout>
                  <Routes>
                    {/* Dashboard admin classique */}
                    <Route path="dashboard" element={<Dashboard />} />
                    
                    {/* ===== ROUTES RÉCEPTIONNISTE ===== */}
                    <Route path="reception" element={<ReceptionDashboard />} />
                    <Route path="accueil-patient" element={<AccueilPatient />} />
                    <Route path="salle-attente" element={<SalleAttente />} />
                    <Route path="facturation/:rdvId" element={<FacturationPatient />} />
                    
                    {/* Routes existantes */}
                    <Route path="patients" element={<Patients />} />
                    <Route path="medecins" element={<Medecins />} />
                    <Route path="rdv" element={<RDV />} />
                    <Route path="consultations" element={<Consultations />} />
                    <Route path="factures" element={<Factures />} />
                    <Route path="dossiers" element={<DossiersMedicaux />} />
                    <Route path="ordonnances" element={<Ordonnances />} />
                    <Route path="maladies" element={<Maladies />} />
                    <Route path="vaccins" element={<Vaccins />} />
                    <Route path="allergies" element={<Allergies />} />
                    <Route path="employes" element={<Employes />} />
                    <Route path="jours-travail" element={<JoursTravail />} />
                    <Route path="actes" element={<Actes />} />
                    <Route path="personnel" element={<GestionPersonnel />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* ===== ROUTE 404 ===== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
