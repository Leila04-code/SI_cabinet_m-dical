import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import { Box, Card, CardContent, Typography, Grid, CircularProgress, Alert } from '@mui/material';

const Dashboard = () => {
  const [stats, setStats] = useState({
    patients: 0,
    medecins: 0,
    rendezvous: 0,
    consultations: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [patientsRes, medecinsRes, rdvRes, consultationsRes] = await Promise.all([
        api.get('patients/'),
        api.get('medecins/'),
        api.get('rdvs/'),
        api.get('consultations/')
      ]);

      let pendingUsers = 0;
      try {
        const usersRes = await api.get('users/');
        pendingUsers = usersRes.data.filter(u => !u.is_active && u.role !== 'PATIENT').length;
      } catch (err) {
        console.log('Endpoint users non disponible');
      }

      setStats({
        patients: patientsRes.data.length,
        medecins: medecinsRes.data.length,
        rendezvous: rdvRes.data.length,
        consultations: consultationsRes.data.length,
        pendingApprovals: pendingUsers
      });
      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      setError('Erreur lors du chargement des données');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Patients',
      value: stats.patients,
      icon: PeopleIcon,
      color: '#2196f3',
      bgColor: '#e3f2fd'
    },
    {
      title: 'Médecins',
      value: stats.medecins,
      icon: LocalHospitalIcon,
      color: '#4caf50',
      bgColor: '#e8f5e9'
    },
    {
      title: 'Rendez-vous',
      value: stats.rendezvous,
      icon: CalendarTodayIcon,
      color: '#ff9800',
      bgColor: '#fff3e0'
    },
    {
      title: 'Consultations',
      value: stats.consultations,
      icon: AssignmentIcon,
      color: '#9c27b0',
      bgColor: '#f3e5f5'
    }
  ];

  return (
    <Box p={3}>
      {/* En-tête */}
      <Box mb={4} display="flex" alignItems="center" gap={2}>
        <TrendingUpIcon sx={{ fontSize: 40, color: '#2196f3' }} />
        <Box>
          <Typography variant="h4" fontWeight="bold">Tableau de Bord</Typography>
          <Typography color="text.secondary">Bienvenue dans votre espace</Typography>
        </Box>
      </Box>

      {/* Alerte comptes en attente */}
      {stats.pendingApprovals > 0 && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
          <Typography fontWeight="medium">
            {stats.pendingApprovals} compte(s) en attente de validation
          </Typography>
          <Typography variant="body2">
            Rendez-vous dans <a href="/admin/personnel" style={{ textDecoration: 'underline', fontWeight: 600 }}>Gestion Personnel</a> pour les approuver
          </Typography>
        </Alert>
      )}

      {/* Cartes statistiques */}
      <Grid container spacing={3} mb={4}>
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                bgcolor: stat.bgColor, 
                '&:hover': { boxShadow: 4 },
                transition: 'box-shadow 0.3s',
                cursor: 'pointer'
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" variant="body2" fontWeight="medium">
                        {stat.title}
                      </Typography>
                      <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        bgcolor: stat.color,
                        borderRadius: '50%',
                        width: 56,
                        height: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <IconComponent sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Vue d'ensemble */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Vue d'ensemble
          </Typography>
          <Box>
            <Typography variant="body1" mb={1}>✓ Système opérationnel</Typography>
            <Typography variant="body1" mb={1}>✓ {stats.medecins} médecin(s) actif(s)</Typography>
            <Typography variant="body1" mb={1}>✓ {stats.patients} patient(s) enregistré(s)</Typography>
            <Typography variant="body1">✓ {stats.rendezvous} rendez-vous programmé(s)</Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;