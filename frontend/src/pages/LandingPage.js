// src/pages/LandingPage.js - VERSION AVEC ADMIN
import React from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Paper,
  Avatar
} from '@mui/material';
import {
  Person,
  Business,
  LocalHospital,
  AdminPanelSettings
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  const RoleCard = ({ title, description, icon, color, path }) => (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-10px)',
          boxShadow: 8,
        }
      }}
    >
      <CardActionArea 
        onClick={() => navigate(path)}
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: 3
        }}
      >
        <Avatar
          sx={{
            width: 100,
            height: 100,
            bgcolor: color,
            mb: 3,
            mx: 'auto'
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h4" component="div" gutterBottom align="center">
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          {description}
        </Typography>
      </CardActionArea>
    </Card>
  );

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
        {/* En-tête */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            p: 4,
            mb: 6,
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
            <LocalHospital sx={{ fontSize: 60, color: 'primary.main', mr: 2 }} />
            <Typography variant="h2" component="h1" color="primary">
              Cabinet Médical
            </Typography>
          </Box>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Bienvenue sur notre plateforme de gestion médicale
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Veuillez sélectionner votre profil pour continuer
          </Typography>
        </Paper>

        <Grid container spacing={4}>
          {/* PATIENT */}
          <Grid item xs={12} md={4}>
            <RoleCard
              title="Patient"
              description="Accédez à vos rendez-vous, consultations et dossier médical"
              icon={<Person sx={{ fontSize: 60 }} />}
              color="primary.main"
              path="/login/patient"
            />
          </Grid>

          {/* PERSONNEL */}
          <Grid item xs={12} md={4}>
            <RoleCard
              title="Personnel"
              description="Réceptionniste, Médecin"
              icon={<Business sx={{ fontSize: 60 }} />}
              color="secondary.main"
              path="/login/personnel"
            />
          </Grid>

          {/* ADMIN */}
          <Grid item xs={12} md={4}>
            <RoleCard
              title="Administrateur"
              description="Gestion complète du système et du personnel"
              icon={<AdminPanelSettings sx={{ fontSize: 60 }} />}
              color="#ff9800"
              path="/login/personnel"
            />
          </Grid>
        </Grid>

        {/* Footer */}
        <Box mt={6} textAlign="center">
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            © 2025 Cabinet Médical - Tous droits réservés
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default LandingPage;