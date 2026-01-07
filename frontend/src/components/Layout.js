// src/components/Layout.js
import React, { useState } from 'react';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  PersonAdd,
  CalendarToday,
  MedicalServices,
  Receipt,
  Folder,
  Description,
  Healing,
  Vaccines,
  Warning,
  Work,
  AccessTime,
  LocalHospital,
  Logout,
  ExpandLess,
  ExpandMore,
  EventAvailable,
  PeopleAlt,
  AccountCircle,
  Close,
  Notifications,
  Search
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [receptionOpen, setReceptionOpen] = useState(true);
  
  const user = authService.getCurrentUser();
  const isReceptionniste = user?.role === 'RECEPTIONNISTE';
  const isAdmin = user?.role === 'ADMIN'; // ✅ AJOUTÉ

  const isActive = (path) => {
    return location.pathname === path;
  };

  const receptionMenuItems = [
    { text: 'Réception', icon: <Dashboard />, path: '/admin/reception' },
    { text: 'Accueillir Patient', icon: <PersonAdd />, path: '/admin/accueil-patient' },
    { text: "Salle d'Attente", icon: <EventAvailable />, path: '/admin/salle-attente' },
    { text: 'Calendrier RDV', icon: <CalendarToday />, path: '/admin/rdv' },
    { text: 'Factures', icon: <Receipt />, path: '/admin/factures', divider: true }
  ];

  const adminMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Gestion Personnel', icon: <PeopleAlt />, path: '/admin/personnel' }, // ✅ AJOUTÉ
    { text: 'Patients', icon: <People />, path: '/admin/patients' },
    { text: 'Médecins', icon: <LocalHospital />, path: '/admin/medecins' },
    { text: 'Employés', icon: <Work />, path: '/admin/employes' },
    { text: 'Jours de Travail', icon: <AccessTime />, path: '/admin/jours-travail' },
    
  ];

  const menuItems = isReceptionniste ? [] : adminMenuItems;

  const handleLogout = () => {
    authService.logout();
    navigate('/login/personnel');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:shadow-xl
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header Sidebar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
              <LocalHospital className="text-white" style={{ fontSize: 30 }} />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Cabinet</h1>
              <p className="text-blue-100 text-sm">Médical Pro</p>
            </div>
          </div>
          <button 
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <Close />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 overflow-y-auto h-[calc(100vh-100px)] scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
          {/* Section Réception - ✅ SEULEMENT POUR RÉCEPTIONNISTE */}
          {isReceptionniste && (
            <div className="mb-2">
              <button
                onClick={() => setReceptionOpen(!receptionOpen)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <PeopleAlt className="text-blue-600" />
                  <span className="font-semibold text-gray-700">Réception</span>
                </div>
                {receptionOpen ? <ExpandLess className="text-gray-400" /> : <ExpandMore className="text-gray-400" />}
              </button>
              
              {receptionOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {receptionMenuItems.map((item) => (
                    <React.Fragment key={item.text}>
                      <button
                        onClick={() => navigate(item.path)}
                        className={`
                          w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200
                          ${isActive(item.path) 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]' 
                            : 'hover:bg-blue-50 text-gray-600 hover:text-blue-600'
                          }
                        `}
                      >
                        <span>{item.icon}</span>
                        <span className="font-medium text-sm">{item.text}</span>
                      </button>
                      {item.divider && <div className="h-px bg-gray-200 my-3 mx-2" />}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          )}

          {!isReceptionniste && <div className="h-px bg-gray-200 my-4" />}

          {/* Menu Admin - ✅ SEULEMENT POUR ADMIN */}
          {isAdmin && (
            <div className="space-y-1">
              {menuItems.map((item) => (
                <React.Fragment key={item.text}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`
                      w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200
                      ${isActive(item.path) 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]' 
                        : 'hover:bg-blue-50 text-gray-600 hover:text-blue-600'
                      }
                    `}
                  >
                    <span>{item.icon}</span>
                    <span className="font-medium text-sm">{item.text}</span>
                  </button>
                  {item.divider && <div className="h-px bg-gray-200 my-3 mx-2" />}
                </React.Fragment>
              ))}
            </div>
          )}
        </nav>
      </aside>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md z-30 sticky top-0">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setMobileOpen(true)}
                className="lg:hidden text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <MenuIcon />
              </button>
              
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {isReceptionniste ? 'Réception' : 'Administration'}
                </h2>
                <p className="text-sm text-gray-500">Bienvenue dans votre espace</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-96">
              <Search className="text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="bg-transparent outline-none w-full text-gray-700"
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              <button className="relative hover:bg-gray-100 p-2 rounded-full transition-colors">
                <Notifications className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>

              <div className="relative">
                <button 
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-3 hover:bg-gray-100 p-2 pr-4 rounded-full transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <AccountCircle className="text-white" />
                  </div>
                  <span className="hidden md:block font-medium text-gray-700">{user?.first_name || 'Utilisateur'}</span>
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl py-2 z-50">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <Logout fontSize="small" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #93c5fd;
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #60a5fa;
        }
      `}</style>
    </div>
  );
}

export default Layout;