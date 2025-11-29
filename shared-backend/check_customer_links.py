import sqlite3
import sys

# Connect to database
db_path = "db.sqlite3"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("=" * 60)
print("CUSTOMER LINKING DIAGNOSTIC")
print("=" * 60)

# Check customer
customer_email = "customer@1.com"
print(f"\n1. Looking for customer: {customer_email}")
cursor.execute("SELECT id, email, name, organization_id FROM customers WHERE email = ?", (customer_email,))
customer = cursor.fetchone()

if customer:
    customer_id, email, name, org_id = customer
    print(f"   ✓ Found: ID={customer_id}, Name={name}, Primary Org={org_id}")
    
    # Check CustomerOrganization links
    print(f"\n2. Checking CustomerOrganization links for customer {customer_id}:")
    cursor.execute("""
        SELECT co.id, co.organization_id, o.name, co.relationship_status
        FROM customer_organizations co
        JOIN organizations o ON co.organization_id = o.id
        WHERE co.customer_id = ?
    """, (customer_id,))
    
    links = cursor.fetchall()
    if links:
        print(f"   ✓ Found {len(links)} organization link(s):")
        for link_id, org_id, org_name, status in links:
            print(f"     - Org ID: {org_id}, Name: {org_name}, Status: {status}")
    else:
        print(f"   ✗ No CustomerOrganization links found!")
        print(f"   This customer is NOT visible to any vendors via M2M relationship.")
    
    # Check which vendors can see this customer
    print(f"\n3. Organizations that should see this customer:")
    if org_id:
        cursor.execute("SELECT id, name FROM organizations WHERE id = ?", (org_id,))
        primary_org = cursor.fetchone()
        if primary_org:
            print(f"   - Primary Org (ID={primary_org[0]}): {primary_org[1]}")
    
    for link_id, org_id_link, org_name, status in links:
        print(f"   - M2M Link (ID={org_id_link}): {org_name} ({status})")
else:
    print(f"   ✗ Customer not found!")

# List all organizations for reference
print(f"\n4. All organizations in database:")
cursor.execute("SELECT id, name FROM organizations ORDER BY id")
orgs = cursor.fetchall()
for org_id, org_name in orgs:
    print(f"   - ID: {org_id}, Name: {org_name}")

conn.close()
print("\n" + "=" * 60)

