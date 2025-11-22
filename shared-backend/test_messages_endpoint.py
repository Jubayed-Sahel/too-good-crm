import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Message, User
from crmApp.services.message_service import MessageService
from django.db import models

# Get user
user = User.objects.get(email='sahel@gmail.com')
print(f"User: {user.email} (ID: {user.id})")

# Get organization
from crmApp.utils.profile_context import get_active_profile_organization
org = get_active_profile_organization(user)
print(f"Organization: {org.name if org else 'None'} (ID: {org.id if org else None})")

# Check all messages
print(f"\n=== ALL MESSAGES ===")
all_messages = Message.objects.filter(
    models.Q(sender=user) | models.Q(recipient=user)
)
if org:
    all_messages = all_messages.filter(organization=org)

print(f"Total messages: {all_messages.count()}")

for msg in all_messages[:10]:
    print(f"  {msg.id}: {msg.sender.email} -> {msg.recipient.email}")
    print(f"     Content: {msg.content[:50]}")
    print(f"     Created: {msg.created_at}")
    print(f"     Org: {msg.organization.name if msg.organization else 'None'}")

# Test get_messages for a specific user
print(f"\n=== TESTING get_messages ===")
# Get another user to test with
other_users = User.objects.exclude(id=user.id)[:3]
for other_user in other_users:
    print(f"\nMessages with {other_user.email} (ID: {other_user.id}):")
    messages = MessageService.get_messages(user, other_user, org, limit=100)
    print(f"  Found: {len(messages)} messages")
    for msg in messages[:5]:
        print(f"    {msg.id}: {msg.content[:50]}")

