/**
 * Authentication Form Validation Schemas
 * Zod schemas for login, signup, and password validation
 */
import { z } from 'zod';

// Validation constants matching backend
const PASSWORD_MIN_LENGTH = 6; // Matches backend setting
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;

// Regex patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[\w.@+-]+$/;

/**
 * Login Schema
 * Validates login form data
 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username or email is required')
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Signup/Registration Schema
 * Validates registration form data with all required fields
 */
export const signupSchema = z.object({
  username: z
    .string()
    .min(USERNAME_MIN_LENGTH, `Username must be at least ${USERNAME_MIN_LENGTH} characters`)
    .max(USERNAME_MAX_LENGTH, `Username cannot exceed ${USERNAME_MAX_LENGTH} characters`)
    .regex(USERNAME_REGEX, 'Username can only contain letters, numbers, and @/./+/-/_ characters')
    .trim(),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .regex(EMAIL_REGEX, 'Invalid email format')
    .toLowerCase()
    .trim(),
  
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(128, 'Password is too long'),
  
  password_confirm: z
    .string()
    .min(1, 'Please confirm your password'),
  
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name is too long')
    .trim(),
  
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name is too long')
    .trim(),
  
  organization_name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(200, 'Organization name is too long')
    .trim(),
  
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  
  profile_image: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ['password_confirm'],
});

export type SignupFormData = z.infer<typeof signupSchema>;

/**
 * Change Password Schema
 * Validates password change form
 */
export const changePasswordSchema = z.object({
  old_password: z
    .string()
    .min(1, 'Current password is required'),
  
  new_password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(128, 'Password is too long'),
  
  new_password_confirm: z
    .string()
    .min(1, 'Please confirm your new password'),
}).refine((data) => data.new_password === data.new_password_confirm, {
  message: "Passwords don't match",
  path: ['new_password_confirm'],
}).refine((data) => data.old_password !== data.new_password, {
  message: "New password must be different from current password",
  path: ['new_password'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/**
 * Forgot Password Schema
 * Validates email for password reset
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset Password Schema
 * Validates password reset with token
 */
export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'Reset token is required'),
  
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(128, 'Password is too long'),
  
  password_confirm: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ['password_confirm'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
