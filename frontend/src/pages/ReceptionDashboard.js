// src/pages/ReceptionDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button
} from '@mui/material';
import {
  PersonAdd,
  CalendarToday,
  People,
  AccessTime,
  CheckCircle,
  Receipt
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import receptionService from '../services/receptionService';

function ReceptionDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    patientsAujourdhui: 0,
    rdvEnAttente: 0,
    rdvConfirmes: 0,
    salleAttente: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // Refresh toutes les 30 secondes
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const statsRes = await receptionService.getStatsJour();
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, action }) => (
    <Card sx={{ height: '100%', cursor: action ? 'pointer' : 'default' }} onClick={action}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: color, opacity: 0.7 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <Box p={3}><Typography>Chargement...</Typography></Box>;
  }

  return (
    <Box p={3}>
      {/* En-tête */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Réception - Tableau de bord
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Typography>
      </Box>

      {/* Actions rapides */}
      <Box mb={4}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<PersonAdd />}
              onClick={() => navigate('/admin/accueil-patient')}
              sx={{ py: 2 }}
            >
              Accueillir un patient
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<CalendarToday />}
              onClick={() => navigate('/admin/rdv')}
              sx={{ py: 2 }}
            >
              Calendrier RDV
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Receipt />}
              onClick={() => navigate('/admin/factures')}
              sx={{ py: 2 }}
            >
              Facturation
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Patients aujourd'hui"
            value={stats.patientsAujourdhui}
            icon={<People sx={{ fontSize: 40 }} />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="RDV confirmés"
            value={stats.rdvConfirmes}
            icon={<CheckCircle sx={{ fontSize: 40 }} />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="En attente"
            value={stats.rdvEnAttente}
            icon={<AccessTime sx={{ fontSize: 40 }} />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Salle d'attente"
            value={stats.salleAttente}
            icon={<People sx={{ fontSize: 40 }} />}
            color="info.main"
            action={() => navigate('/admin/salle-attente')}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default ReceptionDashboard;