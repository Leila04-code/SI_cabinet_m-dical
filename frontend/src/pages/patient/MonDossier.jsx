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
  Button,
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
// ===== COMPOSANT FACTUREROW =====
// Ajoutez ceci AVANT la fonction MonDossier()

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
        console.log('🔍 Chargement détail facture ID:', factureId);
        const response = await api.get(`http://127.0.0.1:8000/api/factures/${factureId}/detail/`);
        console.log('✅ Détail facture reçu:', response.data);
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
                  <Typography sx={{ ml: 2 }}>Chargement du détail...</Typography>
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : detailFacture ? (
                <Box>
                  <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
                    📋 Détail de la facture
                  </Typography>
                  
                  {/* Informations générales */}
                  <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Date de consultation
                        </Typography>
                        <Typography variant="body1">
                          {new Date(detailFacture.date_consultation).toLocaleDateString('fr-FR')}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Patient
                        </Typography>
                        <Typography variant="body1">
                          {detailFacture.patient_nom} {detailFacture.patient_prenom}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Médecin
                        </Typography>
                        <Typography variant="body1">
                          Dr {detailFacture.medecin_nom} {detailFacture.medecin_prenom}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Tableau détaillé */}
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
                        {/* Ligne consultation */}
                        <TableRow>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocalHospitalIcon fontSize="small" color="primary" />
                              <strong>Consultation médicale</strong>
                            </Box>
                          </TableCell>
                          <TableCell align="center">1</TableCell>
                          <TableCell align="right">
                            {detailFacture.prix_consultation?.toFixed(2)} DH
                          </TableCell>
                          <TableCell align="right">
                            <strong>{detailFacture.prix_consultation?.toFixed(2)} DH</strong>
                          </TableCell>
                        </TableRow>

                        {/* Actes médicaux */}
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
                                <TableCell sx={{ pl: 4 }}>
                                  {acte.nom_acte}
                                </TableCell>
                                <TableCell align="center">
                                  <Chip label={acte.quantite} size="small" color="primary" variant="outlined" />
                                </TableCell>
                                <TableCell align="right">
                                  {acte.prix_unitaire?.toFixed(2)} DH
                                </TableCell>
                                <TableCell align="right">
                                  <strong>{acte.prix_total?.toFixed(2)} DH</strong>
                                </TableCell>
                              </TableRow>
                            ))}
                          </>
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4}>
                              <Alert severity="info" sx={{ my: 1 }}>
                                Aucun acte médical supplémentaire effectué
                              </Alert>
                            </TableCell>
                          </TableRow>
                        )}

                        {/* Ligne total */}
                        <TableRow>
                          <TableCell colSpan={3} align="right" sx={{ backgroundColor: '#e3f2fd' }}>
                            <Typography variant="h6" fontWeight="bold">
                              MONTANT TOTAL
                            </Typography>
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
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // États pour les données
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
  
// ===== SECTION FACTURES DANS LE RENDER =====
// Remplacez votre Accordion Factures par ceci :


  useEffect(() => {
    if (!dataLoaded) {
      fetchDossierMedical();
    }
  }, []);

  const fetchDossierMedical = async () => {
    if (dataLoaded) {
      console.log('⚠️ Données déjà chargées, skip');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Début du chargement du dossier médical');
      console.log('👤 CIN:', user.cin);
      
      // 1. Récupérer les infos du patient
      const patientsResponse = await api.get(`http://127.0.0.1:8000/api/patients/?cin=${user.cin}`);
      console.log('📋 Patients trouvés:', patientsResponse.data);
      
      if (!patientsResponse.data || patientsResponse.data.length === 0) {
        setError('Patient introuvable');
        setLoading(false);
        return;
      }
      
      const patientData = patientsResponse.data[0];
      setPatient(patientData);
      console.log('✅ Patient chargé:', patientData.prenom_patient, patientData.nom_patient);
      // Dans fetchDossierMedical(), après setPatient(patientData);
try {
  const patientOrganismeResponse = await api.get(`http://127.0.0.1:8000/api/patient-organismes/?patient=${patientData.id_patient}`);
  
  if (patientOrganismeResponse.data && patientOrganismeResponse.data.length > 0) {
    const organismeData = patientOrganismeResponse.data[0];
    setPatient({
      ...patientData,
      organisme_nom: organismeData.organisme_nom,
      organisme_type: organismeData.organisme_type
    });
    console.log('✅ Organisme chargé:', organismeData.organisme_nom);
  }
} catch (err) {
  console.warn('⚠️ Pas d\'organisme d\'assurance');
}
      
      // 2. Récupérer le dossier médical
      try {
        const dossiersResponse = await api.get(`http://127.0.0.1:8000/api/dossiers/?patient=${patientData.id_patient}`);
        console.log('📁 Dossiers trouvés:', dossiersResponse.data);
        
        if (dossiersResponse.data && dossiersResponse.data.length > 0) {
          const dossierData = dossiersResponse.data[0];
          setDossier(dossierData);
          
          const dossierId = dossierData.id_dossier || dossierData.id_dm || dossierData.id;
          console.log('✅ Dossier médical chargé, ID:', dossierId);
          
          // 3. Récupérer les maladies
          try {
            if (dossierId) {
              const maladiesResponse = await api.get(`http://127.0.0.1:8000/api/maladie-dossiers/?dossier=${dossierId}`);
              setMaladies(maladiesResponse.data);
              console.log('✅ Maladies chargées:', maladiesResponse.data.length);
            }
          } catch (err) {
            console.warn('⚠️ Erreur maladies:', err.message);
          }
          
          // 4. Récupérer les allergies
          try {
            if (dossierId) {
              const allergiesResponse = await api.get(`http://127.0.0.1:8000/api/allergie-dossiers/?dossier=${dossierId}`);
              setAllergies(allergiesResponse.data);
              console.log('✅ Allergies chargées:', allergiesResponse.data.length);
            }
          } catch (err) {
            console.warn('⚠️ Erreur allergies:', err.message);
          }
          
          // 5. Récupérer les vaccins
          try {
            if (dossierId) {
              const vaccinsResponse = await api.get(`http://127.0.0.1:8000/api/vaccin-dossiers/?dossier=${dossierId}`);
              setVaccins(vaccinsResponse.data);
              console.log('✅ Vaccins chargés:', vaccinsResponse.data.length);
            }
          } catch (err) {
            console.warn('⚠️ Erreur vaccins:', err.message);
          }
        }
      } catch (err) {
        console.warn('⚠️ Erreur dossiers:', err.message);
      }
      
      // 6. Récupérer les RDV
      try {
        const rdvsResponse = await api.get(`http://127.0.0.1:8000/api/rdvs/?patient=${patientData.id_patient}`);
        console.log('📅 RDV trouvés:', rdvsResponse.data.length);
        
        const rdvsVerifies = rdvsResponse.data.filter(rdv => 
          rdv.patient === patientData.id_patient || 
          rdv.patient_id === patientData.id_patient
        );
        
        if (rdvsVerifies.length > 0) {
          const rdvIds = rdvsVerifies.map(rdv => rdv.id);
          
          // 7. Récupérer les consultations
          const allConsultations = [];
          for (const rdvId of rdvIds) {
            try {
              const consultationsResponse = await api.get(`http://127.0.0.1:8000/api/consultations/?rdv=${rdvId}`);
              if (consultationsResponse.data && consultationsResponse.data.length > 0) {
                const consultationsVerifiees = consultationsResponse.data.filter(cons => 
                  cons.rdv === rdvId || cons.rdv_id === rdvId
                );
                allConsultations.push(...consultationsVerifiees);
              }
            } catch (err) {
              console.warn(`⚠️ Erreur consultation RDV ${rdvId}:`, err.message);
            }
          }
          
          const uniqueConsultations = Array.from(
            new Map(allConsultations.map(c => [c.id_cons, c])).values()
          );
          
          setConsultations(uniqueConsultations);
          console.log('✅ Consultations chargées:', uniqueConsultations.length);
          
          // 8. Récupérer les ordonnances et factures
          if (allConsultations.length > 0) {
            const allOrdonnances = [];
            const allOrdonnancesAnalyses = [];
            const allOrdonnancesRadios = [];
            const allFactures = [];
            
            for (const consultation of allConsultations) {
              const consultationId = consultation.id_cons || consultation.id_consultation || consultation.id;
              
              if (!consultationId) continue;
              
              // Ordonnances médicaments
              try {
                let ordonnancesResponse;
                try {
                  ordonnancesResponse = await api.get(`http://127.0.0.1:8000/api/ordonnances/?consultation=${consultationId}`);
                } catch (err) {
                  ordonnancesResponse = await api.get(`http://127.0.0.1:8000/api/ordonnances/?id_consultation=${consultationId}`);
                }
                
                if (ordonnancesResponse.data) {
                  allOrdonnances.push(...ordonnancesResponse.data);
                }
              } catch (err) {
                console.warn(`⚠️ Erreur ordonnances consultation ${consultationId}:`, err.message);
              }
              
              // Ordonnances analyses
              try {
                const ordonnancesAnalysesResponse = await api.get(`http://127.0.0.1:8000/api/ordonnance-analyses/?consultation=${consultationId}`);
                if (ordonnancesAnalysesResponse.data) {
                  allOrdonnancesAnalyses.push(...ordonnancesAnalysesResponse.data);
                }
              } catch (err) {
                console.warn(`⚠️ Erreur ordonnances analyses`);
              }
              
              // Ordonnances radios
              try {
                const ordonnancesRadiosResponse = await api.get(`http://127.0.0.1:8000/api/ordonnance-radios/?consultation=${consultationId}`);
                if (ordonnancesRadiosResponse.data) {
                  allOrdonnancesRadios.push(...ordonnancesRadiosResponse.data);
                }
              } catch (err) {
                console.warn(`⚠️ Erreur ordonnances radios`);
              }
              
              // Factures
              try {
                const facturesResponse = await api.get(`http://127.0.0.1:8000/api/factures/?consultation=${consultationId}`);
                if (facturesResponse.data) {
                  allFactures.push(...facturesResponse.data);
                }
              } catch (err) {
                console.warn(`⚠️ Erreur factures`);
              }
            }
            
            const uniqueOrdonnances = Array.from(
              new Map(allOrdonnances.map(o => [o.id_ord || o.id, o])).values()
            );
            const uniqueOrdonnancesAnalyses = Array.from(
              new Map(allOrdonnancesAnalyses.map(o => [o.id_ord_analyse || o.id, o])).values()
            );
            const uniqueOrdonnancesRadios = Array.from(
              new Map(allOrdonnancesRadios.map(o => [o.id_ord_radio || o.id, o])).values()
            );
            const uniqueFactures = Array.from(
              new Map(allFactures.map(f => [f.id_facture || f.id, f])).values()
            );
            
            setOrdonnances(uniqueOrdonnances);
            setOrdonnancesAnalyses(uniqueOrdonnancesAnalyses);
            setOrdonnancesRadios(uniqueOrdonnancesRadios);
            setFactures(uniqueFactures);
            
            console.log('✅ Factures chargées:', uniqueFactures.length);
          }
        }
      } catch (err) {
        console.warn('⚠️ Erreur RDV:', err.message);
      }
      
      console.log('✅ Chargement terminé');
      setDataLoaded(true);
      setLoading(false);
      
    } catch (err) {
      console.error('❌ Erreur critique:', err);
      setError(`Erreur lors du chargement: ${err.message}`);
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
      {/* AppBar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard/patient')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Mon Dossier Médical
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Informations personnelles */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Informations Personnelles
            </Typography>
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
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Adresse</Typography>
              <Typography variant="h6">{patient?.adresse || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Organisme d'assurance</Typography>
              <Typography variant="h6">{patient?.organisme_nom ? `${patient.organisme_nom} (${patient.organisme_type})` : 'Aucun'}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Allergies */}
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
                    <ListItemIcon>
                      <WarningIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.allergie_nom}
                      secondary={
                        <>
                          {item.date_diagnostic && (
                            <>
                              Diagnostiqué le {new Date(item.date_diagnostic).toLocaleDateString('fr-FR')}
                              <br />
                            </>
                          )}
                          {item.precautions_patient && (
                            <>
                              <strong>Précautions :</strong> {item.precautions_patient}
                            </>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Maladies chroniques */}
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
                    <ListItemIcon>
                      <LocalHospitalIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.maladie_nom}
                      secondary={
                        <>
                          {item.date_diagnostic && (
                            <>
                              Diagnostiqué le {new Date(item.date_diagnostic).toLocaleDateString('fr-FR')}
                              <br />
                            </>
                          )}
                          {item.duree_maladie_patient && (
                            <>
                              <strong>Durée :</strong> {item.duree_maladie_patient}
                            </>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Vaccins */}
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
                    <ListItemIcon>
                      <VaccinesIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.vaccin_nom}
                      secondary={
                        <>
                          {item.date_vacc_patient && (
                            <>
                              Administré le {new Date(item.date_vacc_patient).toLocaleDateString('fr-FR')}
                            </>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Consultations */}
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
                      <TableCell>Date</TableCell>
                      <TableCell>Médecin</TableCell>
                      <TableCell>Diagnostic</TableCell>
                      <TableCell>Traitement</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {consultations.map((cons, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(cons.date_cons).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>Dr {cons.medecin_nom}</TableCell>
                        <TableCell>{cons.diagnostic || '-'}</TableCell>
                        <TableCell>{cons.traitement || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Ordonnances */}
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
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      💊 Ordonnances
                    </Typography>
                    <List>
                      {ordonnances.map((ord, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <MedicationIcon color="secondary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={ord.medicaments || 'Médicament non renseigné'}
                            secondary={
                              ord.date_ord
                                ? `Délivrée le ${new Date(ord.date_ord).toLocaleDateString('fr-FR')}`
                                : 'Pas de date'
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
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      🔬 Ordonnances d'analyses
                    </Typography>
                    <List>
                      {ordonnancesAnalyses.map((ord, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <ScienceIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={ord.analyse_nom || 'Analyse'}
                            secondary={
                              ord.date_ord
                                ? `Prescrite le ${new Date(ord.date_ord).toLocaleDateString('fr-FR')}`
                                : 'Date non renseignée'
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {ordonnancesRadios.length > 0 && (
                  <>
                    {(ordonnances.length > 0 || ordonnancesAnalyses.length > 0) && <Divider sx={{ my: 2 }} />}
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      🩻 Ordonnances de radiologie
                    </Typography>
                    <List>
                      {ordonnancesRadios.map((ord, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <LocalHospitalIcon color="error" />
                          </ListItemIcon>
                          <ListItemText
                            primary={ord.radio_nom || 'Radio'}
                            secondary={
                              ord.date_ord
                                ? `Prescrite le ${new Date(ord.date_ord).toLocaleDateString('fr-FR')}`
                                : 'Date non renseignée'
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

        {/* Factures avec bouton "Voir détail" à droite */}
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ReceiptIcon color="warning" />
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
                <TableCell />  {/* ← Cellule vide pour la flèche */}
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Montant</strong></TableCell>
                <TableCell><strong>Statut</strong></TableCell>
              </TableRow>
             </TableHead>
              <TableBody>
                {factures.map((fact, index) => (
                  <FactureRow key={index} facture={fact} />
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