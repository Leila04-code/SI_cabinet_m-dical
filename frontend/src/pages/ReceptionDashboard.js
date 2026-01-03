// src/pages/ReceptionDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert
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
  const [rdvAujourdhui, setRdvAujourdhui] = useState([]);
  const [salleAttente, setSalleAttente] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // Refresh toutes les 30 secondes
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, rdvRes, salleRes] = await Promise.all([
        receptionService.getStatsJour(),
        receptionService.getRDVAujourdhui(),
        receptionService.getSalleAttente()
      ]);
      
      setStats(statsRes.data);
      setRdvAujourdhui(rdvRes.data);
      setSalleAttente(salleRes.data);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'CONFIRME': return 'success';
      case 'RESERVE': return 'warning';
      case 'EN_ATTENTE': return 'info';
      case 'EN_CONSULTATION': return 'primary';
      case 'TERMINE': return 'default';
      case 'ANNULE': return 'error';
      default: return 'default';
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
      <Grid container spacing={3} mb={4}>
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
            action={() => navigate('/admin/salle-attente')}
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

      {/* Salle d'attente en direct */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🪑 Salle d'attente ({salleAttente.length})
              </Typography>
              {salleAttente.length === 0 ? (
                <Alert severity="info">Aucun patient en attente</Alert>
              ) : (
                <List>
                  {salleAttente.map((rdv, index) => (
                    <React.Fragment key={rdv.id}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemText
                          primary={`${rdv.patient.nom} ${rdv.patient.prenom}`}
                          secondary={
                            <>
                              Dr. {rdv.medecin.nom} - {rdv.heure_debut}
                              <Chip 
                                label={rdv.statut} 
                                size="small" 
                                color={getStatutColor(rdv.statut)}
                                sx={{ ml: 1 }}
                              />
                            </>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/admin/salle-attente')}
              >
                Gérer la salle d'attente
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* RDV du jour */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📅 Rendez-vous aujourd'hui ({rdvAujourdhui.length})
              </Typography>
              {rdvAujourdhui.length === 0 ? (
                <Alert severity="info">Aucun rendez-vous prévu</Alert>
              ) : (
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {rdvAujourdhui.slice(0, 10).map((rdv, index) => (
                    <React.Fragment key={rdv.id}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemText
                          primary={`${rdv.heure_debut} - ${rdv.patient.nom} ${rdv.patient.prenom}`}
                          secondary={
                            <>
                              Dr. {rdv.medecin.nom}
                              <Chip 
                                label={rdv.statut} 
                                size="small" 
                                color={getStatutColor(rdv.statut)}
                                sx={{ ml: 1 }}
                              />
                            </>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ReceptionDashboard;