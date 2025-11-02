/**
 * Leads Service with Mock Data
 */

import type {
  Lead,
  LeadActivity,
  CreateLeadData,
  UpdateLeadData,
  ConvertLeadData,
  LeadFilters,
  LeadStats,
} from '@/types';

// Mock leads data
const mockLeads: Lead[] = [
  {
    id: '1',
    organizationId: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1 (555) 234-5678',
    company: 'TechCorp Solutions',
    title: 'VP of Sales',
    website: 'https://techcorp.com',
    source: 'website',
    status: 'qualified',
    priority: 'high',
    score: 85,
    estimatedValue: 50000,
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    description: 'Interested in enterprise CRM solution for 200+ sales team',
    assignedToId: '1',
    assignedToName: 'John Doe',
    tags: ['enterprise', 'hot-lead'],
    nextFollowUpAt: '2024-03-25T10:00:00Z',
    lastContactedAt: '2024-03-20T14:30:00Z',
    createdAt: '2024-03-15T09:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z',
  },
  {
    id: '2',
    organizationId: '1',
    firstName: 'Michael',
    lastName: 'Chen',
    fullName: 'Michael Chen',
    email: 'mchen@startupxyz.io',
    phone: '+1 (555) 345-6789',
    company: 'StartupXYZ',
    title: 'Founder & CEO',
    website: 'https://startupxyz.io',
    source: 'referral',
    status: 'proposal',
    priority: 'high',
    score: 78,
    estimatedValue: 25000,
    city: 'Austin',
    state: 'TX',
    country: 'USA',
    description: 'Looking for affordable CRM for growing startup',
    assignedToId: '1',
    assignedToName: 'John Doe',
    tags: ['startup', 'referral'],
    nextFollowUpAt: '2024-03-24T15:00:00Z',
    lastContactedAt: '2024-03-21T11:00:00Z',
    createdAt: '2024-03-10T10:30:00Z',
    updatedAt: '2024-03-21T11:00:00Z',
  },
  {
    id: '3',
    organizationId: '1',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    fullName: 'Emily Rodriguez',
    email: 'emily.r@marketingpro.com',
    phone: '+1 (555) 456-7890',
    company: 'Marketing Pro Agency',
    title: 'Operations Manager',
    source: 'social_media',
    status: 'contacted',
    priority: 'medium',
    score: 62,
    estimatedValue: 15000,
    city: 'Miami',
    state: 'FL',
    country: 'USA',
    description: 'Inquired about CRM for marketing agency',
    assignedToId: '2',
    assignedToName: 'Jane Smith',
    tags: ['marketing', 'mid-market'],
    nextFollowUpAt: '2024-03-26T09:00:00Z',
    lastContactedAt: '2024-03-19T16:00:00Z',
    createdAt: '2024-03-18T14:00:00Z',
    updatedAt: '2024-03-19T16:00:00Z',
  },
  {
    id: '4',
    organizationId: '1',
    firstName: 'David',
    lastName: 'Williams',
    fullName: 'David Williams',
    email: 'dwilliams@retailco.com',
    phone: '+1 (555) 567-8901',
    company: 'RetailCo Inc',
    title: 'IT Director',
    source: 'trade_show',
    status: 'new',
    priority: 'low',
    score: 45,
    estimatedValue: 35000,
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    description: 'Met at Trade Show 2024, interested in demo',
    tags: ['trade-show', 'retail'],
    createdAt: '2024-03-22T11:00:00Z',
    updatedAt: '2024-03-22T11:00:00Z',
  },
  {
    id: '5',
    organizationId: '1',
    firstName: 'Lisa',
    lastName: 'Thompson',
    fullName: 'Lisa Thompson',
    email: 'lisa@healthtech.com',
    phone: '+1 (555) 678-9012',
    company: 'HealthTech Solutions',
    title: 'CTO',
    website: 'https://healthtech.com',
    source: 'partner',
    status: 'negotiation',
    priority: 'urgent',
    score: 92,
    estimatedValue: 75000,
    city: 'Boston',
    state: 'MA',
    country: 'USA',
    description: 'Enterprise deal, negotiating contract terms',
    assignedToId: '1',
    assignedToName: 'John Doe',
    tags: ['enterprise', 'healthcare', 'hot-lead'],
    nextFollowUpAt: '2024-03-23T14:00:00Z',
    lastContactedAt: '2024-03-22T10:00:00Z',
    createdAt: '2024-03-05T08:00:00Z',
    updatedAt: '2024-03-22T10:00:00Z',
  },
  {
    id: '6',
    organizationId: '1',
    firstName: 'Robert',
    lastName: 'Martinez',
    fullName: 'Robert Martinez',
    email: 'rmartinez@financegroup.com',
    phone: '+1 (555) 789-0123',
    company: 'Finance Group LLC',
    title: 'CFO',
    source: 'email',
    status: 'contacted',
    priority: 'medium',
    score: 68,
    estimatedValue: 45000,
    city: 'New York',
    state: 'NY',
    country: 'USA',
    description: 'Responded to email campaign about financial CRM solutions',
    assignedToId: '2',
    assignedToName: 'Jane Smith',
    tags: ['finance', 'email-campaign'],
    nextFollowUpAt: '2024-03-27T11:00:00Z',
    lastContactedAt: '2024-03-21T09:30:00Z',
    createdAt: '2024-03-20T08:00:00Z',
    updatedAt: '2024-03-21T09:30:00Z',
  },
  {
    id: '7',
    organizationId: '1',
    firstName: 'Jennifer',
    lastName: 'Lee',
    fullName: 'Jennifer Lee',
    email: 'jlee@ecommerceco.com',
    phone: '+1 (555) 890-1234',
    company: 'Ecommerce Co',
    title: 'Operations Director',
    source: 'website',
    status: 'qualified',
    priority: 'high',
    score: 81,
    estimatedValue: 38000,
    city: 'Seattle',
    state: 'WA',
    country: 'USA',
    description: 'Looking for CRM to manage growing customer base',
    assignedToId: '1',
    assignedToName: 'John Doe',
    tags: ['ecommerce', 'qualified'],
    nextFollowUpAt: '2024-03-25T13:00:00Z',
    lastContactedAt: '2024-03-22T15:00:00Z',
    createdAt: '2024-03-17T10:00:00Z',
    updatedAt: '2024-03-22T15:00:00Z',
  },
  {
    id: '8',
    organizationId: '1',
    firstName: 'James',
    lastName: 'Wilson',
    fullName: 'James Wilson',
    email: 'jwilson@constructionpro.com',
    phone: '+1 (555) 901-2345',
    company: 'Construction Pro Inc',
    title: 'Project Manager',
    source: 'cold_call',
    status: 'new',
    priority: 'low',
    score: 38,
    estimatedValue: 22000,
    city: 'Denver',
    state: 'CO',
    country: 'USA',
    description: 'Initial contact via cold call, needs more qualification',
    tags: ['construction', 'cold-call'],
    createdAt: '2024-03-23T14:00:00Z',
    updatedAt: '2024-03-23T14:00:00Z',
  },
  {
    id: '9',
    organizationId: '1',
    firstName: 'Amanda',
    lastName: 'Taylor',
    fullName: 'Amanda Taylor',
    email: 'ataylor@edutechsolutions.com',
    phone: '+1 (555) 012-3456',
    company: 'EduTech Solutions',
    title: 'VP Technology',
    source: 'referral',
    status: 'proposal',
    priority: 'high',
    score: 75,
    estimatedValue: 55000,
    city: 'Portland',
    state: 'OR',
    country: 'USA',
    description: 'Referred by existing customer, sent proposal yesterday',
    assignedToId: '1',
    assignedToName: 'John Doe',
    tags: ['education', 'referral', 'proposal-sent'],
    nextFollowUpAt: '2024-03-24T10:00:00Z',
    lastContactedAt: '2024-03-22T16:00:00Z',
    createdAt: '2024-03-14T09:00:00Z',
    updatedAt: '2024-03-22T16:00:00Z',
  },
  {
    id: '10',
    organizationId: '1',
    firstName: 'Christopher',
    lastName: 'Brown',
    fullName: 'Christopher Brown',
    email: 'cbrown@logisticsworld.com',
    phone: '+1 (555) 123-4567',
    company: 'Logistics World',
    title: 'Director of Operations',
    source: 'trade_show',
    status: 'contacted',
    priority: 'medium',
    score: 59,
    estimatedValue: 41000,
    city: 'Atlanta',
    state: 'GA',
    country: 'USA',
    description: 'Met at logistics trade show, interested in demo',
    assignedToId: '2',
    assignedToName: 'Jane Smith',
    tags: ['logistics', 'trade-show'],
    nextFollowUpAt: '2024-03-26T14:00:00Z',
    lastContactedAt: '2024-03-20T11:00:00Z',
    createdAt: '2024-03-19T13:00:00Z',
    updatedAt: '2024-03-20T11:00:00Z',
  },
];

// Mock lead activities
const mockActivities: LeadActivity[] = [
  {
    id: '1',
    leadId: '1',
    type: 'call',
    subject: 'Discovery Call',
    description: 'Discussed requirements and pain points',
    outcome: 'Positive - moving to next stage',
    duration: 45,
    completedAt: '2024-03-20T14:30:00Z',
    userId: '1',
    userName: 'John Doe',
    createdAt: '2024-03-20T14:30:00Z',
  },
  {
    id: '2',
    leadId: '1',
    type: 'email',
    subject: 'Sent product demo link',
    description: 'Shared video walkthrough and case studies',
    completedAt: '2024-03-18T10:00:00Z',
    userId: '1',
    userName: 'John Doe',
    createdAt: '2024-03-18T10:00:00Z',
  },
];

// Simulated delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class LeadService {
  /**
   * Get all leads with optional filters
   */
  async getLeads(filters?: LeadFilters): Promise<Lead[]> {
    await delay(400);
    
    let filteredLeads = [...mockLeads];

    if (filters) {
      if (filters.status) {
        filteredLeads = filteredLeads.filter(lead => lead.status === filters.status);
      }

      if (filters.source) {
        filteredLeads = filteredLeads.filter(lead => lead.source === filters.source);
      }

      if (filters.priority) {
        filteredLeads = filteredLeads.filter(lead => lead.priority === filters.priority);
      }

      if (filters.assignedToId) {
        filteredLeads = filteredLeads.filter(lead => lead.assignedToId === filters.assignedToId);
      }

      if (filters.minScore !== undefined) {
        filteredLeads = filteredLeads.filter(lead => lead.score >= filters.minScore!);
      }

      if (filters.maxScore !== undefined) {
        filteredLeads = filteredLeads.filter(lead => lead.score <= filters.maxScore!);
      }

      if (filters.tags && filters.tags.length > 0) {
        filteredLeads = filteredLeads.filter(lead =>
          lead.tags?.some(tag => filters.tags!.includes(tag))
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredLeads = filteredLeads.filter(lead =>
          lead.fullName.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          lead.company?.toLowerCase().includes(searchLower)
        );
      }
    }

    return filteredLeads;
  }

  /**
   * Get lead by ID
   */
  async getLead(id: string): Promise<Lead> {
    await delay(300);
    const lead = mockLeads.find(l => l.id === id);
    if (!lead) throw new Error('Lead not found');
    return lead;
  }

  /**
   * Create new lead
   */
  async createLead(data: CreateLeadData): Promise<Lead> {
    await delay(600);

    const newLead: Lead = {
      id: String(mockLeads.length + 1),
      organizationId: '1',
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      company: data.company,
      title: data.title,
      website: data.website,
      source: data.source,
      status: data.status || 'new',
      priority: data.priority || 'medium',
      score: 50, // Default score
      estimatedValue: data.estimatedValue,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
      description: data.description,
      assignedToId: data.assignedToId,
      tags: data.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockLeads.push(newLead);
    return newLead;
  }

  /**
   * Update lead
   */
  async updateLead(id: string, data: UpdateLeadData): Promise<Lead> {
    await delay(500);

    const index = mockLeads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead not found');

    mockLeads[index] = {
      ...mockLeads[index],
      ...data,
      fullName: data.firstName && data.lastName 
        ? `${data.firstName} ${data.lastName}` 
        : mockLeads[index].fullName,
      updatedAt: new Date().toISOString(),
    };

    return mockLeads[index];
  }

  /**
   * Delete lead
   */
  async deleteLead(id: string): Promise<void> {
    await delay(400);
    const index = mockLeads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead not found');
    mockLeads.splice(index, 1);
  }

  /**
   * Convert lead to customer/deal
   */
  async convertLead(id: string, data: ConvertLeadData): Promise<Lead> {
    await delay(800);

    const index = mockLeads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead not found');

    mockLeads[index] = {
      ...mockLeads[index],
      status: 'converted',
      convertedAt: new Date().toISOString(),
      convertedToCustomerId: data.createCustomer ? String(Math.random()) : undefined,
      updatedAt: new Date().toISOString(),
    };

    return mockLeads[index];
  }

  /**
   * Get lead activities
   */
  async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    await delay(300);
    return mockActivities.filter(a => a.leadId === leadId);
  }

  /**
   * Add lead activity
   */
  async addLeadActivity(leadId: string, activity: Partial<LeadActivity>): Promise<LeadActivity> {
    await delay(500);

    const newActivity: LeadActivity = {
      id: String(mockActivities.length + 1),
      leadId,
      type: activity.type!,
      subject: activity.subject!,
      description: activity.description,
      outcome: activity.outcome,
      duration: activity.duration,
      scheduledAt: activity.scheduledAt,
      completedAt: activity.completedAt || new Date().toISOString(),
      userId: '1',
      userName: 'John Doe',
      metadata: activity.metadata,
      createdAt: new Date().toISOString(),
    };

    mockActivities.push(newActivity);
    return newActivity;
  }

  /**
   * Update lead score
   */
  async updateLeadScore(id: string, newScore: number, reason: string): Promise<Lead> {
    await delay(400);

    const index = mockLeads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead not found');

    const oldScore = mockLeads[index].score;
    mockLeads[index].score = newScore;
    mockLeads[index].updatedAt = new Date().toISOString();

    // Log score change (in real app, would save to database)
    console.log(`Lead ${id} score changed from ${oldScore} to ${newScore}: ${reason}`);

    return mockLeads[index];
  }

  /**
   * Get lead statistics
   */
  async getLeadStats(): Promise<LeadStats> {
    await delay(400);

    const total = mockLeads.length;
    const byStatus = {
      new: mockLeads.filter(l => l.status === 'new').length,
      contacted: mockLeads.filter(l => l.status === 'contacted').length,
      qualified: mockLeads.filter(l => l.status === 'qualified').length,
      proposal: mockLeads.filter(l => l.status === 'proposal').length,
      negotiation: mockLeads.filter(l => l.status === 'negotiation').length,
      converted: mockLeads.filter(l => l.status === 'converted').length,
      lost: mockLeads.filter(l => l.status === 'lost').length,
    };

    const averageScore = total > 0 ? mockLeads.reduce((sum, l) => sum + l.score, 0) / total : 0;
    const totalEstimatedValue = mockLeads
      .filter(l => l.estimatedValue)
      .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
    
    const conversionRate = total > 0 ? (byStatus.converted / total) * 100 : 0;

    return {
      totalLeads: total,
      statusCounts: byStatus,
      averageScore: Math.round(averageScore),
      totalEstimatedValue,
      conversionRate: Math.round(conversionRate * 10) / 10,
    };
  }

  /**
   * Assign lead to user
   */
  async assignLead(id: string, userId: string, userName: string): Promise<Lead> {
    await delay(400);

    const index = mockLeads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead not found');

    mockLeads[index].assignedToId = userId;
    mockLeads[index].assignedToName = userName;
    mockLeads[index].updatedAt = new Date().toISOString();

    return mockLeads[index];
  }
}

export const leadService = new LeadService();
