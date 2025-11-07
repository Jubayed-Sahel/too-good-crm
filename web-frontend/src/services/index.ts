/**
 * Central export for all service modules
 * Groups services by domain for better organization
 */

// Authentication & Authorization
export { authService } from './auth.service';
export { rbacService } from './rbac.service';
export { roleService } from './role.service';
export { roleSelectionService } from './role-selection.service';
export type { Role, Permission, UserRole } from './role.service';

// User Management
export { userProfileService } from './userProfile.service';
export type {
  UserProfile,
  UpdateProfileData,
  ChangePasswordData,
  SecuritySettings,
  ActiveSession
} from './userProfile.service';
export { employeeService } from './employee.service';
export type { 
  Employee, 
  InviteEmployeeRequest, 
  InviteEmployeeResponse 
} from './employee.service';

// CRM Core
export { customerService } from './customer.service';
export { leadService } from './lead.service';
export { dealService } from './deal.service';
export type { 
  DealCreateData, 
  DealFilters, 
  DealStats, 
  Pipeline, 
  PipelineStage,
  MoveStageData 
} from './deal.service';
export { activityService } from './activity.service';
export { getActivities, getActivity, createActivity, deleteActivity, getActivityStats } from './activity.service';

// Operations
export { vendorService } from './vendor.service';
export { issueService } from './issue.service';
export { orderService } from './order.service';
export { paymentService } from './payment.service';

// Organization & Settings
export { organizationService } from './organization.service';
export { notificationPreferencesService } from './notificationPreferences.service';
export type {
  NotificationPreferences,
  UpdateNotificationPreferencesData
} from './notificationPreferences.service';

// Analytics
export { analyticsService } from './analytics.service';
