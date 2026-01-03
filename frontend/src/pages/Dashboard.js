import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { patientService, medecinService, rdvService, consultationService } from '../services/api';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';

function Dashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    medecins: 0,
    rdvs: 0,
    consultations: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patients, medecins, rdvs, consultations] = await Promise.all([
          patientService.getAll(),
          medecinService.getAll(),
          rdvService.getAll(),
          consultationService.getAll()
        ]);

        setStats({
          patients: patients.data.length,
          medecins: medecins.data.length,
          rdvs: rdvs.data.length,
          consultations: consultations.data.length
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column',
        height: 150,
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Box sx={{ color: 'white', opacity: 0.8 }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mt: 2 }}>
        {value}
      </Typography>
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        📊 Tableau de Bord
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Patients" 
            value={stats.patients} 
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            color="#2196f3"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Médecins" 
            value={stats.medecins} 
            icon={<LocalHospitalIcon sx={{ fontSize: 40 }} />}
            color="#4caf50"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Rendez-vous" 
            value={stats.rdvs} 
            icon={<EventIcon sx={{ fontSize: 40 }} />}
            color="#ff9800"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Consultations" 
            value={stats.consultations} 
            icon={<AssignmentIcon sx={{ fontSize: 40 }} />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;