// src/pages/admin/GestionPersonnel.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  Badge,
  InputAdornment,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  LocalHospital as LocalHospitalIcon,
  PendingActions as PendingActionsIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function GestionPersonnel() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour les données
  const [medecins, setMedecins] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [users, setUsers] = useState([]);
  const [comptesEnAttente, setComptesEnAttente] = useState([]);
  
  // États pour les dialogs
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openCredentialsDialog, setOpenCredentialsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  
  // États pour les formulaires
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    cin: '',
    role: 'MEDECIN',
    specialite: '',
    username: '',
    password: '',
    showPassword: false
  });
  
  // États pour les notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMedecins: 0,
    totalEmployes: 0,
    comptesEnAttente: 0,
    comptesActifs: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      
      // Récupérer les utilisateurs
      const usersResponse = await axios.get(`${API_URL}/users/`, config);
      setUsers(usersResponse.data);
      
      // Récupérer les médecins
      const medecinsResponse = await axios.get(`${API_URL}/medecins/`, config);
      setMedecins(medecinsResponse.data);
      
      // Récupérer les employés
      const employesResponse = await axios.get(`${API_URL}/employes/`, config);
      setEmployes(employesResponse.data);
      
      // Filtrer les comptes en attente (is_active = false)
      const enAttente = usersResponse.data.filter(u => 
        !u.is_active && (u.role === 'MEDECIN' || u.role === 'RECEPTIONNISTE')
      );
      setComptesEnAttente(enAttente);
      
      // Calculer les stats
      const medecinsActifs = usersResponse.data.filter(u => 
        u.role === 'MEDECIN' && u.is_active
      );
      const employesActifs = usersResponse.data.filter(u => 
        u.role === 'RECEPTIONNISTE' && u.is_active
      );
      
      setStats({
        totalMedecins: medecinsResponse.data.length,
        totalEmployes: employesResponse.data.filter(e => e.role === 'RECEPTIONNISTE').length,
        comptesEnAttente: enAttente.length,
        comptesActifs: medecinsActifs.length + employesActifs.length
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      showSnackbar('Erreur lors du chargement des données', 'error');
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const generateUsername = () => {
    if (formData.prenom && formData.nom) {
      const username = `${formData.prenom.toLowerCase()}.${formData.nom.toLowerCase()}`.replace(/\s+/g, '');
      setFormData({ ...formData, username });
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const handleCreateAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      // 1. Créer l'utilisateur
      const userData = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        first_name: formData.prenom,
        last_name: formData.nom,
        role: formData.role,
        telephone: formData.telephone,
        cin: formData.cin,
        is_active: false // En attente de validation par défaut
      };
      
      const userResponse = await axios.post(`${API_URL}/auth/register/`, userData, config);
      
      // 2. Créer l'entrée correspondante selon le rôle
      if (formData.role === 'MEDECIN') {
        await axios.post(`${API_URL}/medecins/`, {
          nom_med: formData.nom,
          prenom_med: formData.prenom,
          specialite_med: formData.specialite || 'Médecine générale'
        }, config);
      } else if (formData.role === 'RECEPTIONNISTE') {
        await axios.post(`${API_URL}/employes/`, {
          nom_empl: formData.nom,
          prenom_empl: formData.prenom,
          cin_empl: formData.cin,
          date_naissance: new Date().toISOString().split('T')[0], // Date par défaut
          telephone: formData.telephone,
          role: 'RECEPTIONNISTE'
        }, config);
      }
      
      setOpenCreateDialog(false);
      resetForm();
      fetchData();
      
      // Afficher les identifiants générés
      setGeneratedCredentials({
        username: formData.username,
        password: formData.password,
        nom: formData.nom,
        prenom: formData.prenom,
        role: formData.role
      });
      setOpenCredentialsDialog(true);
      
      showSnackbar('Compte créé avec succès !');
    } catch (error) {
      console.error('Erreur création compte:', error);
      showSnackbar(
        error.response?.data?.message || 
        error.response?.data?.username?.[0] || 
        'Erreur lors de la création du compte', 
        'error'
      );
    }
  };

  const handleValidateAccount = async (userId, approve) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      if (approve) {
        // Approuver le compte
        await axios.patch(`${API_URL}/users/${userId}/`, {
          is_active: true
        }, config);
        showSnackbar('Compte validé et activé avec succès !');
      } else {
        // Rejeter = supprimer le compte
        if (window.confirm('Êtes-vous sûr de vouloir rejeter cette demande ? Le compte sera supprimé.')) {
          await axios.delete(`${API_URL}/users/${userId}/`, config);
          showSnackbar('Compte rejeté et supprimé');
        } else {
          return;
        }
      }
      
      fetchData();
    } catch (error) {
      console.error('Erreur validation:', error);
      showSnackbar('Erreur lors de la validation', 'error');
    }
  };

  const handleToggleAccountStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      await axios.patch(`${API_URL}/users/${userId}/`, {
        is_active: !currentStatus
      }, config);
      
      showSnackbar(
        currentStatus ? 'Compte désactivé' : 'Compte activé',
        'success'
      );
      fetchData();
    } catch (error) {
      console.error('Erreur changement statut:', error);
      showSnackbar('Erreur lors du changement de statut', 'error');
    }
  };

  const handleResetPassword = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      // Générer un nouveau mot de passe
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
      let newPassword = '';
      for (let i = 0; i < 12; i++) {
        newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      await axios.post(`${API_URL}/users/${user.id}/reset-password/`, {
        new_password: newPassword
      }, config);
      
      // Afficher le nouveau mot de passe
      setGeneratedCredentials({
        username: user.username,
        password: newPassword,
        nom: user.last_name,
        prenom: user.first_name,
        role: user.role,
        isReset: true
      });
      setOpenCredentialsDialog(true);
      
      showSnackbar('Mot de passe réinitialisé avec succès');
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
      showSnackbar('Erreur lors de la réinitialisation', 'error');
    }
  };

  const handleDeleteUser = async (userId, userRole) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible.')) {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { 'Authorization': `Bearer ${token}` }
        };

        await axios.delete(`${API_URL}/users/${userId}/`, config);
        showSnackbar('Compte supprimé');
        fetchData();
      } catch (error) {
        console.error('Erreur suppression:', error);
        showSnackbar('Erreur lors de la suppression', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      cin: '',
      role: 'MEDECIN',
      specialite: '',
      username: '',
      password: '',
      showPassword: false
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSnackbar('Copié dans le presse-papier');
  };

  const filteredMedecins = medecins.filter(m => 
    m.nom_med?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.prenom_med?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.specialite_med?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmployes = employes.filter(e => 
    e.nom_empl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.prenom_empl?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard/admin')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Gestion du Personnel
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
          >
            Nouveau Compte
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, mb: 4 }}>
        {/* Statistiques */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Médecins
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalMedecins}
                    </Typography>
                  </Box>
                  <LocalHospitalIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Réceptionnistes
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalEmployes}
                    </Typography>
                  </Box>
                  <PersonIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      En attente
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {stats.comptesEnAttente}
                    </Typography>
                  </Box>
                  <PendingActionsIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Comptes actifs
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {stats.comptesActifs}
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Barre de recherche */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Rechercher par nom, prénom ou spécialité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {/* Onglets */}
        <Paper>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab 
              label={
                <Badge badgeContent={stats.comptesEnAttente} color="error">
                  Comptes en attente
                </Badge>
              } 
            />
            <Tab label="Médecins" />
            <Tab label="Réceptionnistes" />
            <Tab label="Tous les comptes" />
          </Tabs>

          {/* Panel 0: Comptes en attente */}
          <TabPanel value={tabValue} index={0}>
            {comptesEnAttente.length === 0 ? (
              <Alert severity="info">Aucun compte en attente de validation</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom complet</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Rôle</TableCell>
                      <TableCell>CIN</TableCell>
                      <TableCell>Date d'inscription</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {comptesEnAttente.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.first_name} {user.last_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.role} 
                            size="small" 
                            color={user.role === 'MEDECIN' ? 'primary' : 'secondary'}
                          />
                        </TableCell>
                        <TableCell>{user.cin || '-'}</TableCell>
                        <TableCell>
                          {new Date(user.date_joined).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="success"
                            onClick={() => handleValidateAccount(user.id, true)}
                            title="Approuver"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleValidateAccount(user.id, false)}
                            title="Rejeter"
                          >
                            <CancelIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Panel 1: Médecins */}
          <TabPanel value={tabValue} index={1}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom complet</TableCell>
                    <TableCell>Spécialité</TableCell>
                    <TableCell>Statut compte</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMedecins.map((medecin) => {
                    const user = users.find(u => 
                      u.first_name === medecin.prenom_med && 
                      u.last_name === medecin.nom_med && 
                      u.role === 'MEDECIN'
                    );
                    return (
                      <TableRow key={medecin.id_med}>
                        <TableCell>Dr {medecin.nom_med} {medecin.prenom_med}</TableCell>
                        <TableCell>{medecin.specialite_med}</TableCell>
                        <TableCell>
                          {user ? (
                            <Chip 
                              label={user.is_active ? 'Actif' : 'Inactif'} 
                              color={user.is_active ? 'success' : 'default'}
                              size="small"
                            />
                          ) : (
                            <Chip label="Pas de compte" size="small" color="warning" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {user && (
                            <>
                              <IconButton
                                color={user.is_active ? 'error' : 'success'}
                                onClick={() => handleToggleAccountStatus(user.id, user.is_active)}
                                title={user.is_active ? 'Désactiver' : 'Activer'}
                                size="small"
                              >
                                {user.is_active ? <LockIcon /> : <LockOpenIcon />}
                              </IconButton>
                              <IconButton
                                color="primary"
                                onClick={() => handleResetPassword(user)}
                                title="Réinitialiser mot de passe"
                                size="small"
                              >
                                <VpnKeyIcon />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteUser(user.id, user.role)}
                                title="Supprimer"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Panel 2: Réceptionnistes */}
          <TabPanel value={tabValue} index={2}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom complet</TableCell>
                    <TableCell>CIN</TableCell>
                    <TableCell>Téléphone</TableCell>
                    <TableCell>Statut compte</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmployes.filter(e => e.role === 'RECEPTIONNISTE').map((employe) => {
                    const user = users.find(u => u.cin === employe.cin_empl && u.role === 'RECEPTIONNISTE');
                    return (
                      <TableRow key={employe.id_employe}>
                        <TableCell>{employe.nom_empl} {employe.prenom_empl}</TableCell>
                        <TableCell>{employe.cin_empl}</TableCell>
                        <TableCell>{employe.telephone}</TableCell>
                        <TableCell>
                          {user ? (
                            <Chip 
                              label={user.is_active ? 'Actif' : 'Inactif'} 
                              color={user.is_active ? 'success' : 'default'}
                              size="small"
                            />
                          ) : (
                            <Chip label="Pas de compte" size="small" color="warning" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {user && (
                            <>
                              <IconButton
                                color={user.is_active ? 'error' : 'success'}
                                onClick={() => handleToggleAccountStatus(user.id, user.is_active)}
                                title={user.is_active ? 'Désactiver' : 'Activer'}
                                size="small"
                              >
                                {user.is_active ? <LockIcon /> : <LockOpenIcon />}
                              </IconButton>
                              <IconButton
                                color="primary"
                                onClick={() => handleResetPassword(user)}
                                title="Réinitialiser mot de passe"
                                size="small"
                              >
                                <VpnKeyIcon />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteUser(user.id, user.role)}
                                title="Supprimer"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Panel 3: Tous les comptes */}
          <TabPanel value={tabValue} index={3}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom d'utilisateur</TableCell>
                    <TableCell>Nom complet</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Rôle</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.filter(u => u.role !== 'PATIENT').map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.first_name} {user.last_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          size="small" 
                          color={user.role === 'ADMIN' ? 'error' : user.role === 'MEDECIN' ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.is_active ? 'Actif' : 'Inactif'} 
                          color={user.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {user.role !== 'ADMIN' && (
                          <>
                            <IconButton
                              color={user.is_active ? 'error' : 'success'}
                              onClick={() => handleToggleAccountStatus(user.id, user.is_active)}
                              title={user.is_active ? 'Désactiver' : 'Activer'}
                              size="small"
                            >
                              {user.is_active ? <LockIcon /> : <LockOpenIcon />}
                            </IconButton>
                            <IconButton
                              color="primary"
                              onClick={() => handleResetPassword(user)}
                              title="Réinitialiser mot de passe"
                              size="small"
                            >
                              <VpnKeyIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteUser(user.id, user.role)}
                              title="Supprimer"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Paper>
      </Container>

      {/* Dialog: Créer un compte */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Créer un nouveau compte</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prénom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CIN"
                value={formData.cin}
                onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Rôle</InputLabel>
                <Select
                  value={formData.role}
                  label="Rôle"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="MEDECIN">Médecin</MenuItem>
                  <MenuItem value="RECEPTIONNISTE">Réceptionniste</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.role === 'MEDECIN' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Spécialité"
                  value={formData.specialite}
                  onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                  placeholder="Ex: Cardiologie, Pédiatrie..."
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                Identifiants de connexion
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom d'utilisateur"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button size="small" onClick={generateUsername}>
                        Générer
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mot de passe"
                type={formData.showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setFormData({ ...formData, showPassword: !formData.showPassword })}
                        edge="end"
                      >
                        {formData.showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                      <Button size="small" onClick={generatePassword}>
                        Générer
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                Le compte sera créé en mode "en attente" et devra être validé pour être activé.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleCreateAccount} 
            variant="contained"
            disabled={!formData.nom || !formData.prenom || !formData.username || !formData.password || !formData.cin}
          >
            Créer le compte
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Identifiants générés */}
      <Dialog 
        open={openCredentialsDialog} 
        onClose={() => setOpenCredentialsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {generatedCredentials?.isReset ? 'Mot de passe réinitialisé' : 'Compte créé avec succès'}
        </DialogTitle>
        <DialogContent>
          {generatedCredentials && (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                {generatedCredentials.isReset 
                  ? `Le mot de passe de ${generatedCredentials.prenom} ${generatedCredentials.nom} a été réinitialisé.`
                  : `Compte créé pour ${generatedCredentials.prenom} ${generatedCredentials.nom} (${generatedCredentials.role})`
                }
              </Alert>

              <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Nom d'utilisateur:
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                    {generatedCredentials.username}
                  </Typography>
                  <Button 
                    size="small" 
                    onClick={() => copyToClipboard(generatedCredentials.username)}
                  >
                    Copier
                  </Button>
                </Box>
              </Paper>

              <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Mot de passe:
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                    {generatedCredentials.password}
                  </Typography>
                  <Button 
                    size="small" 
                    onClick={() => copyToClipboard(generatedCredentials.password)}
                  >
                    Copier
                  </Button>
                </Box>
              </Paper>

              <Alert severity="warning">
                <Typography variant="body2">
                  ⚠️ <strong>Important:</strong> Notez ces identifiants maintenant. 
                  Le mot de passe ne sera plus affiché.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  L'utilisateur devra changer son mot de passe lors de sa première connexion.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCredentialsDialog(false)} variant="contained">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default GestionPersonnel;