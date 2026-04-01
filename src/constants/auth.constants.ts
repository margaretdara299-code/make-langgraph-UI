/**
 * Authentication-related constants.
 */

import type { Rule } from 'antd/es/form';

/** Validation rules for the login form */
export const LOGIN_FORM_RULES: Record<'username' | 'password', Rule[]> = {
    username: [
        { required: true, message: 'Please enter your username' },
        { min: 3, message: 'Username must be at least 3 characters' },
    ],
    password: [
        { required: true, message: 'Please enter your password' },
        { min: 4, message: 'Password must be at least 4 characters' },
    ],
};

/** All UI text strings used on the login page */
export const LOGIN_STRINGS = {
    heading: 'Skills Studio',
    subheading: 'Sign in to your workspace',
    usernamePlaceholder: 'Username',
    passwordPlaceholder: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    signInButton: 'Sign In',
    signingInButton: 'Signing In...',
} as const;

/** localStorage key for auth persistence */
export const AUTH_STORAGE_KEY = 'tensaw_auth';
