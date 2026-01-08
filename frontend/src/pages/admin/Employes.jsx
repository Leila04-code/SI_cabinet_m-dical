import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WorkIcon from '@mui/icons-material/Work';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const Employes = () => {
  const [employes, setEmployes] = useState([]);
  const [filteredEmployes, setFilteredEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmploye, setEditingEmploye] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    poste: '',
    telephone: '',
    email: '',
    adresse: '',
    date_embauche: '',
    salaire: ''
  });

  const postes = [
    'Réceptionniste',
    'Secrétaire Médicale',
    'Infirmier(ère)',
    'Assistant(e) Médical(e)',
    'Agent d\'Entretien',
    'Comptable',
    'Autre'
  ];

  useEffect(() => {
    fetchEmployes();
  }, []);

  useEffect(() => {
    filterEmployes();
  }, [searchTerm, employes]);

  const fetchEmployes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employes/');
      setEmployes(response.data);
      setFilteredEmployes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement employés:', error);
      setLoading(false);
    }
  };

  const filterEmployes = () => {
    if (!searchTerm.trim()) {
      setFilteredEmployes(employes);
      return;
    }
    const filtered = employes.filter(employe =>
      employe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employe.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employe.poste.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployes(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmploye) {
        await api.patch(`/employes/${editingEmploye.id}/`, formData);
      } else {
        await api.post('/employes/', formData);
      }
      fetchEmployes();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Erreur sauvegarde employé:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (employe) => {
    setEditingEmploye(employe);
    setFormData(employe);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await api.delete(`/employes/${id}/`);
        fetchEmployes();
      } catch (error) {
        console.error('Erreur suppression employé:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      poste: '',
      telephone: '',
      email: '',
      adresse: '',
      date_embauche: '',
      salaire: ''
    });
    setEditingEmploye(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <WorkIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
        </h1>
        <p className="text-gray-600 mt-2">Gérez le personnel administratif du cabinet</p>
      </div>

      {/* Barre d'actions */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <SearchIcon sx={{ fontSize: 20 }} />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou poste..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
          >
            <AddIcon sx={{ fontSize: 20 }} />
            Nouvel Employé
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-purple-600 text-sm font-medium">Total Employés</p>
          <p className="text-3xl font-bold text-purple-700">{employes.length}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-blue-600 text-sm font-medium">Postes</p>
          <p className="text-3xl font-bold text-blue-700">
            {new Set(employes.map(e => e.poste)).size}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-green-600 text-sm font-medium">Masse Salariale</p>
          <p className="text-3xl font-bold text-green-700">
            {employes.reduce((acc, e) => acc + (parseFloat(e.salaire) || 0), 0).toFixed(0)} DH
          </p>
        </div>
      </div>

      {/* Liste des employés */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poste
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Embauche
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salaire
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Aucun employé trouvé
                  </td>
                </tr>
              ) : (
                filteredEmployes.map((employe) => (
                  <tr key={employe.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold">
                            {employe.prenom[0]}{employe.nom[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employe.prenom} {employe.nom}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {employe.poste}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <PhoneIcon sx={{ fontSize: 16 }} />
                        {employe.telephone}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <EmailIcon sx={{ fontSize: 20 }} />
                        {employe.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employe.date_embauche ? new Date(employe.date_embauche).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      {employe.salaire ? `${employe.salaire} DH` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(employe)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Modifier"
                        >
                          <EditIcon sx={{ fontSize: 20 }} />
                        </button>
                        <button
                          onClick={() => handleDelete(employe.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <DeleteIcon sx={{ fontSize: 20 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajout/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingEmploye ? 'Modifier l\'Employé' : 'Nouvel Employé'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poste *
                    </label>
                    <select
                      name="poste"
                      value={formData.poste}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Sélectionner...</option>
                      {postes.map((poste) => (
                        <option key={poste} value={poste}>
                          {poste}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'Embauche
                    </label>
                    <input
                      type="date"
                      name="date_embauche"
                      value={formData.date_embauche}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salaire (DH)
                    </label>
                    <input
                      type="number"
                      name="salaire"
                      value={formData.salaire}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <textarea
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    {editingEmploye ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employes;