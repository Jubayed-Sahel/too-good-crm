/**
 * Employee Form Validation Schemas
 * Zod schemas for employee CRUD operations
 */
import { z } from 'zod';
import {
  emailValidator,
  phoneValidator,
  nameValidator,
  requiredDateValidator,
} from '@/schemas/common.schema';

/**
 * Employee Department Options
 */
export const employeeDepartmentValidator = z.enum([
  'sales',
  'marketing',
  'support',
  'engineering',
  'operations',
  'finance',
  'hr',
  'other',
]);

/**
 * Employee Status Options
 */
export const employeeStatusValidator = z.enum(['active', 'inactive', 'on_leave', 'terminated']);

/**
 * Employee Create/Update Schema
 * Validates employee form data
 */
export const employeeSchema = z.object({
  user: z.number().positive().optional(), // Optional if creating user inline
  
  email: emailValidator,
  
  first_name: nameValidator,
  
  last_name: nameValidator,
  
  phone: phoneValidator,
  
  role: z
    .number()
    .positive('Please select a role')
    .optional(),
  
  department: employeeDepartmentValidator.optional(),
  
  position: z
    .string()
    .min(2, 'Position must be at least 2 characters')
    .max(100, 'Position name is too long')
    .optional()
    .or(z.literal('')),
  
  hire_date: requiredDateValidator,
  
  manager: z.number().positive().optional().nullable(),
  
  status: employeeStatusValidator.default('active'),
  
  salary: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount')
    .optional()
    .or(z.literal('')),
  
  commission_rate: z
    .number()
    .min(0, 'Commission rate must be between 0 and 100')
    .max(100, 'Commission rate must be between 0 and 100')
    .optional(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

/**
 * Employee Invitation Schema
 * Validates employee invitation form
 */
export const employeeInvitationSchema = z.object({
  email: emailValidator,
  
  first_name: nameValidator,
  
  last_name: nameValidator,
  
  role: z
    .number()
    .positive('Please select a role'),
  
  department: employeeDepartmentValidator.optional(),
  
  position: z
    .string()
    .max(100, 'Position name is too long')
    .optional()
    .or(z.literal('')),
  
  message: z
    .string()
    .max(500, 'Message cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
});

export type EmployeeInvitationFormData = z.infer<typeof employeeInvitationSchema>;
