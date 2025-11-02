/**
 * Organization and Multi-tenancy Types
 */

export interface Organization {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  logo?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  timezone: string;
  currency: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  website?: string;
  settings: OrganizationSettings;
  subscription?: {
    planId: string;
    planName: string;
    status: 'active' | 'trial' | 'expired' | 'cancelled';
    currentPeriodStart: string;
    currentPeriodEnd: string;
    trialEndsAt?: string;
  };
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSettings {
  branding: {
    primaryColor?: string;
    secondaryColor?: string;
    logo?: string;
    favicon?: string;
  };
  features: {
    enableLeads: boolean;
    enableDeals: boolean;
    enableProducts: boolean;
    enableOrders: boolean;
    enableVendors: boolean;
    enableSamples: boolean;
  };
  defaults: {
    dateFormat: string;
    timeFormat: string;
    firstDayOfWeek: number;
  };
}

export interface UserOrganization {
  id: string;
  userId: string;
  organizationId: string;
  organization: Organization;
  role: string;
  isDefault: boolean;
  joinedAt: string;
}

export interface CreateOrganizationData {
  name: string;
  subdomain: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  timezone: string;
  currency: string;
}

export interface UpdateOrganizationData {
  name?: string;
  logo?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  timezone?: string;
  currency?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  website?: string;
  settings?: Partial<OrganizationSettings>;
}

export interface InviteUserData {
  email: string;
  roleId: string;
  firstName?: string;
  lastName?: string;
}
