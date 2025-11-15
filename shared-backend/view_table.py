import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile, Organization, Issue, Customer, Deal, Lead
from django.db import connection

def print_table(title, headers, rows, max_width=120):
    """Print data in a nice tabular format"""
    print("\n" + "=" * max_width)
    print(f"  {title}")
    print("=" * max_width)
    
    if not rows:
        print("  (No data)")
        return
    
    # Calculate column widths
    col_widths = []
    for i, header in enumerate(headers):
        max_len = len(str(header))
        for row in rows:
            if i < len(row):
                max_len = max(max_len, len(str(row[i])))
        col_widths.append(min(max_len + 2, 40))  # Max 40 chars per column
    
    # Print header
    header_line = " | ".join(str(h).ljust(w) for h, w in zip(headers, col_widths))
    print(f"  {header_line}")
    print("  " + "-" * len(header_line))
    
    # Print rows
    for row in rows[:20]:  # Limit to 20 rows
        row_str = " | ".join(str(val)[:w].ljust(w) for val, w in zip(row, col_widths))
        print(f"  {row_str}")
    
    if len(rows) > 20:
        print(f"  ... and {len(rows) - 20} more rows")
    
    print(f"\n  Total rows: {len(rows)}")

# Show which table to display
if len(sys.argv) > 1:
    table = sys.argv[1].lower()
else:
    print("\n" + "=" * 80)
    print("  AVAILABLE TABLES")
    print("=" * 80)
    print("\n  Usage: python view_table.py [table_name]\n")
    print("  Available tables:")
    print("    - users")
    print("    - profiles")
    print("    - organizations")
    print("    - issues")
    print("    - customers")
    print("    - deals")
    print("    - leads")
    print("    - all (shows summary of all tables)")
    print()
    sys.exit(0)

if table == 'users':
    users = User.objects.all().values_list(
        'id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'last_login_at'
    )
    print_table(
        "USERS TABLE",
        ['ID', 'Username', 'Email', 'First Name', 'Last Name', 'Active', 'Last Login'],
        list(users)
    )

elif table == 'profiles':
    profiles = UserProfile.objects.select_related('user', 'organization').all()
    data = [
        (p.id, p.user.username, p.profile_type, p.organization.name, 
         p.is_primary, p.status, p.role)
        for p in profiles
    ]
    print_table(
        "USER PROFILES TABLE",
        ['ID', 'User', 'Type', 'Organization', 'Primary', 'Status', 'Role'],
        data
    )

elif table == 'organizations':
    orgs = Organization.objects.all().values_list(
        'id', 'name', 'slug', 'email', 'phone', 'is_active', 'linear_team_id'
    )
    print_table(
        "ORGANIZATIONS TABLE",
        ['ID', 'Name', 'Slug', 'Email', 'Phone', 'Active', 'Linear Team'],
        list(orgs)
    )

elif table == 'issues':
    issues = Issue.objects.select_related('organization').all()
    data = [
        (i.id, i.issue_number, i.title[:40], i.priority, i.status, 
         i.organization.name, i.synced_to_linear, i.is_client_issue)
        for i in issues
    ]
    print_table(
        "ISSUES TABLE",
        ['ID', 'Number', 'Title', 'Priority', 'Status', 'Org', 'Linear?', 'Client?'],
        data
    )

elif table == 'customers':
    customers = Customer.objects.select_related('organization').all()
    data = [
        (c.id, c.name, c.email, c.phone, c.company, 
         c.organization.name, c.status)
        for c in customers
    ]
    print_table(
        "CUSTOMERS TABLE",
        ['ID', 'Name', 'Email', 'Phone', 'Company', 'Organization', 'Status'],
        data
    )

elif table == 'deals':
    deals = Deal.objects.select_related('organization', 'customer').all()
    data = [
        (d.id, d.title[:40], d.amount, d.stage, d.probability,
         d.customer.name if d.customer else 'N/A', d.organization.name)
        for d in deals
    ]
    print_table(
        "DEALS TABLE",
        ['ID', 'Title', 'Amount', 'Stage', 'Probability', 'Customer', 'Organization'],
        data
    )

elif table == 'leads':
    leads = Lead.objects.select_related('organization').all()
    data = [
        (l.id, l.first_name, l.last_name, l.email, l.phone,
         l.company, l.status, l.organization.name)
        for l in leads
    ]
    print_table(
        "LEADS TABLE",
        ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Status', 'Organization'],
        data
    )

elif table == 'all':
    # Show summary of all tables
    print("\n" + "=" * 80)
    print("  DATABASE SUMMARY - ALL TABLES")
    print("=" * 80)
    
    cursor = connection.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
    tables = cursor.fetchall()
    
    data = []
    for table_name in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table_name[0]}")
        count = cursor.fetchone()[0]
        data.append((table_name[0], count))
    
    print_table(
        "ALL TABLES",
        ['Table Name', 'Row Count'],
        data
    )

else:
    print(f"\n❌ Unknown table: {table}")
    print("Run without arguments to see available tables.")
