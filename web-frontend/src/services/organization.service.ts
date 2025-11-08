/**
 * Organization Service
 * Handles organization API calls
 */
import api from '@/lib/apiClient';

export interface Organization {
  id: number;
  name: string;
  slug: string;
  description?: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  settings?: {
    timezone?: string;
    currency?: string;
    [key: string]: any;
  };
  subscription_plan?: string;
  subscription_status?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface UpdateOrganizationData {
  name?: string;
  description?: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  settings?: {
    timezone?: string;
    currency?: string;
    [key: string]: any;
  };
  is_active?: boolean;
}

export interface CreateOrganizationData {
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

class OrganizationService {
  private readonly baseUrl = '/organizations';

  /**
   * Get all organizations for current user
   */
  async getOrganizations(): Promise<Organization[]> {
    return api.get<Organization[]>(this.baseUrl);
  }

  /**
   * Get user's organizations
   */
  async getMyOrganizations(): Promise<Organization[]> {
    return api.get<Organization[]>(`${this.baseUrl}/my_organizations/`);
  }

  /**
   * Get current/active organization (first one)
   */
  async getCurrentOrganization(): Promise<Organization> {
    const orgs = await this.getMyOrganizations();
    if (orgs.length === 0) {
      throw new Error('No organization found');
    }
    return orgs[0]; // Return first organization
  }

  /**
   * Get single organization
   */
  async getOrganization(id: number | string): Promise<Organization> {
    const organizationId = typeof id === 'string' ? parseInt(id, 10) : id;
    return api.get<Organization>(`${this.baseUrl}/${organizationId}/`);
  }

  /**
   * Update organization
   */
  async updateOrganization(id: number | string, data: UpdateOrganizationData): Promise<Organization> {
    const organizationId = typeof id === 'string' ? parseInt(id, 10) : id;
    return api.patch<Organization>(`${this.baseUrl}/${organizationId}/`, data);
  }

  /**
   * Get organization members
   */
  async getMembers(organizationId: number | string): Promise<any[]> {
    const orgId = typeof organizationId === 'string' ? parseInt(organizationId, 10) : organizationId;
    return api.get<any[]>(`${this.baseUrl}/${orgId}/members/`);
  }

  /**
   * Get user's organizations (alias for getMyOrganizations)
   */
  async getUserOrganizations(): Promise<Organization[]> {
    return this.getMyOrganizations();
  }

  /**
   * Get organization members (alias for getMembers)
   */
  async getOrganizationMembers(organizationId: number | string): Promise<any[]> {
    return this.getMembers(organizationId);
  }

  /**
   * Create new organization
   */
  async createOrganization(data: CreateOrganizationData): Promise<Organization> {
    return api.post<Organization>(`${this.baseUrl}/`, data);
  }

  /**
   * Switch to a different organization (client-side only - sets as active)
   * In a real app, this would update user preferences on the server
   */
  async switchOrganization(organizationId: number | string): Promise<Organization> {
    return this.getOrganization(organizationId);
  }

  /**
   * Invite user to organization
   */
  async inviteUser(organizationId: number | string, data: { email: string; role?: string }): Promise<any> {
    const orgId = typeof organizationId === 'string' ? parseInt(organizationId, 10) : organizationId;
    return api.post<any>(`${this.baseUrl}/${orgId}/add_member/`, data);
  }
}

export const organizationService = new OrganizationService();
