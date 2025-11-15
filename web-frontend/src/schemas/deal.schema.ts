/**
 * Deal Form Validation Schemas
 * Zod schemas for deal/opportunity CRUD operations
 */
import { z } from 'zod';
import {
  dealStageValidator,
  requiredDateValidator,
  dateValidator,
  notesValidator,
} from './common.schema';

/**
 * Deal Create/Update Schema
 * Validates deal form data
 */
export const dealSchema = z.object({
  title: z
    .string()
    .min(3, 'Deal title must be at least 3 characters')
    .max(200, 'Deal title cannot exceed 200 characters')
    .trim(),
  
  customer: z
    .number()
    .positive('Please select a customer'),
  
  value: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount (e.g., 1000.00)'),
  
  stage: dealStageValidator.default('lead'),
  
  stage_id: z.number().positive().optional(),
  
  probability: z
    .number()
    .min(0, 'Probability must be between 0 and 100')
    .max(100, 'Probability must be between 0 and 100')
    .default(0),
  
  expected_close_date: requiredDateValidator,
  
  actual_close_date: dateValidator,
  
  assigned_to: z.number().positive().optional().nullable(),
  
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  
  notes: notesValidator,
});

export type DealFormData = z.infer<typeof dealSchema>;

/**
 * Deal Stage Move Schema
 * Validates deal stage movement
 */
export const dealStageMoveSchema = z.object({
  stage: dealStageValidator,
  stage_id: z.number().positive().optional(),
  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
});

export type DealStageMoveFormData = z.infer<typeof dealStageMoveSchema>;

/**
 * Deal Close Schema (Won/Lost)
 * Validates deal close action
 */
export const dealCloseSchema = z.object({
  reason: z
    .string()
    .min(10, 'Please provide a reason (minimum 10 characters)')
    .max(500, 'Reason is too long')
    .trim(),
  actual_close_date: requiredDateValidator,
  notes: notesValidator,
});

export type DealCloseFormData = z.infer<typeof dealCloseSchema>;
