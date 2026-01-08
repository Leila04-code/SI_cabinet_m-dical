import os
import django
import sys

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cabinet_medical.settings')
sys.path.insert(0, os.path.dirname(__file__))

# Initialiser Django
django.setup()

# Importer le modèle User
from core.models import User

try:
    # Vérifier si l'admin existe
    if User.objects.filter(username='admin').exists():
        print('⚠️  Un admin "admin" existe déjà!')
        admin = User.objects.get(username='admin')
        print(f'✅ Username: {admin.username}')
        print(f'✅ Role: {admin.role}')
        print(f'✅ Active: {admin.is_active}')
    else:
        # Créer l'admin
        admin = User.objects.create_user(
            username='admin',
            email='admin@cabinet.com',
            password='admin123',
            first_name='Admin',
            last_name='Système',
            role='ADMIN',
            is_staff=True,
            is_superuser=True,
            is_active=True
        )
        print('✅ Admin créé avec succès!')
        print(f'   Username: {admin.username}')
        print(f'   Password: admin123')
        print(f'   Email: {admin.email}')
        print(f'   Role: {admin.role}')
except Exception as e:
    print(f'❌ Erreur: {e}')
    import traceback
    traceback.print_exc()