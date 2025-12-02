/**
 * Customer Form Validation Schemas
 * Zod schemas for customer CRUD operations
 */
import { z } from 'zod';
import {
  emailValidator,
  phoneValidator,
  urlValidator,
  customerStatusValidator,
  notesValidator,
  nameValidator,
  optionalNameValidator,
  addressValidator,
  cityValidator,
  stateValidator,
  countryValidator,
  postalCodeValidator,
} from '@/schemas/common.schema';

/**
 * Customer Create/Update Schema
 * Validates customer form data
 */
export const customerSchema = z.object({
  first_name: nameValidator,
  last_name: nameValidator,
  email: emailValidator,
  phone: phoneValidator,
  organization: optionalNameValidator,
  job_title: z
    .string()
    .max(100, 'Job title is too long')
    .optional()
    .or(z.literal('')),
  status: customerStatusValidator.default('active'),
  assigned_to: z.number().positive().optional().nullable(),
  address: addressValidator,
  city: cityValidator,
  state: stateValidator,
  country: countryValidator,
  postal_code: postalCodeValidator,
  website: urlValidator,
  notes: notesValidator,
});

export type CustomerFormData = z.infer<typeof customerSchema>;

/**
 * Customer Note Schema
 * Validates customer note creation
 */
export const customerNoteSchema = z.object({
  note: z
    .string()
    .min(1, 'Note cannot be empty')
    .max(2000, 'Note cannot exceed 2000 characters')
    .trim(),
});

export type CustomerNoteFormData = z.infer<typeof customerNoteSchema>;
