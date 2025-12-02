/**
 * Lead Form Validation Schemas
 * Zod schemas for lead CRUD operations
 */
import { z } from 'zod';
import {
  emailValidator,
  phoneValidator,
  urlValidator,
  leadStatusValidator,
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
 * Lead Source Options
 */
export const leadSourceValidator = z.enum([
  'website',
  'referral',
  'social_media',
  'email_campaign',
  'event',
  'partner',
  'other',
]);

/**
 * Lead Priority Options
 */
export const leadPriorityValidator = z.enum(['low', 'medium', 'high', 'urgent']);

/**
 * Lead Create/Update Schema
 * Validates lead form data
 */
export const leadSchema = z.object({
  first_name: nameValidator,
  last_name: nameValidator,
  email: emailValidator,
  phone: phoneValidator,
  company: optionalNameValidator,
  job_title: z
    .string()
    .max(100, 'Job title is too long')
    .optional()
    .or(z.literal('')),
  status: leadStatusValidator.default('new'),
  source: leadSourceValidator.default('website'),
  priority: leadPriorityValidator.default('medium'),
  score: z
    .number()
    .min(0, 'Score must be between 0 and 100')
    .max(100, 'Score must be between 0 and 100')
    .default(0),
  assigned_to: z.number().positive().optional().nullable(),
  address: addressValidator,
  city: cityValidator,
  state: stateValidator,
  country: countryValidator,
  postal_code: postalCodeValidator,
  website: urlValidator,
  notes: notesValidator,
  estimated_value: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format')
    .optional()
    .or(z.literal('')),
});

export type LeadFormData = z.infer<typeof leadSchema>;

/**
 * Lead Qualification Schema
 * Validates lead qualification action
 */
export const leadQualificationSchema = z.object({
  reason: z
    .string()
    .min(10, 'Please provide a reason (minimum 10 characters)')
    .max(500, 'Reason is too long')
    .trim(),
});

export type LeadQualificationFormData = z.infer<typeof leadQualificationSchema>;

/**
 * Lead Conversion Schema
 * Validates lead to customer conversion
 */
export const leadConversionSchema = z.object({
  create_deal: z.boolean().default(false),
  deal_title: z
    .string()
    .min(3, 'Deal title must be at least 3 characters')
    .max(200, 'Deal title is too long')
    .optional(),
  deal_value: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format')
    .optional(),
  deal_stage: z.string().optional(),
  notes: notesValidator,
}).refine(
  (data) => {
    // If create_deal is true, deal_title is required
    if (data.create_deal && !data.deal_title) {
      return false;
    }
    return true;
  },
  {
    message: 'Deal title is required when creating a deal',
    path: ['deal_title'],
  }
);

export type LeadConversionFormData = z.infer<typeof leadConversionSchema>;
