// Authentication Types

export type UserType = 'vendor' | 'employee';

export type EmployeeSubRole = 'super_admin' | 'manager' | 'sales' | 'marketing';

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
  id: string;
  name: string;
  email: string;
  role: UserType;
  employeeSubRole?: EmployeeSubRole;
  organizationId?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface AuthError {
  message: string;
  field?: string;
  code?: string;
}
