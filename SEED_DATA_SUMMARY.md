# Seed Data Summary

✅ **Database has been successfully seeded with sample data!**

## Login Credentials

```
Username: admin
Email: admin@crm.com
Password: admin123
```

## Seeded Data Overview

### Organization
- **Demo Company** (Technology Industry)
  - Email: info@democompany.com
  - Phone: +1-555-0100
  - Website: https://democompany.com

### Permissions & Roles
- **20 Permissions** created across 5 resources:
  - Resources: customers, leads, deals, employees, vendors
  - Actions: create, read, update, delete

- **2 Roles**:
  - **Admin**: Full access to all resources (20 permissions)
  - **Sales**: Access to customers, leads, and deals (12 permissions)

### Customers (5)
1. **CUST001** - John Smith (Individual)
   - Email: john.smith@example.com
   - Phone: +1-555-1001
   - Status: Active
   - Source: Website

2. **CUST002** - Jane Doe (Individual)
   - Email: jane.doe@example.com
   - Phone: +1-555-1002
   - Status: Active
   - Source: Referral

3. **CUST003** - Acme Corporation (Business)
   - Email: contact@acme.com
   - Phone: +1-555-1003
   - Status: VIP
   - Industry: Manufacturing
   - Website: https://acme.com
   - Contact Person: Robert Johnson

4. **CUST004** - TechStart Inc (Business)
   - Email: hello@techstart.io
   - Phone: +1-555-1004
   - Status: Active
   - Industry: Technology
   - Website: https://techstart.io
   - Contact Person: Sarah Williams

5. **CUST005** - Emily Chen (Individual)
   - Email: emily.chen@example.com
   - Phone: +1-555-1005
   - Status: Prospect
   - Source: Event

### Leads (5)
1. **LEAD001** - Alice Johnson
   - Company: Johnson Industries
   - Job Title: VP of Operations
   - Email: alice.j@company.com
   - Status: Qualified
   - Lead Score: 85
   - Estimated Value: $50,000
   - Source: Website

2. **LEAD002** - Bob Williams
   - Company: Startup Inc
   - Job Title: CTO
   - Email: bob@startup.io
   - Status: Contacted
   - Lead Score: 70
   - Estimated Value: $35,000
   - Source: Referral

3. **LEAD003** - Carol Martinez
   - Company: Business Group Ltd
   - Job Title: Director of Sales
   - Email: carol@bizgroup.com
   - Status: New
   - Lead Score: 60
   - Estimated Value: $25,000
   - Source: Social Media

4. **LEAD004** - David Lee
   - Company: Enterprise Solutions
   - Job Title: CEO
   - Email: dlee@enterprise.com
   - Status: Qualified
   - Lead Score: 95
   - Estimated Value: $150,000
   - Source: Event

5. **LEAD005** - Eva Thompson
   - Company: Thompson Consulting
   - Job Title: Managing Partner
   - Email: eva.t@consulting.com
   - Status: Contacted
   - Lead Score: 75
   - Estimated Value: $45,000
   - Source: Partner

### Pipeline
**Sales Pipeline** with 6 stages:

1. **Prospecting** (Order: 1, Probability: 10%)
   - Initial contact and research

2. **Qualification** (Order: 2, Probability: 25%)
   - Qualifying the opportunity

3. **Proposal** (Order: 3, Probability: 50%)
   - Proposal submitted

4. **Negotiation** (Order: 4, Probability: 75%)
   - Contract negotiation

5. **Closed Won** (Order: 5, Probability: 100%)
   - Deal won

6. **Closed Lost** (Order: 6, Probability: 0%)
   - Deal lost

### Deals (5)
1. **DEAL001** - Enterprise Software License
   - Description: Annual subscription for 100 users
   - Value: $125,000
   - Stage: Proposal (50%)
   - Customer: Acme Corporation
   - Priority: High
   - Expected Close: ~30 days from now
   - Expected Revenue: $62,500

2. **DEAL002** - Cloud Migration Services
   - Description: Complete cloud infrastructure migration
   - Value: $250,000
   - Stage: Negotiation (75%)
   - Customer: TechStart Inc
   - Priority: Urgent
   - Expected Close: ~45 days from now
   - Expected Revenue: $187,500

3. **DEAL003** - Consulting Package
   - Description: 6-month strategic consulting engagement
   - Value: $75,000
   - Stage: Qualification (25%)
   - Customer: John Smith
   - Priority: Medium
   - Expected Close: ~60 days from now
   - Expected Revenue: $18,750

4. **DEAL004** - Training Program
   - Description: Employee training and certification program
   - Value: $30,000
   - Stage: Prospecting (10%)
   - Customer: Jane Doe
   - Priority: Low
   - Expected Close: ~90 days from now
   - Expected Revenue: $3,000

5. **DEAL005** - Mobile App Development
   - Description: Custom mobile application for iOS and Android
   - Value: $150,000
   - Stage: Proposal (50%)
   - Customer: Emily Chen
   - Priority: High
   - Expected Close: ~75 days from now
   - Expected Revenue: $75,000

## API Endpoints

All data is accessible through the REST API:

### Authentication
```bash
POST /api/auth/login/
POST /api/auth/register/
POST /api/auth/logout/
GET  /api/users/me/
```

### Customers
```bash
GET    /api/customers/          # List all customers
POST   /api/customers/          # Create customer
GET    /api/customers/{id}/     # Get customer details
PUT    /api/customers/{id}/     # Update customer
DELETE /api/customers/{id}/     # Delete customer
```

### Leads
```bash
GET    /api/leads/              # List all leads
POST   /api/leads/              # Create lead
GET    /api/leads/{id}/         # Get lead details
PUT    /api/leads/{id}/         # Update lead
DELETE /api/leads/{id}/         # Delete lead
```

### Deals
```bash
GET    /api/deals/              # List all deals
POST   /api/deals/              # Create deal
GET    /api/deals/{id}/         # Get deal details
PUT    /api/deals/{id}/         # Update deal
DELETE /api/deals/{id}/         # Delete deal
```

### Pipelines
```bash
GET    /api/pipelines/          # List all pipelines
GET    /api/pipelines/{id}/     # Get pipeline details (includes stages)
```

### Organizations
```bash
GET    /api/organizations/      # List organizations
GET    /api/organizations/{id}/ # Get organization details
```

### Roles & Permissions
```bash
GET    /api/roles/              # List all roles
GET    /api/permissions/        # List all permissions
```

## Frontend Integration

To fetch data in your frontend:

### Example: Fetch Customers
```typescript
import { api } from '@/services/api';

// In your component or hook
const fetchCustomers = async () => {
  const response = await api.get('/customers/');
  console.log(response.data);
};
```

### Example: Fetch Deals with Pipeline Stages
```typescript
const fetchDeals = async () => {
  const response = await api.get('/deals/');
  console.log(response.data);
};
```

### Example: Login and Get User Profile
```typescript
// Login first
const login = async () => {
  const response = await api.post('/auth/login/', {
    username: 'admin',
    password: 'admin123'
  });
  // Tokens are automatically stored
};

// Get current user
const getCurrentUser = async () => {
  const response = await api.get('/users/me/');
  console.log(response.data);
};
```

## Dashboard Statistics

With this seed data, your dashboard will show:
- **5 Customers** (3 Active, 1 VIP, 1 Prospect)
- **5 Leads** (2 Qualified, 2 Contacted, 1 New)
- **5 Active Deals** worth $630,000 total
- **Expected Revenue**: $346,750 (weighted by probability)
- **Average Deal Size**: $126,000
- **Conversion Rate**: Can be calculated from Leads → Deals

## Re-seeding Database

To clear and re-seed the database:

```bash
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run seed command
python manage.py seed_data
```

The command will skip existing data to avoid duplicates. If you need to start fresh, you would need to delete the data first or drop and recreate the database.

## Next Steps

1. ✅ Backend seeded with data
2. ✅ Django server running on http://127.0.0.1:8000
3. 🔜 Test API endpoints from frontend
4. 🔜 Update frontend components to display real data
5. 🔜 Test authentication flow
6. 🔜 Verify all CRUD operations work

## Troubleshooting

If you encounter issues:

1. **Server not running**: 
   ```bash
   cd shared-backend
   python manage.py runserver
   ```

2. **Database errors**: Check migrations are applied
   ```bash
   python manage.py migrate
   ```

3. **Permission errors**: Make sure user is authenticated
   ```bash
   # Login first to get auth token
   POST /api/auth/login/
   ```

Enjoy your seeded CRM data! 🎉
