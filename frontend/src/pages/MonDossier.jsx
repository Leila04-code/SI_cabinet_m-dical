// src/pages/patient/MonDossier.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicationIcon from '@mui/icons-material/Medication';
import ScienceIcon from '@mui/icons-material/Science';
import WarningIcon from '@mui/icons-material/Warning';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DescriptionIcon from '@mui/icons-material/Description';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import api from '../../services/api';
import authService from '../../services/authService';

// Composant pour une ligne de facture avec détail
function FactureRow({ facture }) {
  const [open, setOpen] = useState(false);
  const [detailFacture, setDetailFacture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggleDetail = async () => {
    if (!open && !detailFacture) {
      setLoading(true);
      setError('');
      try {
        const factureId = facture.id_facture || facture.id;
        const response = await api.get(`http://127.0.0.1:8000/api/factures/${factureId}/detail/`);
        setDetailFacture(response.data);
      } catch (err) {
        console.error('❌ Erreur chargement détail facture:', err);
        setError(`Erreur: ${err.response?.data?.error || err.message}`);
      } finally {
        setLoading(false);
      }
    }
    setOpen(!open);
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: open ? 'none' : 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={handleToggleDetail}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{new Date(facture.date_fact).toLocaleDateString('fr-FR')}</TableCell>
        <TableCell>{facture.type_facture}</TableCell>
        <TableCell>
          <Typography fontWeight="bold">
            {facture.montant_calcule || facture.montant} DH
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={facture.date_fact ? 'Payée' : 'En attente'}
            color={facture.date_fact ? 'success' : 'warning'}
            size="small"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : detailFacture ? (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    📋 Détail de la facture
                  </Typography>
                  
                  <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Date de consultation</Typography>
                        <Typography variant="body1">
                          {new Date(detailFacture.date_consultation).toLocaleDateString('fr-FR')}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Patient</Typography>
                        <Typography variant="body1">
                          {detailFacture.patient_nom} {detailFacture.patient_prenom}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Médecin</Typography>
                        <Typography variant="body1">
                          Dr {detailFacture.medecin_nom} {detailFacture.medecin_prenom}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell><strong>Description</strong></TableCell>
                          <TableCell align="center"><strong>Quantité</strong></TableCell>
                          <TableCell align="right"><strong>Prix unitaire</strong></TableCell>
                          <TableCell align="right"><strong>Total</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocalHospitalIcon fontSize="small" color="primary" />
                              <strong>Consultation médicale</strong>
                            </Box>
                          </TableCell>
                          <TableCell align="center">1</TableCell>
                          <TableCell align="right">{detailFacture.prix_consultation?.toFixed(2)} DH</TableCell>
                          <TableCell align="right"><strong>{detailFacture.prix_consultation?.toFixed(2)} DH</strong></TableCell>
                        </TableRow>

                        {detailFacture.actes_medicaux && detailFacture.actes_medicaux.length > 0 ? (
                          <>
                            <TableRow>
                              <TableCell colSpan={4} sx={{ backgroundColor: '#f9f9f9', py: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary">
                                  🩺 Actes médicaux effectués
                                </Typography>
                              </TableCell>
                            </TableRow>
                            {detailFacture.actes_medicaux.map((acte, index) => (
                              <TableRow key={index}>
                                <TableCell sx={{ pl: 4 }}>{acte.nom_acte}</TableCell>
                                <TableCell align="center">
                                  <Chip label={acte.quantite} size="small" color="primary" variant="outlined" />
                                </TableCell>
                                <TableCell align="right">{acte.prix_unitaire?.toFixed(2)} DH</TableCell>
                                <TableCell align="right"><strong>{acte.prix_total?.toFixed(2)} DH</strong></TableCell>
                              </TableRow>
                            ))}
                          </>
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4}>
                              <Alert severity="info" sx={{ my: 1 }}>Aucun acte médical supplémentaire</Alert>
                            </TableCell>
                          </TableRow>
                        )}

                        <TableRow>
                          <TableCell colSpan={3} align="right" sx={{ backgroundColor: '#e3f2fd' }}>
                            <Typography variant="h6" fontWeight="bold">MONTANT TOTAL</Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ backgroundColor: '#e3f2fd' }}>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              {detailFacture.montant_total?.toFixed(2)} DH
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : null}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function MonDossier() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [patient, setPatient] = useState(null);
  const [dossier, setDossier] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [maladies, setMaladies] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [vaccins, setVaccins] = useState([]);
  const [ordonnances, setOrdonnances] = useState([]);
  const [ordonnancesAnalyses, setOrdonnancesAnalyses] = useState([]);
  const [ordonnancesRadios, setOrdonnancesRadios] = useState([]);
  const [factures, setFactures] = useState([]);

  useEffect(() => {
    fetchDossierMedical();
  }, []);

  const fetchDossierMedical = async () => {
    try {
      setLoading(true);
      
      const patientsResponse = await api.get(`http://127.0.0.1:8000/api/patients/?cin=${user.cin}`);
      
      if (!patientsResponse.data || patientsResponse.data.length === 0) {
        setError('Patient introuvable');
        setLoading(false);
        return;
      }
      
      const patientData = patientsResponse.data[0];
      setPatient(patientData);
      
      // Récupérer organisme d'assurance
      try {
        const patientOrganismeResponse = await api.get(`http://127.0.0.1:8000/api/patient-organismes/?patient=${patientData.id_patient}`);
        if (patientOrganismeResponse.data && patientOrganismeResponse.data.length > 0) {
          const organismeData = patientOrganismeResponse.data[0];
          setPatient({
            ...patientData,
            organisme_nom: organismeData.organisme_nom,
            organisme_type: organismeData.organisme_type
          });
        }
      } catch (err) {
        console.warn('⚠️ Pas d\'organisme d\'assurance');
      }
      
      const dossiersResponse = await api.get(`http://127.0.0.1:8000/api/dossiers/?patient=${patientData.id_patient}`);
      const dossierData = dossiersResponse.data[0];
      setDossier(dossierData);
      
      if (dossierData) {
        try {
          const maladiesResponse = await api.get(`http://127.0.0.1:8000/api/maladie-dossiers/?dossier=${dossierData.id_dossier}`);
          setMaladies(maladiesResponse.data);
        } catch (err) {
          console.warn('Erreur maladies:', err);
        }
        
        try {
          const allergiesResponse = await api.get(`http://127.0.0.1:8000/api/allergie-dossiers/?dossier=${dossierData.id_dossier}`);
          setAllergies(allergiesResponse.data);
        } catch (err) {
          console.warn('Erreur allergies:', err);
        }
        
        try {
          const vaccinsResponse = await api.get(`http://127.0.0.1:8000/api/vaccin-dossiers/?dossier=${dossierData.id_dossier}`);
          setVaccins(vaccinsResponse.data);
        } catch (err) {
          console.warn('Erreur vaccins:', err);
        }
      }
      
      const rdvsResponse = await api.get(`http://127.0.0.1:8000/api/rdvs/?patient=${patientData.id_patient}`);
      const rdvIds = rdvsResponse.data.map(rdv => rdv.id);
      
      if (rdvIds.length > 0) {
        const consultationsPromises = rdvIds.map(rdvId =>
          api.get(`http://127.0.0.1:8000/api/consultations/?rdv=${rdvId}`)
        );
        const consultationsResults = await Promise.all(consultationsPromises);
        const allConsultations = consultationsResults.flatMap(res => res.data);
        
        setConsultations(allConsultations);
        
        if (allConsultations.length > 0) {
          const ordonnancesPromises = allConsultations.map(cons =>
            api.get(`http://127.0.0.1:8000/api/ordonnances/?consultation=${cons.id_cons}`)
          );
          const ordonnancesResults = await Promise.all(ordonnancesPromises);
          const allOrdonnances = ordonnancesResults.flatMap(res => res.data);
          
          console.log('💊 Ordonnances récupérées:', allOrdonnances);
          setOrdonnances(allOrdonnances);
          
          // Ordonnances d'analyses
          const ordonnancesAnalysesPromises = allConsultations.map(cons =>
            api.get(`http://127.0.0.1:8000/api/ordonnance-analyses/?consultation=${cons.id_cons}`)
          );
          const ordonnancesAnalysesResults = await Promise.all(ordonnancesAnalysesPromises);
          const allOrdonnancesAnalyses = ordonnancesAnalysesResults.flatMap(res => res.data);
          
          console.log('🔬 Analyses récupérées:', allOrdonnancesAnalyses);
          setOrdonnancesAnalyses(allOrdonnancesAnalyses);
          
          // Ordonnances de radios
          const ordonnancesRadiosPromises = allConsultations.map(cons =>
            api.get(`http://127.0.0.1:8000/api/ordonnance-radios/?consultation=${cons.id_cons}`)
          );
          const ordonnancesRadiosResults = await Promise.all(ordonnancesRadiosPromises);
          const allOrdonnancesRadios = ordonnancesRadiosResults.flatMap(res => res.data);
          
          console.log('🩻 Radios récupérées:', allOrdonnancesRadios);
          setOrdonnancesRadios(allOrdonnancesRadios);
          
          // Factures
          const facturesPromises = allConsultations.map(cons =>
            api.get(`http://127.0.0.1:8000/api/factures/?consultation=${cons.id_cons}`)
          );
          const facturesResults = await Promise.all(facturesPromises);
          const allFactures = facturesResults.flatMap(res => res.data);
          setFactures(allFactures);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError('Erreur lors du chargement du dossier médical');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard/patient')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>Mon Dossier Médical</Typography>
          </Toolbar>
        </AppBar>
        <Container sx={{ mt: 4 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Chargement du dossier médical...</Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard/patient')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>Mon Dossier Médical</Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Informations Personnelles</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Nom complet</Typography>
              <Typography variant="h6">{patient?.nom_patient} {patient?.prenom_patient}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">CIN</Typography>
              <Typography variant="h6">{patient?.cin}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Date de naissance</Typography>
              <Typography variant="h6">
                {patient?.date_naissance ? new Date(patient.date_naissance).toLocaleDateString('fr-FR') : '-'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Sexe</Typography>
              <Typography variant="h6">{patient?.sexe === 'M' ? 'Masculin' : 'Féminin'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Téléphone</Typography>
              <Typography variant="h6">{patient?.telephone}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Situation familiale</Typography>
              <Typography variant="h6">{patient?.situation_familiale || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Organisme d'assurance</Typography>
              <Typography variant="h6">
                {patient?.organisme_nom ? `${patient.organisme_nom} (${patient.organisme_type})` : 'Aucun'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Adresse</Typography>
              <Typography variant="h6">{patient?.adresse || '-'}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningIcon color="error" />
              <Typography variant="h6">Allergies ({allergies.length})</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {allergies.length === 0 ? (
              <Typography color="text.secondary">Aucune allergie enregistrée</Typography>
            ) : (
              <List>
                {allergies.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon><WarningIcon color="error" /></ListItemIcon>
                    <ListItemText primary={item.allergie_nom} secondary={item.precautions_patient} />
                  </ListItem>
                ))}
              </List>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocalHospitalIcon color="primary" />
              <Typography variant="h6">Maladies Chroniques ({maladies.length})</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {maladies.length === 0 ? (
              <Typography color="text.secondary">Aucune maladie chronique enregistrée</Typography>
            ) : (
              <List>
                {maladies.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon><LocalHospitalIcon color="primary" /></ListItemIcon>
                    <ListItemText primary={item.maladie_nom} secondary={item.duree_maladie_patient} />
                  </ListItem>
                ))}
              </List>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <VaccinesIcon color="success" />
              <Typography variant="h6">Vaccinations ({vaccins.length})</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {vaccins.length === 0 ? (
              <Typography color="text.secondary">Aucun vaccin enregistré</Typography>
            ) : (
              <List>
                {vaccins.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon><VaccinesIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary={item.vaccin_nom}
                      secondary={item.date_vacc_patient ? `Administré le ${new Date(item.date_vacc_patient).toLocaleDateString('fr-FR')}` : ''}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DescriptionIcon color="primary" />
              <Typography variant="h6">Historique des Consultations ({consultations.length})</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {consultations.length === 0 ? (
              <Typography color="text.secondary">Aucune consultation enregistrée</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Médecin</strong></TableCell>
                      <TableCell><strong>Diagnostic</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {consultations.map((cons, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(cons.date_cons).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" fontWeight="500">Dr {cons.medecin_nom}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {cons.medecin_specialite || 'Généraliste'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{cons.diagnostic || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <MedicationIcon color="secondary" />
              <Typography variant="h6">
                Ordonnances ({ordonnances.length + ordonnancesAnalyses.length + ordonnancesRadios.length})
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {ordonnances.length === 0 && ordonnancesAnalyses.length === 0 && ordonnancesRadios.length === 0 ? (
              <Typography color="text.secondary">Aucune ordonnance</Typography>
            ) : (
              <>
                {ordonnances.length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>💊 Ordonnances</Typography>
                    <List>
                      {ordonnances.map((ord, index) => (
                        <ListItem key={index}>
                          <ListItemIcon><MedicationIcon color="secondary" /></ListItemIcon>
                          <ListItemText
                            primary={ord.medicaments || 'Médicament non renseigné'}
                            secondary={
                              <>
                                {ord.date_ord && ord.medecin_nom ? (
                                  `Délivrée le ${new Date(ord.date_ord).toLocaleDateString('fr-FR')} par Dr ${ord.medecin_nom}`
                                ) : ord.date_ord ? (
                                  `Délivrée le ${new Date(ord.date_ord).toLocaleDateString('fr-FR')}`
                                ) : 'Date non disponible'}
                                {ord.medecin_specialite && (
                                  <>
                                    <br />
                                    {ord.medecin_specialite}
                                  </>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {ordonnancesAnalyses.length > 0 && (
                  <>
                    {ordonnances.length > 0 && <Divider sx={{ my: 2 }} />}
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>🔬 Ordonnances d'analyses</Typography>
                    <List>
                      {ordonnancesAnalyses.map((ord, index) => (
                        <ListItem key={index}>
                          <ListItemIcon><ScienceIcon color="primary" /></ListItemIcon>
                          <ListItemText
                            primary={ord.analyse_nom || 'Analyse'}
                            secondary={
                              <>
                                {ord.date_ord && ord.medecin_nom ? (
                                  `Prescrite le ${new Date(ord.date_ord).toLocaleDateString('fr-FR')} par Dr ${ord.medecin_nom}`
                                ) : ord.date_ord ? (
                                  `Prescrite le ${new Date(ord.date_ord).toLocaleDateString('fr-FR')}`
                                ) : 'Date non disponible'}
                                {ord.medecin_specialite && (
                                  <>
                                    <br />
                                    {ord.medecin_specialite}
                                  </>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ReceiptIcon color="info" />
              <Typography variant="h6">Factures ({factures.length})</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {factures.length === 0 ? (
              <Typography color="text.secondary">Aucune facture</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Montant</strong></TableCell>
                      <TableCell><strong>Statut</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {factures.map((facture, index) => (
                      <FactureRow key={index} facture={facture} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </AccordionDetails>
        </Accordion>
      </Container>
    </Box>
  );
}

export default MonDossier;