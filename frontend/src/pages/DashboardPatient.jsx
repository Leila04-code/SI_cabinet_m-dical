// src/pages/DashboardPatient.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import authService from '../services/authService';
import api from '../services/api';

function DashboardPatient() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [rdvs, setRdvs] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRdvs([]);
    setPatient(null);
    
    const currentUser = authService.getCurrentUser();
    console.log('👤 Utilisateur connecté:', currentUser);
    setUser(currentUser);
    
    if (currentUser) {
      fetchPatientData(currentUser);
    }
  }, []);

  const fetchPatientData = async (currentUser) => {
    try {
      console.log('🔍 Recherche du patient avec CIN:', currentUser.cin);
      
      const patientsResponse = await api.get(`http://127.0.0.1:8000/api/patients/?cin=${currentUser.cin}`);
      console.log('📋 Patients trouvés:', patientsResponse.data);
      
      if (patientsResponse.data && patientsResponse.data.length > 0) {
        const patientData = patientsResponse.data[0];
        console.log('✅ Patient sélectionné:', patientData);
        setPatient(patientData);
        
        console.log('🔍 Recherche des RDV pour le patient ID:', patientData.id_patient);
        const rdvsResponse = await api.get(`http://127.0.0.1:8000/api/rdvs/?patient=${patientData.id_patient}`);
        console.log('📅 RDV bruts reçus de l\'API:', rdvsResponse.data);
        // 🔍 TEST DE PARSING DE DATE
        console.log('═══════════════════════════════════════');
        console.log('🧪 TEST DE PARSING DES DATES');
        console.log('═══════════════════════════════════════');

        const testDate = '2026-01-02';
        console.log('📅 Date string à tester:', testDate);

        // Méthode 1 : new Date(string)
        const date1 = new Date(testDate);
        console.log('Méthode 1 - new Date(string):', date1.toISOString(), '| Timestamp:', date1.getTime());

        // Méthode 2 : new Date(year, month-1, day)
        const [y, m, d] = testDate.split('-').map(Number);
        const date2 = new Date(y, m - 1, d);
        console.log('Méthode 2 - new Date(y,m,d):', date2.toISOString(), '| Timestamp:', date2.getTime());

        // Date du jour
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log('📅 Aujourd\'hui:', today.toISOString(), '| Timestamp:', today.getTime());

        // Comparaison
        console.log('Méthode 1 >= aujourd\'hui?', date1 >= today);
        console.log('Méthode 2 >= aujourd\'hui?', date2 >= today);
        console.log('═══════════════════════════════════════');
                // Vérifier pour chaque RDV s'il a une consultation
        const rdvsAvecStatut = await Promise.all(
          rdvsResponse.data.map(async (rdv) => {
            try {
              const consultationResponse = await api.get(`http://127.0.0.1:8000/api/consultations/?rdv=${rdv.id}`);
              const hasConsultation = consultationResponse.data.length > 0;
              console.log(`🔍 RDV ID=${rdv.id}, Date=${rdv.creneau_details?.date}, A consultation=${hasConsultation}`);
              return {
                ...rdv,
                hasConsultation
              };
            } catch (err) {
              console.log(`🔍 RDV ID=${rdv.id}, Date=${rdv.creneau_details?.date}, Erreur consultation, considéré comme false`);
              return {
                ...rdv,
                hasConsultation: false
              };
            }
          })
        );
        
        console.log('📊 RDV avec statut consultation:', rdvsAvecStatut);
        
        // Filtrer les RDV à venir SANS consultation
        const rdvsAVenir = rdvsAvecStatut.filter(rdv => {
          const rdvDate = rdv.creneau_details?.date || '';
          if (!rdvDate) {
            console.log(`❌ RDV ID=${rdv.id} rejeté: pas de date`);
            return false;
          }
          
          const rdvDateObj = new Date(rdvDate);
          rdvDateObj.setHours(0, 0, 0, 0);
          
          const isDateOk = rdvDateObj >= today;
          const noConsultation = !rdv.hasConsultation;
          
          console.log(`📋 RDV ID=${rdv.id}:`);
          console.log(`   - Date: ${rdvDate} (timestamp: ${rdvDateObj.getTime()})`);
          console.log(`   - Aujourd'hui: ${today.toISOString().split('T')[0]} (timestamp: ${today.getTime()})`);
          console.log(`   - Date OK (>=): ${isDateOk}`);
          console.log(`   - Pas de consultation: ${noConsultation}`);
          console.log(`   - RÉSULTAT: ${isDateOk && noConsultation ? '✅ GARDÉ' : '❌ REJETÉ'}`);
          
          return isDateOk && noConsultation;
        }).sort((a, b) => {
          const dateA = a.creneau_details?.date || '';
          const dateB = b.creneau_details?.date || '';
          return dateA.localeCompare(dateB);
        });
        
        console.log('✅ RDV FINAUX à afficher:', rdvsAVenir);
        console.log('📊 Nombre de RDV à afficher:', rdvsAVenir.length);
        setRdvs(rdvsAVenir);
      } else {
        console.warn('⚠️ Aucun patient trouvé avec ce CIN');
        setRdvs([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCancelRDV = async (rdvId, creneauId) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      try {
        await api.delete(`http://127.0.0.1:8000/api/rdvs/${rdvId}/`);
        await api.patch(`http://127.0.0.1:8000/api/creneaux/${creneauId}/`, {
          libre: true
        });
        
        const currentUser = authService.getCurrentUser();
        fetchPatientData(currentUser);
        
        alert('Rendez-vous annulé avec succès');
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'annulation du rendez-vous');
      }
    }
  };

  const handleCardClick = (destination, cardName) => {
    console.log(`Clic sur la carte: ${cardName}`);
    console.log(`Navigation vers: ${destination}`);
    navigate(destination);
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🏥 Cabinet Médical - Espace Patient
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user?.first_name} {user?.last_name}
          </Typography>
          <IconButton size="large" onClick={handleMenu} color="inherit">
            <AccountCircleIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            <MenuItem disabled>
              <Box>
                <Typography variant="subtitle2">{user?.username}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { handleClose(); navigate('/patient/profil'); }}>
              Mon Profil
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); handleLogout(); }}>
              <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
              Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Bienvenue {user?.first_name} !
          </Typography>
          <Typography variant="body1">
            Gérez vos rendez-vous et consultez votre dossier médical
          </Typography>
        </Paper>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer', 
                '&:hover': { boxShadow: 6, transform: 'translateY(-4px)', transition: 'all 0.3s' } 
              }}
              onClick={() => handleCardClick('/patient/mes-rdv', 'Mes Rendez-vous')}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CalendarMonthIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>Mes Rendez-vous</Typography>
                <Typography variant="body2" color="text.secondary">
                  {rdvs.length} RDV programmé{rdvs.length > 1 ? 's' : ''}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer', 
                '&:hover': { boxShadow: 6, transform: 'translateY(-4px)', transition: 'all 0.3s' } 
              }}
              onClick={() => handleCardClick('/patient/prendre-rdv', 'Prendre un RDV')}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <AddIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>Prendre un RDV</Typography>
                <Typography variant="body2" color="text.secondary">Réservez rapidement</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer', 
                '&:hover': { boxShadow: 6, transform: 'translateY(-4px)', transition: 'all 0.3s' } 
              }}
              onClick={() => handleCardClick('/patient/mon-dossier', 'Mon Dossier')}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <FolderIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>Mon Dossier</Typography>
                <Typography variant="body2" color="text.secondary">Historique médical</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              📅 Mes prochains rendez-vous
            </Typography>
            {rdvs.length > 0 && (
              <Button variant="outlined" size="small" onClick={() => navigate('/patient/mes-rdv')}>
                Voir tout
              </Button>
            )}
          </Box>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">Chargement...</Typography>
            </Box>
          ) : rdvs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CalendarMonthIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Aucun rendez-vous programmé
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
                onClick={() => navigate('/patient/prendre-rdv')}
              >
                Prendre un rendez-vous
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {rdvs.slice(0, 3).map((rdv) => (
                <Grid item xs={12} key={rdv.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalHospitalIcon color="primary" />
                            <Box>
                              <Typography variant="h6" color="primary">
                                Dr {rdv.medecin_nom} {rdv.medecin_prenom}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {rdv.medecin_specialite || 'Généraliste'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={5}>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip 
                              icon={<CalendarMonthIcon />}
                              label={new Date(rdv.creneau_details?.date).toLocaleDateString('fr-FR', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short'
                              })}
                              color="primary"
                              size="small"
                            />
                            <Chip 
                              icon={<AccessTimeIcon />}
                              label={rdv.creneau_details?.heure_debut}
                              color="secondary"
                              size="small"
                            />
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={3} sx={{ textAlign: 'right' }}>
                          <Button 
                            size="small" 
                            color="error" 
                            variant="outlined"
                            onClick={() => handleCancelRDV(rdv.id, rdv.creneau)}
                          >
                            Annuler
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default DashboardPatient;