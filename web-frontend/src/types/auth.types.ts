// Authentication Types

export type UserType = 'vendor' | 'employee' | 'customer';

export type EmployeeSubRole = 'super_admin' | 'manager' | 'sales' | 'marketing';

export type ProfileType = 'vendor' | 'employee' | 'customer';

export type ProfileStatus = 'active' | 'inactive' | 'suspended';

export interface UserProfile {
  id: number;
  user: number;
  user_email: string;
  organization: number;
  organization_name: string;
  profile_type: ProfileType;
  profile_type_display: string;
  is_primary: boolean;
  is_owner?: boolean;
  status: ProfileStatus;
  status_display: string;
  activated_at: string | null;
  deactivated_at: string | null;
  roles?: Array<{
    id: number;
    name: string;
    slug: string;
    is_primary: boolean;
  }>;
  created_at: string;
  updated_at: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  role: UserType;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserType;
}

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  profile_image: string | null;
  phone: string | null;
  is_active: boolean;
  is_verified: boolean;
  is_staff: boolean;
  two_factor_enabled: boolean;
  last_login_at: string | null;
  email_verified_at: string | null;
  profiles: UserProfile[];
  created_at: string;
  updated_at: string;
  // Computed properties for convenience
  primaryOrganizationId?: number;
  primaryProfile?: UserProfile;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  password: string;
  password_confirm: string;
  phone?: string;
  organization_name?: string;
}

export interface AuthError {
  message: string;
  field?: string;
  code?: string;
}
