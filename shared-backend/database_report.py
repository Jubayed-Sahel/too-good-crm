import os
import django
import sqlite3
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile, Organization, Issue, Order, Activity

# Database file info
db_path = Path(__file__).parent / 'db.sqlite3'
db_size = db_path.stat().st_size
db_size_mb = db_size / (1024 * 1024)

print("=" * 80)
print("DATABASE INFORMATION REPORT")
print("=" * 80)
print()

print("📁 DATABASE FILE:")
print(f"   Location: {db_path}")
print(f"   Size: {db_size:,} bytes ({db_size_mb:.2f} MB)")
print(f"   Exists: {db_path.exists()}")
print()

print("📊 STATISTICS:")
print(f"   Total Users: {User.objects.count()}")
print(f"   Total Organizations: {Organization.objects.count()}")
print(f"   Total User Profiles: {UserProfile.objects.count()}")
print(f"   Total Issues: {Issue.objects.count()}")
print(f"   Total Orders: {Order.objects.count()}")
print(f"   Total Activities: {Activity.objects.count()}")
print()

print("👥 USER BREAKDOWN:")
print("-" * 80)
for user in User.objects.all()[:10]:  # First 10 users
    profiles = user.user_profiles.all()
    profile_types = [p.profile_type for p in profiles]
    print(f"   {user.id}. {user.username} ({user.email})")
    print(f"      Profiles: {', '.join(profile_types) if profile_types else 'None'}")
    print(f"      Last login: {user.last_login_at or 'Never'}")
print()

print("🏢 ORGANIZATIONS:")
print("-" * 80)
for org in Organization.objects.all():
    user_count = org.user_organizations.count()
    print(f"   {org.id}. {org.name} (slug: {org.slug})")
    print(f"      Users: {user_count}, Active: {org.is_active}")
    if org.linear_team_id:
        print(f"      Linear Team ID: {org.linear_team_id}")
print()

print("👤 USER PROFILE TYPES:")
print("-" * 80)
profile_counts = {}
for profile in UserProfile.objects.all():
    profile_type = profile.profile_type
    profile_counts[profile_type] = profile_counts.get(profile_type, 0) + 1

for ptype, count in profile_counts.items():
    print(f"   {ptype}: {count}")
print()

print("🔍 USERS WITH MULTIPLE PROFILES (Can Switch Modes):")
print("-" * 80)
users_with_multiple = []
for user in User.objects.all():
    profiles = user.user_profiles.all()
    profile_types = set(p.profile_type for p in profiles)
    
    has_customer = 'customer' in profile_types
    has_vendor = 'vendor' in profile_types or 'employee' in profile_types
    
    if has_customer and has_vendor:
        users_with_multiple.append({
            'username': user.username,
            'email': user.email,
            'profiles': list(profile_types)
        })

if users_with_multiple:
    for u in users_with_multiple:
        print(f"   ✅ {u['username']} ({u['email']})")
        print(f"      Can toggle between: {', '.join(u['profiles'])}")
else:
    print("   ❌ No users found with both vendor and customer profiles")
    print("   (Users need both to see the mode toggle in mobile app)")
print()

print("🎫 ISSUES:")
print("-" * 80)
total_issues = Issue.objects.count()
client_issues = Issue.objects.filter(is_client_issue=True).count()
print(f"   Total Issues: {total_issues}")
print(f"   Client-Raised Issues: {client_issues}")
print(f"   Internal Issues: {total_issues - client_issues}")
if total_issues > 0:
    synced_to_linear = Issue.objects.filter(synced_to_linear=True).count()
    print(f"   Synced to Linear: {synced_to_linear}")
print()

print("🗄️ DATABASE TABLES:")
print("-" * 80)
# Connect directly to SQLite to get table names
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
tables = cursor.fetchall()
print(f"   Total tables: {len(tables)}")
for table in tables:
    cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
    count = cursor.fetchone()[0]
    print(f"   - {table[0]}: {count} rows")
conn.close()
print()

print("=" * 80)
print("END OF REPORT")
print("=" * 80)
