// src/pages/DashboardMedecin.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import authService from '../services/authService';

function DashboardMedecin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [rdvsAujourdhui, setRdvsAujourdhui] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    // Charger les RDV du jour
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* AppBar */}
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🏥 Cabinet Médical - Espace Médecin
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Dr {user?.last_name}
          </Typography>
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
          >
            <MenuItem onClick={() => navigate('/medecin/profile')}>
              Mon Profil
            </MenuItem>
            <MenuItem onClick={() => navigate('/medecin/horaires')}>
              Mes Horaires
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} /> Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container sx={{ mt: 4, mb: 4 }}>
        {/* Welcome */}
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Bonjour Dr {user?.last_name} !
          </Typography>
          <Typography variant="body1">
            Voici votre planning d'aujourd'hui
          </Typography>
        </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <CalendarTodayIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  12
                </Typography>
                <Typography variant="body2">
                  RDV aujourd'hui
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  156
                </Typography>
                <Typography variant="body2">
                  Patients suivis
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <AssignmentIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  45
                </Typography>
                <Typography variant="body2">
                  Consultations ce mois
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <CardContent>
                <BarChartIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  95%
                </Typography>
                <Typography variant="body2">
                  Taux de présence
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Planning du jour */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            📅 Planning d'aujourd'hui
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Heure</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>09:00</TableCell>
                  <TableCell>Hassan ALAMI</TableCell>
                  <TableCell>
                    <Chip label="Première consultation" color="primary" size="small" />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={() => navigate('/medecin/consultation/new')}
                    >
                      Commencer
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>09:30</TableCell>
                  <TableCell>Sara BENALI</TableCell>
                  <TableCell>
                    <Chip label="Suivi" color="success" size="small" />
                  </TableCell>
                  <TableCell>
                    <Button variant="contained" size="small">
                      Commencer
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>10:00</TableCell>
                  <TableCell colSpan={3} sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    Créneau libre
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Quick Actions */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => navigate('/medecin/horaires')}
            >
              Gérer mes horaires
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => navigate('/medecin/patients')}
            >
              Mes patients
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
            >
              Statistiques
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
            >
              Ordonnances
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default DashboardMedecin;