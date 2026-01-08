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
import { patientService, medecinService, rdvService, creneauService } from '../services/api';

const steps = ['Recherche/Création Patient', 'Prise de RDV', 'Confirmation'];

function AccueilPatient() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // ===== ÉTAPE 1: RECHERCHE/CRÉATION =====
  const [searchCIN, setSearchCIN] = useState('');
  const [patientTrouve, setPatientTrouve] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Formulaire nouveau patient (correspond EXACTEMENT au modèle Django)
  const [newPatient, setNewPatient] = useState({
    cin: '',
    nom_patient: '',
    prenom_patient: '',
    date_naissance: '',
    sexe: 'M',
    telephone: '',
    adresse: '',
    situation_familiale: 'CELIBATAIRE'
  });

  // ===== ÉTAPE 2: PRISE RDV =====
  const [medecins, setMedecins] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [selectedSpecialite, setSelectedSpecialite] = useState('');
  const [selectedMedecin, setSelectedMedecin] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [creneauxDisponibles, setCreneauxDisponibles] = useState([]);
  const [selectedCreneau, setSelectedCreneau] = useState(null);

  // ===== ÉTAPE 3: CONFIRMATION =====
  const [rdvCree, setRdvCree] = useState(null);
  const [confirmationDialog, setConfirmationDialog] = useState(false);

  useEffect(() => {
    loadMedecins();
  }, []);

  const loadMedecins = async () => {
    try {
      const res = await medecinService.getAll();
      setMedecins(res.data);
      
      // Extraire les spécialités uniques
      const specs = [...new Set(res.data.map(m => m.specialite_med))].filter(s => s);
      setSpecialites(specs);
    } catch (error) {
      console.error('Erreur chargement médecins:', error);
      setError('Erreur lors du chargement des médecins');
    }
  };

  // ===== ÉTAPE 1: RECHERCHE =====
  const handleSearch = async () => {
    if (!searchCIN.trim()) {
      setError('Veuillez entrer un CIN');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await patientService.searchByCIN(searchCIN);
      
      if (res.data && res.data.length > 0) {
        setPatientTrouve(res.data[0]);
        setShowCreateForm(false);
        setError('');
      } else {
        setPatientTrouve(null);
        setShowCreateForm(true);
        setNewPatient(prev => ({ ...prev, cin: searchCIN }));
        setError('Patient non trouvé. Créez un nouveau patient ci-dessous.');
      }
    } catch (error) {
      console.error('Erreur recherche:', error);
      setPatientTrouve(null);
      setShowCreateForm(true);
      setNewPatient(prev => ({ ...prev, cin: searchCIN }));
      setError('Patient non trouvé. Créez un nouveau patient ci-dessous.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async () => {
    // Validation
    if (!newPatient.cin || !newPatient.nom_patient || !newPatient.prenom_patient || 
        !newPatient.date_naissance || !newPatient.telephone) {
      setError('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Utiliser l'endpoint qui crée aussi le dossier médical
      const res = await patientService.create(newPatient);
      
      // Créer le dossier médical séparément si nécessaire
      // (ou utiliser create-with-dossier si vous l'avez implémenté)
      
      setPatientTrouve(res.data);
      setShowCreateForm(false);
      setError('');
      alert('✅ Patient créé avec succès !');
    } catch (error) {
      console.error('Erreur création patient:', error);
      if (error.response?.data) {
        const errorMsg = error.response.data.cin 
          ? 'Ce CIN existe déjà dans la base de données'
          : JSON.stringify(error.response.data);
        setError(`Erreur : ${errorMsg}`);
      } else {
        setError('Erreur lors de la création du patient');
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== ÉTAPE 2: RDV =====
  const handleSpecialiteChange = (e) => {
    setSelectedSpecialite(e.target.value);
    setSelectedMedecin('');
    setCreneauxDisponibles([]);
    setSelectedCreneau(null);
  };

  const handleMedecinChange = (e) => {
    setSelectedMedecin(e.target.value);
    setCreneauxDisponibles([]);
    setSelectedCreneau(null);
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedCreneau(null);
    
    if (selectedMedecin && date) {
      setLoading(true);
      setError('');
      try {
        const res = await creneauService.getDisponibles(selectedMedecin, date);
        setCreneauxDisponibles(res.data);
        
        if (res.data.length === 0) {
          setError('Aucun créneau disponible pour cette date');
        }
      } catch (error) {
        console.error('Erreur créneaux:', error);
        setError('Erreur lors du chargement des créneaux');
        setCreneauxDisponibles([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateRDV = async () => {
    if (!selectedCreneau) {
      setError('Veuillez sélectionner un créneau');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const rdvData = {
        patient: patientTrouve.id_patient,
        medecin: selectedMedecin,
        creneau: selectedCreneau.id
      };
      
      const res = await rdvService.create(rdvData);
      setRdvCree(res.data);
      setActiveStep(2);
      setError('');
    } catch (error) {
      console.error('Erreur création RDV:', error);
      if (error.response?.data) {
        setError(`Erreur : ${JSON.stringify(error.response.data)}`);
      } else {
        setError('Erreur lors de la création du RDV');
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== ÉTAPE 3: CONFIRMATION =====
  const handleConfirmerRDV = async () => {
    try {
      await rdvService.confirmer(rdvCree.id);
      setConfirmationDialog(true);
    } catch (error) {
      console.error('Erreur confirmation:', error);
      setError('Erreur lors de la confirmation');
    }
  };

  const handleTerminer = () => {
    window.location.href = '/admin/reception';
  };

  // ===== RENDU DES ÉTAPES =====
  const renderStep1 = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Rechercher le patient par CIN
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="CIN du patient"
            value={searchCIN}
            onChange={(e) => setSearchCIN(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ex: AD345678"
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
            {loading ? 'Recherche...' : 'Rechercher'}
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
              <strong>{patientTrouve.nom_patient} {patientTrouve.prenom_patient}</strong>
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
              <TextField 
                fullWidth 
                label="CIN *" 
                value={newPatient.cin} 
                onChange={(e) => setNewPatient({...newPatient, cin: e.target.value.toUpperCase()})}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Nom *" 
                value={newPatient.nom_patient}
                onChange={(e) => setNewPatient({...newPatient, nom_patient: e.target.value})}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Prénom *" 
                value={newPatient.prenom_patient}
                onChange={(e) => setNewPatient({...newPatient, prenom_patient: e.target.value})}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                type="date" 
                label="Date de naissance *" 
                InputLabelProps={{ shrink: true }}
                value={newPatient.date_naissance}
                onChange={(e) => setNewPatient({...newPatient, date_naissance: e.target.value})}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Sexe *</InputLabel>
                <Select 
                  value={newPatient.sexe} 
                  onChange={(e) => setNewPatient({...newPatient, sexe: e.target.value})}
                  label="Sexe *"
                >
                  <MenuItem value="M">Homme</MenuItem>
                  <MenuItem value="F">Femme</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Téléphone *" 
                value={newPatient.telephone}
                onChange={(e) => setNewPatient({...newPatient, telephone: e.target.value})}
                placeholder="Ex: 0656784312"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Situation familiale</InputLabel>
                <Select 
                  value={newPatient.situation_familiale}
                  onChange={(e) => setNewPatient({...newPatient, situation_familiale: e.target.value})}
                  label="Situation familiale"
                >
                  <MenuItem value="CELIBATAIRE">Célibataire</MenuItem>
                  <MenuItem value="MARIE">Marié(e)</MenuItem>
                  <MenuItem value="DIVORCE">Divorcé(e)</MenuItem>
                  <MenuItem value="VEUF">Veuf/Veuve</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Adresse" 
                value={newPatient.adresse}
                onChange={(e) => setNewPatient({...newPatient, adresse: e.target.value})}
                placeholder="Ex: LOTISSEMENT FATH EL KHEIR"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                startIcon={<PersonAdd />}
                onClick={handleCreatePatient}
                disabled={loading}
              >
                {loading ? 'Création en cours...' : 'Créer le patient'}
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
        Prendre rendez-vous pour {patientTrouve?.nom_patient} {patientTrouve?.prenom_patient}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Spécialité *</InputLabel>
            <Select 
              value={selectedSpecialite} 
              onChange={handleSpecialiteChange}
              label="Spécialité *"
            >
              {specialites.map(spec => (
                <MenuItem key={spec} value={spec}>{spec}</MenuItem>
              ))}
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

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="date"
            label="Date du RDV *"
            InputLabelProps={{ shrink: true }}
            value={selectedDate}
            onChange={handleDateChange}
            disabled={!selectedMedecin}
            inputProps={{ min: new Date().toISOString().split('T')[0] }}
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
                    label={`${creneau.heure_debut.slice(0, 5)} - ${creneau.heure_fin.slice(0, 5)}`}
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
            disabled={!selectedCreneau || loading}
          >
            {loading ? 'Création...' : 'Créer le rendez-vous'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const renderStep3 = () => {
    const medecinInfo = medecins.find(m => m.id_med === selectedMedecin);
    
    return (
      <Box textAlign="center">
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Rendez-vous créé avec succès !
        </Typography>
        
        <Card sx={{ mt: 3, textAlign: 'left' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Détails du RDV:</Typography>
            <Typography>Patient: {patientTrouve.nom_patient} {patientTrouve.prenom_patient}</Typography>
            <Typography>Médecin: Dr. {medecinInfo?.nom_med} {medecinInfo?.prenom_med}</Typography>
            <Typography>Spécialité: {medecinInfo?.specialite_med}</Typography>
            <Typography>Date: {selectedDate}</Typography>
            <Typography>Heure: {selectedCreneau?.heure_debut.slice(0, 5)} - {selectedCreneau?.heure_fin.slice(0, 5)}</Typography>
          </CardContent>
        </Card>

        <Alert severity="info" sx={{ mt: 3 }}>
          Le RDV a été créé. Le patient peut maintenant attendre en salle d'attente.
        </Alert>

        <Grid container spacing={2} mt={2}>
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
          <Grid item xs={12} md={6}>
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
  };

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