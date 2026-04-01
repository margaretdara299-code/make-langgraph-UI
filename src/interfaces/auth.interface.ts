/**
 * Authentication-related interfaces.
 */

/** Shape of the login form values */
export interface LoginFormValues {
    username: string;
    password: string;
    remember: boolean;
}

/** Auth state managed by the useLogin hook */
export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

/** Props for the LoginCard component */
export interface LoginCardProps {
    onSubmit: (values: LoginFormValues) => void;
    isLoading: boolean;
    error: string | null;
    onFieldChange: () => void;
}
