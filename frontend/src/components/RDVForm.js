import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, MenuItem, Typography
} from '@mui/material';
import { rdvService, patientService, medecinService, creneauService } from '../services/api';

function RDVForm({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    patient: '',
    medecin: '',
    creneau: ''
  });
  
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [creneaux, setCreneaux] = useState([]);
  const [creneauxFiltres, setCreneauxFiltres] = useState([]);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (formData.medecin) {
      // Filtrer les créneaux par médecin sélectionné
      const creneauxDuMedecin = creneaux.filter(
        c => c.medecin === parseInt(formData.medecin) && c.libre
      );
      setCreneauxFiltres(creneauxDuMedecin);
    } else {
      setCreneauxFiltres([]);
    }
  }, [formData.medecin, creneaux]);

  const fetchData = async () => {
    try {
      const [patientsRes, medecinsRes, creneauxRes] = await Promise.all([
        patientService.getAll(),
        medecinService.getAll(),
        creneauService.getLibres()
      ]);
      
      setPatients(patientsRes.data);
      setMedecins(medecinsRes.data);
      setCreneaux(creneauxRes.data);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await rdvService.create(formData);
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la création du RDV:', error);
      alert('Erreur lors de la création du rendez-vous');
    }
  };

  const resetForm = () => {
    setFormData({
      patient: '',
      medecin: '',
      creneau: ''
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nouveau Rendez-vous</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Patient"
                name="patient"
                value={formData.patient}
                onChange={handleChange}
                required
              >
                <MenuItem value="">Sélectionnez un patient</MenuItem>
                {patients.map((patient) => (
                  <MenuItem key={patient.id_patient} value={patient.id_patient}>
                    {patient.nom_patient} {patient.prenom_patient}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
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
                    Dr {medecin.nom_med} {medecin.prenom_med} - {medecin.specialite_med}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Créneau disponible"
                name="creneau"
                value={formData.creneau}
                onChange={handleChange}
                required
                disabled={!formData.medecin}
                helperText={!formData.medecin ? "Sélectionnez d'abord un médecin" : ""}
              >
                <MenuItem value="">Sélectionnez un créneau</MenuItem>
                {creneauxFiltres.map((creneau) => (
                  <MenuItem key={creneau.id} value={creneau.id}>
                    {creneau.date} - {creneau.heure_debut} à {creneau.heure_fin}
                  </MenuItem>
                ))}
              </TextField>
              {formData.medecin && creneauxFiltres.length === 0 && (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                  Aucun créneau disponible pour ce médecin
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="contained" color="primary">
            Créer le RDV
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default RDVForm;