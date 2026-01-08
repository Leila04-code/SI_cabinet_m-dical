// src/pages/medecin/ConsultationPatient.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  Alert,
  Snackbar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  InputAdornment
} from '@mui/material';
import {
  ArrowBack,
  Person,
  CheckCircle,
  MedicalServices,
  Description,
  Add,
  Delete,
  ExpandMore,
  Save
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../services/authService';
import api from '../../services/api';

function ConsultationPatient() {
  const navigate = useNavigate();
  const { rdvId } = useParams();
  const user = authService.getCurrentUser();
  
  const [activeStep, setActiveStep] = useState(0);
  const [rdv, setRdv] = useState(null);
  const [patient, setPatient] = useState(null);
  const [dossier, setDossier] = useState(null);
  const [medecin, setMedecin] = useState(null);
  const [consultationsPassees, setConsultationsPassees] = useState([]);
  
  // Listes pour les autocomplete
  const [medicamentsList, setMedicamentsList] = useState([]);
  const [analysesList, setAnalysesList] = useState([]);
  const [radiosList, setRadiosList] = useState([]);
  const [actesList, setActesList] = useState([]);
  
  // Formulaires
  const [dossierForm, setDossierForm] = useState({
    poids: '',
    taille: '',
    tension_arterielle: '',
    antecedents_medicaux: '',
    antecedents_chirurgicaux: '',
    antecedents_familiaux: ''
  });
  
  const [consultationForm, setConsultationForm] = useState({
    diagnostic: '',
    traitement: '',
    observations: '',
    prix_cons: '200'
  });
  
  const [actesMedicaux, setActesMedicaux] = useState([]);
  const [ordonnanceMedicaments, setOrdonnanceMedicaments] = useState('');
  const [ordonnancesAnalyses, setOrdonnancesAnalyses] = useState([]);
  const [ordonnancesRadios, setOrdonnancesRadios] = useState([]);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [loading, setLoading] = useState(true);

  const steps = ['Confirmer RDV', 'Dossier Médical', 'Consultation', 'Ordonnances'];

  useEffect(() => {
    fetchData();
  }, [rdvId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // RDV
      const rdvResponse = await api.get(`http://127.0.0.1:8000/api/rdvs/${rdvId}/`);
      setRdv(rdvResponse.data);
      
      // Patient
      const patientResponse = await api.get(`http://127.0.0.1:8000/api/patients/${rdvResponse.data.patient}/`);
      setPatient(patientResponse.data);
      
      // Médecin
      const medecinResponse = await api.get(`http://127.0.0.1:8000/api/medecins/?email=${user.email}`);
      setMedecin(medecinResponse.data[0]);
      
      // Dossier médical
      try {
        const dossierResponse = await api.get(`http://127.0.0.1:8000/api/dossiers/?patient=${rdvResponse.data.patient}`);
        if (dossierResponse.data.length > 0) {
          const dossierData = dossierResponse.data[0];
          setDossier(dossierData);
          setDossierForm({
            poids: dossierData.poids || '',
            taille: dossierData.taille || '',
            tension_arterielle: dossierData.tension_arterielle || '',
            antecedents_medicaux: dossierData.antecedents_medicaux || '',
            antecedents_chirurgicaux: dossierData.antecedents_chirurgicaux || '',
            antecedents_familiaux: dossierData.antecedents_familiaux || ''
          });
        }
      } catch (err) {
        console.warn('Dossier non trouvé');
      }
      
      // Consultations passées
      try {
        const rdvsPatient = await api.get(`http://127.0.0.1:8000/api/rdvs/?patient=${rdvResponse.data.patient}`);
        const consultationsPromises = rdvsPatient.data.map(r => 
          api.get(`http://127.0.0.1:8000/api/consultations/?rdv=${r.id}`)
        );
        const consultationsResults = await Promise.all(consultationsPromises);
        const allConsultations = consultationsResults.flatMap(res => res.data);
        setConsultationsPassees(allConsultations);
      } catch (err) {
        console.warn('Erreur consultations passées');
      }
      
      // Listes pour autocomplete
      const actesResponse = await api.get('http://127.0.0.1:8000/api/actes/');
      setActesList(actesResponse.data);
      
      const analysesResponse = await api.get('http://127.0.0.1:8000/api/analyses/');
      setAnalysesList(analysesResponse.data);
      
      const radiosResponse = await api.get('http://127.0.0.1:8000/api/radios/');
      setRadiosList(radiosResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement:', error);
      showSnackbar('Erreur lors du chargement', 'error');
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleConfirmerRdv = async () => {
    try {
      await api.patch(`http://127.0.0.1:8000/api/rdvs/${rdvId}/confirmer/`);
      showSnackbar('RDV confirmé');
      setActiveStep(1);
    } catch (error) {
      showSnackbar('Erreur confirmation RDV', 'error');
    }
  };

  const handleSaveDossier = async () => {
    try {
      if (dossier) {
        await api.put(`http://127.0.0.1:8000/api/dossiers/${dossier.id_dossier}/`, {
          ...dossierForm,
          patient: patient.id_patient
        });
      } else {
        await api.post('http://127.0.0.1:8000/api/dossiers/', {
          ...dossierForm,
          patient: patient.id_patient
        });
      }
      showSnackbar('Dossier médical enregistré');
      setActiveStep(2);
    } catch (error) {
      showSnackbar('Erreur sauvegarde dossier', 'error');
    }
  };

  const handleAddActe = () => {
    setActesMedicaux([...actesMedicaux, { acte: null, quantite: 1 }]);
  };

  const handleRemoveActe = (index) => {
    setActesMedicaux(actesMedicaux.filter((_, i) => i !== index));
  };

  const handleAddAnalyse = () => {
    setOrdonnancesAnalyses([...ordonnancesAnalyses, { analyse: null }]);
  };

  const handleRemoveAnalyse = (index) => {
    setOrdonnancesAnalyses(ordonnancesAnalyses.filter((_, i) => i !== index));
  };

  const handleAddRadio = () => {
    setOrdonnancesRadios([...ordonnancesRadios, { radio: null }]);
  };

  const handleRemoveRadio = (index) => {
    setOrdonnancesRadios(ordonnancesRadios.filter((_, i) => i !== index));
  };

  const handleSaveConsultation = async () => {
    try {
      // 1. Créer la consultation
      const consultationData = {
        rdv: rdvId,
        medecin: medecin.id_med,
        date_cons: new Date().toISOString().split('T')[0],
        diagnostic: consultationForm.diagnostic,
        traitement: consultationForm.traitement,
        observations: consultationForm.observations,
        prix_cons: parseFloat(consultationForm.prix_cons)
      };
      
      const consultationResponse = await api.post('http://127.0.0.1:8000/api/consultations/', consultationData);
      const consultationId = consultationResponse.data.id_cons;
      
      // 2. Ajouter les actes médicaux
      for (const acte of actesMedicaux) {
        if (acte.acte) {
          await api.post('http://127.0.0.1:8000/api/consultation-actes/', {
            consultation: consultationId,
            acte: acte.acte.id,
            quantite: acte.quantite,
            prix_applique: acte.acte.prix_acte
          });
        }
      }
      
      // 3. Ordonnance médicaments
      if (ordonnanceMedicaments.trim()) {
        await api.post('http://127.0.0.1:8000/api/ordonnances/', {
          consultation: consultationId,
          medicaments: ordonnanceMedicaments,
          date_ord: new Date().toISOString().split('T')[0]
        });
      }
      
      // 4. Ordonnances analyses
      for (const ord of ordonnancesAnalyses) {
        if (ord.analyse) {
          await api.post('http://127.0.0.1:8000/api/ordonnance-analyses/', {
            consultation: consultationId,
            analyse: ord.analyse.id_analyse,
            date_ord: new Date().toISOString().split('T')[0]
          });
        }
      }
      
      // 5. Ordonnances radios
      for (const ord of ordonnancesRadios) {
        if (ord.radio) {
          await api.post('http://127.0.0.1:8000/api/ordonnance-radios/', {
            consultation: consultationId,
            radio: ord.radio.id_rad,
            date_ord: new Date().toISOString().split('T')[0]
          });
        }
      }
      
      // 6. Marquer RDV comme terminé
      await api.patch(`http://127.0.0.1:8000/api/rdvs/${rdvId}/termine/`);
      
      showSnackbar('✅ Consultation enregistrée avec succès !');
      
      setTimeout(() => {
        navigate('/dashboard/medecin');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur sauvegarde consultation:', error);
      showSnackbar('Erreur lors de la sauvegarde', 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard/medecin')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Consultation - {patient?.nom_patient} {patient?.prenom_patient}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, mb: 4 }}>
        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Informations patient */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Person sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h6">
                  {patient?.nom_patient} {patient?.prenom_patient}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  CIN: {patient?.cin} | Tél: {patient?.telephone}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Consultations passées */}
        {consultationsPassees.length > 0 && (
          <Accordion sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">
                📋 Historique des consultations ({consultationsPassees.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Diagnostic</TableCell>
                    <TableCell>Traitement</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {consultationsPassees.map((cons, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(cons.date_cons).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>{cons.diagnostic}</TableCell>
                      <TableCell>{cons.traitement}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Step 0: Confirmer RDV */}
        {activeStep === 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Confirmer le rendez-vous
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Le patient est arrivé. Confirmez le rendez-vous pour commencer la consultation.
            </Alert>
            <Button
              variant="contained"
              size="large"
              startIcon={<CheckCircle />}
              onClick={handleConfirmerRdv}
            >
              Confirmer et commencer la consultation
            </Button>
          </Paper>
        )}

        {/* Step 1: Dossier Médical */}
        {activeStep === 1 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              📋 Dossier Médical
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Poids (kg)"
                  type="number"
                  value={dossierForm.poids}
                  onChange={(e) => setDossierForm({...dossierForm, poids: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Taille (cm)"
                  type="number"
                  value={dossierForm.taille}
                  onChange={(e) => setDossierForm({...dossierForm, taille: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Tension artérielle"
                  value={dossierForm.tension_arterielle}
                  onChange={(e) => setDossierForm({...dossierForm, tension_arterielle: e.target.value})}
                  placeholder="Ex: 12/8"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Antécédents médicaux"
                  value={dossierForm.antecedents_medicaux}
                  onChange={(e) => setDossierForm({...dossierForm, antecedents_medicaux: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Antécédents chirurgicaux"
                  value={dossierForm.antecedents_chirurgicaux}
                  onChange={(e) => setDossierForm({...dossierForm, antecedents_chirurgicaux: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Antécédents familiaux"
                  value={dossierForm.antecedents_familiaux}
                  onChange={(e) => setDossierForm({...dossierForm, antecedents_familiaux: e.target.value})}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setActiveStep(0)}>Retour</Button>
              <Button variant="contained" onClick={handleSaveDossier}>
                Enregistrer et continuer
              </Button>
            </Box>
          </Paper>
        )}

        {/* Step 2: Consultation */}
        {activeStep === 2 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              🩺 Consultation
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Diagnostic"
                  value={consultationForm.diagnostic}
                  onChange={(e) => setConsultationForm({...consultationForm, diagnostic: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Traitement"
                  value={consultationForm.traitement}
                  onChange={(e) => setConsultationForm({...consultationForm, traitement: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Observations"
                  value={consultationForm.observations}
                  onChange={(e) => setConsultationForm({...consultationForm, observations: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prix consultation (DH)"
                  type="number"
                  value={consultationForm.prix_cons}
                  onChange={(e) => setConsultationForm({...consultationForm, prix_cons: e.target.value})}
                />
              </Grid>
            </Grid>

            {/* Actes médicaux */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🩺 Actes médicaux
              </Typography>
              {actesMedicaux.map((acte, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={8}>
                    <Autocomplete
                      options={actesList}
                      getOptionLabel={(option) => option.nom_acte}
                      value={acte.acte}
                      onChange={(e, newValue) => {
                        const newActes = [...actesMedicaux];
                        newActes[index].acte = newValue;
                        setActesMedicaux(newActes);
                      }}
                      renderInput={(params) => <TextField {...params} label="Acte médical" />}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Quantité"
                      value={acte.quantite}
                      onChange={(e) => {
                        const newActes = [...actesMedicaux];
                        newActes[index].quantite = parseInt(e.target.value) || 1;
                        setActesMedicaux(newActes);
                      }}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton color="error" onClick={() => handleRemoveActe(index)}>
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button startIcon={<Add />} onClick={handleAddActe}>
                Ajouter un acte
              </Button>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setActiveStep(1)}>Retour</Button>
              <Button variant="contained" onClick={() => setActiveStep(3)}>
                Continuer vers ordonnances
              </Button>
            </Box>
          </Paper>
        )}

        {/* Step 3: Ordonnances */}
        {activeStep === 3 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              💊 Prescriptions
            </Typography>
            
            {/* Ordonnance médicaments */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                💊 Ordonnance de médicaments
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Médicaments prescrits"
                value={ordonnanceMedicaments}
                onChange={(e) => setOrdonnanceMedicaments(e.target.value)}
                placeholder="Ex: Doliprane 1000mg - 3x/jour pendant 5 jours"
              />
            </Box>

            {/* Ordonnances analyses */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                🔬 Ordonnances d'analyses
              </Typography>
              {ordonnancesAnalyses.map((ord, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={11}>
                    <Autocomplete
                      options={analysesList}
                      getOptionLabel={(option) => option.nom_analyse}
                      value={ord.analyse}
                      onChange={(e, newValue) => {
                        const newOrds = [...ordonnancesAnalyses];
                        newOrds[index].analyse = newValue;
                        setOrdonnancesAnalyses(newOrds);
                      }}
                      renderInput={(params) => <TextField {...params} label="Analyse" />}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton color="error" onClick={() => handleRemoveAnalyse(index)}>
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button startIcon={<Add />} onClick={handleAddAnalyse}>
                Ajouter une analyse
              </Button>
            </Box>

            {/* Ordonnances radios */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                🩻 Ordonnances de radiologie
              </Typography>
              {ordonnancesRadios.map((ord, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={11}>
                    <Autocomplete
                      options={radiosList}
                      getOptionLabel={(option) => option.nom_rad}
                      value={ord.radio}
                      onChange={(e, newValue) => {
                        const newOrds = [...ordonnancesRadios];
                        newOrds[index].radio = newValue;
                        setOrdonnancesRadios(newOrds);
                      }}
                      renderInput={(params) => <TextField {...params} label="Radio" />}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton color="error" onClick={() => handleRemoveRadio(index)}>
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button startIcon={<Add />} onClick={handleAddRadio}>
                Ajouter une radio
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setActiveStep(2)}>Retour</Button>
              <Button 
                variant="contained" 
                color="success" 
                size="large"
                startIcon={<Save />}
                onClick={handleSaveConsultation}
              >
                Terminer la consultation
              </Button>
            </Box>
          </Paper>
        )}
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ConsultationPatient;