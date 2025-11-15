/**
 * Common Validation Schemas
 * Reusable validators for common fields
 */
import { z } from 'zod';

// Email validator
export const emailValidator = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim();

// Phone validator (E.164 format)
export const phoneValidator = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number (e.g., +1234567890)')
  .optional()
  .or(z.literal(''));

// URL validator
export const urlValidator = z
  .string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''));

// Positive number validator
export const positiveNumberValidator = z
  .number()
  .positive('Must be a positive number')
  .or(
    z.string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Invalid number format')
      .transform((val) => parseFloat(val))
  );

// Optional positive number
export const optionalPositiveNumberValidator = positiveNumberValidator.optional();

// Date validator (ISO format or date string)
export const dateValidator = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  })
  .or(z.date())
  .optional();

// Required date validator
export const requiredDateValidator = z
  .string()
  .min(1, 'Date is required')
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  });

// Status validators
export const customerStatusValidator = z.enum(['active', 'inactive', 'prospect', 'vip']);
export const leadStatusValidator = z.enum(['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost']);
export const dealStageValidator = z.enum(['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost']);
export const issueStatusValidator = z.enum(['open', 'in_progress', 'resolved', 'closed', 'reopened']);
export const issuePriorityValidator = z.enum(['low', 'medium', 'high', 'critical']);
export const orderStatusValidator = z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']);

// Notes/Description validator
export const notesValidator = z
  .string()
  .max(2000, 'Notes cannot exceed 2000 characters')
  .optional()
  .or(z.literal(''));

// Required notes
export const requiredNotesValidator = z
  .string()
  .min(1, 'This field is required')
  .max(2000, 'Cannot exceed 2000 characters');

// Name validators
export const nameValidator = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name cannot exceed 100 characters')
  .trim();

export const optionalNameValidator = z
  .string()
  .max(100, 'Name cannot exceed 100 characters')
  .trim()
  .optional()
  .or(z.literal(''));

// Address validators
export const addressValidator = z
  .string()
  .max(255, 'Address is too long')
  .optional()
  .or(z.literal(''));

export const cityValidator = z
  .string()
  .max(100, 'City name is too long')
  .optional()
  .or(z.literal(''));

export const stateValidator = z
  .string()
  .max(100, 'State name is too long')
  .optional()
  .or(z.literal(''));

export const countryValidator = z
  .string()
  .max(100, 'Country name is too long')
  .optional()
  .or(z.literal(''));

export const postalCodeValidator = z
  .string()
  .max(20, 'Postal code is too long')
  .optional()
  .or(z.literal(''));
