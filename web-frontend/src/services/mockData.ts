/**
 * Mock data for development (replaces backend API calls)
 * This makes the app feel dynamic without needing a real database
 */

import type { Customer } from '@/types';

// Extended mock customers with full details for customer detail page
export const mockCustomers: any[] = [
  {
    id: 1,
    full_name: 'John Doe',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@acme.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation',
    job_title: 'CEO',
    status: 'active',
    assigned_to: 1,
    website: 'https://acme.com',
    address: '123 Business Ave, Suite 100',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'USA',
    industry: 'Technology',
    source: 'Website',
    tags: [
      { id: 1, name: 'enterprise', color: 'purple' },
      { id: 2, name: 'high-value', color: 'green' },
      { id: 3, name: 'vip', color: 'gold' }
    ],
    notes: 'Key decision maker for large contracts. Prefers email communication.',
    total_value: 125000,
    lifetime_value: 450000,
    last_contact: '2024-10-28T14:30:00Z',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-10-28T14:30:00Z',
  },
  {
    id: 2,
    full_name: 'Jane Smith',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@techstart.io',
    phone: '+1 (555) 234-5678',
    company: 'TechStart Inc',
    job_title: 'CTO',
    status: 'active',
    assigned_to: 2,
    website: 'https://techstart.io',
    address: '456 Innovation Drive',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94102',
    country: 'USA',
    industry: 'Software',
    source: 'Referral',
    tags: [
      { id: 4, name: 'startup', color: 'blue' },
      { id: 5, name: 'tech', color: 'cyan' },
      { id: 6, name: 'growing', color: 'green' }
    ],
    notes: 'Interested in scalable solutions. Fast decision-making process.',
    total_value: 78000,
    lifetime_value: 78000,
    last_contact: '2024-10-30T09:15:00Z',
    created_at: '2024-01-14T09:30:00Z',
    updated_at: '2024-10-30T09:15:00Z',
  },
  {
    id: 3,
    full_name: 'Mike Johnson',
    first_name: 'Mike',
    last_name: 'Johnson',
    email: 'mike.j@globalsolutions.com',
    phone: '+1 (555) 345-6789',
    company: 'Global Solutions Ltd',
    job_title: 'VP Sales',
    status: 'inactive',
    assigned_to: 1,
    website: 'https://globalsolutions.com',
    address: '789 Commerce Blvd',
    city: 'Chicago',
    state: 'IL',
    postal_code: '60601',
    country: 'USA',
    industry: 'Consulting',
    source: 'Cold Outreach',
    tags: [
      { id: 7, name: 'needs-followup', color: 'orange' },
      { id: 8, name: 'potential', color: 'yellow' }
    ],
    notes: 'Has not responded to last 3 emails. Consider alternative contact.',
    total_value: 0,
    lifetime_value: 25000,
    last_contact: '2024-08-15T11:20:00Z',
    created_at: '2024-01-10T08:15:00Z',
    updated_at: '2024-08-15T11:20:00Z',
  },
  {
    id: 4,
    full_name: 'Sarah Williams',
    first_name: 'Sarah',
    last_name: 'Williams',
    email: 'sarah@innovationlabs.com',
    phone: '+1 (555) 456-7890',
    company: 'Innovation Labs',
    job_title: 'Founder',
    status: 'pending',
    assigned_to: 3,
    website: 'https://innovationlabs.com',
    address: '321 Startup Street',
    city: 'Austin',
    state: 'TX',
    postal_code: '78701',
    country: 'USA',
    industry: 'AI/ML',
    source: 'Conference',
    tags: [
      { id: 9, name: 'hot-lead', color: 'red' },
      { id: 10, name: 'ai', color: 'purple' },
      { id: 11, name: 'innovative', color: 'pink' }
    ],
    notes: 'Met at TechCrunch Disrupt. Very interested in AI integration features.',
    total_value: 45000,
    lifetime_value: 45000,
    last_contact: '2024-10-25T16:45:00Z',
    created_at: '2024-01-18T11:45:00Z',
    updated_at: '2024-10-25T16:45:00Z',
  },
  {
    id: 5,
    full_name: 'David Brown',
    first_name: 'David',
    last_name: 'Brown',
    email: 'david.b@digitaldynamics.net',
    phone: '+1 (555) 567-8901',
    company: 'Digital Dynamics',
    job_title: 'Director',
    status: 'active',
    assigned_to: 2,
    website: 'https://digitaldynamics.net',
    address: '654 Digital Plaza',
    city: 'Seattle',
    state: 'WA',
    postal_code: '98101',
    country: 'USA',
    industry: 'Marketing',
    source: 'LinkedIn',
    tags: [
      { id: 12, name: 'digital-marketing', color: 'teal' },
      { id: 13, name: 'recurring', color: 'green' }
    ],
    notes: 'Monthly recurring client. Always pays on time. Great relationship.',
    total_value: 95000,
    lifetime_value: 285000,
    last_contact: '2024-11-01T10:00:00Z',
    created_at: '2024-01-12T13:20:00Z',
    updated_at: '2024-11-01T10:00:00Z',
  },
  {
    id: 6,
    full_name: 'Emily Davis',
    first_name: 'Emily',
    last_name: 'Davis',
    email: 'emily.davis@cloudventures.io',
    phone: '+1 (555) 678-9012',
    company: 'Cloud Ventures',
    job_title: 'Product Manager',
    status: 'active',
    assigned_to: 1,
    website: 'https://cloudventures.io',
    address: '987 Cloud Tower',
    city: 'Boston',
    state: 'MA',
    postal_code: '02101',
    country: 'USA',
    industry: 'Cloud Services',
    source: 'Partner Referral',
    tags: [
      { id: 14, name: 'cloud', color: 'blue' },
      { id: 15, name: 'saas', color: 'cyan' },
      { id: 16, name: 'partnership', color: 'purple' }
    ],
    notes: 'Looking for white-label solutions. Potential partnership opportunity.',
    total_value: 150000,
    lifetime_value: 150000,
    last_contact: '2024-10-29T13:30:00Z',
    created_at: '2024-02-05T14:00:00Z',
    updated_at: '2024-10-29T13:30:00Z',
  },
  {
    id: 7,
    full_name: 'Robert Martinez',
    first_name: 'Robert',
    last_name: 'Martinez',
    email: 'r.martinez@retailpro.com',
    phone: '+1 (555) 789-0123',
    company: 'RetailPro Systems',
    job_title: 'Operations Manager',
    status: 'active',
    assigned_to: 3,
    website: 'https://retailpro.com',
    address: '147 Retail Road',
    city: 'Miami',
    state: 'FL',
    postal_code: '33101',
    country: 'USA',
    industry: 'Retail',
    source: 'Trade Show',
    tags: [
      { id: 17, name: 'retail', color: 'orange' },
      { id: 18, name: 'multi-location', color: 'blue' },
      { id: 19, name: 'expansion', color: 'green' }
    ],
    notes: 'Expanding to 10 new locations. Needs scalable solution by Q2 2025.',
    total_value: 210000,
    lifetime_value: 210000,
    last_contact: '2024-10-27T11:00:00Z',
    created_at: '2024-02-20T09:00:00Z',
    updated_at: '2024-10-27T11:00:00Z',
  },
  {
    id: 8,
    full_name: 'Lisa Anderson',
    first_name: 'Lisa',
    last_name: 'Anderson',
    email: 'lisa.a@healthtech.org',
    phone: '+1 (555) 890-1234',
    company: 'HealthTech Solutions',
    job_title: 'Director of IT',
    status: 'pending',
    assigned_to: 2,
    website: 'https://healthtech.org',
    address: '258 Medical Center Dr',
    city: 'Philadelphia',
    state: 'PA',
    postal_code: '19101',
    country: 'USA',
    industry: 'Healthcare',
    source: 'Website',
    tags: [
      { id: 20, name: 'healthcare', color: 'red' },
      { id: 21, name: 'compliance', color: 'gray' },
      { id: 22, name: 'hipaa', color: 'red' }
    ],
    notes: 'Requires HIPAA-compliant solution. Waiting for security audit results.',
    total_value: 0,
    lifetime_value: 0,
    last_contact: '2024-10-24T15:20:00Z',
    created_at: '2024-03-10T10:30:00Z',
    updated_at: '2024-10-24T15:20:00Z',
  },
];

// Mock activity data for customer detail page
export const mockActivities = {
  1: [
    {
      id: 1,
      type: 'email',
      title: 'Sent proposal for Q4 expansion',
      date: '2024-10-28T14:30:00Z',
      description: 'Sent detailed proposal including pricing for 5 new locations',
    },
    {
      id: 2,
      type: 'call',
      title: 'Phone call - Budget discussion',
      date: '2024-10-25T10:15:00Z',
      description: 'Discussed budget allocation for next fiscal year',
    },
    {
      id: 3,
      type: 'meeting',
      title: 'Onsite demo at headquarters',
      date: '2024-10-20T13:00:00Z',
      description: 'Successfully demonstrated new features to C-suite executives',
    },
    {
      id: 4,
      type: 'deal',
      title: 'Deal closed - Enterprise package',
      date: '2024-10-15T16:45:00Z',
      description: 'Signed contract for $125,000 enterprise package',
    },
  ],
  2: [
    {
      id: 5,
      type: 'email',
      title: 'Follow-up on integration questions',
      date: '2024-10-30T09:15:00Z',
      description: 'Answered technical questions about API integration',
    },
    {
      id: 6,
      type: 'meeting',
      title: 'Technical planning session',
      date: '2024-10-22T14:00:00Z',
      description: 'Reviewed implementation timeline with tech team',
    },
  ],
  3: [
    {
      id: 7,
      type: 'email',
      title: 'Attempted re-engagement',
      date: '2024-08-15T11:20:00Z',
      description: 'Sent third follow-up email - no response',
    },
  ],
  4: [
    {
      id: 8,
      type: 'meeting',
      title: 'Discovery call completed',
      date: '2024-10-25T16:45:00Z',
      description: 'Great conversation about AI integration needs',
    },
    {
      id: 9,
      type: 'email',
      title: 'Sent AI feature documentation',
      date: '2024-10-26T10:00:00Z',
      description: 'Shared technical specs for AI/ML capabilities',
    },
  ],
  5: [
    {
      id: 10,
      type: 'call',
      title: 'Monthly check-in call',
      date: '2024-11-01T10:00:00Z',
      description: 'Regular monthly review - all systems running smoothly',
    },
    {
      id: 11,
      type: 'email',
      title: 'Invoice sent for October',
      date: '2024-11-01T09:00:00Z',
      description: 'Monthly recurring invoice sent - $9,500',
    },
  ],
  6: [
    {
      id: 12,
      type: 'meeting',
      title: 'Partnership discussion',
      date: '2024-10-29T13:30:00Z',
      description: 'Explored white-label partnership opportunities',
    },
  ],
  7: [
    {
      id: 13,
      type: 'email',
      title: 'Expansion proposal sent',
      date: '2024-10-27T11:00:00Z',
      description: 'Sent proposal for 10-location rollout plan',
    },
  ],
  8: [
    {
      id: 14,
      type: 'email',
      title: 'Security audit documentation',
      date: '2024-10-24T15:20:00Z',
      description: 'Sent HIPAA compliance and security audit documentation',
    },
  ],
};

// Mock notes for customers
export const mockNotes = {
  1: [
    { id: 1, content: 'Very responsive to emails. Best to reach between 9-11 AM EST.', date: '2024-10-28T14:30:00Z', author: 'Sales Team' },
    { id: 2, content: 'Mentioned potential for additional 3 locations in 2025.', date: '2024-10-25T10:15:00Z', author: 'Account Manager' },
  ],
  2: [
    { id: 3, content: 'Tech-savvy team. Prefers detailed technical documentation.', date: '2024-10-30T09:15:00Z', author: 'Solutions Engineer' },
  ],
  3: [
    { id: 4, content: 'Mark as low priority. No engagement in 2+ months.', date: '2024-08-15T11:20:00Z', author: 'Sales Rep' },
  ],
  4: [
    { id: 5, content: 'Very excited about AI features. This could be a big deal!', date: '2024-10-25T16:45:00Z', author: 'Sales Manager' },
  ],
  5: [
    { id: 6, content: 'Perfect client. Always pays on time, great communication.', date: '2024-11-01T10:00:00Z', author: 'Account Manager' },
  ],
  6: [
    { id: 7, content: 'Partnership could lead to 50+ new customers through their network.', date: '2024-10-29T13:30:00Z', author: 'VP Sales' },
  ],
  7: [
    { id: 8, content: 'Urgent: Need to finalize by end of Q4 for their Q1 2025 launch.', date: '2024-10-27T11:00:00Z', author: 'Sales Team' },
  ],
  8: [
    { id: 9, content: 'Compliance is critical. Must pass security review before proceeding.', date: '2024-10-24T15:20:00Z', author: 'Solutions Engineer' },
  ],
};

// Helper function to get customer by ID
export const getCustomerById = (id: number): Customer | undefined => {
  return mockCustomers.find(customer => customer.id === id);
};

// Helper function to get activities for a customer
export const getCustomerActivities = (customerId: number) => {
  return mockActivities[customerId as keyof typeof mockActivities] || [];
};

// Helper function to get notes for a customer
export const getCustomerNotes = (customerId: number) => {
  return mockNotes[customerId as keyof typeof mockNotes] || [];
};

// Mock Sales Pipeline Data
export const mockPipelineDeals: any[] = [
  // Lead Stage
  {
    id: 1,
    title: 'Enterprise Software License',
    customer: 'Acme Corporation',
    customerId: 1,
    value: 125000,
    stage: 'lead',
    probability: 20,
    expectedCloseDate: '2025-01-15',
    owner: 'Sales Team',
    description: 'Potential enterprise software deal for 50+ users',
    created_at: '2024-10-15T10:00:00Z',
    lastActivity: '2024-11-01T14:30:00Z',
  },
  {
    id: 2,
    title: 'Cloud Migration Services',
    customer: 'Global Solutions Ltd',
    customerId: 3,
    value: 85000,
    stage: 'lead',
    probability: 15,
    expectedCloseDate: '2025-02-01',
    owner: 'Sales Team',
    description: 'Cloud infrastructure migration project',
    created_at: '2024-10-20T09:00:00Z',
    lastActivity: '2024-10-28T16:00:00Z',
  },
  {
    id: 3,
    title: 'Marketing Automation Platform',
    customer: 'Digital Dynamics',
    customerId: 5,
    value: 45000,
    stage: 'lead',
    probability: 25,
    expectedCloseDate: '2024-12-20',
    owner: 'Account Manager',
    description: 'Full marketing automation suite implementation',
    created_at: '2024-10-25T11:00:00Z',
    lastActivity: '2024-11-01T10:00:00Z',
  },
  
  // Qualified Stage
  {
    id: 4,
    title: 'AI Integration Package',
    customer: 'Innovation Labs',
    customerId: 4,
    value: 95000,
    stage: 'qualified',
    probability: 40,
    expectedCloseDate: '2024-12-15',
    owner: 'Solutions Engineer',
    description: 'Custom AI/ML integration for product suite',
    created_at: '2024-09-10T14:00:00Z',
    lastActivity: '2024-10-30T13:45:00Z',
  },
  {
    id: 5,
    title: 'SaaS Subscription - Annual',
    customer: 'TechStart Inc',
    customerId: 2,
    value: 78000,
    stage: 'qualified',
    probability: 50,
    expectedCloseDate: '2024-12-10',
    owner: 'Account Manager',
    description: 'Annual SaaS subscription with premium features',
    created_at: '2024-09-15T10:30:00Z',
    lastActivity: '2024-10-29T09:15:00Z',
  },
  {
    id: 6,
    title: 'E-commerce Platform Setup',
    customer: 'RetailPro Systems',
    customerId: 7,
    value: 120000,
    stage: 'qualified',
    probability: 45,
    expectedCloseDate: '2025-01-05',
    owner: 'Sales Manager',
    description: 'Full e-commerce platform with payment integration',
    created_at: '2024-09-20T15:00:00Z',
    lastActivity: '2024-10-31T11:20:00Z',
  },
  
  // Proposal Stage
  {
    id: 7,
    title: 'White Label Partnership',
    customer: 'Cloud Ventures',
    customerId: 6,
    value: 250000,
    stage: 'proposal',
    probability: 60,
    expectedCloseDate: '2024-12-05',
    owner: 'VP Sales',
    description: 'Strategic white-label partnership agreement',
    created_at: '2024-08-15T09:00:00Z',
    lastActivity: '2024-10-29T15:30:00Z',
  },
  {
    id: 8,
    title: 'Custom Development Project',
    customer: 'HealthTech Solutions',
    customerId: 8,
    value: 175000,
    stage: 'proposal',
    probability: 55,
    expectedCloseDate: '2024-12-20',
    owner: 'Solutions Engineer',
    description: 'HIPAA-compliant custom software development',
    created_at: '2024-08-20T10:00:00Z',
    lastActivity: '2024-10-27T14:00:00Z',
  },
  {
    id: 9,
    title: 'Training & Onboarding Package',
    customer: 'Digital Dynamics',
    customerId: 5,
    value: 35000,
    stage: 'proposal',
    probability: 65,
    expectedCloseDate: '2024-11-30',
    owner: 'Customer Success',
    description: 'Comprehensive training program for new features',
    created_at: '2024-09-01T13:00:00Z',
    lastActivity: '2024-10-30T10:45:00Z',
  },
  
  // Negotiation Stage
  {
    id: 10,
    title: 'Multi-Location Expansion',
    customer: 'RetailPro Systems',
    customerId: 7,
    value: 310000,
    stage: 'negotiation',
    probability: 75,
    expectedCloseDate: '2024-11-25',
    owner: 'Sales Manager',
    description: '10-location rollout with enterprise support',
    created_at: '2024-07-10T11:00:00Z',
    lastActivity: '2024-11-01T16:00:00Z',
  },
  {
    id: 11,
    title: 'API Integration Services',
    customer: 'TechStart Inc',
    customerId: 2,
    value: 62000,
    stage: 'negotiation',
    probability: 80,
    expectedCloseDate: '2024-11-20',
    owner: 'Technical Lead',
    description: 'Custom API development and integration',
    created_at: '2024-07-25T14:30:00Z',
    lastActivity: '2024-11-01T11:15:00Z',
  },
  
  // Closed Won
  {
    id: 12,
    title: 'Enterprise Package Upgrade',
    customer: 'Acme Corporation',
    customerId: 1,
    value: 125000,
    stage: 'closed-won',
    probability: 100,
    expectedCloseDate: '2024-10-15',
    actualCloseDate: '2024-10-15',
    owner: 'Account Manager',
    description: 'Upgraded to enterprise package with additional features',
    created_at: '2024-06-01T10:00:00Z',
    lastActivity: '2024-10-15T16:45:00Z',
  },
  {
    id: 13,
    title: 'Consulting Services Q3',
    customer: 'Cloud Ventures',
    customerId: 6,
    value: 95000,
    stage: 'closed-won',
    probability: 100,
    expectedCloseDate: '2024-09-30',
    actualCloseDate: '2024-09-28',
    owner: 'Consultant',
    description: 'Q3 consulting and advisory services',
    created_at: '2024-07-01T09:00:00Z',
    lastActivity: '2024-09-28T17:00:00Z',
  },
  {
    id: 14,
    title: 'Monthly Subscription',
    customer: 'Digital Dynamics',
    customerId: 5,
    value: 9500,
    stage: 'closed-won',
    probability: 100,
    expectedCloseDate: '2024-10-01',
    actualCloseDate: '2024-10-01',
    owner: 'Account Manager',
    description: 'Recurring monthly subscription renewed',
    created_at: '2024-09-01T10:00:00Z',
    lastActivity: '2024-10-01T09:00:00Z',
  },
  
  // Closed Lost
  {
    id: 15,
    title: 'Basic Plan Subscription',
    customer: 'Global Solutions Ltd',
    customerId: 3,
    value: 25000,
    stage: 'closed-lost',
    probability: 0,
    expectedCloseDate: '2024-09-15',
    actualCloseDate: '2024-09-20',
    owner: 'Sales Rep',
    description: 'Lost to competitor - pricing concerns',
    created_at: '2024-08-01T11:00:00Z',
    lastActivity: '2024-09-20T14:00:00Z',
    lostReason: 'Competitor pricing',
  },
];

// Pipeline statistics helper
export const getPipelineStats = () => {
  const totalValue = mockPipelineDeals.reduce((sum, deal) => sum + deal.value, 0);
  const wonValue = mockPipelineDeals
    .filter(d => d.stage === 'closed-won')
    .reduce((sum, deal) => sum + deal.value, 0);
  const pipelineValue = mockPipelineDeals
    .filter(d => !['closed-won', 'closed-lost'].includes(d.stage))
    .reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);
  
  const byStage = {
    lead: mockPipelineDeals.filter(d => d.stage === 'lead'),
    qualified: mockPipelineDeals.filter(d => d.stage === 'qualified'),
    proposal: mockPipelineDeals.filter(d => d.stage === 'proposal'),
    negotiation: mockPipelineDeals.filter(d => d.stage === 'negotiation'),
    'closed-won': mockPipelineDeals.filter(d => d.stage === 'closed-won'),
    'closed-lost': mockPipelineDeals.filter(d => d.stage === 'closed-lost'),
  };

  return {
    totalDeals: mockPipelineDeals.length,
    totalValue,
    wonValue,
    pipelineValue,
    openDeals: mockPipelineDeals.filter(d => !['closed-won', 'closed-lost'].includes(d.stage)).length,
    wonDeals: byStage['closed-won'].length,
    lostDeals: byStage['closed-lost'].length,
    byStage,
  };
};

// Get deals by stage for pipeline view
export const getDealsByStage = (stage: string) => {
  return mockPipelineDeals.filter(d => d.stage === stage);
};

