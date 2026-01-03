// src/components/Navbar.jsx - VERSION AVEC AUTHENTIFICATION
import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FolderIcon from '@mui/icons-material/Folder';
import MedicationIcon from '@mui/icons-material/Medication';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import authService from '../services/authService';

function Navbar() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Récupérer l'utilisateur connecté
  const user = authService.getCurrentUser();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      authService.logout();
      navigate('/login');
    }
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          🏥 Cabinet Médical
        </Typography>
        
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            color="inherit" 
            component={Link} 
            to="/admin/dashboard"
            startIcon={<HomeIcon />}
            size="small"
          >
            Dashboard
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/admin/patients"
            startIcon={<PeopleIcon />}
            size="small"
          >
            Patients
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/admin/medecins"
            startIcon={<LocalHospitalIcon />}
            size="small"
          >
            Médecins
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/admin/rdv"
            startIcon={<EventIcon />}
            size="small"
          >
            RDV
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/admin/consultations"
            startIcon={<AssignmentIcon />}
            size="small"
          >
            Consultations
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/admin/factures"
            startIcon={<ReceiptIcon />}
            size="small"
          >
            Factures
          </Button>
     
          <Button 
            color="inherit" 
            component={Link} 
            to="/admin/dossiers"
            startIcon={<FolderIcon />}
            size="small"
          >
            Dossiers
          </Button>

          <Button 
            color="inherit" 
            component={Link} 
            to="/admin/employes"
            startIcon={<PeopleIcon />}
            size="small"
          >
            Employés
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/admin/actes"
            startIcon={<MedicalServicesIcon />}
            size="small"
          >
            Actes
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/admin/ordonnances"
            startIcon={<MedicationIcon />}
            size="small"
          >
            Ordonnances
          </Button>
        </Box>

        {/* Section Utilisateur */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ textAlign: 'right', mr: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.9 }}>
              {user?.role === 'ADMIN' ? 'Administrateur' : 
               user?.role === 'RECEPTIONNISTE' ? 'Réceptionniste' : user?.role}
            </Typography>
          </Box>
          
          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircleIcon />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="subtitle2">
                  {user?.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { handleClose(); navigate('/admin/profile'); }}>
              <PersonIcon sx={{ mr: 1 }} fontSize="small" />
              Mon Profil
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { handleClose(); handleLogout(); }}>
              <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
              Déconnexion
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;