// src/pages/AccueilPatient.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  TextField,
  Grid,
  Card,
  CardContent,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Search, PersonAdd, CalendarToday, CheckCircle } from '@mui/icons-material';
import receptionService from '../services/receptionService';
import { patientService, medecinService } from '../services/api';

const steps = ['Recherche/Création Patient', 'Prise de RDV', 'Confirmation'];

function AccueilPatient() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // ===== ÉTAPE 1: RECHERCHE/CRÉATION =====
  const [searchCIN, setSearchCIN] = useState('');
  const [patientTrouve, setPatientTrouve] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Formulaire nouveau patient
  const [newPatient, setNewPatient] = useState({
    cin: '',
    nom: '',
    prenom: '',
    date_naissance: '',
    sexe: 'M',
    telephone: '',
    email: '',
    adresse: '',
    groupe_sanguin: 'O+',
    profession: '',
    situation_familiale: 'CELIBATAIRE'
  });

  // ===== ÉTAPE 2: PRISE RDV =====
  const [medecins, setMedecins] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [selectedSpecialite, setSelectedSpecialite] = useState('');
  const [selectedMedecin, setSelectedMedecin] = useState('');
  const [joursTravail, setJoursTravail] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [creneauxDisponibles, setCreneauxDisponibles] = useState([]);
  const [selectedCreneau, setSelectedCreneau] = useState(null);
  const [motifRDV, setMotifRDV] = useState('');

  // ===== ÉTAPE 3: CONFIRMATION =====
  const [rdvCree, setRdvCree] = useState(null);
  const [confirmationDialog, setConfirmationDialog] = useState(false);

  useEffect(() => {
    loadMedecins();
  }, []);

  const loadMedecins = async () => {
    try {
      const res = await medecinService.getAll();
      console.log('📋 Médecins chargés:', res.data);
      setMedecins(res.data);
      
      // Extraire les spécialités uniques (ATTENTION: champ = specialite_med)
      const specs = [...new Set(res.data.map(m => m.specialite_med))].filter(s => s);
      console.log('🏥 Spécialités:', specs);
      setSpecialites(specs);
    } catch (error) {
      console.error('Erreur chargement médecins:', error);
      alert('Erreur lors du chargement des médecins');
    }
  };

  // ===== ÉTAPE 1: RECHERCHE =====
  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await receptionService.searchPatientByCIN(searchCIN);
      
      if (res.data && res.data.length > 0) {
        setPatientTrouve(res.data[0]);
        setShowCreateForm(false);
        // Ne PAS passer automatiquement à l'étape suivante
        // L'utilisateur cliquera sur le bouton pour continuer
      } else {
        setPatientTrouve(null);
        setShowCreateForm(true);
        alert('Patient non trouvé. Veuillez créer un nouveau patient.');
      }
    } catch (error) {
      console.error('Erreur recherche:', error);
      setPatientTrouve(null);
      setShowCreateForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async () => {
    setLoading(true);
    try {
      const res = await receptionService.createPatientWithDossier(newPatient);
      setPatientTrouve(res.data);
      setShowCreateForm(false);
      alert('✅ Patient créé avec succès !');
      setActiveStep(1);
    } catch (error) {
      console.error('Erreur création patient:', error);
      alert('Erreur lors de la création du patient');
    } finally {
      setLoading(false);
    }
  };

  // ===== ÉTAPE 2: RDV =====
  const handleSpecialiteChange = (e) => {
    setSelectedSpecialite(e.target.value);
    setSelectedMedecin('');
    setJoursTravail([]);
    setCreneauxDisponibles([]);
  };

  const handleMedecinChange = async (e) => {
    const medecinId = e.target.value;
    setSelectedMedecin(medecinId);
    
    // Désactiver temporairement les jours de travail (endpoint manquant)
    // TODO: Ajouter l'endpoint dans Django
    setJoursTravail([]);
    
    /* Pour plus tard quand l'endpoint existe :
    setLoading(true);
    try {
      const res = await receptionService.getJoursTravail(medecinId);
      setJoursTravail(res.data);
    } catch (error) {
      console.error('Erreur jours travail:', error);
      setJoursTravail([]);
    } finally {
      setLoading(false);
    }
    */
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (selectedMedecin && date) {
      setLoading(true);
      try {
        const res = await receptionService.getCreneauxDisponibles(selectedMedecin, date);
        setCreneauxDisponibles(res.data);
      } catch (error) {
        console.error('Erreur créneaux:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateRDV = async () => {
    if (!selectedCreneau) {
      alert('Veuillez sélectionner un créneau');
      return;
    }

    setLoading(true);
    try {
      // Structure minimale basée sur votre backend
      const rdvData = {
        patient: patientTrouve.id_patient, // Utiliser id_patient
        medecin: selectedMedecin,
        creneau: selectedCreneau.id
      };
      
      console.log('📤 Données RDV envoyées:', rdvData);
      
      const res = await receptionService.createRDV(rdvData);
      console.log('✅ RDV créé:', res.data);
      setRdvCree(res.data);
      setActiveStep(2);
    } catch (error) {
      console.error('❌ Erreur création RDV:', error);
      console.error('📋 Détails erreur:', error.response?.data);
      alert(`Erreur lors de la création du RDV: ${JSON.stringify(error.response?.data)}`);
    } finally {
      setLoading(false);
    }
  };

  // ===== ÉTAPE 3: CONFIRMATION =====
  const handleConfirmerRDV = async () => {
    try {
      await receptionService.confirmerRDV(rdvCree.id);
      setConfirmationDialog(true);
    } catch (error) {
      console.error('Erreur confirmation:', error);
      alert('Erreur lors de la confirmation');
    }
  };

  const handleTerminer = () => {
    // Recharger la page du dashboard pour afficher les nouvelles données
    window.location.href = '/admin/reception';
  };

  // ===== RENDU DES ÉTAPES =====
  const renderStep1 = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Rechercher le patient par CIN
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="CIN du patient"
            value={searchCIN}
            onChange={(e) => setSearchCIN(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ex: AB123456"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Search />}
            onClick={handleSearch}
            disabled={!searchCIN || loading}
            sx={{ height: '56px' }}
          >
            Rechercher
          </Button>
        </Grid>
      </Grid>

      {patientTrouve && (
        <Card sx={{ mt: 3, bgcolor: 'success.light' }}>
          <CardContent>
            <Typography variant="h6" color="success.dark">
              ✅ Patient trouvé !
            </Typography>
            <Typography variant="body1">
              <strong>{patientTrouve.nom} {patientTrouve.prenom}</strong>
            </Typography>
            <Typography variant="body2">
              CIN: {patientTrouve.cin} | Tél: {patientTrouve.telephone}
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => setActiveStep(1)}
            >
              Prendre RDV pour ce patient
            </Button>
          </CardContent>
        </Card>
      )}

      {showCreateForm && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            <PersonAdd /> Créer un nouveau patient
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="CIN *" value={newPatient.cin} 
                onChange={(e) => setNewPatient({...newPatient, cin: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Nom *" value={newPatient.nom}
                onChange={(e) => setNewPatient({...newPatient, nom: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Prénom *" value={newPatient.prenom}
                onChange={(e) => setNewPatient({...newPatient, prenom: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="date" label="Date de naissance *" 
                InputLabelProps={{ shrink: true }}
                value={newPatient.date_naissance}
                onChange={(e) => setNewPatient({...newPatient, date_naissance: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Sexe</InputLabel>
                <Select value={newPatient.sexe} 
                  onChange={(e) => setNewPatient({...newPatient, sexe: e.target.value})}>
                  <MenuItem value="M">Homme</MenuItem>
                  <MenuItem value="F">Femme</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Téléphone *" value={newPatient.telephone}
                onChange={(e) => setNewPatient({...newPatient, telephone: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email" value={newPatient.email}
                onChange={(e) => setNewPatient({...newPatient, email: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Groupe sanguin</InputLabel>
                <Select value={newPatient.groupe_sanguin}
                  onChange={(e) => setNewPatient({...newPatient, groupe_sanguin: e.target.value})}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                    <MenuItem key={g} value={g}>{g}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Adresse" value={newPatient.adresse}
                onChange={(e) => setNewPatient({...newPatient, adresse: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                startIcon={<PersonAdd />}
                onClick={handleCreatePatient}
                disabled={!newPatient.cin || !newPatient.nom || !newPatient.prenom || loading}
              >
                Créer le patient et son dossier médical
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );

  const renderStep2 = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Prendre rendez-vous pour {patientTrouve?.nom} {patientTrouve?.prenom}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Spécialité *</InputLabel>
            <Select 
              value={selectedSpecialite} 
              onChange={handleSpecialiteChange}
              label="Spécialité *"
            >
              {specialites.length === 0 ? (
                <MenuItem disabled>Aucune spécialité disponible</MenuItem>
              ) : (
                specialites.map(spec => (
                  <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth disabled={!selectedSpecialite}>
            <InputLabel>Médecin *</InputLabel>
            <Select 
              value={selectedMedecin} 
              onChange={handleMedecinChange}
              label="Médecin *"
            >
              {medecins
                .filter(m => m.specialite_med === selectedSpecialite)
                .map(m => (
                  <MenuItem key={m.id_med} value={m.id_med}>
                    Dr. {m.nom_med} {m.prenom_med}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>

        {joursTravail.length > 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              Jours de travail: {joursTravail.map(j => j.jour).join(', ')}
            </Alert>
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="date"
            label="Date du RDV"
            InputLabelProps={{ shrink: true }}
            value={selectedDate}
            onChange={handleDateChange}
            disabled={!selectedMedecin}
            inputProps={{ min: new Date().toISOString().split('T')[0] }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Motif du rendez-vous (facultatif)"
            value={motifRDV}
            onChange={(e) => setMotifRDV(e.target.value)}
            placeholder="Ex: Consultation de suivi, Douleurs, Contrôle annuel..."
            helperText="Vous pouvez laisser ce champ vide"
          />
        </Grid>

        {creneauxDisponibles.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Créneaux disponibles:
            </Typography>
            <Grid container spacing={1}>
              {creneauxDisponibles.map(creneau => (
                <Grid item key={creneau.id}>
                  <Chip
                    label={`${creneau.heure_debut} - ${creneau.heure_fin}`}
                    onClick={() => setSelectedCreneau(creneau)}
                    color={selectedCreneau?.id === creneau.id ? 'primary' : 'default'}
                    variant={selectedCreneau?.id === creneau.id ? 'filled' : 'outlined'}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}

        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<CalendarToday />}
            onClick={handleCreateRDV}
            disabled={!selectedCreneau || !motifRDV || loading}
          >
            Créer le rendez-vous
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const renderStep3 = () => (
    <Box textAlign="center">
      <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        Rendez-vous créé avec succès !
      </Typography>
      
      {rdvCree && (
        <Card sx={{ mt: 3, textAlign: 'left' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Détails du RDV:</Typography>
            <Typography>Patient: {patientTrouve.nom} {patientTrouve.prenom}</Typography>
            <Typography>Médecin: Dr. {medecins.find(m => m.id_med === selectedMedecin)?.nom_med}</Typography>
            <Typography>Date: {selectedDate}</Typography>
            <Typography>Heure: {selectedCreneau?.heure_debut} - {selectedCreneau?.heure_fin}</Typography>
            <Typography>Motif: {motifRDV || 'Consultation'}</Typography>
            <Chip label={rdvCree.statut} color="warning" sx={{ mt: 2 }} />
          </CardContent>
        </Card>
      )}

      <Alert severity="warning" sx={{ mt: 3 }}>
        Le RDV est actuellement en statut <strong>RÉSERVÉ</strong>. 
        {rdvCree?.date === new Date().toISOString().split('T')[0] 
          ? " Le patient est présent, vous pouvez confirmer maintenant."
          : " Confirmez quand le patient viendra à la date du RDV."}
      </Alert>

      <Grid container spacing={2} mt={2}>
        {rdvCree?.date === new Date().toISOString().split('T')[0] && (
          <Grid item xs={12} md={6}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={handleConfirmerRDV}
            >
              Confirmer le RDV (Patient présent)
            </Button>
          </Grid>
        )}
        <Grid item xs={12} md={rdvCree?.date === new Date().toISOString().split('T')[0] ? 6 : 12}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleTerminer}
          >
            Terminer et retourner au dashboard
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Accueil d'un patient
        </Typography>

        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && renderStep1()}
        {activeStep === 1 && renderStep2()}
        {activeStep === 2 && renderStep3()}
      </Paper>

      <Dialog open={confirmationDialog} onClose={() => setConfirmationDialog(false)}>
        <DialogTitle>✅ RDV Confirmé !</DialogTitle>
        <DialogContent>
          <Typography>
            Le rendez-vous a été confirmé. Le patient peut maintenant patienter en salle d'attente.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTerminer} variant="contained">
            Retour au dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AccueilPatient;