import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, MenuItem, Typography, Box,
  IconButton, Divider, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CreateIcon from '@mui/icons-material/Create';
import { 
  consultationService, rdvService, medecinService, 
  analyseService, radioService 
} from '../services/api';
import api from '../services/api';

function ConsultationForm({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    rdv: '',
    medecin: '',
    date_cons: new Date().toISOString().split('T')[0],
    diagnostic: '',
    prix_cons: ''
  });
  
  const [rdvs, setRdvs] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [radios, setRadios] = useState([]);
  const [actesMedicaux, setActesMedicaux] = useState([]);
  
  const [analysesPrescrites, setAnalysesPrescrites] = useState([]);
  const [radiosPrescrites, setRadiosPrescrites] = useState([]);
  const [actesPrescrits, setActesPrescrits] = useState([]);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const [rdvsRes, medecinsRes, analysesRes, radiosRes, actesRes] = await Promise.all([
        rdvService.getAll(),
        medecinService.getAll(),
        analyseService.getAll(),
        radioService.getAll(),
        api.get('actes/')
      ]);
      
      setRdvs(rdvsRes.data);
      setMedecins(medecinsRes.data);
      setAnalyses(analysesRes.data);
      setRadios(radiosRes.data);
      setActesMedicaux(actesRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ===== GESTION DES ANALYSES =====
  const ajouterAnalyse = () => {
    setAnalysesPrescrites([...analysesPrescrites, { analyse: '', date_ord: formData.date_cons }]);
  };

  const supprimerAnalyse = (index) => {
    setAnalysesPrescrites(analysesPrescrites.filter((_, i) => i !== index));
  };

  const handleAnalyseChange = (index, field, value) => {
    const newAnalyses = [...analysesPrescrites];
    newAnalyses[index][field] = value;
    setAnalysesPrescrites(newAnalyses);
  };

  // ===== GESTION DES RADIOS =====
  const ajouterRadio = () => {
    setRadiosPrescrites([...radiosPrescrites, { radio: '', date_ord: formData.date_cons }]);
  };

  const supprimerRadio = (index) => {
    setRadiosPrescrites(radiosPrescrites.filter((_, i) => i !== index));
  };

  const handleRadioChange = (index, field, value) => {
    const newRadios = [...radiosPrescrites];
    newRadios[index][field] = value;
    setRadiosPrescrites(newRadios);
  };

  // ===== GESTION DES ACTES MÉDICAUX =====
  const ajouterActe = () => {
    setActesPrescrits([...actesPrescrits, { 
      mode: 'existant', // 'existant' ou 'nouveau'
      acte: '', 
      nom_acte: '',
      code_acte: '',
      quantite: 1, 
      prix_applique: '' 
    }]);
  };

  const supprimerActe = (index) => {
    setActesPrescrits(actesPrescrits.filter((_, i) => i !== index));
  };

  const handleActeModeChange = (index, newMode) => {
    const newActes = [...actesPrescrits];
    newActes[index].mode = newMode;
    // Réinitialiser les champs selon le mode
    if (newMode === 'existant') {
      newActes[index].nom_acte = '';
      newActes[index].code_acte = '';
    } else {
      newActes[index].acte = '';
    }
    setActesPrescrits(newActes);
  };

  const handleActeChange = (index, field, value) => {
    const newActes = [...actesPrescrits];
    newActes[index][field] = value;
    
    // Si on change l'acte existant, on met à jour le prix automatiquement
    if (field === 'acte' && newActes[index].mode === 'existant') {
      const acteSelectionne = actesMedicaux.find(a => a.id_acte === parseInt(value));
      if (acteSelectionne) {
        newActes[index].prix_applique = acteSelectionne.prix_acte;
      }
    }
    
    setActesPrescrits(newActes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Créer la consultation
      const consultationRes = await consultationService.create(formData);
      const consultationId = consultationRes.data.id_cons;

      // Créer les actes médicaux
      for (const acte of actesPrescrits) {
        let acteId = acte.acte;

        // Si c'est un nouvel acte, le créer d'abord
        if (acte.mode === 'nouveau' && acte.nom_acte && acte.code_acte && acte.prix_applique) {
          const newActeRes = await api.post('actes/', {
            nom_acte: acte.nom_acte,
            code_acte: acte.code_acte,
            prix_acte: acte.prix_applique,
            description: ''
          });
          acteId = newActeRes.data.id_acte;
        }

        // Créer la liaison consultation-acte
        if (acteId) {
          await api.post('consultation-actes/', {
            consultation: consultationId,
            acte: acteId,
            quantite: acte.quantite || 1,
            prix_applique: acte.prix_applique
          });
        }
      }

      // Créer les analyses prescrites
      for (const analyse of analysesPrescrites) {
        if (analyse.analyse) {
          await api.post('ordonnance-analyses/', {
            consultation: consultationId,
            analyse: analyse.analyse,
            date_ord: analyse.date_ord
          });
        }
      }

      // Créer les radios prescrites
      for (const radio of radiosPrescrites) {
        if (radio.radio) {
          await api.post('ordonnance-radios/', {
            consultation: consultationId,
            radio: radio.radio,
            date_ord: radio.date_ord
          });
        }
      }

      alert('Consultation créée avec succès !');
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la création de la consultation:', error);
      alert('Erreur lors de la création de la consultation');
    }
  };

  const resetForm = () => {
    setFormData({
      rdv: '',
      medecin: '',
      date_cons: new Date().toISOString().split('T')[0],
      diagnostic: '',
      prix_cons: ''
    });
    setAnalysesPrescrites([]);
    setRadiosPrescrites([]);
    setActesPrescrits([]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Nouvelle Consultation</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Rendez-vous"
                name="rdv"
                value={formData.rdv}
                onChange={handleChange}
                required
              >
                <MenuItem value="">Sélectionnez un RDV</MenuItem>
                {rdvs.map((rdv) => (
                  <MenuItem key={rdv.id} value={rdv.id}>
                    {rdv.patient_nom} {rdv.patient_prenom} - {rdv.creneau_details?.date}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Médecin"
                name="medecin"
                value={formData.medecin}
                onChange={handleChange}
                required
              >
                <MenuItem value="">Sélectionnez un médecin</MenuItem>
                {medecins.map((medecin) => (
                  <MenuItem key={medecin.id_med} value={medecin.id_med}>
                    Dr {medecin.nom_med} {medecin.prenom_med}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date de consultation"
                name="date_cons"
                value={formData.date_cons}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Prix (MAD)"
                name="prix_cons"
                value={formData.prix_cons}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Diagnostic"
                name="diagnostic"
                value={formData.diagnostic}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* ===== ACTES MÉDICAUX ===== */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">💉 Actes médicaux</Typography>
                <Button startIcon={<AddIcon />} onClick={ajouterActe} size="small">
                  Ajouter un acte
                </Button>
              </Box>
              
              {actesPrescrits.map((acte, index) => (
                <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  {/* Sélecteur de mode */}
                  <Box sx={{ mb: 2 }}>
                    <ToggleButtonGroup
                      value={acte.mode}
                      exclusive
                      onChange={(e, newMode) => newMode && handleActeModeChange(index, newMode)}
                      size="small"
                      fullWidth
                    >
                      <ToggleButton value="existant">
                        <SearchIcon sx={{ mr: 1 }} fontSize="small" />
                        Choisir un acte existant
                      </ToggleButton>
                      <ToggleButton value="nouveau">
                        <CreateIcon sx={{ mr: 1 }} fontSize="small" />
                        Créer un nouvel acte
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  {/* Formulaire selon le mode */}
                  {acte.mode === 'existant' ? (
                    // Mode: Acte existant
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          fullWidth
                          label="Acte"
                          value={acte.acte}
                          onChange={(e) => handleActeChange(index, 'acte', e.target.value)}
                          required
                        >
                          <MenuItem value="">Sélectionnez un acte</MenuItem>
                          {actesMedicaux.map((a) => (
                            <MenuItem key={a.id_acte} value={a.id_acte}>
                              {a.nom_acte} - {a.prix_acte} MAD
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Quantité"
                          value={acte.quantite}
                          onChange={(e) => handleActeChange(index, 'quantite', e.target.value)}
                          inputProps={{ min: 1 }}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Prix appliqué"
                          value={acte.prix_applique}
                          onChange={(e) => handleActeChange(index, 'prix_applique', e.target.value)}
                          inputProps={{ min: 0, step: '0.01' }}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        <IconButton color="error" onClick={() => supprimerActe(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ) : (
                    // Mode: Nouvel acte
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nom de l'acte"
                          value={acte.nom_acte}
                          onChange={(e) => handleActeChange(index, 'nom_acte', e.target.value)}
                          placeholder="Ex: Consultation spécialisée"
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Code de l'acte"
                          value={acte.code_acte}
                          onChange={(e) => handleActeChange(index, 'code_acte', e.target.value)}
                          placeholder="Ex: ACT001"
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Prix (MAD)"
                          value={acte.prix_applique}
                          onChange={(e) => handleActeChange(index, 'prix_applique', e.target.value)}
                          inputProps={{ min: 0, step: '0.01' }}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Quantité"
                          value={acte.quantite}
                          onChange={(e) => handleActeChange(index, 'quantite', e.target.value)}
                          inputProps={{ min: 1 }}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                            💡 L'acte sera enregistré dans la base
                          </Typography>
                          <IconButton color="error" onClick={() => supprimerActe(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  )}
                </Box>
              ))}
            </Grid>

            {/* ===== ANALYSES ===== */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">🔬 Analyses prescrites</Typography>
                <Button startIcon={<AddIcon />} onClick={ajouterAnalyse} size="small">
                  Ajouter une analyse
                </Button>
              </Box>
              {analysesPrescrites.map((analyse, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    select
                    label="Analyse"
                    value={analyse.analyse}
                    onChange={(e) => handleAnalyseChange(index, 'analyse', e.target.value)}
                    sx={{ flex: 2 }}
                  >
                    {analyses.map((a) => (
                      <MenuItem key={a.id_analyse} value={a.id_analyse}>
                        {a.nom_analyse}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    type="date"
                    label="Date prescription"
                    value={analyse.date_ord}
                    onChange={(e) => handleAnalyseChange(index, 'date_ord', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1 }}
                  />
                  <IconButton color="error" onClick={() => supprimerAnalyse(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Grid>

            {/* ===== RADIOS ===== */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">📷 Radios prescrites</Typography>
                <Button startIcon={<AddIcon />} onClick={ajouterRadio} size="small">
                  Ajouter une radio
                </Button>
              </Box>
              {radiosPrescrites.map((radio, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    select
                    label="Radio"
                    value={radio.radio}
                    onChange={(e) => handleRadioChange(index, 'radio', e.target.value)}
                    sx={{ flex: 2 }}
                  >
                    {radios.map((r) => (
                      <MenuItem key={r.id_radio} value={r.id_radio}>
                        {r.nom_rad}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    type="date"
                    label="Date prescription"
                    value={radio.date_ord}
                    onChange={(e) => handleRadioChange(index, 'date_ord', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1 }}
                  />
                  <IconButton color="error" onClick={() => supprimerRadio(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="contained" color="primary">
            Créer la Consultation
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ConsultationForm;