import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import JitsiCallSession

calls = JitsiCallSession.objects.all()
print(f'Total calls: {calls.count()}')
for c in calls[:5]:
    recipient = c.recipient.username if c.recipient else "group"
    print(f'Call {c.id}: {c.initiator.username} -> {recipient}, status={c.status}')

# Delete old calls for clean testing
old_calls = JitsiCallSession.objects.filter(status__in=['completed', 'rejected', 'cancelled'])
if old_calls.exists():
    count = old_calls.count()
    old_calls.delete()
    print(f'\nDeleted {count} old call(s)')
