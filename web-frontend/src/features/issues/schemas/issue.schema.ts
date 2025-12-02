/**
 * Issue Form Validation Schemas
 * Zod schemas for issue/ticket CRUD operations
 */
import { z } from 'zod';
import {
  issueStatusValidator,
  issuePriorityValidator,
  requiredNotesValidator,
  notesValidator,
} from '@/schemas/common.schema';

/**
 * Issue Type Options
 */
export const issueTypeValidator = z.enum([
  'bug',
  'feature_request',
  'support',
  'question',
  'complaint',
  'other',
]);

/**
 * Issue Create Schema
 * Validates issue creation form
 */
export const issueCreateSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  
  description: requiredNotesValidator,
  
  type: issueTypeValidator.default('support'),
  
  priority: issuePriorityValidator.default('medium'),
  
  customer: z.number().positive().optional().nullable(),
  
  order: z.number().positive().optional().nullable(),
  
  assigned_to: z.number().positive().optional().nullable(),
});

export type IssueCreateFormData = z.infer<typeof issueCreateSchema>;

/**
 * Issue Update Schema
 * Validates issue update form
 */
export const issueUpdateSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  
  description: requiredNotesValidator,
  
  type: issueTypeValidator,
  
  priority: issuePriorityValidator,
  
  status: issueStatusValidator,
  
  assigned_to: z.number().positive().optional().nullable(),
});

export type IssueUpdateFormData = z.infer<typeof issueUpdateSchema>;

/**
 * Issue Comment Schema
 * Validates issue comment/note
 */
export const issueCommentSchema = z.object({
  comment: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment cannot exceed 2000 characters')
    .trim(),
  
  internal: z.boolean().default(false), // Internal comments not visible to customers
});

export type IssueCommentFormData = z.infer<typeof issueCommentSchema>;

/**
 * Issue Resolution Schema
 * Validates issue resolution
 */
export const issueResolutionSchema = z.object({
  resolution: z
    .string()
    .min(10, 'Resolution must be at least 10 characters')
    .max(1000, 'Resolution cannot exceed 1000 characters')
    .trim(),
  
  notes: notesValidator,
});

export type IssueResolutionFormData = z.infer<typeof issueResolutionSchema>;
