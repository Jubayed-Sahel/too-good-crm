/**
 * Export all services
 */
export { authService } from './auth.service';
export { customerService } from './customer.service';
export { dealService } from './deal.service';
export type { 
  DealCreateData, 
  DealFilters, 
  DealStats, 
  Pipeline, 
  PipelineStage,
  MoveStageData 
} from './deal.service';
export { analyticsService } from './analytics.service';
export { organizationService } from './organization.service';
export { rbacService } from './rbac.service';
export { userService } from './user.service';
export { leadService } from './lead.service';
export { employeeService } from './employee.service';
export type { 
  Employee, 
  InviteEmployeeRequest, 
  InviteEmployeeResponse 
} from './employee.service';
export { roleService } from './role.service';
export type {
  Role,
  Permission,
  UserRole
} from './role.service';

// New model services
export { issueService } from './issue.service';
export { orderService } from './order.service';
export { paymentService } from './payment.service';
export { activityService } from './activity.service';
export { getActivities, getActivity, createActivity, deleteActivity, getActivityStats } from './activity.service';
