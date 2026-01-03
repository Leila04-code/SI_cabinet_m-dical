// src/pages/admin/DashboardAdmin.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  LocalHospital as LocalHospitalIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  BarChart as ChartIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

function DashboardAdmin() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // États pour les statistiques
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalMedecins: 0,
    totalEmployes: 0,
    comptesEnAttente: 0,
    rdvAujourdhui: 0,
    consultationsMois: 0,
    revenuMois: 0
  });

  // États pour les activités récentes
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      // Récupérer les statistiques admin
      const statsResponse = await axios.get(`${API_URL}/admin/dashboard-stats/`, config);
      
      // Récupérer les patients
      const patientsResponse = await axios.get(`${API_URL}/patients/`, config);
      
      // Récupérer les RDV (si disponible)
      try {
        const rdvResponse = await axios.get(`${API_URL}/rdv/`, config);
        const rdvAujourdhui = rdvResponse.data.filter(rdv => {
          const rdvDate = new Date(rdv.creneau?.date);
          const today = new Date();
          return rdvDate.toDateString() === today.toDateString();
        });
        
        setUpcomingAppointments(rdvResponse.data.slice(0, 5));
        setStats(prev => ({
          ...prev,
          rdvAujourdhui: rdvAujourdhui.length
        }));
      } catch (error) {
        console.log('RDV non disponibles');
      }

      setStats(prev => ({
        ...prev,
        totalPatients: patientsResponse.data.length,
        totalMedecins: statsResponse.data.total_medecins || 0,
        totalEmployes: statsResponse.data.total_employes || 0,
        comptesEnAttente: statsResponse.data.comptes_en_attente || 0,
        consultationsMois: Math.floor(Math.random() * 150) + 100, // Placeholder
        revenuMois: Math.floor(Math.random() * 50000) + 30000 // Placeholder
      }));

      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  // Cards de statistiques
  const StatCard = ({ title, value, icon, color, trend, onClick }) => (
    <Card 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 6, transform: 'translateY(-2px)' } : {},
        transition: 'all 0.3s'
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h3" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
              {value}
            </Typography>
            {trend && (
              <Chip 
                label={trend} 
                size="small" 
                color="success" 
                icon={<TrendingUpIcon />}
              />
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '12px',
              width: 60,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 2
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  // Boutons d'action rapide
  const QuickActionButton = ({ icon, label, onClick, color }) => (
    <Button
      variant="contained"
      size="large"
      startIcon={icon}
      onClick={onClick}
      sx={{
        py: 2,
        backgroundColor: color,
        '&:hover': {
          backgroundColor: color,
          opacity: 0.9
        }
      }}
      fullWidth
    >
      {label}
    </Button>
  );

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* AppBar */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Dashboard Administrateur
          </Typography>
          
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <NotificationsIcon />
          </IconButton>
          
          <IconButton onClick={handleMenuOpen} size="small">
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {localStorage.getItem('userName')?.charAt(0) || 'A'}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => navigate('/admin/profile')}>
              <SettingsIcon sx={{ mr: 2 }} /> Mon profil
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 2 }} /> Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Message de bienvenue */}
        <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Typography variant="h4" gutterBottom>
            Bienvenue, {localStorage.getItem('userName') || 'Administrateur'} 👋
          </Typography>
          <Typography variant="body1">
            Voici un aperçu de l'activité de votre cabinet médical
          </Typography>
        </Paper>

        {/* Statistiques principales */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Patients"
              value={stats.totalPatients}
              icon={<PeopleIcon sx={{ color: 'white', fontSize: 30 }} />}
              color="#2196f3"
              trend="+12% ce mois"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Médecins"
              value={stats.totalMedecins}
              icon={<LocalHospitalIcon sx={{ color: 'white', fontSize: 30 }} />}
              color="#4caf50"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="RDV Aujourd'hui"
              value={stats.rdvAujourdhui}
              icon={<CalendarIcon sx={{ color: 'white', fontSize: 30 }} />}
              color="#ff9800"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Comptes en attente"
              value={stats.comptesEnAttente}
              icon={<PersonAddIcon sx={{ color: 'white', fontSize: 30 }} />}
              color="#f44336"
              onClick={() => navigate('/admin/personnel')}
            />
          </Grid>
        </Grid>

        {/* Actions rapides */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              🚀 Actions Rapides
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              icon={<PeopleIcon />}
              label="Gestion du Personnel"
              onClick={() => navigate('/admin/personnel')}
              color="#1976d2"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              icon={<AssignmentIcon />}
              label="Voir Patients"
              onClick={() => navigate('/patients')}
              color="#2e7d32"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              icon={<CalendarIcon />}
              label="Rendez-vous"
              onClick={() => navigate('/rdv')}
              color="#ed6c02"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              icon={<ChartIcon />}
              label="Statistiques"
              onClick={() => navigate('/admin/stats')}
              color="#9c27b0"
            />
          </Grid>
        </Grid>

        {/* Statistiques détaillées */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    📊 Activité du Mois
                  </Typography>
                  <Button size="small" endIcon={<ArrowForwardIcon />}>
                    Détails
                  </Button>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#e3f2fd' }}>
                      <Typography variant="h4" color="primary">
                        {stats.consultationsMois}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Consultations
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#f3e5f5' }}>
                      <Typography variant="h4" color="secondary">
                        {stats.revenuMois.toLocaleString()} DH
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Revenu
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Performance
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={75} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    75% de l'objectif mensuel
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    👥 Personnel
                  </Typography>
                  <Button 
                    size="small" 
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/admin/personnel')}
                  >
                    Gérer
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                      <LocalHospitalIcon sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
                      <Typography variant="h5">{stats.totalMedecins}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Médecins
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                      <PeopleIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                      <Typography variant="h5">{stats.totalEmployes}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Réceptionnistes
                      </Typography>
                    </Box>
                  </Grid>

                  {stats.comptesEnAttente > 0 && (
                    <Grid item xs={12}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          backgroundColor: '#fff3e0', 
                          border: '1px solid #ffb74d',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#ffe0b2' }
                        }}
                        onClick={() => navigate('/admin/personnel')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonAddIcon sx={{ color: '#ff9800', mr: 1 }} />
                            <Typography variant="body2">
                              <strong>{stats.comptesEnAttente}</strong> compte(s) en attente de validation
                            </Typography>
                          </Box>
                          <ArrowForwardIcon sx={{ color: '#ff9800' }} />
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Prochains rendez-vous */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  📅 Prochains Rendez-vous
                </Typography>
                
                {upcomingAppointments.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CalendarIcon sx={{ fontSize: 60, color: '#bdbdbd', mb: 2 }} />
                    <Typography color="text.secondary">
                      Aucun rendez-vous à venir
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Patient</TableCell>
                          <TableCell>Médecin</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Heure</TableCell>
                          <TableCell>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {upcomingAppointments.map((rdv, index) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              {rdv.patient?.nom_patient} {rdv.patient?.prenom_patient}
                            </TableCell>
                            <TableCell>
                              Dr {rdv.medecin?.nom_med} {rdv.medecin?.prenom_med}
                            </TableCell>
                            <TableCell>
                              {rdv.creneau?.date ? new Date(rdv.creneau.date).toLocaleDateString('fr-FR') : '-'}
                            </TableCell>
                            <TableCell>
                              {rdv.creneau?.heure_debut || '-'}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={rdv.creneau?.libre ? 'Confirmé' : 'En attente'} 
                                size="small" 
                                color={rdv.creneau?.libre ? 'success' : 'warning'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default DashboardAdmin;