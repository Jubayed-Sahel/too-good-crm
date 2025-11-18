from crmApp.models import UserPresence, User

print("\n=== USER PRESENCE STATUS ===\n")
presences = UserPresence.objects.select_related('user').all()

for p in presences:
    print(f"User ID: {p.user.id}")
    print(f"Username: {p.user.username}")
    print(f"Name: {p.user.first_name} {p.user.last_name}")
    print(f"Status: {p.status}")
    print(f"Is Online: {p.is_online}")
    print(f"Is Available: {p.is_available}")
    print(f"Last Seen: {p.last_seen}")
    print(f"Available for Calls: {p.available_for_calls}")
    print("-" * 50)

print(f"\nTotal users with presence: {presences.count()}\n")
