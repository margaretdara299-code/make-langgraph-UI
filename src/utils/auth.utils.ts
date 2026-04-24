/**
 * Authentication utility functions.
 */

import { AUTH_STORAGE_KEY } from '@/constants/auth.constants';

/**
 * Simulates an authentication API call.
 * Always succeeds after a brief delay.
 */
export const simulateAuthDelay = (): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, 1200));

/**
 * Persists the authentication state to localStorage.
 */
export const setAuthPersistence = (isAuthenticated: boolean): void => {
    if (isAuthenticated) {
        localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    }
};

/**
 * Reads the persisted authentication state from localStorage.
 */
export const getAuthPersistence = (): boolean =>
    localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
