// src/pages/SalleAttente.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Badge
} from '@mui/material';
import {
  Person,
  CheckCircle,
  HourglassEmpty,
  MedicalServices,
  Receipt,
  Cancel,
  Refresh
} from '@mui/icons-material';
import receptionService from '../services/receptionService';
import { useNavigate } from 'react-router-dom';

function SalleAttente() {
  const navigate = useNavigate();
  const [rdvsAujourdhui, setRdvsAujourdhui] = useState([]);
  const [salleAttente, setSalleAttente] = useState([]);
  const [enConsultation, setEnConsultation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRDV, setSelectedRDV] = useState(null);
  const [dialogConfirm, setDialogConfirm] = useState(false);
  const [dialogConsultation, setDialogConsultation] = useState(false);

  useEffect(() => {
    loadData();
    // Auto-refresh toutes les 20 secondes
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [rdvRes, salleRes] = await Promise.all([
        receptionService.getRDVAujourdhui(),
        receptionService.getSalleAttente()
      ]);
      
      setRdvsAujourdhui(rdvRes.data);
      
      // Séparer salle d'attente et en consultation
      const salle = rdvRes.data.filter(r => r.statut === 'CONFIRME');
      const enCons = rdvRes.data.filter(r => r.statut === 'EN_CONSULTATION');
      
      setSalleAttente(salle);
      setEnConsultation(enCons);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmerRDV = async (rdv) => {
    setSelectedRDV(rdv);
    setDialogConfirm(true);
  };

  const confirmerRDV = async () => {
    try {
      await receptionService.confirmerRDV(selectedRDV.id);
      setDialogConfirm(false);
      loadData();
      alert('✅ Patient confirmé en salle d\'attente');
    } catch (error) {
      console.error('Erreur confirmation:', error);
      alert('Erreur lors de la confirmation');
    }
  };

  const handleMarquerConsultation = async (rdv) => {
    try {
      await receptionService.marquerEnConsultation(rdv.id);
      loadData();
      alert('✅ Patient en consultation');
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleTerminerConsultation = async (rdv) => {
    setSelectedRDV(rdv);
    setDialogConsultation(true);
  };

  const terminerConsultation = async () => {
    try {
      await receptionService.marquerTermine(selectedRDV.id);
      setDialogConsultation(false);
      // Rediriger vers facturation
      navigate(`/admin/facturation/${selectedRDV.id}`);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'RESERVE': return 'warning';
      case 'CONFIRME': return 'success';
      case 'EN_CONSULTATION': return 'primary';
      case 'TERMINE': return 'default';
      case 'ANNULE': return 'error';
      default: return 'default';
    }
  };

  const getStatutLabel = (statut) => {
    switch(statut) {
      case 'RESERVE': return 'Réservé';
      case 'CONFIRME': return 'En attente';
      case 'EN_CONSULTATION': return 'En consultation';
      case 'TERMINE': return 'Terminé';
      case 'ANNULE': return 'Annulé';
      default: return statut;
    }
  };

  const RDVCard = ({ rdv, actions }) => (
    <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <Person />
            </Avatar>
          </Grid>
          
          <Grid item xs>
            <Typography variant="h6">
              {rdv.patient.nom} {rdv.patient.prenom}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              CIN: {rdv.patient.cin} | Tél: {rdv.patient.telephone}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Dr. {rdv.medecin.nom} {rdv.medecin.prenom} - {rdv.medecin.specialite}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              🕐 {rdv.heure_debut} - {rdv.heure_fin}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Motif: {rdv.motif}
            </Typography>
          </Grid>

          <Grid item>
            <Chip 
              label={getStatutLabel(rdv.statut)}
              color={getStatutColor(rdv.statut)}
              sx={{ mb: 1 }}
            />
            <Box display="flex" flexDirection="column" gap={1}>
              {actions}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <Box p={3}><Typography>Chargement...</Typography></Box>;
  }

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        {/* En-tête */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            🏥 Gestion de la Salle d'Attente
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadData}
          >
            Actualiser
          </Button>
        </Box>

        {/* Statistiques rapides */}
        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'warning.light' }}>
              <CardContent>
                <Typography variant="h4">{rdvsAujourdhui.filter(r => r.statut === 'RESERVE').length}</Typography>
                <Typography>RDV Réservés</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'success.light' }}>
              <CardContent>
                <Typography variant="h4">{salleAttente.length}</Typography>
                <Typography>Patients en attente</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'primary.light' }}>
              <CardContent>
                <Typography variant="h4">{enConsultation.length}</Typography>
                <Typography>En consultation</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Section: RDV à confirmer */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HourglassEmpty /> RDV Réservés à confirmer
            <Badge badgeContent={rdvsAujourdhui.filter(r => r.statut === 'RESERVE').length} color="warning" />
          </Typography>
          
          {rdvsAujourdhui.filter(r => r.statut === 'RESERVE').length === 0 ? (
            <Alert severity="info">Aucun RDV à confirmer</Alert>
          ) : (
            rdvsAujourdhui.filter(r => r.statut === 'RESERVE').map(rdv => (
              <RDVCard
                key={rdv.id}
                rdv={rdv}
                actions={
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<CheckCircle />}
                    onClick={() => handleConfirmerRDV(rdv)}
                  >
                    Confirmer
                  </Button>
                }
              />
            ))
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Section: Salle d'attente */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🪑 Salle d'Attente
            <Badge badgeContent={salleAttente.length} color="success" />
          </Typography>
          
          {salleAttente.length === 0 ? (
            <Alert severity="info">Aucun patient en attente</Alert>
          ) : (
            salleAttente.map(rdv => (
              <RDVCard
                key={rdv.id}
                rdv={rdv}
                actions={
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<MedicalServices />}
                    onClick={() => handleMarquerConsultation(rdv)}
                  >
                    Entrer en consultation
                  </Button>
                }
              />
            ))
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Section: En consultation */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            👨‍⚕️ En Consultation
            <Badge badgeContent={enConsultation.length} color="primary" />
          </Typography>
          
          {enConsultation.length === 0 ? (
            <Alert severity="info">Aucune consultation en cours</Alert>
          ) : (
            enConsultation.map(rdv => (
              <RDVCard
                key={rdv.id}
                rdv={rdv}
                actions={
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    startIcon={<Receipt />}
                    onClick={() => handleTerminerConsultation(rdv)}
                  >
                    Générer Facture
                  </Button>
                }
              />
            ))
          )}
        </Box>
      </Paper>

      {/* Dialog Confirmation RDV */}
      <Dialog open={dialogConfirm} onClose={() => setDialogConfirm(false)}>
        <DialogTitle>Confirmer le RDV</DialogTitle>
        <DialogContent>
          <Typography>
            Confirmer l'arrivée de <strong>{selectedRDV?.patient.nom} {selectedRDV?.patient.prenom}</strong> ?
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Le patient sera placé en salle d'attente
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogConfirm(false)}>Annuler</Button>
          <Button variant="contained" onClick={confirmerRDV}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Terminer Consultation */}
      <Dialog open={dialogConsultation} onClose={() => setDialogConsultation(false)}>
        <DialogTitle>Consultation terminée</DialogTitle>
        <DialogContent>
          <Typography>
            La consultation de <strong>{selectedRDV?.patient.nom} {selectedRDV?.patient.prenom}</strong> est terminée.
          </Typography>
          <Alert severity="success" sx={{ mt: 2 }}>
            Vous allez être redirigé vers la facturation
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogConsultation(false)}>Annuler</Button>
          <Button variant="contained" color="success" onClick={terminerConsultation}>
            Aller à la facturation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SalleAttente;