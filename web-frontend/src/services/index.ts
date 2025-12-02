/**
 * Central export for all service modules
 * Groups services by domain for better organization
 */

// Authentication & Authorization
export { authService } from './auth.service';
export { rbacService } from './rbac.service';
export { roleService } from './role.service';
export { permissionService } from './permission.service';
export { roleSelectionService } from './role-selection.service';
export type { Role, Permission, UserRole } from './role.service';
export type { PermissionsByResource } from './permission.service';

// User Management
export { userProfileService } from './userProfile.service';
export type {
  UserProfile,
  UpdateProfileData,
  ChangePasswordData,
  SecuritySettings,
  ActiveSession
} from './userProfile.service';
// Employee service - RE-EXPORTED from features/employees (MIGRATED)
export { employeeService } from '../features/employees/services/employee.service';
export type { 
  Employee, 
  InviteEmployeeRequest, 
  InviteEmployeeResponse 
} from '../features/employees/services/employee.service';

// CRM Core
// Customer service - RE-EXPORTED from features/customers (MIGRATED)
export { customerService } from '../features/customers/services/customer.service';
// Lead service - RE-EXPORTED from features/leads (MIGRATED)
export { leadService } from '../features/leads/services/lead.service';
// Deal service - RE-EXPORTED from features/deals (MIGRATED)
export { dealService } from '../features/deals/services/deal.service';
export type { 
  DealCreateData, 
  DealFilters, 
  DealStats, 
  Pipeline, 
  PipelineStage,
  MoveStageData 
} from '../features/deals/services/deal.service';
// Activity services - RE-EXPORTED from features/activities (MIGRATED)
export { activityService, getActivities, getActivity, createActivity, deleteActivity, getActivityStats } from '../features/activities/services/activity.service';
export { auditLogService } from '../features/activities/services/auditLog.service';

// Operations
// Vendor service - RE-EXPORTED from features/vendors (MIGRATED - structure only)
export { vendorService } from '../features/vendors/services/vendor.service';
// Issue service - RE-EXPORTED from features/issues (MIGRATED)
export { issueService } from '../features/issues/services/issue.service';
// Order service - RE-EXPORTED from features/orders (MIGRATED)
export { orderService } from '../features/orders/services/order.service';
// Payment service - RE-EXPORTED from features/payments (MIGRATED)
export { paymentService } from '../features/payments/services/payment.service';

// Organization & Settings
export { organizationService } from './organization.service';
export { notificationPreferencesService } from './notificationPreferences.service';
export type {
  NotificationPreferences,
  UpdateNotificationPreferencesData
} from './notificationPreferences.service';

// AI & Automation
// geminiService - RE-EXPORTED from features/messages (MIGRATED)
// Messages services - RE-EXPORTED from features/messages (MIGRATED)
export * from '../features/messages/services';