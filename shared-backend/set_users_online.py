import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import UserPresence, User

# Set all users online for testing
users = User.objects.all()
for user in users:
    presence, created = UserPresence.objects.get_or_create(
        user=user,
        defaults={'status': 'online', 'available_for_calls': True}
    )
    if not created:
        presence.status = 'online'
        presence.available_for_calls = True
        presence.save()
    print(f'✓ {user.username} (ID: {user.id}) - online, available for calls')

print(f'\n✅ Set {users.count()} users online')
