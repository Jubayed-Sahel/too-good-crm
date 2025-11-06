/**
 * Organization API Service with Mock Data
 */

import type {
  Organization,
  UserOrganization,
  CreateOrganizationData,
  UpdateOrganizationData,
  InviteUserData,
} from '@/types';

// Mock data
const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    subdomain: 'acme',
    logo: '',
    industry: 'Technology',
    size: 'medium',
    timezone: 'America/New_York',
    currency: 'USD',
    address: '123 Tech Street',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    postalCode: '94105',
    phone: '+1-555-0100',
    website: 'https://acme.example.com',
    settings: {
      branding: {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
      },
      features: {
        enableLeads: true,
        enableDeals: true,
        enableProducts: true,
        enableOrders: true,
        enableVendors: true,
        enableSamples: true,
      },
      defaults: {
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        firstDayOfWeek: 0,
      },
    },
    subscription: {
      planId: '1',
      planName: 'Professional',
      status: 'active',
      currentPeriodStart: '2024-11-01T00:00:00Z',
      currentPeriodEnd: '2024-12-01T00:00:00Z',
    },
    ownerId: '1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-11-02T10:00:00Z',
  },
  {
    id: '2',
    name: 'TechStart Inc',
    subdomain: 'techstart',
    industry: 'Software',
    size: 'small',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    settings: {
      branding: {},
      features: {
        enableLeads: true,
        enableDeals: true,
        enableProducts: false,
        enableOrders: false,
        enableVendors: false,
        enableSamples: false,
      },
      defaults: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        firstDayOfWeek: 1,
      },
    },
    subscription: {
      planId: '2',
      planName: 'Starter',
      status: 'trial',
      currentPeriodStart: '2024-10-25T00:00:00Z',
      currentPeriodEnd: '2024-11-25T00:00:00Z',
      trialEndsAt: '2024-11-25T00:00:00Z',
    },
    ownerId: '1',
    createdAt: '2024-10-25T10:00:00Z',
    updatedAt: '2024-10-25T10:00:00Z',
  },
];

const mockUserOrganizations: UserOrganization[] = [
  {
    id: '1',
    userId: '1',
    organizationId: '1',
    organization: mockOrganizations[0],
    role: 'Admin',
    isDefault: true,
    joinedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    userId: '1',
    organizationId: '2',
    organization: mockOrganizations[1],
    role: 'Owner',
    isDefault: false,
    joinedAt: '2024-10-25T10:00:00Z',
  },
];

// Simulated delay for API calls
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class OrganizationService {
  /**
   * Get all organizations for current user
   */
  async getUserOrganizations(): Promise<UserOrganization[]> {
    await delay(500);
    return mockUserOrganizations;
  }

  /**
   * Get current/active organization
   */
  async getCurrentOrganization(): Promise<Organization> {
    await delay(300);
    const defaultOrg = mockUserOrganizations.find((uo) => uo.isDefault);
    if (!defaultOrg) throw new Error('No default organization');
    return defaultOrg.organization;
  }

  /**
   * Get organization by ID
   */
  async getOrganization(id: string): Promise<Organization> {
    await delay(300);
    const org = mockOrganizations.find((o) => o.id === id);
    if (!org) throw new Error('Organization not found');
    return org;
  }

  /**
   * Create new organization
   */
  async createOrganization(data: CreateOrganizationData): Promise<Organization> {
    await delay(800);
    
    const newOrg: Organization = {
      id: String(mockOrganizations.length + 1),
      ...data,
      settings: {
        branding: {},
        features: {
          enableLeads: true,
          enableDeals: true,
          enableProducts: true,
          enableOrders: true,
          enableVendors: false,
          enableSamples: false,
        },
        defaults: {
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          firstDayOfWeek: 0,
        },
      },
      subscription: {
        planId: '1',
        planName: 'Trial',
        status: 'trial',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      ownerId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockOrganizations.push(newOrg);
    return newOrg;
  }

  /**
   * Update organization
   */
  async updateOrganization(id: string, data: UpdateOrganizationData): Promise<Organization> {
    await delay(600);
    
    const index = mockOrganizations.findIndex((o) => o.id === id);
    if (index === -1) throw new Error('Organization not found');

    const updated: Organization = {
      ...mockOrganizations[index],
      ...data,
      settings: {
        ...mockOrganizations[index].settings,
        ...(data.settings || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    mockOrganizations[index] = updated;
    return mockOrganizations[index];
  }

  /**
   * Switch to different organization
   */
  async switchOrganization(organizationId: string): Promise<void> {
    await delay(400);
    
    // Set all to non-default
    mockUserOrganizations.forEach((uo) => {
      uo.isDefault = false;
    });

    // Set selected as default
    const userOrg = mockUserOrganizations.find((uo) => uo.organizationId === organizationId);
    if (!userOrg) throw new Error('Organization not found');
    userOrg.isDefault = true;
  }

  /**
   * Invite user to organization
   */
  async inviteUser(organizationId: string, data: InviteUserData): Promise<void> {
    await delay(700);
    // In real implementation, this would send an invitation email
    console.log('Inviting user:', data, 'to organization:', organizationId);
  }

  /**
   * Get organization members
   */
  async getOrganizationMembers(_organizationId: string): Promise<any[]> {
    await delay(400);
    
    // Mock members data
    return [
      {
        id: '1',
        userId: '1',
        email: 'admin@acme.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'Admin',
        status: 'active',
        joinedAt: '2024-01-15T10:00:00Z',
      },
      {
        id: '2',
        userId: '2',
        email: 'sarah@acme.com',
        firstName: 'Sarah',
        lastName: 'Smith',
        role: 'Sales Manager',
        status: 'active',
        joinedAt: '2024-02-20T10:00:00Z',
      },
      {
        id: '3',
        userId: '3',
        email: 'mike@acme.com',
        firstName: 'Mike',
        lastName: 'Johnson',
        role: 'Sales Rep',
        status: 'active',
        joinedAt: '2024-03-10T10:00:00Z',
      },
    ];
  }
}

export const organizationService = new OrganizationService();
