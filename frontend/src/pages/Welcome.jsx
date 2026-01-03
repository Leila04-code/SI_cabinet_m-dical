// src/pages/Welcome.jsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BusinessIcon from '@mui/icons-material/Business';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

function Welcome() {
  const navigate = useNavigate();

  const roles = [
    {
      title: '🧑 Patient',
      description: 'Prendre rendez-vous et consulter mon dossier médical',
      icon: <PersonIcon sx={{ fontSize: 80, color: '#667eea' }} />,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      actions: [
        { label: 'Créer mon compte', path: '/register/patient', variant: 'contained' },
        { label: 'Me connecter', path: '/login?role=patient', variant: 'outlined' }
      ]
    },
    {
      title: '👨‍⚕️ Médecin',
      description: 'Gérer mes consultations et mon planning',
      icon: <LocalHospitalIcon sx={{ fontSize: 80, color: '#f093fb' }} />,
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      actions: [
        { label: 'Créer mon compte', path: '/register/medecin', variant: 'contained' },
        { label: 'Me connecter', path: '/login?role=medecin', variant: 'outlined' }
      ]
    },
    {
      title: '🧑‍💼 Réceptionniste',
      description: 'Gérer les rendez-vous et les patients',
      icon: <BusinessIcon sx={{ fontSize: 80, color: '#4facfe' }} />,
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      actions: [
        { label: 'Créer mon compte', path: '/register/receptionniste', variant: 'contained' },
        { label: 'Me connecter', path: '/login?role=receptionniste', variant: 'outlined' }
      ]
    },
    {
      title: '👨‍💻 Administrateur',
      description: 'Administration complète du cabinet',
      icon: <AdminPanelSettingsIcon sx={{ fontSize: 80, color: '#43e97b' }} />,
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      actions: [
        { label: 'Me connecter', path: '/login?role=admin', variant: 'contained' }
      ]
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Paper
          elevation={10}
          sx={{
            p: 4,
            mb: 4,
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 3
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
            🏥 Bienvenue au Cabinet Médical
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Choisissez votre profil pour commencer
          </Typography>
        </Paper>

        {/* Role Cards */}
        <Grid container spacing={3}>
          {roles.map((role, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                elevation={10}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                  }
                }}
              >
                <Box
                  sx={{
                    background: role.color,
                    p: 3,
                    textAlign: 'center',
                    color: 'white'
                  }}
                >
                  {role.icon}
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 2 }}>
                    {role.title}
                  </Typography>
                </Box>

                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    {role.description}
                  </Typography>
                </CardContent>

                <CardActions sx={{ flexDirection: 'column', gap: 1, p: 2 }}>
                  {role.actions.map((action, idx) => (
                    <Button
                      key={idx}
                      fullWidth
                      variant={action.variant}
                      size="large"
                      onClick={() => navigate(action.path)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
            © 2025 Cabinet Médical - Tous droits réservés
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Welcome;