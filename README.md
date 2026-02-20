# Système d'Information pour la Gestion de Cabinet Médical

## À propos du projet

Solution informatique et moderne pour la gestion d'un cabinet médical pluridisciplinaire. Ce système automatise et centralise l'ensemble des opérations du cabinet, de la prise de rendez-vous à la facturation, en garantissant la sécurité et la confidentialité des données médicales sensibles.

## Contexte et Problématique

### Le Défi

La gestion traditionnelle des cabinets médicaux repose sur des méthodes manuelles présentant de nombreuses limitations :

- **Organisationnel** : Doubles réservations, rendez-vous manqués, conflits d'horaires
- **Médical** : Dossiers papier vulnérables, difficulté d'accès à l'historique médical, risques d'erreurs médicales
- **Administratif** : Facturation manuelle chronophage, difficultés de suivi des mutuelles, statistiques complexes à établir
- **Sécurité** : Données exposées aux risques de vol, incendie, perte irréversible

### La Solution

Système d'information centralisé permettant d'automatiser l'ensemble des processus, d'améliorer la qualité des soins et de garantir la sécurité des données médicales conformément aux normes en vigueur.

## Fonctionnalités Principales

### Gestion des Patients
- Enregistrement complet des patients (identité, CIN, assurance)
- Dossier médical électronique centralisé
- Historique complet des consultations
- Gestion des allergies, maladies chroniques et vaccinations
- Contrôle automatique d'unicité (CIN)

### Gestion des Rendez-vous
- Planification intelligente des agendas médicaux
- Prévention automatique des conflits d'horaires
- Visualisation en temps réel des disponibilités
- Optimisation du temps médical

### Gestion des Consultations
- Enregistrement des diagnostics et observations cliniques
- Saisie des commentaires médicaux
- Association automatique des actes médicaux réalisés
- Mise à jour automatique du dossier médical
- Traçabilité complète de chaque consultation

### Gestion des Ordonnances
- Génération automatique d'ordonnances
- Prescription de traitements médicamenteux
- Prescription d'analyses biologiques
- Prescription d'examens radiologiques
- Liaison automatique consultation-ordonnance

### Gestion de la Facturation
- Calcul automatique des montants (consultation + actes)
- Gestion des tarifs spécifiques par acte médical
- Génération de factures détaillées et reçus de paiement



## Architecture du Système

### Architecture Technique
```
┌─────────────────────────────────────────┐
│         Couche Présentation             │
│      (React + Material-UI)              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Couche Métier                   │
│   (Django REST Framework + JWT)         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Couche Données                  │
│           (MySQL 8.0)                   │
└─────────────────────────────────────────┘
```

### Modélisation
- **MCD** (Modèle Conceptuel de Données) : Entités et relations métier
- **MLD** (Modèle Logique de Données) : Structure de la base de données
- **MCT** (Modèle Conceptuel de Traitements) : Flux d'informations et traitements

## Technologies Utilisées

### Backend
- **Python** 3.12
- **Django** 6.0
- **Django REST Framework** - API REST
- **JWT** - Authentification sécurisée

### Frontend
- **React** 19.2.3
- **Material-UI** 7.3.6 - Composants graphiques
- **React Router** 7.10.1 - Navigation

### Base de données
- **MySQL** 8.0

### Outils de développement
- **Visual Studio Code** - IDE
- **Git & GitHub** - Versioning
- **Windows PowerShell** - Terminal

### Outils de conception
- **LucidSpark** - Brainstorming et idéation
- **LucidChart** - Diagrammes UML
- **Looping** - Modélisation MCD/MLD
- **MySQL Workbench** - Modélisation BDD
- **Crixet** - Gestion de projet Agile

## Acteurs du Système

| Acteur | Rôle | Responsabilités |
|--------|------|-----------------|
| **Patient** | Bénéficiaire | Prise de RDV, consultation dossier médical |
| **Médecin** | Praticien | Consultations, diagnostics, prescriptions |
| **Réceptionniste** | Personnel administratif | Gestion agenda, enregistrement patients, facturation |
| **Administrateur** | Superviseur | Gestion des accès, personnel, supervision globale |

## 🚀 Installation et Configuration

### Prérequis
```bash
- Python >= 3.12
- Node.js >= 14
- MySQL >= 8.0
- Git
```

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/Leila04-code/SI_cabinet_m-dical
```

2. **Configuration Backend (Django)**
```bash
# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt
```

3. **Configuration Base de données**
```bash
# Se connecter à MySQL
mysql -u root -p

# Créer la base de données
CREATE DATABASE cabinet_medical CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Importer le schéma
mysql -u root -p cabinet_medical < database/schema.sql
```

4. **Configuration de l'environnement**
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos paramètres
DB_NAME=cabinet_medical
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_HOST=localhost
DB_PORT=3306
SECRET_KEY=votre_cle_secrete
```

5. **Migrations Django**
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

6. **Installation Frontend (React)**
```bash
cd frontend
npm install
```

### Lancement de l'application

**Backend (Terminal 1)**
```bash
python manage.py runserver
# API disponible sur http://localhost:8000
```

**Frontend (Terminal 2)**
```bash
cd frontend
npm start
# Interface disponible sur http://localhost:3000
```


