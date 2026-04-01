/**
 * Custom hook encapsulating all login form logic.
 * Handles form submission, loading state, validation, and navigation.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginFormValues } from '@/interfaces';
import { simulateAuthDelay, setAuthPersistence } from '@/utils/auth.utils';
import { ROUTES } from '@/routes';

export default function useLogin() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Handles form submission.
     * Simulates auth call, persists state, navigates to dashboard.
     */
    const handleSubmit = useCallback(
        async (values: LoginFormValues) => {
            setError(null);
            setIsLoading(true);

            try {
                await simulateAuthDelay();

                // Always succeed — mock auth
                setAuthPersistence(true);
                navigate(ROUTES.DASHBOARD, { replace: true });
            } catch {
                setError('Something went wrong. Please try again.');
            } finally {
                setIsLoading(false);
            }
        },
        [navigate]
    );

    /** Clears any existing error (useful on field change) */
    const clearError = useCallback(() => {
        if (error) setError(null);
    }, [error]);

    return {
        isLoading,
        error,
        handleSubmit,
        clearError,
    };
}
