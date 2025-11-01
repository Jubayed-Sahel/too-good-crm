/**
 * Validation utilities
 */
import { VALIDATION } from '@/config/constants';

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  return VALIDATION.EMAIL_REGEX.test(email);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
};

/**
 * Validate username
 */
export const isValidUsername = (username: string): boolean => {
  return username.length >= VALIDATION.USERNAME_MIN_LENGTH;
};

/**
 * Get password strength message
 */
export const getPasswordStrengthMessage = (password: string): string => {
  if (password.length === 0) return '';
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`;
  }
  return 'Password is valid';
};
