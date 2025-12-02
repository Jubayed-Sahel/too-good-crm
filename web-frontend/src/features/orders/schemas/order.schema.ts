/**
 * Order Form Validation Schemas
 * Zod schemas for order CRUD operations
 */
import { z } from 'zod';
import {
  orderStatusValidator,
  requiredDateValidator,
  positiveNumberValidator,
  notesValidator,
} from './common.schema';

/**
 * Payment Method Options
 */
export const paymentMethodValidator = z.enum([
  'credit_card',
  'debit_card',
  'bank_transfer',
  'paypal',
  'cash',
  'check',
  'other',
]);

/**
 * Order Item Schema
 * Validates individual order item
 */
export const orderItemSchema = z.object({
  product_name: z
    .string()
    .min(1, 'Product name is required')
    .max(200, 'Product name is too long')
    .trim(),
  
  description: z
    .string()
    .max(500, 'Description is too long')
    .optional()
    .or(z.literal('')),
  
  quantity: z
    .number()
    .positive('Quantity must be greater than 0')
    .int('Quantity must be a whole number'),
  
  unit_price: positiveNumberValidator,
  
  discount: z
    .number()
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100%')
    .default(0),
  
  tax_rate: z
    .number()
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%')
    .default(0),
});

export type OrderItemFormData = z.infer<typeof orderItemSchema>;

/**
 * Order Create/Update Schema
 * Validates order form data
 */
export const orderSchema = z.object({
  customer: z
    .number()
    .positive('Please select a customer'),
  
  order_number: z
    .string()
    .min(1, 'Order number is required')
    .max(50, 'Order number is too long')
    .trim(),
  
  order_date: requiredDateValidator,
  
  expected_delivery_date: requiredDateValidator,
  
  actual_delivery_date: z.string().optional().or(z.literal('')),
  
  status: orderStatusValidator.default('pending'),
  
  payment_method: paymentMethodValidator.default('credit_card'),
  
  payment_status: z.enum(['pending', 'paid', 'partially_paid', 'refunded']).default('pending'),
  
  items: z
    .array(orderItemSchema)
    .min(1, 'Order must have at least one item'),
  
  subtotal: positiveNumberValidator,
  
  tax: z.number().min(0, 'Tax cannot be negative').default(0),
  
  discount: z.number().min(0, 'Discount cannot be negative').default(0),
  
  shipping: z.number().min(0, 'Shipping cannot be negative').default(0),
  
  total: positiveNumberValidator,
  
  shipping_address: z
    .string()
    .max(255, 'Shipping address is too long')
    .optional()
    .or(z.literal('')),
  
  billing_address: z
    .string()
    .max(255, 'Billing address is too long')
    .optional()
    .or(z.literal('')),
  
  notes: notesValidator,
});

export type OrderFormData = z.infer<typeof orderSchema>;

/**
 * Order Status Update Schema
 * Validates order status change
 */
export const orderStatusUpdateSchema = z.object({
  status: orderStatusValidator,
  
  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
});

export type OrderStatusUpdateFormData = z.infer<typeof orderStatusUpdateSchema>;
